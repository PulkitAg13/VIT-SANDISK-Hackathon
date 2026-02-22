import faiss
import numpy as np

class VectorStore:

    def __init__(self):
        self.index = None
        self.id_map = []

    def add_vector(self, vector, file_id):

        vector_np = np.array([vector]).astype("float32")

        if self.index is None:
            dimension = vector_np.shape[1]
            self.index = faiss.IndexFlatL2(dimension)

        self.index.add(vector_np)
        self.id_map.append(file_id)

    def search(self, query_vector, top_k=5):

        if self.index is None:
            return []

        query_np = np.array([query_vector]).astype("float32")

        distances, indices = self.index.search(query_np, top_k)

        results = []

        for i, idx in enumerate(indices[0]):
            if idx < len(self.id_map):
                results.append({
                    "file_id": self.id_map[idx],
                    "distance": float(distances[0][i])
                })

        return results