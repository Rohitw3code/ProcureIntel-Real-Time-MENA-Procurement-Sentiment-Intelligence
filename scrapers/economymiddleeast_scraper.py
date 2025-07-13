import requests
import json
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import pprint

# --- Scraper Configuration ---
SOURCE_NAME = "economymiddleeast.com"
# A list of business-related category pages to find article links
BUSINESS_CATEGORY_URLS = [
    "https://economymiddleeast.com/newscategories/banking-finance/",
    "https://economymiddleeast.com/newscategories/real-estate/",
    "https://economymiddleeast.com/newscategories/industry/",
    "https://economymiddleeast.com/newscategories/economy/",
    "https://economymiddleeast.com/newscategories/markets/",
    "https://economymiddleeast.com/newscategories/technology-innovation/",
    "https://economymiddleeast.com/newscategories/logistics/",
    "https://economymiddleeast.com/newscategories/sustainability/",
]

def get_article_urls():
    """
    Scrapes the business category pages to find all news article links.

    Returns:
        list: A list of unique, absolute URLs to the articles.
    """
    print(f"--- Fetching article links from: {SOURCE_NAME} ---")
    
    # Use a set to automatically handle duplicate links
    article_links = set()

    for category_url in BUSINESS_CATEGORY_URLS:
        try:
            print(f"Fetching from category: {category_url}")
            response = requests.get(category_url, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all anchor <a> tags that have an 'href' attribute
            for a_tag in soup.find_all('a', href=True):
                href = a_tag['href']
                
                # Check if the link is a news article
                if href and '/news/' in href:
                    # Construct the full, absolute URL
                    full_url = urljoin(category_url, href)
                    article_links.add(full_url)

        except requests.exceptions.RequestException as e:
            print(f"Error fetching article list from {category_url}: {e}")
            continue

    return sorted(list(article_links))

def scrape_article_content(url):
    """
    Extracts structured data from a single article page.

    Args:
        url (str): The URL of the article to scrape.

    Returns:
        dict: A dictionary containing the extracted article data, or None if an error occurs.
    """
    print(f"--- Scraping article content from: {url} ---")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')

        # --- Data Extraction ---
        title = soup.title.string.strip() if soup.title else 'N/A'

        date_tag = soup.find('meta', property='article:modified_time')
        date = date_tag['content'] if date_tag else 'N/A'
        
        author = 'N/A'
        # Try finding author in the more reliable JSON-LD script data first
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            if script.string:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict):
                        # Handle different JSON-LD structures
                        if data.get('@type') == 'NewsArticle' and 'author' in data:
                            author = data['author']['name']
                            break
                        if isinstance(data.get('@graph'), list):
                            for item in data['@graph']:
                                if item.get('@type') == 'NewsArticle' and 'author' in item:
                                    author = item['author']['name']
                                    break
                    if author != 'N/A':
                        break
                except (json.JSONDecodeError, KeyError, TypeError):
                    continue
        
        # Fallback to meta tag if not found in JSON-LD
        if author == 'N/A':
            author_tag = soup.find('meta', attrs={'name': 'author'})
            if author_tag and author_tag.get('content'):
                author = author_tag.get('content')

        # Find the main content container
        content_div = soup.find('div', class_='brxe-post-content')
        raw_text = ''
        if content_div:
            paragraphs = content_div.find_all('p')
            raw_text = '\n'.join([p.get_text(strip=True) for p in paragraphs])
        
        cleaned_text = ' '.join(raw_text.split())

        return {
            'url': url,
            'title': title,
            'publication_date': date,
            'author': author,
            'raw_text': raw_text,
            'cleaned_text': cleaned_text
        }

    except requests.exceptions.RequestException as e:
        print(f"Could not fetch article {url}. Error: {e}")
        return None
    except Exception as e:
        print(f"An error occurred while parsing {url}: {e}")
        return None

# --- Main Execution Block ---
if __name__ == "__main__":
    # 1. Get all article URLs from the specified categories
    all_urls = get_article_urls()

    if not all_urls:
        print("No articles found. Exiting.")
    else:
        print(f"\nFound {len(all_urls)} article URLs to scrape.\n")
        
        # 2. Scrape each article and store its data
        all_article_data = []
        for url in all_urls:
            data = scrape_article_content(url)
            if data:
                all_article_data.append(data)
                print(f"Successfully scraped: {data.get('title', 'N/A')}")
            else:
                print(f"Failed to scrape: {url}")
            print("-" * 20)
        
        # 3. Print all the collected data
        print("\n\n--- All Extracted Article Data ---")
        pprint.pprint(all_article_data)
        print(f"\n--- Total Articles Scraped: {len(all_article_data)} ---")
