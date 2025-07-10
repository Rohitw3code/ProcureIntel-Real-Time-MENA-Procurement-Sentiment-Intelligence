CREATE TABLE article_links (
    id VARCHAR(255) PRIMARY KEY,  -- The URL hash as unique key
    url TEXT NOT NULL,
    source VARCHAR(255),
    scraped_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('failed', 'new', 'fetched'))
);
