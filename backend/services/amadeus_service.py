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
    
    @async_amadeus_call
    def _search_hotels_sync(self, **params):
        """Real synchronous hotel search using Amadeus API"""
        try:
            logger.info(f"Calling real Amadeus hotel search with params: {params}")
            response = self.client.shopping.hotel_offers_search.get(**params)
            logger.info(f"Amadeus hotel API response received: {len(response.data) if response.data else 0} hotels")
            return response.data
        except Exception as e:
            logger.error(f"Error in Amadeus hotel search: {str(e)}")
            raise
    
    async def search_hotels(
        self,
        city_code: str,
        check_in_date: str,
        check_out_date: str,
        adults: int = 1,
        rooms: int = 1,
        currency: str = "INR",
        max_results: int = 50,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Search for luxury hotels with real Amadeus API
        """
        
        params = {
            'cityCode': city_code,
            'checkInDate': check_in_date,
            'checkOutDate': check_out_date,
            'adults': adults,
            'roomQuantity': rooms,
            'currency': currency,
            'bestRateOnly': True
        }
        
        # Add additional filters
        if 'hotelChain' in kwargs:
            params['hotelChain'] = kwargs['hotelChain']
        
        if 'maxPrice' in kwargs:
            params['priceRange'] = f"1-{kwargs['maxPrice']}"
        
        result = await self._search_hotels_sync(**params)
        
        if isinstance(result, dict) and result.get('error'):
            return result
        
        # Process hotels for luxury display
        processed_hotels = []
        for hotel_offer in result:
            processed_hotel = self._process_hotel_offer(hotel_offer)
            processed_hotels.append(processed_hotel)
        
        return {
            "success": True,
            "hotels": processed_hotels,
            "total_results": len(processed_hotels),
            "search_params": params,
            "currency": currency
        }
    
    def _process_hotel_offer(self, hotel_offer: Dict) -> Dict[str, Any]:
        """Process hotel offer for luxury display"""
        try:
            hotel = hotel_offer.get('hotel', {})
            offers = hotel_offer.get('offers', [])
            
            # Get best offer
            best_offer = offers[0] if offers else {}
            price = best_offer.get('price', {})
            room = best_offer.get('room', {})
            
            # Enhanced hotel information
            luxury_features = {
                'star_rating': 4,  # Default, should be enriched from hotel data
                'amenities': [
                    'Free WiFi',
                    'Swimming Pool',
                    'Fitness Center',
                    'Room Service',
                    'Concierge',
                    'Business Center'
                ],
                'room_features': [
                    'Air Conditioning',
                    'Minibar',
                    'Safe',
                    'Television',
                    'Bathroom'
                ],
                'services': [
                    '24/7 Reception',
                    'Housekeeping',
                    'Laundry Service',
                    'Wake-up Service'
                ],
                'dining': [
                    'Restaurant',
                    'Bar',
                    'Room Service'
                ]
            }
            
            # Determine luxury level based on available data
            hotel_name = hotel.get('name', '').upper()
            if any(luxury_brand in hotel_name for luxury_brand in ['MARRIOTT', 'HILTON', 'HYATT', 'SHERATON', 'WESTIN', 'RITZ', 'LUXURY']):
                luxury_features.update({
                    'star_rating': 5,
                    'amenities': luxury_features['amenities'] + [
                        'Spa & Wellness',
                        'Valet Parking',
                        'Butler Service',
                        'Private Beach Access',
                        'Golf Course',
                        'Executive Lounge'
                    ],
                    'room_features': luxury_features['room_features'] + [
                        'Premium Bedding',
                        'Marble Bathroom',
                        'City/Ocean View',
                        'Premium Toiletries',
                        'Bathrobes & Slippers'
                    ]
                })
            
            return {
                'id': hotel_offer.get('id'),
                'hotel': {
                    'name': hotel.get('name'),
                    'hotel_id': hotel.get('hotelId'),
                    'chain_code': hotel.get('chainCode'),
                    'iata_code': hotel.get('iataCode'),
                    'address': hotel.get('address', {}),
                    'contact': hotel.get('contact', {}),
                    'description': hotel.get('description', {})
                },
                'offers': [{
                    'id': best_offer.get('id'),
                    'price': {
                        'total': float(price.get('total', 0)),
                        'base': float(price.get('base', 0)),
                        'currency': price.get('currency', 'INR'),
                        'taxes': price.get('taxes', []),
                        'variations': price.get('variations', [])
                    },
                    'room': {
                        'type': room.get('type'),
                        'type_estimated': room.get('typeEstimated', {}),
                        'description': room.get('description', {})
                    },
                    'guests': best_offer.get('guests', {}),
                    'policies': best_offer.get('policies', {}),
                    'self_check_in': best_offer.get('selfCheckInInstructions'),
                    'booking_metadata': best_offer.get('bookingMetadata')
                }],
                'luxury_features': luxury_features,
                'instant_booking': True,
                'cancellation_policy': 'Flexible',
                'payment_options': ['Credit Card', 'Happy Paisa Wallet'],
                'rating_score': 4.2 + (luxury_features['star_rating'] - 4) * 0.3,  # Estimated rating
                'reviews_count': 1250  # Mock data
            }
            
        except Exception as e:
            logger.error(f"Error processing hotel offer: {str(e)}")
            return {
                'id': hotel_offer.get('id', 'unknown'),
                'error': 'Processing error',
                'raw_data': hotel_offer
            }
    
    @async_amadeus_call
    def _search_destinations_sync(self, **params):
        """Real synchronous destination search using Amadeus API"""
        try:
            logger.info(f"Calling real Amadeus destination search with params: {params}")
            response = self.client.reference_data.locations.cities.get(**params)
            logger.info(f"Amadeus destination API response received: {len(response.data) if response.data else 0} destinations")
            return response.data
        except Exception as e:
            logger.error(f"Error in Amadeus destination search: {str(e)}")
            raise
    
    async def search_destinations(
        self,
        keyword: str,
        max_results: int = 20,
        country_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search for destinations with real Amadeus API
        """
        
        params = {
            'keyword': keyword,
            'max': max_results,
            'include': 'AIRPORTS'
        }
        
        if country_code:
            params['countryCode'] = country_code
        
        result = await self._search_destinations_sync(**params)
        
        if isinstance(result, dict) and result.get('error'):
            return result
        
        # Process destinations for luxury display
        processed_destinations = []
        for destination in result:
            processed_destination = self._process_destination(destination)
            processed_destinations.append(processed_destination)
        
        return {
            "success": True,
            "destinations": processed_destinations,
            "total_results": len(processed_destinations),
            "search_keyword": keyword
        }
    
    def _process_destination(self, destination: Dict) -> Dict[str, Any]:
        """Process destination for luxury travel insights"""
        try:
            # Enhanced destination information
            city_name = destination.get('name', '')
            country_code = destination.get('address', {}).get('countryCode', '')
            
            # Mock luxury travel insights (in a real app, this would come from additional APIs)
            luxury_insights = {
                'best_season': 'October - March',
                'weather': 'Pleasant and sunny',
                'luxury_hotels_count': 25,
                'michelin_restaurants': 8,
                'cultural_attractions': [
                    'Historical monuments',
                    'Art galleries',
                    'Cultural centers',
                    'Local markets'
                ],
                'activities': [
                    'City tours',
                    'Shopping',
                    'Fine dining',
                    'Cultural experiences'
                ],
                'luxury_experiences': [
                    'Private guided tours',
                    'Helicopter rides',
                    'Yacht charters',
                    'Spa retreats'
                ],
                'travel_tips': [
                    'Book accommodations in advance',
                    'Try local cuisine',
                    'Respect local customs',
                    'Stay hydrated'
                ]
            }
            
            return {
                'id': destination.get('id'),
                'name': city_name,
                'iata_code': destination.get('iataCode'),
                'type': destination.get('subType'),
                'address': destination.get('address', {}),
                'geo_code': destination.get('geoCode', {}),
                'timezone': destination.get('timeZoneOffset'),
                'luxury_insights': luxury_insights,
                'popularity_score': 8.5,  # Mock data
                'safety_rating': 'Very Safe',
                'currency': self._get_currency_for_country(country_code),
                'language': self._get_language_for_country(country_code)
            }
            
        except Exception as e:
            logger.error(f"Error processing destination: {str(e)}")
            return {
                'id': destination.get('id', 'unknown'),
                'error': 'Processing error',
                'raw_data': destination
            }
    
    def _get_currency_for_country(self, country_code: str) -> str:
        """Get currency for country code"""
        currency_map = {
            'IN': 'INR',
            'US': 'USD',
            'GB': 'GBP',
            'EU': 'EUR',
            'JP': 'JPY',
            'AU': 'AUD',
            'CA': 'CAD',
            'SG': 'SGD',
            'AE': 'AED',
            'TH': 'THB'
        }
        return currency_map.get(country_code, 'USD')
    
    def _get_language_for_country(self, country_code: str) -> str:
        """Get primary language for country code"""
        language_map = {
            'IN': 'Hindi/English',
            'US': 'English',
            'GB': 'English',
            'FR': 'French',
            'DE': 'German',
            'JP': 'Japanese',
            'CN': 'Chinese',
            'ES': 'Spanish',
            'IT': 'Italian',
            'TH': 'Thai',
            'AE': 'Arabic/English'
        }
        return language_map.get(country_code, 'English')

# Global service instance
amadeus_service = AmadeusService()