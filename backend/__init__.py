# Backend module for TrackBets
from .scrapers import (
    get_stock_price,
    get_aggregated_sentiment,
    get_pdf_text,
    get_youtube_text,
    get_twitter_sentiment,
    get_news,
    get_reddit_posts
)
from .brain import generate_flashcard, FinancialAnalyst
from .mock_data import get_zomato_static, get_tcs_static

__all__ = [
    'get_stock_price',
    'get_aggregated_sentiment',
    'get_pdf_text',
    'get_youtube_text',
    'get_twitter_sentiment',
    'get_news',
    'get_reddit_posts',
    'generate_flashcard',
    'FinancialAnalyst',
    'get_zomato_static',
    'get_tcs_static'
]