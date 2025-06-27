import os
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import asyncio
from functools import wraps

logger = logging.getLogger(__name__)

class AmadeusService:
    """
    Mock Amadeus API service for Axxzora travel integration
    Provides comprehensive travel services with enhanced features
    """
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize mock Amadeus client"""
        try:
            logger.info("Initializing mock Amadeus client")
            self.client = "mock_client"
        except Exception as e:
            logger.error(f"Failed to initialize mock Amadeus client: {str(e)}")
            raise
    
    def async_amadeus_call(func):
        """Decorator to handle async Amadeus API calls"""
        @wraps(func)
        async def wrapper(self, *args, **kwargs):
            try:
                # For our mock implementation, we'll just call the function directly
                result = func(self, *args, **kwargs)
                return result
            except Exception as e:
                logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
                return {
                    "error": True,
                    "message": "An unexpected error occurred",
                    "code": 500
                }
        return wrapper
    
    @async_amadeus_call
    def _search_flights_sync(self, **params):
        """Mock synchronous flight search"""
        # Return mock flight data
        return [
            {
                "id": "1",
                "price": {
                    "total": "25000",
                    "base": "22000",
                    "currency": "INR",
                    "fees": [
                        {"type": "SUPPLIER", "amount": "1000"},
                        {"type": "TICKETING", "amount": "2000"}
                    ]
                },
                "itineraries": [
                    {
                        "duration": "PT5H30M",
                        "segments": [
                            {
                                "departure": {"iataCode": params.get('originLocationCode', 'DEL'), "at": "2025-02-15T06:00:00"},
                                "arrival": {"iataCode": params.get('destinationLocationCode', 'GOA'), "at": "2025-02-15T11:30:00"},
                                "carrierCode": "AI",
                                "number": "123",
                                "aircraft": {"code": "320"},
                                "duration": "PT5H30M",
                                "cabin": params.get('travelClass', 'ECONOMY')
                            }
                        ]
                    }
                ],
                "travelerPricings": [
                    {
                        "travelerId": "1",
                        "fareOption": "STANDARD",
                        "travelerType": "ADULT",
                        "price": {"total": "25000", "currency": "INR"}
                    }
                ]
            },
            {
                "id": "2",
                "price": {
                    "total": "30000",
                    "base": "27000",
                    "currency": "INR",
                    "fees": [
                        {"type": "SUPPLIER", "amount": "1500"},
                        {"type": "TICKETING", "amount": "1500"}
                    ]
                },
                "itineraries": [
                    {
                        "duration": "PT4H30M",
                        "segments": [
                            {
                                "departure": {"iataCode": params.get('originLocationCode', 'DEL'), "at": "2025-02-15T08:00:00"},
                                "arrival": {"iataCode": params.get('destinationLocationCode', 'GOA'), "at": "2025-02-15T12:30:00"},
                                "carrierCode": "6E",
                                "number": "456",
                                "aircraft": {"code": "320"},
                                "duration": "PT4H30M",
                                "cabin": params.get('travelClass', 'ECONOMY')
                            }
                        ]
                    }
                ],
                "travelerPricings": [
                    {
                        "travelerId": "1",
                        "fareOption": "STANDARD",
                        "travelerType": "ADULT",
                        "price": {"total": "30000", "currency": "INR"}
                    }
                ]
            }
        ]
    
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
        Search for flights with enhanced filtering and luxury features
        
        Args:
            origin: IATA code for departure airport
            destination: IATA code for arrival airport
            departure_date: Date in YYYY-MM-DD format
            return_date: Return date for round-trip (optional)
            adults: Number of adult passengers
            children: Number of child passengers
            infants: Number of infant passengers
            travel_class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
            max_results: Maximum number of results
            currency: Currency code (default: INR)
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
        """Mock synchronous hotel search"""
        # Return mock hotel data
        return [
            {
                "id": "1",
                "hotel": {
                    "name": "Luxury Resort & Spa",
                    "hotelId": "LUXGOA1",
                    "chainCode": "LUX",
                    "iataCode": params.get('cityCode', 'GOA'),
                    "address": {
                        "lines": ["Beach Road"],
                        "cityName": "Goa",
                        "countryCode": "IN"
                    },
                    "contact": {
                        "phone": "+91 123 456 7890",
                        "email": "info@luxuryresort.com"
                    },
                    "description": {
                        "text": "A luxury beachfront resort with world-class amenities"
                    }
                },
                "offers": [
                    {
                        "id": "1",
                        "price": {
                            "total": "35000",
                            "base": "30000",
                            "currency": "INR",
                            "taxes": [],
                            "variations": []
                        },
                        "room": {
                            "type": "DELUXE",
                            "typeEstimated": {
                                "category": "DELUXE",
                                "beds": 1,
                                "bedType": "KING"
                            },
                            "description": {
                                "text": "Deluxe room with ocean view"
                            }
                        },
                        "guests": {
                            "adults": params.get('adults', 1)
                        },
                        "policies": {
                            "cancellation": {
                                "description": "Free cancellation until 24 hours before check-in"
                            }
                        }
                    }
                ]
            },
            {
                "id": "2",
                "hotel": {
                    "name": "Grand Hyatt Goa",
                    "hotelId": "HYAGOA1",
                    "chainCode": "HYA",
                    "iataCode": params.get('cityCode', 'GOA'),
                    "address": {
                        "lines": ["Bambolim Bay"],
                        "cityName": "Goa",
                        "countryCode": "IN"
                    },
                    "contact": {
                        "phone": "+91 832 301 1234",
                        "email": "goa.grand@hyatt.com"
                    },
                    "description": {
                        "text": "A 5-star luxury resort set on the shores of Bambolim Bay"
                    }
                },
                "offers": [
                    {
                        "id": "2",
                        "price": {
                            "total": "45000",
                            "base": "40000",
                            "currency": "INR",
                            "taxes": [],
                            "variations": []
                        },
                        "room": {
                            "type": "SUITE",
                            "typeEstimated": {
                                "category": "SUITE",
                                "beds": 1,
                                "bedType": "KING"
                            },
                            "description": {
                                "text": "Luxury suite with private balcony"
                            }
                        },
                        "guests": {
                            "adults": params.get('adults', 1)
                        },
                        "policies": {
                            "cancellation": {
                                "description": "Free cancellation until 48 hours before check-in"
                            }
                        }
                    }
                ]
            }
        ]
    
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
        Search for luxury hotels with enhanced features
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
        """Mock synchronous destination search"""
        # Return mock destination data
        return [
            {
                "id": "MUMBI",
                "name": "Mumbai",
                "iataCode": "BOM",
                "subType": "CITY",
                "address": {
                    "cityName": "Mumbai",
                    "countryCode": "IN"
                },
                "geoCode": {
                    "latitude": 19.0760,
                    "longitude": 72.8777
                },
                "timeZoneOffset": "+05:30"
            },
            {
                "id": "DELHI",
                "name": "Delhi",
                "iataCode": "DEL",
                "subType": "CITY",
                "address": {
                    "cityName": "Delhi",
                    "countryCode": "IN"
                },
                "geoCode": {
                    "latitude": 28.6139,
                    "longitude": 77.2090
                },
                "timeZoneOffset": "+05:30"
            },
            {
                "id": "GOAIN",
                "name": "Goa",
                "iataCode": "GOA",
                "subType": "CITY",
                "address": {
                    "cityName": "Goa",
                    "countryCode": "IN"
                },
                "geoCode": {
                    "latitude": 15.2993,
                    "longitude": 74.1240
                },
                "timeZoneOffset": "+05:30"
            }
        ]
    
    async def search_destinations(
        self,
        keyword: str,
        max_results: int = 20,
        country_code: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search for destinations with enhanced information
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
            
            # Customize based on destination
            popular_destinations = {
                'GOA': {
                    'best_season': 'November - February',
                    'luxury_experiences': ['Beach resorts', 'Sunset cruises', 'Spa treatments', 'Portuguese heritage tours'],
                    'activities': ['Beach activities', 'Water sports', 'Nightlife', 'Heritage tours']
                },
                'MUMBAI': {
                    'luxury_experiences': ['Bollywood tours', 'Fine dining', 'Shopping at high-end malls', 'Marine Drive sunset'],
                    'activities': ['Gateway of India', 'Elephanta Caves', 'Shopping', 'Street food tours']
                },
                'DELHI': {
                    'luxury_experiences': ['Heritage hotel stays', 'Private palace tours', 'Luxury shopping', 'Fine dining'],
                    'activities': ['Red Fort', 'India Gate', 'Qutub Minar', 'Chandni Chowk']
                }
            }
            
            city_upper = city_name.upper()
            if city_upper in popular_destinations:
                luxury_insights.update(popular_destinations[city_upper])
            
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
    
    async def get_flight_inspiration(
        self,
        origin: str,
        max_price: Optional[int] = None,
        departure_date: Optional[str] = None,
        one_way: bool = False
    ) -> Dict[str, Any]:
        """
        Get flight inspiration for dream destinations
        """
        try:
            params = {
                'origin': origin,
                'oneWay': one_way
            }
            
            if max_price:
                params['maxPrice'] = max_price
            
            if departure_date:
                params['departureDate'] = departure_date
            
            # This would use Amadeus Flight Inspiration API
            # For now, return mock luxury destinations
            inspiration_destinations = [
                {
                    'destination': 'GOA',
                    'departure_date': departure_date or '2025-02-15',
                    'return_date': '2025-02-22',
                    'price': {'total': 15000, 'currency': 'INR'},
                    'direct_flights': True,
                    'luxury_score': 9.2,
                    'description': 'Tropical paradise with luxury beach resorts'
                },
                {
                    'destination': 'DUBAI',
                    'departure_date': departure_date or '2025-03-01',
                    'return_date': '2025-03-08',
                    'price': {'total': 35000, 'currency': 'INR'},
                    'direct_flights': True,
                    'luxury_score': 9.8,
                    'description': 'Ultimate luxury destination with world-class shopping'
                },
                {
                    'destination': 'SINGAPORE',
                    'departure_date': departure_date or '2025-02-20',
                    'return_date': '2025-02-27',
                    'price': {'total': 28000, 'currency': 'INR'},
                    'direct_flights': True,
                    'luxury_score': 9.5,
                    'description': 'Modern city-state with exceptional dining and hotels'
                }
            ]
            
            return {
                'success': True,
                'inspiration': inspiration_destinations,
                'origin': origin,
                'search_params': params
            }
            
        except Exception as e:
            logger.error(f"Error getting flight inspiration: {str(e)}")
            return {
                'error': True,
                'message': str(e)
            }
    
    async def get_destination_weather(self, city_code: str) -> Dict[str, Any]:
        """
        Get weather information for destination (mock implementation)
        In a real app, this would integrate with weather APIs
        """
        
        # Mock weather data
        weather_data = {
            'GOA': {
                'current': {'temperature': 28, 'condition': 'Sunny', 'humidity': 65},
                'forecast': [
                    {'date': '2025-01-22', 'high': 30, 'low': 22, 'condition': 'Sunny'},
                    {'date': '2025-01-23', 'high': 29, 'low': 23, 'condition': 'Partly Cloudy'},
                    {'date': '2025-01-24', 'high': 31, 'low': 24, 'condition': 'Sunny'}
                ]
            },
            'DUBAI': {
                'current': {'temperature': 25, 'condition': 'Clear', 'humidity': 45},
                'forecast': [
                    {'date': '2025-01-22', 'high': 27, 'low': 19, 'condition': 'Clear'},
                    {'date': '2025-01-23', 'high': 26, 'low': 18, 'condition': 'Clear'},
                    {'date': '2025-01-24', 'high': 28, 'low': 20, 'condition': 'Sunny'}
                ]
            }
        }
        
        return {
            'success': True,
            'city_code': city_code,
            'weather': weather_data.get(city_code, {
                'current': {'temperature': 25, 'condition': 'Pleasant', 'humidity': 55},
                'forecast': []
            })
        }

# Global service instance
amadeus_service = AmadeusService()