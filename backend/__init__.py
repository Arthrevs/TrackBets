# Backend module for KnowYourBets
from .scrapers import (
    fetch_stock_price,
    fetch_aggregated_sentiment, # Updated name
    extract_pdf_context,
    extract_video_context
)
from .brain import generate_flashcard, rule_based_verdict
from .mock_data import get_zomato_static, get_tcs_static

__all__ = [
    'fetch_stock_price',
    'fetch_aggregated_sentiment',
    'extract_pdf_context',
    'extract_video_context',
    'generate_flashcard',
    'rule_based_verdict',
    'get_zomato_static',
    'get_tcs_static'
]
