import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_PATH = os.path.join(BASE_DIR, "storage")

def scan_storage_folder():
    files_data = []

    if not os.path.exists(STORAGE_PATH):
        return []

    for root, dirs, files in os.walk(STORAGE_PATH):
        for file in files:
            full_path = os.path.join(root, file)

            try:
                stats = os.stat(full_path)

                file_info = {
                    "name": file,
                    "path": full_path,
                    "created_at": datetime.fromtimestamp(stats.st_ctime),
                    "last_accessed": datetime.fromtimestamp(stats.st_atime),
                    "last_modified": datetime.fromtimestamp(stats.st_mtime),
                    "size": stats.st_size
                }

                files_data.append(file_info)

            except:
                continue

    return files_data