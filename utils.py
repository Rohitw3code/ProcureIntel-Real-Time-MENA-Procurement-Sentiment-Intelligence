import re

def clean_article_text(raw_text: str) -> str:
    """
    Clean raw article text scraped from a news site.
    Basic steps:
    1. Remove duplicate whitespace.
    2. Strip common boilerplate lines.
    3. Normalize quotes and punctuation.
    4. Strip trailing leading whitespace.
    """

    # 1️⃣ Remove line breaks that are excessive or weird.
    text = raw_text.replace('\r', '\n')

    # 2️⃣ Collapse multiple line breaks into one.
    text = re.sub(r'\n+', '\n', text)

    # 3️⃣ Remove common boilerplate lines.
    # Add more patterns for your source if you notice them!
    boilerplate_patterns = [
        r'Read more.*',
        r'Subscribe.*',
        r'Copyright.*',
        r'All rights reserved.*',
        r'Follow us on.*',
        r'Share this article.*'
    ]
    for pattern in boilerplate_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)

    # 4️⃣ Normalize fancy quotes to standard ones.
    text = text.replace('“', '"').replace('”', '"').replace("‘", "'").replace("’", "'")

    # 5️⃣ Remove extra spaces inside lines.
    text = re.sub(r'[ \t]+', ' ', text)

    # 6️⃣ Remove any double spaces leftover.
    text = re.sub(r' +', ' ', text)

    # 7️⃣ Strip leading and trailing whitespace.
    text = text.strip()

    return text
