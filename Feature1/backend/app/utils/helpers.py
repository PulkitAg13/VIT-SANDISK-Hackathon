import hashlib
import os
from datetime import datetime


def calculate_sha256(file_path: str) -> str:
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def extract_file_metadata(file_path: str):
    stat = os.stat(file_path)
    return {
        "size_bytes": stat.st_size,
        "created_at": datetime.fromtimestamp(stat.st_ctime),
        "modified_at": datetime.fromtimestamp(stat.st_mtime),
    }


def is_supported_file(file_path: str) -> bool:
    supported_extensions = [".pdf", ".docx", ".pptx", ".txt"]
    ext = os.path.splitext(file_path)[1].lower()
    return ext in supported_extensions