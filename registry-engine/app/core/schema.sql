-- MoRe registry schema v3  (PostgreSQL 15+, PostGIS 3.x, pgcrypto)
--
-- Principles
--  * Exact survey geometry is the source of truth. H3 cells are an optional coarse index only.
--  * parcel_events is an append-only, hash-chained log. `parcels` is a projection of it,
--    updated in the same transaction that appends the event.
--  * Events carry hashes and commitments only (no PII, no raw geometry), so inclusion
--    receipts can be shared with lenders/courts without leaking the registry.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE parcel_status AS ENUM (
  'PENDING_OWNER_APPROVAL', -- passed automated checks; waiting for landowner step-up approval
  'UNDER_REVIEW',           -- needs a human (low accuracy, split anomaly, missing title docs, ...)
  'DISPUTED',               -- quarantined claim that conflicts with another parcel
  'ACTIVE',
  'RETIRED',                -- superseded by a split/merge
  'REJECTED'
);

CREATE TYPE accuracy_class AS ENUM ('TOTAL_STATION', 'RTK_GNSS', 'DGPS', 'HANDHELD');
CREATE TYPE encumbrance_kind AS ENUM
  ('MORTGAGE_CHARGE', 'CAVEAT', 'COURT_ORDER', 'GOVT_ACQUISITION', 'OTHER');

-- ---------------------------------------------------------------- owners
CREATE TABLE owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Secret salt for owner commitments in events. Never exported or logged.
  commitment_salt bytea NOT NULL DEFAULT gen_random_bytes(16)
);

-- ---------------------------------------------------------------- parcels
CREATE TABLE parcels (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status           parcel_status NOT NULL,
  geom             geometry(Polygon, 4326) NOT NULL,   -- legal geometry, WGS84
  area_m2          numeric(14,2) NOT NULL,             -- computed in a metric CRS at ingest
  declared_area_m2 numeric(14,2),                      -- area printed on the survey plan
  accuracy         accuracy_class NOT NULL,
  uncertainty_m    numeric(8,3) NOT NULL,              -- effective: survey class + datum-transform accuracy
  source_crs       integer NOT NULL,                   -- EPSG code the surveyor submitted in
  transform_op     text NOT NULL,                      -- exact datum transformation used
  geom_hash        bytea NOT NULL,                     -- sha256 of canonical geometry (event_log.py)
  owner_id         uuid REFERENCES owners(id),
  surveyor_id      uuid NOT NULL,
  survey_plan_no   text,
  root_title_hashes bytea[] NOT NULL DEFAULT '{}',     -- sha256 of root-of-title documents
  h3_r12           bigint[] NOT NULL DEFAULT '{}',     -- OPTIONAL coarse cover (analytics/previews)
  created_at       timestamptz NOT NULL DEFAULT now(),
  CHECK (ST_IsValid(geom)),
  CHECK (octet_length(geom_hash) = 32)
);
CREATE INDEX parcels_geom_gix   ON parcels USING gist (geom);   -- this is the candidate search
CREATE INDEX parcels_h3_gin     ON parcels USING gin (h3_r12);
CREATE INDEX parcels_status_idx ON parcels (status);

CREATE TABLE parcel_lineage (
  child_id  uuid NOT NULL REFERENCES parcels(id),
  parent_id uuid NOT NULL REFERENCES parcels(id),
  relation  text NOT NULL CHECK (relation IN ('SPLIT', 'MERGE')),
  PRIMARY KEY (child_id, parent_id)
);

-- ---------------------------------------------------------------- encumbrances
CREATE TABLE encumbrances (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id        uuid NOT NULL REFERENCES parcels(id),
  kind             encumbrance_kind NOT NULL,
  holder_ref       text,                                -- lender / court / agency reference
  status           text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISCHARGED')),
  doc_hash         bytea,
  opened_event_seq bigint,
  closed_event_seq bigint
);
CREATE INDEX encumbrances_active_idx ON encumbrances (parcel_id) WHERE status = 'ACTIVE';

-- ---------------------------------------------------------------- proposals & disputes
CREATE TABLE proposals (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind             text NOT NULL CHECK (kind IN ('NEW_PARCEL', 'SPLIT')),
  surveyor_id      uuid NOT NULL,
  parent_parcel_id uuid REFERENCES parcels(id),
  verdict          text NOT NULL,
  findings         jsonb NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX proposals_surveyor_idx ON proposals (surveyor_id, created_at);

CREATE TABLE disputes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id        uuid REFERENCES proposals(id),
  claimant_parcel_id uuid NOT NULL REFERENCES parcels(id),
  incumbent_parcel_id uuid NOT NULL REFERENCES parcels(id),
  code               text NOT NULL,                     -- MATERIAL_OVERLAP | DUPLICATE_CLAIM
  overlap_area_m2    numeric(14,2),
  overlap_ratio      numeric(6,4),
  -- TRIAGE: an admin looks first; the incumbent's public record is NOT touched yet.
  -- OPEN:   admin confirmed it is credible; recorded on the incumbent's event chain.
  status             text NOT NULL DEFAULT 'TRIAGE'
                       CHECK (status IN ('TRIAGE', 'OPEN', 'DISMISSED', 'RESOLVED_COURT_ORDER', 'WITHDRAWN')),
  evidence_hashes    bytea[] NOT NULL DEFAULT '{}',
  resolution_ref     text,                              -- e.g. court order document hash/ref
  opened_at          timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX disputes_incumbent_idx ON disputes (incumbent_parcel_id) WHERE status IN ('TRIAGE', 'OPEN');

-- ---------------------------------------------------------------- event log (append-only)
CREATE TABLE parcel_events (
  seq               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- global order == commit order
  parcel_id         uuid    NOT NULL,
  parcel_seq        integer NOT NULL,                  -- 1, 2, 3 ... per parcel
  event_type        text    NOT NULL,
  payload           jsonb   NOT NULL,                  -- convenience copy for querying
  canonical_payload bytea   NOT NULL,                  -- the exact bytes that were hashed
  prev_hash         bytea   NOT NULL,                  -- 32 zero bytes for a parcel's first event
  event_hash        bytea   NOT NULL,                  -- sha256(prev_hash || canonical_payload)
  actor_ref         text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parcel_id, parcel_seq),
  CHECK (octet_length(prev_hash) = 32 AND octet_length(event_hash) = 32)
);

-- The database verifies chain linkage and the hash itself: the app is not trusted to hash.
CREATE FUNCTION parcel_events_guard() RETURNS trigger AS $$
DECLARE
  last_row parcel_events%ROWTYPE;
  zero bytea := decode(repeat('00', 32), 'hex');
BEGIN
  SELECT * INTO last_row FROM parcel_events
   WHERE parcel_id = NEW.parcel_id ORDER BY parcel_seq DESC LIMIT 1;
  IF NOT FOUND THEN
    IF NEW.parcel_seq <> 1 OR NEW.prev_hash <> zero THEN
      RAISE EXCEPTION 'first event of a parcel must have parcel_seq=1 and zero prev_hash';
    END IF;
  ELSE
    IF NEW.parcel_seq <> last_row.parcel_seq + 1 OR NEW.prev_hash <> last_row.event_hash THEN
      RAISE EXCEPTION 'broken hash chain for parcel %', NEW.parcel_id;
    END IF;
  END IF;
  IF NEW.event_hash <> digest(NEW.prev_hash || NEW.canonical_payload, 'sha256') THEN
    RAISE EXCEPTION 'event_hash does not match sha256(prev_hash || canonical_payload)';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER parcel_events_guard_trg BEFORE INSERT ON parcel_events
  FOR EACH ROW EXECUTE FUNCTION parcel_events_guard();

CREATE FUNCTION parcel_events_immutable() RETURNS trigger AS $$
BEGIN RAISE EXCEPTION 'parcel_events is append-only'; END $$ LANGUAGE plpgsql;

CREATE TRIGGER parcel_events_no_mutation BEFORE UPDATE OR DELETE ON parcel_events
  FOR EACH ROW EXECUTE FUNCTION parcel_events_immutable();
CREATE TRIGGER parcel_events_no_truncate BEFORE TRUNCATE ON parcel_events
  FOR EACH STATEMENT EXECUTE FUNCTION parcel_events_immutable();

REVOKE UPDATE, DELETE, TRUNCATE ON parcel_events FROM PUBLIC;
-- Triggers stop the app role; a DBA can still disable them. That is exactly what the
-- external anchor is for: a rewrite of history no longer matches the published root.

-- ---------------------------------------------------------------- anchoring
CREATE TABLE anchor_batches (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_seq    bigint  NOT NULL,
  last_seq     bigint  NOT NULL,
  leaf_count   integer NOT NULL,
  merkle_root  bytea   NOT NULL,
  chain_id     integer NOT NULL,                       -- 137 Polygon PoS, 80002 Amoy testnet
  tx_hash      text,
  block_number bigint,
  status       text NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  CHECK (last_seq >= first_seq),
  CHECK (octet_length(merkle_root) = 32)
);
-- A FAILED batch (tx never landed) is void; its range is re-batched.
CREATE UNIQUE INDEX anchor_batches_range_uq ON anchor_batches (first_seq) WHERE status <> 'FAILED';
