from app.core.embedding_engine import EmbeddingEngine
from app.core.faiss_index import FaissIndex
from app.core.hybrid_ranker import HybridRanker


class SearchService:

    def __init__(self):
        self.embedding_engine = EmbeddingEngine()
        self.faiss_index = FaissIndex()
        self.faiss_index.build_index()
        self.hybrid_ranker = HybridRanker()

    def search(self, query: str, top_k=5):

        query_vector = self.embedding_engine.generate_embedding(query)

        semantic_results = self.faiss_index.search(query_vector, top_k)

        final_results = self.hybrid_ranker.rank(query, semantic_results)

        return {
            "query": query,
            "results": final_results
        }