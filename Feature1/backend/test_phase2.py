from app.database.db import initialize_database
from app.core.text_extractor import TextExtractor
from app.services.indexing_service import IndexingService


if __name__ == "__main__":

    initialize_database()

    extractor = TextExtractor()
    indexer = IndexingService()

    file_path = "../data/sample_files/test.pdf"

    file_data = extractor.process_file(file_path)

    if file_data:
        indexer.index_file(file_data)
        print("File successfully indexed.")
    else:
        print("File processing failed.")