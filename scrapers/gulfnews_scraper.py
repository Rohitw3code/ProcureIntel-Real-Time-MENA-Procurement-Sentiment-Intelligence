import requests
import json
from bs4 import BeautifulSoup
from utils import clean_article_text
import re

# --- Scraper Configuration ---
SOURCE_NAME = "gulfnews.com"
# URL for the main page to start scraping links from
BASE_URL = "https://gulfnews.com/business"

def get_article_urls():
    """
    Scrapes the Gulf News business section page to find all news article links.
    This function now uses the BASE_URL constant and takes no arguments.

    Returns:
        list: A list of unique, absolute URLs to the articles.
    """
    print(f"--- Fetching article links from: {BASE_URL} ---")
    try:
        # Use the BASE_URL constant defined in this file
        response = requests.get(BASE_URL, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Use a set to automatically handle duplicate links
        article_links = set()
        
        # Regex to identify article URLs. This pattern looks for URLs that
        # have at least two path segments and end with a specific numeric ID format.
        # Example: /sport/cricket/story-slug-1.1234567
        article_pattern = re.compile(r'\/[^/]+\/.+-1\.\d+')

        # Find all anchor <a> tags that have an 'href' attribute
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            
            # Check if the link matches the article pattern
            if article_pattern.match(href):
                # Construct the full, absolute URL by prepending the base domain
                if href.startswith('/'):
                    full_url = "https://gulfnews.com" + href
                    article_links.add(full_url)

        print(f"--- Found {len(article_links)} unique article links ---")
        return sorted(list(article_links))

    except requests.exceptions.RequestException as e:
        print(f"Error fetching article list from Gulf News: {e}")
        return []

def scrape_article_content(url):
    """
    Extracts structured data from a single Gulf News article page.

    Args:
        url (str): The URL of the article to scrape.

    Returns:
        dict: A dictionary containing the extracted article data,
              or None if an error occurs.
    """
    print(f"--- Scraping article content from: {url} ---")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')

        # --- Data Extraction ---
        url_tag = soup.find('link', {'rel': 'canonical'})
        article_url = url_tag['href'] if url_tag else url

        title_tag = soup.find('h1', class_='ORiM7')
        title = title_tag.get_text(strip=True) if title_tag else 'Title not found'

        publication_date = 'Date not found'
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            try:
                if script.string:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and data.get('@type') in ['Article', 'NewsArticle'] and 'datePublished' in data:
                        publication_date = data['datePublished']
                        break
            except (json.JSONDecodeError, TypeError):
                continue
        
        if publication_date == 'Date not found':
            date_tag = soup.find('time')
            if date_tag:
                publication_date = date_tag.get('dateTime', date_tag.get_text(strip=True))

        author_tag = soup.select_one('div._48or4 > a')
        author = author_tag.get_text(strip=True) if author_tag else 'Author not found'

        story_body_divs = soup.select('div.Iqx1L p')
        raw_text_list = [p.get_text(strip=True) for p in story_body_divs]
        text_content = ' '.join(raw_text_list)
        raw_text = text_content
        cleaned_text = clean_article_text(raw_text)

        return {
            'url': article_url,
            'title': title,
            'publication_date': publication_date,
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
    # 1. Get all article URLs from the base URL
    all_urls = get_article_urls()

    if not all_urls:
        print("No articles found. Exiting.")
    else:
        # 2. Scrape each article and store its data
        all_article_data = []
        for url in all_urls:
            data = scrape_article_content(url)
            if data:
                all_article_data.append(data)
                print(f"Successfully scraped: {data['title']}")
            else:
                print(f"Failed to scrape: {url}")
            print("-" * 20)
        
        # 3. Print all the collected data
        print("\n\n--- All Extracted Article Data ---")
        print(json.dumps(all_article_data, indent=4))
