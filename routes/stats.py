import os
import psycopg2
from flask import Blueprint, jsonify,request
from database import DB_CONNECTION_STRING
from psycopg2 import extras
import logging

logging.basicConfig(level=logging.INFO)

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@stats_bp.route('/insights', methods=['GET'])
def get_article_stats():
    """
    GET /api/stats/articles
    Returns various statistics about the scraped and analyzed articles.
    
    This version uses a single, efficient SQL query via psycopg2 to fetch all stats
    at once, avoiding loops and multiple round trips to the database.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    conn = None
    try:
        # Establish the database connection
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        
        # Use a cursor to execute the query as requested
        with conn.cursor() as cur:
            sql = """
                WITH scraped_count AS (
                    SELECT COUNT(*) as total FROM scraped_articles
                ),
                analyzed_count AS (
                    SELECT COUNT(*) as total FROM article_analysis
                ),
                tender_count AS (
                    SELECT COUNT(*) as total FROM article_analysis WHERE mode = 'Tender'
                ),
                company_count AS (
                    SELECT COUNT(DISTINCT company_name) as total FROM company_analysis
                ),
                country_count AS (
                    SELECT COUNT(DISTINCT unnest) as total FROM article_analysis, unnest(countries)
                ),
                commodity_count AS (
                    SELECT COUNT(DISTINCT unnest) as total FROM article_analysis, unnest(commodities)
                ),
                sentiment_counts AS (
                    SELECT
                        COUNT(*) FILTER (WHERE sentiment = 'Positive') as positive,
                        COUNT(*) FILTER (WHERE sentiment = 'Negative') as negative,
                        COUNT(*) FILTER (WHERE sentiment = 'Neutral') as neutral
                    FROM company_analysis
                )
                SELECT
                    (SELECT total FROM scraped_count) as total_articles_scraped,
                    (SELECT total FROM analyzed_count) as articles_analyzed,
                    (SELECT total FROM tender_count) as total_tenders,
                    (SELECT total FROM company_count) as total_companies,
                    (SELECT total FROM country_count) as total_countries,
                    (SELECT total FROM commodity_count) as total_commodities,
                    (SELECT positive FROM sentiment_counts) as positive_sentiments,
                    (SELECT negative FROM sentiment_counts) as negative_sentiments,
                    (SELECT neutral FROM sentiment_counts) as neutral_sentiments;
            """
            cur.execute(sql)
            # Fetch the single result row
            result = cur.fetchone()

        if not result:
             return jsonify({"message": "No statistics found. The tables might be empty."}), 200

        # Map the result tuple to the desired JSON structure, handling NULLs by defaulting to 0
        stats = {
            "total_data_news_articles_scraped": result[0] or 0,
            "articles_analyzed": result[1] or 0,
            "total_tenders": result[2] or 0,
            "total_companies": result[3] or 0,
            "total_countries": result[4] or 0,
            "total_commodities": result[5] or 0,
            "sentiment_analysis": {
                "positive": result[6] or 0,
                "negative": result[7] or 0,
                "neutral": result[8] or 0
            }
        }

        return jsonify(stats), 200

    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        # Ensure the connection is always closed
        if conn:
            conn.close()

@stats_bp.route('/search/companies', methods=['GET'])
def search_companies():
    """
    GET /api/stats/search/companies
    Searches for companies by name with optional filters.
    Query Parameters:
        - name (required): The company name to search for (case-insensitive, partial match).
        - sentiment (optional): Filter by sentiment ('Positive', 'Negative', 'Neutral').
        - risk_type (optional): Filter by risk classification.
        - mode (optional): Filter by analysis mode ('Tender', 'Sentiment').
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    company_name = request.args.get('name')
    if not company_name:
        return jsonify({"error": "The 'name' query parameter is required."}), 400

    # Optional filters from query parameters
    filters = {
        'sentiment': request.args.get('sentiment'),
        'risk_type': request.args.get('risk_type'),
        'mode': request.args.get('mode')
    }

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        # Using RealDictCursor to get results as dictionaries directly
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            # Base query joins the necessary tables
            base_sql = """
                SELECT
                    ca.company_name,
                    ca.sentiment,
                    ca.risk_type,
                    ca.reason_for_sentiment,
                    aa.mode,
                    aa.countries,
                    aa.commodities,
                    sa.title as article_title,
                    sa.url as article_url,
                    sa.publication_date
                FROM company_analysis ca
                JOIN article_analysis aa ON ca.article_analysis_id = aa.id
                JOIN scraped_articles sa ON aa.article_id = sa.id
                WHERE ca.company_name ILIKE %(company_name)s
            """
            
            params = {'company_name': f'%{company_name}%'}
            
            # Dynamically add WHERE clauses for optional filters
            for key, value in filters.items():
                if value:
                    # Determine the table alias for the column
                    if key in ['sentiment', 'risk_type']:
                        table_alias = 'ca'
                    else: # mode
                        table_alias = 'aa'
                    
                    base_sql += f" AND {table_alias}.{key} = %({key})s"
                    params[key] = value

            base_sql += " ORDER BY sa.publication_date DESC;"

            cur.execute(base_sql, params)
            results = cur.fetchall()

        return jsonify(results), 200

    except psycopg2.Error as e:
        logging.error(f"Database error during company search: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"An unexpected error occurred during company search: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()