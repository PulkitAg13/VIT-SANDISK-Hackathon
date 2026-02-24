from app.services.search_service import SearchService


if __name__ == "__main__":

    print("=== Phase 4: Hybrid Intelligent Ranking Test ===")

    search_service = SearchService()

    query = "education department website"

    response = search_service.search(query, top_k=3)

    print("\nQuery:", response["query"])
    print("\nRanked Results:\n")

    for idx, r in enumerate(response["results"], start=1):
        print(f"Rank {idx}:")
        print(f"File: {r['file_name']}")
        print(f"Confidence: {r['confidence']}%")
        print(f"Reason: {r['reason']}")
        print("-" * 50)