# MoRe (Mortgage and Registry)

**The Operating System for Nigerian Real Estate**

MoRe seamlessly bridges the gap between land security and capital. We combine an immutable cadastral spatial registry with a dynamic mortgage marketplace, unlocking Nigeria's property wealth for banks, surveyors, developers, and citizens.

---

## The Systemic Crisis in Nigerian Real Estate

The Nigerian property market possesses trillions of Naira in locked value ("Dead Capital") due to a chain reaction of systemic failures:

### 1. Title Ownership Conflicts & Overlapping Claims
The root of the crisis is the cadastral registry. Because surveys are largely paper-based or rely on disjointed digital systems, physical land coordinates are frequently manipulated or misregistered. This leads to overlapping claims, multi-year boundary disputes, and extreme land tenure insecurity. 

### 2. The Seeking Mortgage Challenge
Because the underlying land titles are fundamentally insecure, Commercial Banks and Primary Mortgage Banks (PMBs) view real estate as high-risk. Without mathematical certainty that a borrower actually owns the land, banks refuse to underwrite long-term mortgages, crippling the housing market.

Furthermore, everyday homebuyers face a massive visibility problem. Most Nigerians are completely unaware of their mortgage qualification status, affordability metrics, or the specific loan products available to them. MoRe solves this by acting as a transparent financial bridge, empowering citizens to instantly check their affordability, understand their qualification status, and get matched with the right lenders before committing to a property.

### 3. The Trust Deficit
The industry is plagued by a lack of trust. Fraudulent surveyors manipulate data, identity verification is weak, and paper trails are easily forged. Lenders have no single source of truth to verify who surveyed the land, who owns it, and if it has been sub-divided.

### 4. The Real Estate Developer's Dilemma
Developers spend billions building premium estates but struggle to liquidate their inventory. Why? Because the retail buyers they rely on cannot secure mortgage financing. The developer's capital becomes trapped until they find outright cash buyers.

---

## The MoRe Solution

MoRe solves the **Cold Start Data Problem** by using the mortgage application process (the Point-of-Sale) as the trojan horse to build a cryptographically secure land registry. 

### The Cryptographic Spatial Engine
We abandoned easily forged "string addresses" (e.g., *Plot 4, Lekki*) and replaced them with **Uber's H3 Hierarchical Spatial Index**. 
* When a surveyor uploads GPS coordinates, our Python engine converts the polygon into a unique array of H3 Hexagons (Resolution 13). 
* The database mathematically rejects any new registration that overlaps with an existing locked hexagon. **Overlapping claims become algorithmically impossible.**

### Dual-Key Authorization
MoRe separates the data creator from the asset holder. 
* **The Oracle:** A verified Surveyor (verified via SURCON integration & biometric liveness) *proposes* a boundary or a plot split.
* **The Asset Holder:** The Landowner receives an alert in their Vault and must use their cryptographic key to *Approve* or *Reject* the alteration.

### The Polygon Blockchain Notary
Rather than forcing users to pay expensive gas fees for every transaction, MoRe utilizes a hyper-efficient PostGIS database for daily operations. At midnight, the engine generates a **Merkle Tree** of all active parcels and anchors the single Merkle Root to the **Polygon Blockchain**. This provides immutable, unhackable historical proof of ownership for less than $0.01 per day.

### Automated Mortgage Underwriting
Because the collateral (the land) is mathematically secured by the Registry Engine, the Mortgage Marketplace can automate underwriting. Developers can list "Pre-Cleared Estates," and homebuyers can apply for mortgages that banks are actually eager to approve.

---

## Architecture (Microservices Monorepo)

To ensure the flexibility of the marketplace without compromising the strict mathematics of the registry, MoRe is built as a microservices monorepo:

### 1. `frontend/` (Vite / React / Tailwind)
The unified user interface for the entire ecosystem. It houses the Mortgage Marketplace, the Surveyor Oracle Dashboard, and the Landowner Title Vault.

### 2. `marketplace-backend/` (Node.js / Express / MongoDB)
The core business logic engine. Handles user authentication (JWT), mortgage product listings, lender profiles, and application tracking. When a surveyor submits coordinates, this Node server acts as a proxy, securely forwarding the payload to the Spatial Engine.

### 3. `registry-engine/` (Python / FastAPI / PostgreSQL / PostGIS)
The heavy-lifting spatial oracle. It receives GPS data, calculates H3 spatial overlap hashes, enforces the Dual-Key parent-child lineage logic, and contains the `anchoring.py` web3 script that notarizes the database state to the Polygon blockchain.

---