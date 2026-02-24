import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.text_extractor import TextExtractor

if __name__ == "__main__":
    extractor = TextExtractor()

    file_path = "../data/sample_files/test.pdf"

    file_data = extractor.process_file(file_path)

    if file_data:
        print("\n===== FILE METADATA =====")
        print(f"File Name: {file_data.file_name}")
        print(f"Extension: {file_data.file_extension}")
        print(f"Size (bytes): {file_data.size_bytes}")
        print(f"SHA256: {file_data.sha256_hash[:20]}...")
        print("\n===== EXTRACTED TEXT =====")
        print(file_data.extracted_text[:500])
    else:
        print("File processing failed.")