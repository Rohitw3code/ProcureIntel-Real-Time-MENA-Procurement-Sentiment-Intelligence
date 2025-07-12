from flask import Blueprint, request, jsonify
from database import supabase


stats_bp = Blueprint('stats', __name__, url_prefix='/api/stats')


@stats_bp.route('/articles', methods=['GET'])
def get_article_stats():
    """
    GET /api/stats/articles
    Returns the total number of articles scraped and analyzed.
    """
    count = request.args.get('count', 10)
    
    
