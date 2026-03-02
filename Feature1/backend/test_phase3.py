from app.services.search_service import SearchService


if __name__ == "__main__":

    search_service = SearchService()

    query = "education department website"

    response = search_service.search(query, top_k=3)

    print("\nQuery:", response["query"])
    print("\nSearch Results:\n")

    for r in response["results"]:
        print(f"File: {r['file_name']}")
        print(f"Confidence: {r['confidence']}%")
        print(f"Reason: {r['reason']}")
        print("-" * 40)