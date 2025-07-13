import requests
from bs4 import BeautifulSoup
import pprint
import json

# The specific URL of the news article you want to scrape
url = "https://economymiddleeast.com/news/dubai-real-estate-sets-new-record-sales-climb-89-billion-h1-2025/"

def extract_article_data_from_url(article_url):
    """
    Scrapes a single news article page from a URL, extracts key details,
    and returns them as a dictionary.
    
    Args:
        article_url (str): The URL of the article to scrape.
    
    Returns:
        dict: A dictionary containing the article's URL, title, publication date,
              author, raw text, and cleaned text. Returns None if the request fails.
    """
    try:
        # Send an HTTP GET request to the URL with a User-Agent header
        print(f"Requesting HTML from {article_url}...")
        response = requests.get(article_url, headers={'User-Agent': 'Mozilla/5.0'})
        # Raise an exception for bad status codes (4xx or 5xx)
        response.raise_for_status()
        html_content = response.text

        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')

        # Extract the title from the <title> tag
        title = soup.title.string.strip() if soup.title else 'N/A'

        # Extract the publication date from the meta tag
        date_tag = soup.find('meta', property='article:modified_time')
        date = date_tag['content'] if date_tag else 'N/A'

        # Extract the author from the JSON-LD script for better accuracy
        author = 'N/A'
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            # Ensure the script has content before trying to load it
            if script.string:
                try:
                    data = json.loads(script.string)
                    
                    # Handle case where JSON-LD is a list of objects in a '@graph'
                    if isinstance(data.get('@graph'), list):
                        for item in data['@graph']:
                            if item.get('@type') == 'NewsArticle' and 'author' in item:
                                author_data = item['author']
                                if isinstance(author_data, dict) and 'name' in author_data:
                                    author = author_data['name']
                                    break
                    
                    # Handle case where JSON-LD is a single NewsArticle object
                    elif data.get('@type') == 'NewsArticle' and 'author' in data:
                        author_data = data['author']
                        if isinstance(author_data, dict) and 'name' in author_data:
                            author = author_data['name']

                    if author != 'N/A':
                        break
                except (json.JSONDecodeError, AttributeError, TypeError):
                    continue

        # Fallback if author not found in JSON-LD
        if author == 'N/A':
            author_tag = soup.find('meta', attrs={'name': 'author'})
            if author_tag and author_tag.get('content'):
                author = author_tag['content']

        # Extract the main article content from the specific div class
        content_div = soup.find('div', class_='brxe-post-content')

        raw_text = ''
        if content_div:
            # Get text from all paragraph tags within the content div
            paragraphs = content_div.find_all('p')
            raw_text = '\n'.join([p.get_text(strip=True) for p in paragraphs])
        
        # Clean the text by removing extra whitespace and joining with single spaces
        cleaned_text = ' '.join(raw_text.split())

        # Return the extracted data in a dictionary
        return {
            'url': article_url,
            'title': title,
            'publication_date': date,
            'author': author,
            'raw_text': raw_text,
            'cleaned_text': cleaned_text
        }

    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the web request for {article_url}: {e}")
        return None
    except Exception as e:
        print(f"An error occurred while parsing the article: {e}")
        return None

# Run the function with the specified URL and print the result
if __name__ == "__main__":
    article_details = extract_article_data_from_url(url)
    if article_details:
        print("\n--- Extracted Article Details ---")
        pprint.pprint(article_details)
        print("---------------------------------")

