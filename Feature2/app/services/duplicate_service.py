import hashlib

def compute_hash(content: str):
    return hashlib.sha256(content.encode()).hexdigest()

def is_exact_duplicate(hash1, hash2):
    return hash1 == hash2