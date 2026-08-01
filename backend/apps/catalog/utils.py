import requests

def fetch_and_truncate_description(isbn):
    """
    Fetches the description of a book from Open Library API by ISBN,
    extracts the text from nested structures if present, and truncates
    it to ~300 characters cleanly on the last complete word.
    """
    if not isbn:
        return ""
    
    clean_isbn = "".join(char for char in str(isbn) if char.isalnum())
    if not clean_isbn:
        return ""

    url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{clean_isbn}&jscmd=details&format=json"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        bibkey = f"ISBN:{clean_isbn}"
        if bibkey not in data:
            return ""
            
        details = data[bibkey].get("details", {})
        description_data = details.get("description", "")
        
        description = ""
        if isinstance(description_data, dict):
            description = description_data.get("value", "")
        elif isinstance(description_data, str):
            description = description_data
            
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
    except Exception as e:
        # Output error to console/log but don't crash the save process
        print(f"Error fetching description for ISBN {clean_isbn}: {e}")
        return ""
