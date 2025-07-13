import os
import psycopg2
from flask import Blueprint, jsonify,request
from database import DB_CONNECTION_STRING
from psycopg2 import extras
import logging
from .search import search_similar_companies

logging.basicConfig(level=logging.INFO)

stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')

@stats_bp.route('/insights', methods=['GET'])
def get_article_stats():
    """
    GET /api/stats/insights
    Returns various statistics about the scraped and analyzed articles.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
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
                    SELECT COUNT(*) as total FROM companies
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
            result = cur.fetchone()

        if not result:
            return jsonify({"message": "No statistics found. The tables might be empty."}), 200

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
        if conn:
            conn.close()

@stats_bp.route('/search/companies', methods=['GET'])
def search_companies():
    """
    GET /api/stats/search/companies
    Searches for companies by similarity-matched IDs with optional filters.
    Query Parameters:
        - name (required): The company name to search for (used for similarity match).
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

    # Get matching company IDs using your vector store
    company_ids = search_similar_companies(company_name)

    if not company_ids:
        return jsonify({"message": "No similar companies found."}), 200

    filters = {
        'sentiment': request.args.get('sentiment'),
        'risk_type': request.args.get('risk_type'),
        'mode': request.args.get('mode')
    }

    print(company_ids)

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            sql = """
                SELECT
                    c.real_name AS company_name,
                    ca.sentiment,
                    ca.risk_type,
                    ca.reason_for_sentiment,
                    aa.mode,
                    aa.countries,
                    aa.commodities,
                    sa.title AS article_title,
                    sa.url AS article_url,
                    sa.publication_date
                FROM company_analysis ca
                JOIN companies c ON ca.company_id = c.id
                JOIN article_analysis aa ON ca.article_analysis_id = aa.id
                JOIN scraped_articles sa ON aa.article_id = sa.id
                WHERE ca.company_id = ANY (%(company_ids)s)
            """
            params = {'company_ids': company_ids}

            for key, value in filters.items():
                if value:
                    if key in ['sentiment', 'risk_type']:
                        table_alias = 'ca'
                    else:
                        table_alias = 'aa'
                    sql += f" AND {table_alias}.{key} = %({key})s"
                    params[key] = value

            sql += """
                ORDER BY array_position(%(company_ids)s, ca.company_id);
            """
            cur.execute(sql, params)
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

@stats_bp.route('/company-sentiment-summary', methods=['GET'])
def get_company_sentiment_summary():
    """
    GET /api/stats/company-sentiment-summary
    Provides a summary of sentiment counts for each company using the companies table.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    filters = {
        'name': request.args.get('name'),
        'risk_type': request.args.get('risk_type'),
        'mode': request.args.get('mode')
    }
    order_by_param = request.args.get('order_by', 'total').lower()
    try:
        limit = int(request.args.get('limit', 10))
    except ValueError:
        limit = 10

    allowed_ordering = {
        'positive': 'positive',
        'negative': 'negative',
        'neutral': 'neutral',
        'total': 'total_sentiments'
    }
    order_by_column = allowed_ordering.get(order_by_param, 'total_sentiments')

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            sql = """
                SELECT
                    c.real_name AS company_name,
                    COUNT(ca.sentiment) FILTER (WHERE ca.sentiment = 'Positive') AS positive,
                    COUNT(ca.sentiment) FILTER (WHERE ca.sentiment = 'Negative') AS negative,
                    COUNT(ca.sentiment) FILTER (WHERE ca.sentiment = 'Neutral') AS neutral,
                    COUNT(ca.sentiment) AS total_sentiments
                FROM company_analysis ca
                JOIN companies c ON ca.company_id = c.id
                JOIN article_analysis aa ON ca.article_analysis_id = aa.id
            """

            where_clauses = []
            params = {'limit': limit}

            if filters['name']:
                where_clauses.append("c.real_name ILIKE %(company_name)s")
                params['company_name'] = f"%{filters['name']}%"

            if filters['risk_type']:
                where_clauses.append("ca.risk_type = %(risk_type)s")
                params['risk_type'] = filters['risk_type']

            if filters['mode']:
                where_clauses.append("aa.mode = %(mode)s")
                params['mode'] = filters['mode']

            if where_clauses:
                sql += " WHERE " + " AND ".join(where_clauses)

            sql += f"""
                GROUP BY c.real_name
                ORDER BY {order_by_column} DESC
                LIMIT %(limit)s;
            """

            cur.execute(sql, params)
            results = cur.fetchall()

        return jsonify(results), 200

    except psycopg2.Error as e:
        logging.error(f"Database error during company sentiment summary: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"An unexpected error occurred during company sentiment summary: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@stats_bp.route('/tenders', methods=['GET'])
def get_latest_tenders():
    """
    GET /api/stats/tenders
    Retrieves the latest tender opportunities, ordered by publication date.
    Query Parameters:
        - limit (optional): The number of tenders to return. Defaults to 5.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    try:
        limit = int(request.args.get('limit', 5))
    except ValueError:
        return jsonify({"error": "Invalid 'limit' parameter. Must be an integer."}), 400

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            # This query joins article_analysis with scraped_articles to get tender details
            sql = """
                SELECT
                    sa.title,
                    sa.url,
                    sa.publication_date,
                    aa.countries,
                    aa.commodities,
                    aa.contract_value,
                    aa.deadline
                FROM article_analysis aa
                JOIN scraped_articles sa ON aa.article_id = sa.id
                WHERE aa.mode = 'Tender'
                ORDER BY sa.publication_date DESC
                LIMIT %(limit)s;
            """
            params = {'limit': limit}
            cur.execute(sql, params)
            results = cur.fetchall()

        return jsonify(results), 200

    except psycopg2.Error as e:
        logging.error(f"Database error while fetching tenders: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"An unexpected error occurred while fetching tenders: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()


@stats_bp.route('/companies/shuffled', methods=['GET'])
def get_shuffled_companies():
    """
    GET /api/stats/companies/shuffled
    Retrieves a random list of 4 distinct company names.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            # Correct: Use subquery to select DISTINCT, then ORDER BY RANDOM()
            sql = """
                SELECT DISTINCT ON (company_name) *
                FROM company_analysis
                WHERE company_name IN (
                    SELECT company_name
                    FROM company_analysis
                    GROUP BY company_name
                    ORDER BY RANDOM()
                    LIMIT 4
                )
                ORDER BY company_name, RANDOM();                
                """
            cur.execute(sql)
            results = cur.fetchall()

        return jsonify(results), 200

    except psycopg2.Error as e:
        logging.error(f"Database error while fetching shuffled companies: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"An unexpected error occurred while fetching shuffled companies: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()
