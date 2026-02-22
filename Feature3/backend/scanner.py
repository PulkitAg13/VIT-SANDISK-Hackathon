from datetime import datetime, timedelta
import random

def generate_sample_files():
    files = []

    for i in range(30):
        file = {
            "name": f"file_{i}.txt",
            "path": f"/folder/file_{i}.txt",
            "created_at": datetime.utcnow() - timedelta(days=random.randint(10, 1000)),
            "last_accessed": datetime.utcnow() - timedelta(days=random.randint(0, 500)),
            "open_count": random.randint(0, 100),
            "size": random.randint(1000, 10000000)
        }
        files.append(file)

    return files