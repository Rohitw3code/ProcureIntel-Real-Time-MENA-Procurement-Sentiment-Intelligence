-- This table stores the links to be scraped.
CREATE TABLE article_links (
    id VARCHAR(255) PRIMARY KEY,  -- The URL hash as unique key
    url TEXT NOT NULL,
    source VARCHAR(255),
    scraped_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('failed', 'new', 'fetched'))
);

-- This table tracks the status and results of each pipeline execution.
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    new_links_found INTEGER,
    articles_scraped INTEGER,
    entities_analyzed INTEGER,
    status TEXT CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PAUSED')),
    details TEXT, -- To store error messages or other details
    scraper_stats JSONB -- Stores the count of new links found by each scraper as a JSON object.
);

-- This table stores the detailed content scraped from each article.
CREATE TABLE IF NOT EXISTS scraped_articles (
    id SERIAL PRIMARY KEY,
    link_id VARCHAR(255) NOT NULL REFERENCES article_links(id) ON DELETE CASCADE,
    source VARCHAR(255),
    url TEXT,
    title TEXT,
    author TEXT,
    publication_date TIMESTAMP WITH TIME ZONE,
    raw_text TEXT,
    cleaned_text TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(link_id) -- Ensures that we only store one copy of each article.
);
