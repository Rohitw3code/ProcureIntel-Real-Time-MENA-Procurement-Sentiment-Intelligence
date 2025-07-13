import requests
from bs4 import BeautifulSoup

# The URL of the website you want to scrape
url = "https://economymiddleeast.com/"
# The name of the file where the HTML will be saved
output_filename = "forbes.html"

def scrape_and_find_links():
    """
    Scrapes a website, saves the HTML, and extracts news links.
    """
    # Send an HTTP GET request to the URL
    print(f"Requesting HTML from {url}...")
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    response.raise_for_status()
    html_content = response.text

    # Save the HTML content to a file
    with open(output_filename, 'w', encoding='utf-8') as file:
        file.write(html_content)
    print(f"Successfully saved the HTML to {output_filename}")


# Run the function
if __name__ == "__main__":
    links = scrape_and_find_links()
    # You can now use the 'links' list for other purposes