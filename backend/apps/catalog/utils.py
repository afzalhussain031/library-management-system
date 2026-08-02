import os
import requests
from dotenv import load_dotenv

load_dotenv()


def fetch_and_truncate_description(isbn):
    """
    Fetches the description of a book from Open Library API by ISBN.
    If not found, falls back to Google Books API.
    Extracts the text and truncates it to ~300 characters cleanly.
    """
    if not isbn:
        return ""
    
    clean_isbn = "".join(char for char in str(isbn) if char.isalnum())
    if not clean_isbn:
        return ""

    description = ""

    # Attempt 1: Open Library API
    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{clean_isbn}&jscmd=details&format=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        bibkey = f"ISBN:{clean_isbn}"
        if bibkey in data:
            details = data[bibkey].get("details", {})
            description_data = details.get("description", "")
            
            if isinstance(description_data, dict):
                description = description_data.get("value", "")
            elif isinstance(description_data, str):
                description = description_data
    except Exception as e:
        print(f"Open Library API error for ISBN {clean_isbn}: {e}")

    description = description.strip()

    # Attempt 2: Google Books API Fallback
    if not description:
        google_url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{clean_isbn}"
        api_key = os.environ.get("GOOGLE_BOOKS_API_KEY")
        if api_key:
            google_url += f"&key={api_key}"
            
        try:
            response = requests.get(google_url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            items = data.get("items", [])
            if items:
                volume_info = items[0].get("volumeInfo", {})
                description = volume_info.get("description", "")
        except Exception as e:
            print(f"Google Books API error for ISBN {clean_isbn}: {e}")
            
    description = description.strip()
    if not description:
        return ""
        
    if len(description) <= 300:
        return description
        
    truncated = description[:300]
    last_space = truncated.rfind(' ')
    if last_space != -1:
        truncated = truncated[:last_space]
        
    return truncated.rstrip() + "..."
