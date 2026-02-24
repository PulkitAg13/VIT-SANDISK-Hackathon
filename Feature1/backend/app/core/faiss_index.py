import os
import faiss
import numpy as np
import pickle
from datetime import datetime

from app.database.db import get_connection


INDEX_PATH = os.path.join("app", "database", "faiss.index")


class FaissIndex:

    def __init__(self):
        self.index = None
        self.file_map = {}  # FAISS index → file_path

    # ---------------------------------------------------
    # Build or Load FAISS Index
    # ---------------------------------------------------
    def build_index(self):

        # If index already exists on disk → load it
        if os.path.exists(INDEX_PATH):
            self.index = faiss.read_index(INDEX_PATH)
            print("Loaded FAISS index from disk.")
            self._load_file_map()
            return

        # Otherwise build from database
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT file_path, embedding FROM files")
        rows = cursor.fetchall()
        conn.close()

        if not rows:
            print("No embeddings found in database.")
            return

        embeddings = []

        for idx, (file_path, embedding_blob) in enumerate(rows):
            vector = pickle.loads(embedding_blob)
            embeddings.append(vector)
            self.file_map[idx] = file_path

        embeddings = np.array(embeddings).astype("float32")

        dimension = embeddings.shape[1]

        # We use Inner Product because embeddings are normalized
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

        # Save index to disk
        faiss.write_index(self.index, INDEX_PATH)

        print(f"FAISS index built with {len(embeddings)} vectors.")

    # ---------------------------------------------------
    # Rebuild File Map When Loading Index
    # ---------------------------------------------------
    def _load_file_map(self):
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT file_path FROM files")
        rows = cursor.fetchall()

        conn.close()

        for idx, (file_path,) in enumerate(rows):
            self.file_map[idx] = file_path

    # ---------------------------------------------------
    # Semantic Search
    # ---------------------------------------------------
    def search(self, query_vector, top_k=5):

        if self.index is None:
            raise ValueError("FAISS index not built.")

        query_vector = np.array([query_vector]).astype("float32")

        scores, indices = self.index.search(query_vector, top_k)

        results = []

        for score, idx in zip(scores[0], indices[0]):

            if idx == -1:
                continue

            file_path = self.file_map.get(idx)

            if not file_path:
                continue

            file_name = os.path.basename(file_path)

            confidence = round(float(score) * 100, 2)

            # Update behavioral tracking
            self._update_access_tracking(file_path)

            results.append({
                "file_name": file_name,
                "file_path": file_path,
                "confidence": confidence,
                "semantic_score": float(score),
                "reason": "Semantic similarity match"
            })

        return results

    # ---------------------------------------------------
    # Track Access Frequency & Recency
    # ---------------------------------------------------
    def _update_access_tracking(self, file_path):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE files
            SET access_count = access_count + 1,
                last_accessed = ?
            WHERE file_path = ?
        """, (datetime.now().isoformat(), file_path))

        conn.commit()
        conn.close()