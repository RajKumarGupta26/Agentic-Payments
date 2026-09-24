import hashlib
import json


def create_delivery_proof(service_data):
    """
    Create a SHA-256 content hash of the delivered service data.
    """

    canonical_data = json.dumps(
        service_data,
        sort_keys=True,
        separators=(",", ":")
    )

    content_hash = hashlib.sha256(
        canonical_data.encode("utf-8")
    ).hexdigest()

    return {
        "algorithm": "SHA-256",
        "content_hash": content_hash,
        "content": service_data
    }