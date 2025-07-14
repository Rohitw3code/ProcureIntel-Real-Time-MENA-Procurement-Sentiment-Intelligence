import os
import psycopg2
from flask import Blueprint, jsonify,request
from database import DB_CONNECTION_STRING
from psycopg2 import extras
import logging
from .search import search_similar_companies,search_articles,search_tenders
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from groq import Groq


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Example: Use your same OpenAI key or env vars
llm = ChatOpenAI(model="gpt-4o-mini")  # Or your preferred model

# Init Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

reason_summary_prompt = ChatPromptTemplate.from_template(
    """
    You are an assistant. Combine these multiple reasons into a single clear, concise summary for a sentiment analysis report.
    
    Reasons:
    {reasons}
    
    Provide a clear, short summary.
    """
)

def summarize_with_groq(description: str) -> str:
    """
    Uses Groq's LLM to summarize the given description.
    """
    response = groq_client.chat.completions.create(
        model="llama3-70b-8192",  # or any Groq-supported model
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Write a short, clear summary that is easy for a user to read."
            },
            {
                "role": "user",
                "content": f"Summarize this article:\n\n{description} only return summarized data no extra text"
            }
        ]
    )
    return response.choices[0].message.content.strip()


def summarize_reasons_with_ai(reasons: list[str]) -> str:
    cleaned = [r.strip() for r in reasons if r and r.strip()]
    if not cleaned:
        return ""
    if len(cleaned) == 1:
        return cleaned[0]

    # Create the final prompt
    prompt = reason_summary_prompt.format_messages(reasons="\n".join(cleaned))

    # Call LLM
    response = llm.invoke(prompt)

    print("summarizing.....")

    # Return just the text
    return response.content.strip()


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

@stats_bp.route('/search/companies1', methods=['GET'])
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

            sql += " ORDER BY sa.publication_date DESC;"

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

@stats_bp.route('/search/tender', methods=['GET'])
def search_tender():
    """
    GET /api/stats/search/tender
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    query = request.args.get('query')
    k = request.args.get('k')
    if not query:
        return jsonify({"error": "The 'query' parameter is required."}), 400

    article_id = search_tenders(query=query, k=k)  # your search logic

    conn = psycopg2.connect(DB_CONNECTION_STRING)
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        sql = """
            SELECT 
            sa.url,
            sa.cleaned_text,
            sa.source,
            aa.mode AS analysis_mode,
            aa.countries,
            aa.commodities,
            aa.contract_value,
            aa.deadline
            FROM 
            scraped_articles sa
            LEFT JOIN 
            article_analysis aa ON sa.id = aa.article_id
            WHERE 
            sa.id = ANY(%s)
        """
        cur.execute(sql, (article_id,))
        result = cur.fetchall()
    conn.close()
    return jsonify(result)





@stats_bp.route('/search/companies', methods=['GET'])
def search_companies1():
    """
    GET /api/stats/search/companies1
    Returns grouped company insights with additional commodity, country, contract value, and risk stats.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    company_name = request.args.get('name')
    if not company_name:
        return jsonify({"error": "The 'name' query parameter is required."}), 400

    company_ids = search_similar_companies(company_name)

    if not company_ids:
        return jsonify({"message": "No similar companies found."}), 200

    filters = {
        'sentiment': request.args.get('sentiment'),
        'risk_type': request.args.get('risk_type'),
        'mode': request.args.get('mode')
    }

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            sql = """
                WITH base_data AS (
                    SELECT
                        c.id AS company_id,
                        c.real_name AS company_name,
                        ca.sentiment,
                        ca.reason_for_sentiment,
                        sa.url,
                        unnest(aa.commodities) AS commodity,
                        unnest(aa.countries) AS country,
                        aa.contract_value,
                        ca.risk_type
                    FROM company_analysis ca
                    JOIN companies c ON ca.company_id = c.id
                    JOIN article_analysis aa ON ca.article_analysis_id = aa.id
                    JOIN scraped_articles sa ON aa.article_id = sa.id
                    WHERE ca.company_id = ANY (%(company_ids)s)
            """

            params = {'company_ids': company_ids}

            where_clauses = []

            for key, value in filters.items():
                if value:
                    if key in ['sentiment', 'risk_type']:
                        table_alias = 'ca'
                    else:
                        table_alias = 'aa'
                    where_clauses.append(f"{table_alias}.{key} = %({key})s")
                    params[key] = value

            if where_clauses:
                sql += " AND " + " AND ".join(where_clauses)

            sql += """
                )
                SELECT
                    company_id,
                    company_name,
                    COUNT(*) AS total_occurrences,
                    COUNT(*) FILTER (WHERE sentiment = 'Positive') AS positive_count,
                    COUNT(*) FILTER (WHERE sentiment = 'Negative') AS negative_count,
                    COUNT(*) FILTER (WHERE sentiment = 'Neutral') AS neutral_count,
                    ARRAY_AGG(DISTINCT url) AS all_article_urls,
                    ARRAY_AGG(reason_for_sentiment) AS all_reasons,
                    
                    COUNT(DISTINCT commodity) AS total_unique_commodities,
                    ARRAY_AGG(commodity) AS all_commodities,
                    
                    COUNT(DISTINCT country) AS total_unique_countries,
                    ARRAY_AGG(country) AS all_countries,
                    
                    COUNT(DISTINCT contract_value) AS total_unique_contract_values,
                    
                    JSONB_OBJECT_AGG(risk_type, ct) FILTER (WHERE risk_type IS NOT NULL) AS risk_type_counts
                FROM (
                    SELECT
                        *,
                        COUNT(*) OVER (PARTITION BY risk_type) AS ct
                    FROM base_data
                ) sub
                GROUP BY company_id, company_name
                ORDER BY array_position(%(company_ids)s, company_id);
            """

            cur.execute(sql, params)
            rows = cur.fetchall()

        results = []
        for row in rows:
            # summarized_reason = summarize_reasons_with_ai(row["all_reasons"] or [])
            if row["all_reasons"]:
                summarized_reason = row["all_reasons"][0]+"....read more"

            # Get top 3 commodities
            commodities = [c for c in row["all_commodities"] if c]
            commodities_count = {}
            for c in commodities:
                commodities_count[c] = commodities_count.get(c, 0) + 1
            top_commodities = sorted(commodities_count.items(), key=lambda x: x[1], reverse=True)[:3]

            # Get top 3 countries
            countries = [c for c in row["all_countries"] if c]
            countries_count = {}
            for c in countries:
                countries_count[c] = countries_count.get(c, 0) + 1
            top_countries = sorted(countries_count.items(), key=lambda x: x[1], reverse=True)[:3]

            results.append({
                "company_id": row["company_id"],
                "company_name": row["company_name"],
                "sentiments": {
                    "positive": row["positive_count"] or 0,
                    "negative": row["negative_count"] or 0,
                    "neutral": row["neutral_count"] or 0
                },
                "urls": row["all_article_urls"] or [],
                "reason": summarized_reason,
                "commodities": {
                    "total_unique": row["total_unique_commodities"],
                    "top_3": [{"name": k, "count": v} for k, v in top_commodities]
                },
                "countries": {
                    "total_unique": row["total_unique_countries"],
                    "top_3": [{"name": k, "count": v} for k, v in top_countries]
                },
                "contract_values": {
                    "total_unique": row["total_unique_contract_values"]
                },
                "risk_types": row["risk_type_counts"] or {}
            })

        return jsonify(results), 200

    except psycopg2.Error as e:
        logging.error(f"Database error during grouped company search: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"An unexpected error occurred during grouped company search: {e}")
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
                    c.id as company_id,
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
                GROUP BY c.id
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










@stats_bp.route('/company/sentiments', methods=['GET'])
def get_company_sentiments():
    """
    GET /api/stats/company/sentiments?company_id=123
    Returns the real name and all unique sentiment + reason + date for the given company_id.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    company_id = request.args.get('company_id')
    if not company_id:
        return jsonify({"error": "The 'company_id' query parameter is required."}), 400

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            sql = """
                SELECT
                    c.real_name,
                    ca.sentiment,
                    ca.reason_for_sentiment,
                    DATE(sa.scraped_at) AS sentiment_date
                FROM company_analysis ca
                JOIN companies c ON ca.company_id = c.id
                JOIN article_analysis aa ON ca.article_analysis_id = aa.id
                JOIN scraped_articles sa ON aa.article_id = sa.id
                WHERE c.id = %(company_id)s
                GROUP BY c.real_name, ca.sentiment, ca.reason_for_sentiment, DATE(sa.scraped_at)
                ORDER BY sentiment_date DESC;
            """

            cur.execute(sql, {'company_id': company_id})
            rows = cur.fetchall()

        if not rows:
            return jsonify({"message": "No sentiments found for the specified company ID."}), 200

        # Structure as: {date: [ {sentiment, reason} ]}
        timeline = {}
        for row in rows:
            date_str = row['sentiment_date'].isoformat()
            if date_str not in timeline:
                timeline[date_str] = []
            timeline[date_str].append({
                "sentiment": row["sentiment"],
                "reason": row["reason_for_sentiment"]
            })

        result = {
            "company_id": company_id,
            "real_name": rows[0]["real_name"],
            "sentiment_timeline": timeline
        }

        return jsonify(result), 200

    except psycopg2.Error as e:
        logging.error(f"Database error while fetching company sentiments: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"Unexpected error while fetching company sentiments: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@stats_bp.route('/company/article-count', methods=['GET'])
def get_company_article_count():
    """
    GET /api/stats/company/article-count?company_id=123
    Returns the real name, total article count, distinct scraped dates, and all unique article IDs for the given company_id.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    company_id = request.args.get('company_id')
    if not company_id:
        return jsonify({"error": "The 'company_id' query parameter is required."}), 400

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            sql = """
                SELECT
                    c.real_name,
                    COUNT(DISTINCT sa.id) AS article_count,
                    ARRAY_AGG(DISTINCT sa.id) AS article_ids,
                    ARRAY_AGG(DISTINCT DATE(sa.scraped_at)) AS article_dates
                FROM company_analysis ca
                JOIN companies c ON ca.company_id = c.id
                JOIN article_analysis aa ON ca.article_analysis_id = aa.id
                JOIN scraped_articles sa ON aa.article_id = sa.id
                WHERE c.id = %(company_id)s
                GROUP BY c.real_name;
            """

            cur.execute(sql, {'company_id': company_id})
            row = cur.fetchone()

        if not row:
            return jsonify({"message": "No articles found for the specified company ID."}), 200

        result = {
            "company_id": company_id,
            "real_name": row["real_name"],
            "article_count": row["article_count"],
            "article_ids": sorted(row["article_ids"]) if row["article_ids"] else [],
            "article_dates": sorted([date.isoformat() for date in row["article_dates"]]) if row["article_dates"] else []
        }

        return jsonify(result), 200

    except psycopg2.Error as e:
        logging.error(f"Database error while fetching company article count: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"Unexpected error while fetching company article count: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@stats_bp.route('/risk-factors/counts', methods=['GET'])
def get_risk_factors_counts_all_dates():
    """
    GET /api/stats/risk-factors/counts?company_id=123
    Returns the count of each risk_type grouped by date (scraped_at date).
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    company_id = request.args.get('company_id')

    conn = None
    try:
        conn = psycopg2.connect(DB_CONNECTION_STRING)
        with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
            sql = """
                SELECT
                    DATE(sa.scraped_at) AS date,
                    ca.risk_type,
                    COUNT(*) AS count
                FROM company_analysis ca
                JOIN article_analysis aa ON ca.article_analysis_id = aa.id
                JOIN scraped_articles sa ON aa.article_id = sa.id
                WHERE ca.risk_type IS NOT NULL
            """

            params = {}

            if company_id:
                sql += " AND ca.company_id = %(company_id)s"
                params['company_id'] = company_id

            sql += """
                GROUP BY date, ca.risk_type
                ORDER BY date DESC, ca.risk_type;
            """

            cur.execute(sql, params)
            rows = cur.fetchall()

        # Organize output: {date: {risk_type: count}}
        date_risk_counts = {}
        for row in rows:
            date_key = row["date"].isoformat()
            if date_key not in date_risk_counts:
                date_risk_counts[date_key] = {}
            date_risk_counts[date_key][row["risk_type"]] = row["count"]

        return jsonify({
            "company_id": company_id,
            "risk_counts_by_date": date_risk_counts
        }), 200

    except psycopg2.Error as e:
        logging.error(f"Database error while fetching risk factor counts: {e}")
        return jsonify({"error": "A database error occurred.", "details": str(e)}), 500
    except Exception as e:
        logging.error(f"Unexpected error while fetching risk factor counts: {e}")
        return jsonify({"error": "An internal server error occurred.", "details": str(e)}), 500
    finally:
        if conn:
            conn.close()

@stats_bp.route('/search/articles', methods=['GET'])
def search_news_articles():
    """
    Searches for articles similar to the given query using the ArticleVectorStore.
    Returns article details: id, title, author, url, description, publication_date.
    """
    if not DB_CONNECTION_STRING:
        logging.error("DATABASE_URL environment variable not set.")
        return jsonify({"error": "Database connection string is not configured."}), 500

    query = request.args.get('query')
    k = int(request.args.get('k', 4))

    # Vector search — returns list of IDs
    article_ids = search_articles(query, k)

    if not article_ids:
        return jsonify([])

    # Connect to DB
    conn = psycopg2.connect(DB_CONNECTION_STRING)
    with conn.cursor(cursor_factory=extras.RealDictCursor) as cur:
        sql = """
            SELECT 
                id,
                title,
                author,
                url,
                cleaned_text AS description,
                publication_date
            FROM 
                scraped_articles
            WHERE 
                id = ANY(%s)
        """
        cur.execute(sql, (article_ids,))
        rows = cur.fetchall()

    # Close the connection
    conn.close()

    # Format the dates as ISO strings
    for row in rows:
        if row['publication_date']:
            row['publication_date'] = row['publication_date'].isoformat()

    return jsonify(rows)


@stats_bp.route('/summarize/article', methods=['POST'])
def summarize_article():
    """
    Accepts a JSON payload with 'description' and returns an easy-to-read summary.
    Expects:
    {
      "description": "Full cleaned article text..."
    }
    """
    try:
        data = request.get_json()
        description = data.get("description")

        if not description:
            return jsonify({"error": "Missing 'description' field."}), 400

        # Run your real summarizer here
        summary = summarize_with_groq(description)

        return jsonify({
            "summary": summary
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

