# scrapers/zawya_scraper.py

import requests
from bs4 import BeautifulSoup

SOURCE_NAME = "zawya.com"
BASE_URL = "https://www.zawya.com"

def get_article_urls():
    """Scrapes the list of article URLs from the Zawya business page."""
    list_url = f"{BASE_URL}/en/business"
    print(f"Fetching article links from: {list_url}")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(list_url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'lxml')
        links = []
        for article in soup.find_all('div', class_='teaser'):
            link_tag = article.find(['h2', 'h3'], class_='teaser-title')
            if link_tag and link_tag.find('a'):
                href = link_tag.find('a')['href']
                full_link = href if href.startswith('http') else BASE_URL + href
                links.append(full_link)
        
        return list(set(links))
    except requests.exceptions.RequestException as e:
        print(f"Error fetching article list from Zawya: {e}")
        return []

def scrape_article_content(url):
    """
    MODIFIED: Scrapes content and metadata, but no longer includes raw_html.
    """
    print(f"Scraping article content from: {url}")
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'lxml')

        title = soup.find('h1', class_='article-title').text.strip() if soup.find('h1', class_='article-title') else "N/A"
        date_tag = soup.find('div', class_='article-date')
        date = date_tag.find('span').text.strip() if date_tag and date_tag.find('span') else "N/A"
        author = soup.find('span', class_='author-name-text').text.strip() if soup.find('span', class_='author-name-text') else "N/A"
        
        article_body_div = soup.find('div', class_='article-body')
        
        if article_body_div:
            raw_text = article_body_div.get_text(separator='\n', strip=True)
            paragraphs = article_body_div.find_all('p')
            cleaned_text = '\n'.join([p.text.strip() for p in paragraphs])
        else:
            raw_text = "N/A"
            cleaned_text = "N/A"

        # MODIFIED: Removed 'raw_html' from the returned dictionary
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
