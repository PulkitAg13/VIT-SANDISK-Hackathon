from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class FileMetadata:
    file_path: str
    file_name: str
    file_extension: str
    size_bytes: int
    created_at: datetime
    modified_at: datetime
    sha256_hash: str
    extracted_text: Optional[str] = None