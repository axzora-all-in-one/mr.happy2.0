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

    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        children: int = 0,
        infants: int = 0,
        travel_class: str = "ECONOMY",
        max_results: int = 50,
        currency: str = "INR",
        **kwargs
    ) -> Dict[str, Any]:
        """
        Search for flights with real Amadeus API
        """
        
        params = {
            'originLocationCode': origin,
            'destinationLocationCode': destination,
            'departureDate': departure_date,
            'adults': adults,
            'max': max_results,
            'currencyCode': currency,
            'travelClass': travel_class
        }
        
        if return_date:
            params['returnDate'] = return_date
        
        if children > 0:
            params['children'] = children
        
        if infants > 0:
            params['infants'] = infants
        
        # Add additional filters from kwargs
        if 'nonStop' in kwargs:
            params['nonStop'] = kwargs['nonStop']
        
        if 'maxPrice' in kwargs:
            params['maxPrice'] = kwargs['maxPrice']
        
        result = await self._search_flights_sync(**params)
        
        if isinstance(result, dict) and result.get('error'):
            return result
        
        # Enhanced processing for luxury display
        processed_flights = []
        for flight_offer in result:
            processed_flight = self._process_flight_offer(flight_offer)
            processed_flights.append(processed_flight)
        
        return {
            "success": True,
            "flights": processed_flights,
            "total_results": len(processed_flights),
            "search_params": params,
            "currency": currency
        }
    
    def _process_flight_offer(self, flight_offer: Dict) -> Dict[str, Any]:
        """Process and enhance flight offer data for luxury display"""
        try:
            price = flight_offer.get('price', {})
            itineraries = flight_offer.get('itineraries', [])
            traveler_pricings = flight_offer.get('travelerPricings', [])
            
            # Calculate total duration and stops
            total_duration = ""
            total_stops = 0
            segments_info = []
            
            for itinerary in itineraries:
                duration = itinerary.get('duration', '')
                segments = itinerary.get('segments', [])
                total_stops += len(segments) - 1
                
                for segment in segments:
                    segment_info = {
                        'departure': {
                            'airport': segment.get('departure', {}).get('iataCode'),
                            'terminal': segment.get('departure', {}).get('terminal'),
                            'time': segment.get('departure', {}).get('at')
                        },
                        'arrival': {
                            'airport': segment.get('arrival', {}).get('iataCode'),
                            'terminal': segment.get('arrival', {}).get('terminal'),
                            'time': segment.get('arrival', {}).get('at')
                        },
                        'carrier': segment.get('carrierCode'),
                        'flight_number': segment.get('number'),
                        'aircraft': segment.get('aircraft', {}).get('code'),
                        'duration': segment.get('duration'),
                        'cabin_class': segment.get('cabin', 'ECONOMY')
                    }
                    segments_info.append(segment_info)
                
                if duration:
                    total_duration = duration
            
            # Enhanced pricing information
            pricing_details = {
                'total_price': float(price.get('total', 0)),
                'base_price': float(price.get('base', 0)),
                'currency': price.get('currency', 'INR'),
                'taxes': [],
                'fees': []
            }
            
            # Process fees and taxes
            for fee in price.get('fees', []):
                pricing_details['fees'].append({
                    'type': fee.get('type'),
                    'amount': float(fee.get('amount', 0))
                })
            
            # Luxury features and amenities
            luxury_features = {
                'cabin_amenities': [],
                'meal_service': 'Standard',
                'entertainment': 'Available',
                'wifi': 'Available',
                'seat_pitch': 'Standard',
                'baggage_allowance': '23kg'
            }
            
            # Determine luxury level based on cabin class
            cabin_classes = [seg.get('cabin_class', 'ECONOMY') for seg in segments_info]
            if 'FIRST' in cabin_classes:
                luxury_features.update({
                    'meal_service': 'Gourmet Multi-Course',
                    'entertainment': 'Premium Entertainment System',
                    'wifi': 'Complimentary High-Speed WiFi',
                    'seat_pitch': '60+ inches',
                    'baggage_allowance': '32kg x 2',
                    'cabin_amenities': ['Lie-flat beds', 'Premium lounge access', 'Dedicated check-in']
                })
            elif 'BUSINESS' in cabin_classes:
                luxury_features.update({
                    'meal_service': 'Premium Multi-Course',
                    'entertainment': 'Premium Entertainment',
                    'wifi': 'Complimentary WiFi',
                    'seat_pitch': '40+ inches',
                    'baggage_allowance': '32kg x 2',
                    'cabin_amenities': ['Flat-bed seats', 'Lounge access', 'Priority boarding']
                })
            elif 'PREMIUM_ECONOMY' in cabin_classes:
                luxury_features.update({
                    'meal_service': 'Enhanced Meal Service',
                    'seat_pitch': '34+ inches',
                    'baggage_allowance': '23kg x 2',
                    'cabin_amenities': ['Extra legroom', 'Priority boarding']
                })
            
            return {
                'id': flight_offer.get('id'),
                'price': pricing_details,
                'itineraries': segments_info,
                'duration': total_duration,
                'stops': total_stops,
                'luxury_features': luxury_features,
                'booking_class': cabin_classes[0] if cabin_classes else 'ECONOMY',
                'instant_pricing': True,
                'change_fees': 'Included in fare rules',
                'validity': '24 hours',
                'last_ticketing_date': flight_offer.get('lastTicketingDate'),
                'traveler_pricings': traveler_pricings
            }
            
        except Exception as e:
            logger.error(f"Error processing flight offer: {str(e)}")
            return {
                'id': flight_offer.get('id', 'unknown'),
                'error': 'Processing error',
                'raw_data': flight_offer
            }