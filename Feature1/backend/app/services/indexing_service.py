import pickle

from app.database.db import get_connection
from app.core.embedding_engine import EmbeddingEngine
from app.utils.logger import logger


class IndexingService:

    def __init__(self):
        self.embedding_engine = EmbeddingEngine()

    # ---------------------------------------------------
    # Index Single File
    # ---------------------------------------------------
    def index_file(self, file_metadata):

        conn = get_connection()
        cursor = conn.cursor()

        # Check if file already exists
        cursor.execute(
            "SELECT sha256_hash FROM files WHERE file_path = ?",
            (file_metadata.file_path,)
        )
        result = cursor.fetchone()

        # Skip if unchanged
        if result:
            existing_hash = result[0]

            if existing_hash == file_metadata.sha256_hash:
                logger.info(f"Skipped unchanged file: {file_metadata.file_name}")
                conn.close()
                return

        # Generate embedding
        embedding = self.embedding_engine.generate_embedding(
            file_metadata.extracted_text
        )

        if embedding is None:
            logger.warning(f"No embedding generated for {file_metadata.file_name}")
            conn.close()
            return

        embedding_blob = pickle.dumps(embedding)

        # Insert or update
        cursor.execute("""
            INSERT INTO files (
                file_path, file_name, file_extension,
                size_bytes, created_at, modified_at,
                sha256_hash, embedding,
                access_count, last_accessed
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(file_path) DO UPDATE SET
                file_name=excluded.file_name,
                file_extension=excluded.file_extension,
                size_bytes=excluded.size_bytes,
                created_at=excluded.created_at,
                modified_at=excluded.modified_at,
                sha256_hash=excluded.sha256_hash,
                embedding=excluded.embedding
        """, (
            file_metadata.file_path,
            file_metadata.file_name,
            file_metadata.file_extension,
            file_metadata.size_bytes,
            file_metadata.created_at.isoformat(),
            file_metadata.modified_at.isoformat(),
            file_metadata.sha256_hash,
            embedding_blob,
            0,          # initial access_count
            None        # initial last_accessed
        ))

        conn.commit()
        conn.close()

        logger.info(f"Indexed file: {file_metadata.file_name}")