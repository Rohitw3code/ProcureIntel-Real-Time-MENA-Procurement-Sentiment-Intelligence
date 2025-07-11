-- =======================================================================
-- Drop and recreate ENUM types safely (only if you're sure it's safe!)
-- =======================================================================

DROP TYPE IF EXISTS link_status CASCADE;
DROP TYPE IF EXISTS pipeline_status CASCADE;
DROP TYPE IF EXISTS embedding_status CASCADE;
DROP TYPE IF EXISTS analysis_status CASCADE;
DROP TYPE IF EXISTS analysis_mode CASCADE;
DROP TYPE IF EXISTS sentiment_type CASCADE;
DROP TYPE IF EXISTS risk_classification CASCADE;

-- =======================================================================
-- Redefine ENUM types
-- =======================================================================

CREATE TYPE link_status AS ENUM ('failed', 'success', 'pending');
CREATE TYPE pipeline_status AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PAUSED');
CREATE TYPE embedding_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE analysis_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE analysis_mode AS ENUM ('Tender', 'Sentiment', 'Ignore');
CREATE TYPE sentiment_type AS ENUM ('Positive', 'Negative', 'Neutral');
CREATE TYPE risk_classification AS ENUM (
  'Trade Barrier',
  'Supply Disruption',
  'Compliance',
  'Financial',
  'Reputational'
);

-- =======================================================================
-- Tables
-- =======================================================================

-- This table stores the links to be scraped.
CREATE TABLE IF NOT EXISTS article_links (
  id VARCHAR(255) PRIMARY KEY,  -- The URL hash as unique key
  url TEXT NOT NULL,
  source VARCHAR(255),
  scraped_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status link_status DEFAULT 'pending'
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
  embedding_status embedding_status DEFAULT 'pending',
  analysis_status analysis_status DEFAULT 'pending',
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(link_id)
);

-- Stores embeddings for each article.
CREATE TABLE IF NOT EXISTS article_embeddings (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES scraped_articles(id) ON DELETE CASCADE,
  source VARCHAR(255),
  publication_date TIMESTAMP WITH TIME ZONE,
  model VARCHAR(255),
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id)
);

-- Index for vector search
CREATE INDEX IF NOT EXISTS article_embeddings_vector_idx
  ON article_embeddings USING ivfflat (embedding vector_l2_ops);

-- Stores article-level analysis.
CREATE TABLE IF NOT EXISTS article_analysis (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES scraped_articles(id) ON DELETE CASCADE,
  mode analysis_mode,
  countries TEXT[],
  commodities TEXT[],
  contract_value TEXT,  -- Consider changing to NUMERIC in future
  deadline TEXT,        -- Consider changing to DATE/TIMESTAMP in future
  model_type TEXT,
  model_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id)
);

-- Stores company-level sentiment/risk analysis.
CREATE TABLE IF NOT EXISTS company_analysis (
  id SERIAL PRIMARY KEY,
  article_analysis_id INTEGER NOT NULL REFERENCES article_analysis(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  sentiment sentiment_type,
  risk_type risk_classification,
  reason_for_sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

