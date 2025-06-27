from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field
from ..services.amadeus_service import amadeus_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/amadeus", tags=["Amadeus Travel Services"])

# Request/Response Models
class FlightSearchRequest(BaseModel):
    origin: str = Field(..., description="IATA code for departure airport (e.g., DEL)")
    destination: str = Field(..., description="IATA code for arrival airport (e.g., GOA)")
    departure_date: str = Field(..., description="Departure date in YYYY-MM-DD format")
    return_date: Optional[str] = Field(None, description="Return date for round-trip")
    adults: int = Field(1, ge=1, le=9, description="Number of adult passengers")
    children: int = Field(0, ge=0, le=9, description="Number of child passengers")
    infants: int = Field(0, ge=0, le=9, description="Number of infant passengers")
    travel_class: str = Field("ECONOMY", description="Travel class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST")
    max_results: int = Field(50, ge=1, le=250, description="Maximum number of results")
    currency: str = Field("INR", description="Currency code")
    non_stop: Optional[bool] = Field(None, description="Search only non-stop flights")
    max_price: Optional[int] = Field(None, description="Maximum price filter")

class HotelSearchRequest(BaseModel):
    city_code: str = Field(..., description="City IATA code (e.g., GOA)")
    check_in_date: str = Field(..., description="Check-in date in YYYY-MM-DD format")
    check_out_date: str = Field(..., description="Check-out date in YYYY-MM-DD format")
    adults: int = Field(1, ge=1, le=9, description="Number of adult guests")
    rooms: int = Field(1, ge=1, le=8, description="Number of rooms")
    currency: str = Field("INR", description="Currency code")
    max_results: int = Field(50, ge=1, le=100, description="Maximum number of results")
    hotel_chain: Optional[str] = Field(None, description="Hotel chain filter")
    max_price: Optional[int] = Field(None, description="Maximum price per night")

class DestinationSearchRequest(BaseModel):
    keyword: str = Field(..., description="Search keyword for destination")
    max_results: int = Field(20, ge=1, le=50, description="Maximum number of results")
    country_code: Optional[str] = Field(None, description="Country code filter (e.g., IN)")

# Enhanced Flight Search Endpoint
@router.post("/flights/search")
async def search_flights(request: FlightSearchRequest):
    """
    🛫 Search for luxury flights with Amadeus API
    
    This endpoint provides comprehensive flight search with enhanced features:
    - Real-time pricing from multiple airlines
    - Luxury cabin class options
    - Detailed flight information including amenities
    - Integration with Happy Paisa pricing
    """
    try:
        logger.info(f"Flight search request: {request.origin} -> {request.destination} on {request.departure_date}")
        
        # Validate date format and logic
        try:
            departure = datetime.strptime(request.departure_date, "%Y-%m-%d").date()
            if departure < date.today():
                raise HTTPException(
                    status_code=400, 
                    detail="Departure date cannot be in the past"
                )
            
            if request.return_date:
                return_dt = datetime.strptime(request.return_date, "%Y-%m-%d").date()
                if return_dt <= departure:
                    raise HTTPException(
                        status_code=400, 
                        detail="Return date must be after departure date"
                    )
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        # Prepare search parameters
        search_params = {
            "origin": request.origin.upper(),
            "destination": request.destination.upper(),
            "departure_date": request.departure_date,
            "adults": request.adults,
            "children": request.children,
            "infants": request.infants,
            "travel_class": request.travel_class.upper(),
            "max_results": request.max_results,
            "currency": request.currency.upper()
        }
        
        if request.return_date:
            search_params["return_date"] = request.return_date
        
        if request.non_stop is not None:
            search_params["nonStop"] = request.non_stop
        
        if request.max_price:
            search_params["maxPrice"] = request.max_price
        
        # Call Amadeus service
        result = await amadeus_service.search_flights(**search_params)
        
        if result.get('error'):
            raise HTTPException(
                status_code=result.get('code', 500),
                detail=f"Amadeus API error: {result.get('message', 'Unknown error')}"
            )
        
        # Add Happy Paisa conversion for each flight
        if result.get('flights'):
            for flight in result['flights']:
                if 'price' in flight:
                    inr_price = flight['price']['total_price']
                    hp_price = inr_price / 1000  # 1 HP = ₹1000
                    flight['price']['happy_paisa'] = {
                        'amount': round(hp_price, 3),
                        'currency': 'HP',
                        'conversion_rate': 1000
                    }
        
        # Add metadata for luxury experience
        result['luxury_metadata'] = {
            'search_time': datetime.now().isoformat(),
            'price_guarantee': '24 hours',
            'booking_protection': 'Full refund within 24 hours',
            'customer_support': '24/7 Premium Support',
            'loyalty_benefits': 'Earn Happy Paisa rewards'
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in flight search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while searching flights"
        )

# Enhanced Hotel Search Endpoint
@router.post("/hotels/search")
async def search_hotels(request: HotelSearchRequest):
    """
    🏨 Search for luxury hotels with Amadeus API
    
    Features:
    - Premium hotel selection
    - Real-time availability and pricing
    - Detailed amenity information
    - Luxury features and ratings
    """
    try:
        logger.info(f"Hotel search request: {request.city_code} from {request.check_in_date} to {request.check_out_date}")
        
        # Validate dates
        try:
            check_in = datetime.strptime(request.check_in_date, "%Y-%m-%d").date()
            check_out = datetime.strptime(request.check_out_date, "%Y-%m-%d").date()
            
            if check_in < date.today():
                raise HTTPException(
                    status_code=400,
                    detail="Check-in date cannot be in the past"
                )
            
            if check_out <= check_in:
                raise HTTPException(
                    status_code=400,
                    detail="Check-out date must be after check-in date"
                )
                
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        # Prepare search parameters
        search_params = {
            "city_code": request.city_code.upper(),
            "check_in_date": request.check_in_date,
            "check_out_date": request.check_out_date,
            "adults": request.adults,
            "rooms": request.rooms,
            "currency": request.currency.upper(),
            "max_results": request.max_results
        }
        
        if request.hotel_chain:
            search_params["hotelChain"] = request.hotel_chain
        
        if request.max_price:
            search_params["maxPrice"] = request.max_price
        
        # Call Amadeus service
        result = await amadeus_service.search_hotels(**search_params)
        
        if result.get('error'):
            raise HTTPException(
                status_code=result.get('code', 500),
                detail=f"Amadeus API error: {result.get('message', 'Unknown error')}"
            )
        
        # Add Happy Paisa conversion for each hotel
        if result.get('hotels'):
            for hotel in result['hotels']:
                if 'offers' in hotel and hotel['offers']:
                    for offer in hotel['offers']:
                        if 'price' in offer:
                            inr_price = offer['price']['total']
                            hp_price = inr_price / 1000  # 1 HP = ₹1000
                            offer['price']['happy_paisa'] = {
                                'amount': round(hp_price, 3),
                                'currency': 'HP',
                                'conversion_rate': 1000
                            }
        
        # Add luxury metadata
        result['luxury_metadata'] = {
            'search_time': datetime.now().isoformat(),
            'booking_protection': 'Free cancellation up to 24 hours',
            'concierge_service': 'Available for premium bookings',
            'loyalty_benefits': 'Earn Happy Paisa rewards',
            'quality_guarantee': 'Verified luxury properties only'
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in hotel search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while searching hotels"
        )

# Enhanced Destination Search
@router.post("/destinations/search")
async def search_destinations(request: DestinationSearchRequest):
    """
    🌍 Discover luxury travel destinations
    
    Features:
    - AI-powered destination recommendations
    - Luxury travel insights
    - Cultural and activity information
    - Weather and seasonal recommendations
    """
    try:
        logger.info(f"Destination search request: {request.keyword}")
        
        # Call Amadeus service
        result = await amadeus_service.search_destinations(
            keyword=request.keyword,
            max_results=request.max_results,
            country_code=request.country_code
        )
        
        if result.get('error'):
            raise HTTPException(
                status_code=result.get('code', 500),
                detail=f"Amadeus API error: {result.get('message', 'Unknown error')}"
            )
        
        # Add travel insights metadata
        result['travel_insights'] = {
            'search_time': datetime.now().isoformat(),
            'personalization': 'Recommendations based on luxury preferences',
            'real_time_data': 'Live destination information',
            'expert_curation': 'Destinations selected by travel experts'
        }
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in destination search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while searching destinations"
        )

# Flight Inspiration Endpoint
@router.get("/flights/inspiration")
async def get_flight_inspiration(
    origin: str = Query(..., description="Origin IATA code"),
    max_price: Optional[int] = Query(None, description="Maximum price filter"),
    departure_date: Optional[str] = Query(None, description="Departure date (YYYY-MM-DD)"),
    one_way: bool = Query(False, description="One-way trip")
):
    """
    ✈️ Get flight inspiration for dream destinations
    
    Discover amazing destinations within your budget and travel preferences.
    Perfect for spontaneous luxury getaways!
    """
    try:
        result = await amadeus_service.get_flight_inspiration(
            origin=origin.upper(),
            max_price=max_price,
            departure_date=departure_date,
            one_way=one_way
        )
        
        if result.get('error'):
            raise HTTPException(
                status_code=result.get('code', 500),
                detail=f"Error getting flight inspiration: {result.get('message', 'Unknown error')}"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in flight inspiration: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while getting flight inspiration"
        )

# Weather Information Endpoint
@router.get("/destinations/{city_code}/weather")
async def get_destination_weather(city_code: str):
    """
    🌤️ Get weather information for travel destination
    
    Provides current weather and forecast to help plan your luxury travel experience.
    """
    try:
        result = await amadeus_service.get_destination_weather(city_code.upper())
        
        return result
        
    except Exception as e:
        logger.error(f"Unexpected error in weather search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while getting weather information"
        )

# Service Health Check
@router.get("/health")
async def amadeus_health_check():
    """
    🩺 Check Amadeus service health and connectivity
    """
    try:
        # Test basic connectivity with a simple destination search
        test_result = await amadeus_service.search_destinations(
            keyword="Mumbai",
            max_results=1
        )
        
        if test_result.get('error'):
            return {
                "status": "unhealthy",
                "amadeus_api": "disconnected",
                "error": test_result.get('message', 'Unknown error'),
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "status": "healthy",
            "amadeus_api": "connected",
            "services": {
                "flight_search": "operational",
                "hotel_search": "operational", 
                "destination_search": "operational",
                "inspiration": "operational"
            },
            "features": {
                "luxury_enhancements": "enabled",
                "happy_paisa_integration": "enabled",
                "real_time_pricing": "enabled",
                "voice_search_ready": "enabled"
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "amadeus_api": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Popular Routes Endpoint
@router.get("/flights/popular-routes")
async def get_popular_routes():
    """
    🔥 Get popular luxury travel routes from India
    """
    try:
        popular_routes = [
            {
                "route": "Delhi to Dubai",
                "origin": "DEL",
                "destination": "DXB", 
                "starting_price": {"inr": 25000, "hp": 25.0},
                "duration": "3h 30m",
                "airlines": ["Emirates", "Air India", "IndiGo"],
                "luxury_score": 9.5,
                "popularity": "Very High"
            },
            {
                "route": "Mumbai to Singapore", 
                "origin": "BOM",
                "destination": "SIN",
                "starting_price": {"inr": 28000, "hp": 28.0},
                "duration": "5h 20m", 
                "airlines": ["Singapore Airlines", "Air India", "Vistara"],
                "luxury_score": 9.3,
                "popularity": "High"
            },
            {
                "route": "Delhi to London",
                "origin": "DEL", 
                "destination": "LHR",
                "starting_price": {"inr": 55000, "hp": 55.0},
                "duration": "8h 45m",
                "airlines": ["British Airways", "Virgin Atlantic", "Air India"], 
                "luxury_score": 9.7,
                "popularity": "High"
            },
            {
                "route": "Bangalore to Goa",
                "origin": "BLR",
                "destination": "GOA", 
                "starting_price": {"inr": 8500, "hp": 8.5},
                "duration": "1h 30m",
                "airlines": ["IndiGo", "SpiceJet", "Air India"],
                "luxury_score": 8.2,
                "popularity": "Very High"
            },
            {
                "route": "Delhi to Bangkok",
                "origin": "DEL",
                "destination": "BKK",
                "starting_price": {"inr": 22000, "hp": 22.0}, 
                "duration": "4h 15m",
                "airlines": ["Thai Airways", "Air India", "IndiGo"],
                "luxury_score": 8.8,
                "popularity": "High"
            }
        ]
        
        return {
            "success": True,
            "popular_routes": popular_routes,
            "total_routes": len(popular_routes),
            "last_updated": datetime.now().isoformat(),
            "currency_note": "Prices in INR and Happy Paisa (1 HP = ₹1000)"
        }
        
    except Exception as e:
        logger.error(f"Error getting popular routes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while getting popular routes"
        )