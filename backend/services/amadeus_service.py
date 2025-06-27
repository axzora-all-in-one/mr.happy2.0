import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from amadeus import Client, ResponseError
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

class AmadeusService:
    """
    Real Amadeus API service for Axxzora travel integration
    Provides comprehensive travel services with real Amadeus data
    """
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize real Amadeus client with test credentials"""
        try:
            api_key = os.environ.get('AMADEUS_API_KEY')
            api_secret = os.environ.get('AMADEUS_API_SECRET')
            environment = os.environ.get('AMADEUS_ENVIRONMENT', 'test')
            
            if not api_key or not api_secret:
                raise ValueError("Amadeus API credentials not found in environment variables")
            
            self.client = Client(
                client_id=api_key,
                client_secret=api_secret,
                hostname=environment  # 'test' for test environment
            )
            
            logger.info(f"Real Amadeus client initialized successfully for {environment} environment")
            logger.info(f"Using API Key: {api_key[:8]}***")
            
        except Exception as e:
            logger.error(f"Failed to initialize Amadeus client: {str(e)}")
            raise
    
    def async_amadeus_call(func):
        """Decorator to handle async Amadeus API calls"""
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            try:
                # Run the blocking Amadeus call in a thread pool
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(None, func, self, *args, **kwargs)
                return result
            except ResponseError as error:
                logger.error(f"Amadeus API error in {func.__name__}: {error}")
                return {
                    "error": True,
                    "message": str(error),
                    "code": getattr(error, 'response', {}).get('status_code', 500),
                    "details": getattr(error, 'response', {}).get('body', {})
                }
            except Exception as e:
                logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
                return {
                    "error": True,
                    "message": f"An unexpected error occurred: {str(e)}",
                    "code": 500
                }
        return wrapper
    
    @async_amadeus_call
    def _search_flights_sync(self, **params):
        """Real synchronous flight search using Amadeus API"""
        try:
            logger.info(f"Calling real Amadeus flight search with params: {params}")
            response = self.client.shopping.flight_offers_search.get(**params)
            logger.info(f"Amadeus API response received: {len(response.data) if response.data else 0} flights")
            return response.data
        except Exception as e:
            logger.error(f"Error in Amadeus flight search: {str(e)}")
            raise