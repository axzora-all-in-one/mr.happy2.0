#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta

# Get the backend URL from frontend/.env
BACKEND_URL = "https://9cd9ed52-85c8-49c4-b8c9-eca8356b77ac.preview.emergentagent.com/api"

def test_amadeus_health():
    """Test Amadeus API health check endpoint"""
    print("\n=== Testing Amadeus Health Check ===\n")
    
    try:
        response = requests.get(f"{BACKEND_URL}/amadeus/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200 and response.json().get("status") == "healthy":
            print("✅ Amadeus health check passed")
            return True
        else:
            print("❌ Amadeus health check failed")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during health check: {str(e)}")
        return False

def test_flight_search():
    """Test flight search with specific payload"""
    print("\n=== Testing Flight Search with Specific Payload ===\n")
    
    flight_search_payload = {
        "origin": "DEL",
        "destination": "BOM", 
        "departure_date": "2025-03-15",
        "adults": 1,
        "travel_class": "ECONOMY",
        "max_results": 5
    }
    
    print(f"Payload: {json.dumps(flight_search_payload, indent=2)}")
    
    try:
        response = requests.post(f"{BACKEND_URL}/amadeus/flights/search", json=flight_search_payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success', False)}")
            print(f"Total Results: {result.get('total_results', 0)}")
            
            # Check if flights are returned
            flights = result.get('flights', [])
            print(f"Number of flights returned: {len(flights)}")
            
            if flights:
                # Print details of first flight
                first_flight = flights[0]
                print("\nSample Flight Details:")
                print(f"  ID: {first_flight.get('id')}")
                print(f"  Price: {first_flight.get('price', {}).get('total_price')} {first_flight.get('price', {}).get('currency')}")
                
                # Check Happy Paisa conversion
                hp_price = first_flight.get('price', {}).get('happy_paisa', {})
                if hp_price:
                    print(f"  Happy Paisa: {hp_price.get('amount')} HP (Conversion Rate: {hp_price.get('conversion_rate')})")
                else:
                    print("  Happy Paisa conversion not found")
                
                # Check luxury features
                luxury_features = first_flight.get('luxury_features', {})
                if luxury_features:
                    print("  Luxury Features:")
                    for key, value in luxury_features.items():
                        if isinstance(value, list):
                            print(f"    {key}: {', '.join(value) if value else 'None'}")
                        else:
                            print(f"    {key}: {value}")
                else:
                    print("  Luxury features not found")
                
                print("\nFull response saved to 'amadeus_flight_search_response.json'")
                with open('amadeus_flight_search_response.json', 'w') as f:
                    json.dump(result, f, indent=2)
                return True
            else:
                print("❌ No flights returned in the response")
                print(f"Full Response: {json.dumps(result, indent=2)}")
                return False
        else:
            print(f"❌ Flight search failed with status code {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during flight search: {str(e)}")
        return False

def test_hotel_search():
    """Test hotel search with specific payload"""
    print("\n=== Testing Hotel Search with Specific Payload ===\n")
    
    hotel_search_payload = {
        "city_code": "PAR",
        "check_in_date": "2025-03-15",
        "check_out_date": "2025-03-18", 
        "adults": 2,
        "rooms": 1,
        "max_results": 5
    }
    
    print(f"Payload: {json.dumps(hotel_search_payload, indent=2)}")
    
    try:
        response = requests.post(f"{BACKEND_URL}/amadeus/hotels/search", json=hotel_search_payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success', False)}")
            print(f"Total Results: {result.get('total_results', 0)}")
            
            # Check if hotels are returned
            hotels = result.get('hotels', [])
            print(f"Number of hotels returned: {len(hotels)}")
            
            if hotels:
                # Print details of first hotel
                first_hotel = hotels[0]
                print("\nSample Hotel Details:")
                print(f"  ID: {first_hotel.get('id')}")
                print(f"  Name: {first_hotel.get('hotel', {}).get('name')}")
                
                # Check offers
                offers = first_hotel.get('offers', [])
                if offers and len(offers) > 0:
                    first_offer = offers[0]
                    print(f"  Room Type: {first_offer.get('room', {}).get('type')}")
                    print(f"  Price: {first_offer.get('price', {}).get('total')} {first_offer.get('price', {}).get('currency')}")
                    
                    # Check Happy Paisa conversion
                    hp_price = first_offer.get('price', {}).get('happy_paisa', {})
                    if hp_price:
                        print(f"  Happy Paisa: {hp_price.get('amount')} HP (Conversion Rate: {hp_price.get('conversion_rate')})")
                    else:
                        print("  Happy Paisa conversion not found")
                else:
                    print("  No offers found for this hotel")
                
                # Check luxury features
                luxury_features = first_hotel.get('luxury_features', {})
                if luxury_features:
                    print("  Luxury Features:")
                    for key, value in luxury_features.items():
                        if isinstance(value, list):
                            print(f"    {key}: {', '.join(value[:3])}{'...' if len(value) > 3 else ''}")
                        else:
                            print(f"    {key}: {value}")
                else:
                    print("  Luxury features not found")
                
                print("\nFull response saved to 'amadeus_hotel_search_response.json'")
                with open('amadeus_hotel_search_response.json', 'w') as f:
                    json.dump(result, f, indent=2)
                return True
            else:
                print("❌ No hotels returned in the response")
                print(f"Full Response: {json.dumps(result, indent=2)}")
                return False
        else:
            print(f"❌ Hotel search failed with status code {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during hotel search: {str(e)}")
        return False

def test_destinations_search():
    """Test destinations search with specific payload"""
    print("\n=== Testing Destinations Search with Specific Payload ===\n")
    
    destinations_search_payload = {
        "keyword": "Paris",
        "max_results": 5
    }
    
    print(f"Payload: {json.dumps(destinations_search_payload, indent=2)}")
    
    try:
        response = requests.post(f"{BACKEND_URL}/amadeus/destinations/search", json=destinations_search_payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success', False)}")
            print(f"Total Results: {result.get('total_results', 0)}")
            
            # Check if destinations are returned
            destinations = result.get('destinations', [])
            print(f"Number of destinations returned: {len(destinations)}")
            
            if destinations:
                # Print details of first destination
                first_destination = destinations[0]
                print("\nSample Destination Details:")
                print(f"  Name: {first_destination.get('name')}")
                print(f"  IATA Code: {first_destination.get('iata_code')}")
                print(f"  Type: {first_destination.get('type')}")
                
                # Check luxury insights
                luxury_insights = first_destination.get('luxury_insights', {})
                if luxury_insights:
                    print("  Luxury Insights:")
                    for key, value in luxury_insights.items():
                        if isinstance(value, list):
                            print(f"    {key}: {', '.join(value[:3])}{'...' if len(value) > 3 else ''}")
                        else:
                            print(f"    {key}: {value}")
                else:
                    print("  Luxury insights not found")
                
                print("\nFull response saved to 'amadeus_destinations_search_response.json'")
                with open('amadeus_destinations_search_response.json', 'w') as f:
                    json.dump(result, f, indent=2)
                return True
            else:
                print("❌ No destinations returned in the response")
                print(f"Full Response: {json.dumps(result, indent=2)}")
                return False
        else:
            print(f"❌ Destinations search failed with status code {response.status_code}")
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exception during destinations search: {str(e)}")
        return False

def run_tests():
    """Run all Amadeus API tests"""
    print("Starting Amadeus API tests...")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Test health check
    health_ok = test_amadeus_health()
    if not health_ok:
        print("Health check failed. Continuing with other tests...")
    
    # Test flight search
    flight_search_ok = test_flight_search()
    if not flight_search_ok:
        print("Flight search test failed.")
    
    # Test hotel search
    hotel_search_ok = test_hotel_search()
    if not hotel_search_ok:
        print("Hotel search test failed.")
    
    # Test destinations search
    destinations_search_ok = test_destinations_search()
    if not destinations_search_ok:
        print("Destinations search test failed.")
    
    # Print summary
    print("\n=== Amadeus API Testing Summary ===")
    print(f"1. Health Check: {'✅ Passed' if health_ok else '❌ Failed'}")
    print(f"2. Flight Search: {'✅ Passed' if flight_search_ok else '❌ Failed'}")
    print(f"3. Hotel Search: {'✅ Passed' if hotel_search_ok else '❌ Failed'}")
    print(f"4. Destinations Search: {'✅ Passed' if destinations_search_ok else '❌ Failed'}")
    
    if all([health_ok, flight_search_ok, hotel_search_ok, destinations_search_ok]):
        print("\n✅ All Amadeus API tests passed successfully!")
    else:
        print("\n❌ Some Amadeus API tests failed.")

if __name__ == "__main__":
    run_tests()