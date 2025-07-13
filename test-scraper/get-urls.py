import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# List of business-related category URLs to scrape.
# You can add or remove URLs from this list to change the scope of the scrape.
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

def scrape_business_news_links():
    """
    Scrapes specified business category pages on a website, parses the HTML,
    and extracts all unique news article URLs.
    """
    # Use a set to store unique URLs to avoid duplicates
    news_urls_set = set()

    # Iterate over each category URL
    for category_url in BUSINESS_CATEGORY_URLS:
        try:
            # Send an HTTP GET request to the URL with a User-Agent header
            print(f"Requesting HTML from {category_url}...")
            response = requests.get(category_url, headers={'User-Agent': 'Mozilla/5.0'})
            # Raise an exception for bad status codes (4xx or 5xx)
            response.raise_for_status()
            html_content = response.text

            # Parse the HTML content using BeautifulSoup
            soup = BeautifulSoup(html_content, 'html.parser')

            # Find all 'a' (anchor) tags which typically contain links
            for link in soup.find_all('a'):
                href = link.get('href')
                
                # Check if the link has an href attribute and if it's a news article
                if href and '/news/' in href:
                    # Resolve relative URLs to absolute URLs using the current category_url as base
                    absolute_url = urljoin(category_url, href)
                    news_urls_set.add(absolute_url)

        except requests.exceptions.RequestException as e:
            print(f"An error occurred during the web request for {category_url}: {e}")
            continue  # Continue to the next category URL
        except Exception as e:
            print(f"An error occurred while processing {category_url}: {e}")
            continue  # Continue to the next category URL

    # Convert the set of unique URLs to a list
    news_urls_list = list(news_urls_set)
    
    return news_urls_list

# Run the function and print the results
if __name__ == "__main__":
    links = scrape_business_news_links()
    if links:
        print("\nFound business news URLs:")
        for news_url in links:
            print(news_url)
        print(f"\nTotal unique business news URLs found: {len(links)}")
    else:
        print("No business news URLs were found.")
