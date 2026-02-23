import sys
import io
import os
from pypdf import PdfReader
from extractor import extract_policy_data
from dotenv import load_dotenv

load_dotenv(override=True)

def main():
    pdf_path = sys.argv[1]
    text_content = ""
    try:
        pdf = PdfReader(pdf_path)
        for page in pdf.pages:
            text_content += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    text_content = text_content[:5000]
    print("Sending to AI...")
    
    # We will temporarily modify extract_policy_data or just run it and see the result
    # Actually let's just run it
    res = extract_policy_data(text_content)
    print("RESULT:", res)

if __name__ == "__main__":
    main()
