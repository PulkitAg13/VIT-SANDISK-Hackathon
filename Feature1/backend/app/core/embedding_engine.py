from sentence_transformers import SentenceTransformer
import numpy as np


class EmbeddingEngine:

    _model = None  # Class-level shared model

    def __init__(self):
        if EmbeddingEngine._model is None:
            EmbeddingEngine._model = SentenceTransformer(
                "sentence-transformers/all-MiniLM-L6-v2"
            )

    def generate_embedding(self, text: str):

        if not text:
            return None

        embedding = EmbeddingEngine._model.encode(
            text,
            normalize_embeddings=True
        )

        return np.array(embedding, dtype="float32")