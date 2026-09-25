import hashlib
import os
from sqlalchemy.orm import Session
from web3 import Web3

from app.models.parcel import Parcel, ParcelHash, ParcelStatus

# Environment Variables (Using Polygon RPC)
POLYGON_RPC_URL = os.getenv("POLYGON_RPC_URL", "https://polygon-rpc.com")
# In production, this private key belongs to the system's "Notary Wallet"
PRIVATE_KEY = os.getenv("ANCHOR_WALLET_PRIVATE_KEY", "0x0000000000000000000000000000000000000000000000000000000000000001") 

def hash_leaf(data: str) -> str:
    """Simple SHA256 hash for a leaf node."""
    return hashlib.sha256(data.encode('utf-8')).hexdigest()

def build_merkle_root(leaves: list[str]) -> str:
    """Builds a deterministic Merkle root from a list of leaf hashes."""
    if not leaves:
        return hash_leaf("empty_registry")
    if len(leaves) == 1:
        return leaves[0]
    
    new_level = []
    for i in range(0, len(leaves), 2):
        left = leaves[i]
        # If odd number of leaves, duplicate the last one
        right = leaves[i+1] if i+1 < len(leaves) else left 
        combined = left + right
        new_level.append(hash_leaf(combined))
        
    return build_merkle_root(new_level)

def generate_daily_merkle_root(db: Session) -> str:
    """
    Fetches all ACTIVE parcels, creates a cryptographic string for each,
    and calculates the global Merkle root representing the exact state of the registry.
    """
    active_parcels = db.query(Parcel).filter(Parcel.status == ParcelStatus.ACTIVE).all()
    
    leaves = []
    for parcel in active_parcels:
        # Fetch associated H3 spatial indices
        hashes = db.query(ParcelHash.h3_index).filter(ParcelHash.parcel_id == parcel.id).all()
        h3_strings = ",".join(sorted([h[0] for h in hashes]))
        
        # The core immutable data block: "ParcelID:OwnerID:H3Array"
        data_block = f"{parcel.id}:{parcel.owner_id}:{h3_strings}"
        leaves.append(hash_leaf(data_block))
        
    # Sort leaves alphabetically to ensure the tree is deterministic regardless of DB fetch order
    leaves.sort()
    
    merkle_root = build_merkle_root(leaves)
    return merkle_root

def anchor_root_to_polygon(merkle_root: str):
    """
    Submits the Merkle Root to the Polygon blockchain by embedding it 
    into the data payload of a 0-ETH transaction.
    """
    try:
        w3 = Web3(Web3.HTTPProvider(POLYGON_RPC_URL))
        if not w3.is_connected():
            print("Warning: Could not connect to Polygon RPC. Skipping anchor.")
            return None
            
        account = w3.eth.account.from_key(PRIVATE_KEY)
        
        # Embed the merkle root directly in the transaction 'data' field
        # This is a highly gas-efficient way to timestamp data without a custom Smart Contract
        tx = {
            'to': account.address, # Sending a transaction to ourselves
            'value': 0,
            'gas': 50000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(account.address),
            'data': w3.to_bytes(text=f"GEOHASH_ANCHOR:{merkle_root}"),
            'chainId': 137 # Polygon Mainnet
        }
        
        # Sign and send
        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        print(f"Successfully anchored Merkle Root {merkle_root} to Polygon.")
        print(f"Transaction Hash: {w3.to_hex(tx_hash)}")
        
        return w3.to_hex(tx_hash)
    except Exception as e:
        print(f"Anchoring failed: {e}")
        return None
