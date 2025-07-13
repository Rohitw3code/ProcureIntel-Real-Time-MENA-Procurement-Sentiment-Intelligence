# scrapers/menabytes_scraper.py

import requests
from bs4 import BeautifulSoup
from utils.utils import clean_article_text

# --- Scraper Configuration ---
SOURCE_NAME = "menabytes.com"
BASE_URL = "https://www.menabytes.com"

def get_article_urls():
    """
    Scrapes the main page of menabytes.com to find all news article links.
    """
    print(f"Fetching article links from: {BASE_URL}")
    try:
        response = requests.get(BASE_URL, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        news_items = soup.find_all('li', class_='infinite-post')
        
        # Ensure the links are absolute URLs
        news_links = []
        for item in news_items:
            link_tag = item.find('a')
            if link_tag and link_tag.get('href'):
                href = link_tag['href']
                # The provided links are already absolute
                news_links.append(href)
        
        return list(set(news_links)) # Return unique links

    except requests.exceptions.RequestException as e:
        print(f"Error fetching article list from MENAbytes: {e}")
        return []

def scrape_article_content(url):
    """
    Extracts structured data from a single MENAbytes article page.
    """
    print(f"Scraping article content from: {url}")
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        title_tag = soup.find('h1', class_='post-title')
        title = title_tag.get_text(strip=True) if title_tag else 'N/A'

        date_tag = soup.find('time', itemprop='datePublished')
        date = date_tag['datetime'] if date_tag else 'N/A'

        author_tag = soup.find('span', class_='author-name')
        author = author_tag.get_text(strip=True) if author_tag else 'N/A'

        content_area = soup.find('div', id='content-main')
        raw_text = ''
        cleaned_text = ''
        if content_area:
            raw_text = content_area.get_text(separator='\n', strip=True)
            paragraphs = content_area.find_all('p')
            cleaned_text = clean_article_text(raw_text)
        
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
