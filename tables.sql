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

-- Optional: Add a fast similarity search index
CREATE INDEX IF NOT EXISTS article_embeddings_vector_idx
    ON article_embeddings USING ivfflat (embedding vector_l2_ops);

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
    embedding_status TEXT DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'success', 'failed')),
    analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'success', 'failed')), -- NEW COLUMN
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(link_id)
);

-- This table will store the vector embeddings for each article.
CREATE TABLE IF NOT EXISTS article_embeddings (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL REFERENCES scraped_articles(id) ON DELETE CASCADE,
    source VARCHAR(255),
    publication_date TIMESTAMP WITH TIME ZONE,
    model VARCHAR(255),
    embedding vector(1536), -- Dimension for OpenAI's text-embedding-3-small model
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id) -- Ensures only one embedding per article.
);
