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
CREATE TYPE pipeline_status AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'PAUSED','STOPPED');
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
    articles_embedded INTEGER, 
    entities_analyzed INTEGER,
    status TEXT CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PAUSED','STOPPED')),
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
  cost NUMERIC(10, 8), 
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
  cost NUMERIC(10, 8), 
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
  company_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS pipeline_runs (
    id SERIAL PRIMARY KEY,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status pipeline_status, -- Uses the updated ENUM
    details TEXT, -- To store error messages or other details
    scraper_stats JSONB, -- Stores the count of new links found by each scraper
    new_links_found INTEGER DEFAULT 0,
    articles_scraped INTEGER DEFAULT 0,
    articles_embedded INTEGER DEFAULT 0,
    articles_analyzed INTEGER DEFAULT 0,
    analysis_cost NUMERIC(12, 8) DEFAULT 0,
    embedding_cost NUMERIC(12, 8) DEFAULT 0,
    total_cost NUMERIC(12, 8) DEFAULT 0
);


CREATE OR REPLACE VIEW langchain_articles AS
SELECT
  -- The unique ID for the embedding row, which PGVector will use
  ae.id,

  -- The text content LangChain will use for the document
  sa.cleaned_text AS page_content,

  -- The embedding vector
  ae.embedding,

  -- A JSONB object containing all other relevant information as metadata
  jsonb_build_object(
      'article_id', sa.id,
      'title', sa.title,
      'url', sa.url,
      'source', sa.source,
      'publication_date', sa.publication_date,
      'countries', aa.countries,
      'commodities', aa.commodities,
      'company_name', ca.company_name,
      'sentiment', ca.sentiment,
      'risk_type', ca.risk_type
  ) AS metadata
FROM
  article_embeddings ae
JOIN
  scraped_articles sa ON ae.article_id = sa.id
LEFT JOIN
  article_analysis aa ON sa.id = aa.article_id
LEFT JOIN
  company_analysis ca ON aa.id = ca.article_analysis_id;

SELECT COUNT(DISTINCT unnest) AS unique_count
FROM article_analysis, unnest(countries) AS unnest;


WITH CompanyIDMapping AS (
    SELECT
        company_name,
        -- Assign a unique, dense rank number to each distinct company name.
        -- The result is cast to INTEGER to match the column type.
        DENSE_RANK() OVER(ORDER BY company_name)::INTEGER AS generated_id
    FROM
        (SELECT DISTINCT company_name FROM company_analysis) AS DistinctCompanies
)
UPDATE
    company_analysis
SET
    company_id = CompanyIDMapping.generated_id
FROM
    CompanyIDMapping
WHERE
    company_analysis.company_name = CompanyIDMapping.company_name;
CREATE INDEX idx_company_analysis_company_id ON company_analysis(company_id);


-- Step 1: Create the new 'companies' table.
-- We add a UNIQUE constraint to 'real_name' to ensure there are no duplicate company entries.
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  real_name TEXT NOT NULL UNIQUE,
  embedding vector(1536)
);

-- Step 2: Populate the 'companies' table with unique company names
-- from your existing 'company_analysis' table.
INSERT INTO companies (real_name)
SELECT DISTINCT company_name FROM company_analysis
ON CONFLICT (real_name) DO NOTHING; -- This prevents errors if you run the script multiple times.

-- Step 3: Add the 'company_id' column to your existing 'company_analysis' table.
-- We add it without the foreign key constraint first to allow for updating.
ALTER TABLE company_analysis
ADD COLUMN IF NOT EXISTS company_id INTEGER;

-- Step 4: Update the 'company_analysis' table to set the correct 'company_id'
-- for each row by matching the company name.
UPDATE company_analysis ca
SET company_id = c.id
FROM companies c
WHERE ca.company_name = c.real_name;

-- Step 5: Now that the data is linked, add the foreign key constraint.
-- This enforces the relationship between the two tables.
ALTER TABLE company_analysis
ADD CONSTRAINT fk_company
FOREIGN KEY (company_id) REFERENCES companies(id);

-- Step 6 (Optional but Recommended): If every analysis must have a company,
-- alter the column to be NOT NULL.
-- This is only possible if every row in company_analysis was successfully matched in Step 4.
ALTER TABLE company_analysis
ALTER COLUMN company_id SET NOT NULL;


