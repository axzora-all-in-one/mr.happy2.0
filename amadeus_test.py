#!/usr/bin/env python3
import requests
import json
from datetime import datetime, timedelta

# Get the backend URL from frontend/.env
BACKEND_URL = "https://9cd9ed52-85c8-49c4-b8c9-eca8356b77ac.preview.emergentagent.com/api"

def test_amadeus_health():
    """Test Amadeus API health check endpoint"""
    print("Testing Amadeus health check...")
    response = requests.get(f"{BACKEND_URL}/amadeus/health")
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200 and response.json().get("status") == "healthy":
        print("✅ Amadeus health check passed")
        return True
    else:
        print("❌ Amadeus health check failed")
        return False

def test_amadeus_flight_search():
    """Test Amadeus flight search endpoint"""
    print("\nTesting Amadeus flight search...")
    # Sample flight search from Delhi to Goa
    flight_search_data = {
        "origin": "DEL",
        "destination": "GOA",
        "departure_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "adults": 1,
        "travel_class": "ECONOMY",
        "max_results": 10,
        "currency": "INR"
    }
    
    response = requests.post(f"{BACKEND_URL}/amadeus/flights/search", json=flight_search_data)
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        flights = result.get("flights", [])
        print(f"Found {len(flights)} flights")
        
        if flights:
            # Check Happy Paisa conversion
            if "price" in flights[0] and "happy_paisa" in flights[0]["price"]:
                hp_price = flights[0]["price"]["happy_paisa"]
                print(f"Happy Paisa price: {hp_price['amount']} HP (conversion rate: {hp_price['conversion_rate']})")
                
                # Check luxury features
                if "luxury_features" in flights[0]:
                    luxury = flights[0]["luxury_features"]
                    print(f"Luxury features: {', '.join(luxury.keys())}")
                    print("✅ Flight search passed with Happy Paisa conversion and luxury features")
                    return True
                else:
                    print("❌ Flight search missing luxury features")
            else:
                print("❌ Flight search missing Happy Paisa conversion")
        else:
            print("❌ Flight search returned no flights")
    else:
        print(f"❌ Flight search failed: {response.text}")
    
    return False

def test_amadeus_hotel_search():
    """Test Amadeus hotel search endpoint"""
    print("\nTesting Amadeus hotel search...")
    # Sample hotel search for Goa
    hotel_search_data = {
        "city_code": "GOA",
        "check_in_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
        "check_out_date": (datetime.now() + timedelta(days=37)).strftime("%Y-%m-%d"),
        "adults": 2,
        "rooms": 1,
        "currency": "INR",
        "max_results": 10
    }
    
    response = requests.post(f"{BACKEND_URL}/amadeus/hotels/search", json=hotel_search_data)
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        hotels = result.get("hotels", [])
        print(f"Found {len(hotels)} hotels")
        
        if hotels:
            # Check Happy Paisa conversion
            if "offers" in hotels[0] and hotels[0]["offers"] and "price" in hotels[0]["offers"][0]:
                if "happy_paisa" in hotels[0]["offers"][0]["price"]:
                    hp_price = hotels[0]["offers"][0]["price"]["happy_paisa"]
                    print(f"Happy Paisa price: {hp_price['amount']} HP (conversion rate: {hp_price['conversion_rate']})")
                    
                    # Check luxury features
                    if "luxury_features" in hotels[0]:
                        luxury = hotels[0]["luxury_features"]
                        print(f"Luxury features: {', '.join(luxury.keys())}")
                        print("✅ Hotel search passed with Happy Paisa conversion and luxury features")
                        return True
                    else:
                        print("❌ Hotel search missing luxury features")
                else:
                    print("❌ Hotel search missing Happy Paisa conversion")
            else:
                print("❌ Hotel search missing offers or price information")
        else:
            print("❌ Hotel search returned no hotels")
    else:
        print(f"❌ Hotel search failed: {response.text}")
    
    return False

def test_amadeus_destinations_search():
    """Test Amadeus destinations search endpoint"""
    print("\nTesting Amadeus destinations search...")
    # Sample destinations search for popular cities
    destinations_search_data = {
        "keyword": "Mumbai",
        "max_results": 10
    }
    
    response = requests.post(f"{BACKEND_URL}/amadeus/destinations/search", json=destinations_search_data)
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        destinations = result.get("destinations", [])
        print(f"Found {len(destinations)} destinations")
        
        if destinations:
            # Check luxury insights
            if "luxury_insights" in destinations[0]:
                insights = destinations[0]["luxury_insights"]
                print(f"Luxury insights: {', '.join(insights.keys())}")
                print("✅ Destinations search passed with luxury insights")
                return True
            else:
                print("❌ Destinations search missing luxury insights")
        else:
            print("❌ Destinations search returned no destinations")
    else:
        print(f"❌ Destinations search failed: {response.text}")
    
    return False

def test_amadeus_popular_routes():
    """Test Amadeus popular routes endpoint"""
    print("\nTesting Amadeus popular routes...")
    response = requests.get(f"{BACKEND_URL}/amadeus/flights/popular-routes")
    print(f"Status code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        routes = result.get("popular_routes", [])
        print(f"Found {len(routes)} popular routes")
        
        if routes:
            # Check Happy Paisa pricing
            if "starting_price" in routes[0] and "hp" in routes[0]["starting_price"]:
                hp_price = routes[0]["starting_price"]["hp"]
                print(f"Happy Paisa price: {hp_price} HP")
                
                # Check luxury score
                if "luxury_score" in routes[0]:
                    luxury_score = routes[0]["luxury_score"]
                    print(f"Luxury score: {luxury_score}")
                    print("✅ Popular routes passed with Happy Paisa pricing and luxury score")
                    return True
                else:
                    print("❌ Popular routes missing luxury score")
            else:
                print("❌ Popular routes missing Happy Paisa pricing")
        else:
            print("❌ Popular routes returned no routes")
    else:
        print(f"❌ Popular routes failed: {response.text}")
    
    return False

def run_tests():
    """Run all Amadeus API tests"""
    print("Starting Amadeus API tests...")
    print(f"Backend URL: {BACKEND_URL}")
    
    # Test Amadeus health
    health_ok = test_amadeus_health()
    
    # Test flight search
    flight_search_ok = test_amadeus_flight_search()
    
    # Test hotel search
    hotel_search_ok = test_amadeus_hotel_search()
    
    # Test destinations search
    destinations_search_ok = test_amadeus_destinations_search()
    
    # Test popular routes
    popular_routes_ok = test_amadeus_popular_routes()
    
    # Print summary
    print("\nTest Summary:")
    tests_passed = sum([health_ok, flight_search_ok, hotel_search_ok, destinations_search_ok, popular_routes_ok])
    tests_total = 5
    print(f"Passed: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print("\n✅ All Amadeus API tests passed successfully!")
    else:
        print(f"\n❌ {tests_total - tests_passed} Amadeus API tests failed.")

if __name__ == "__main__":
    run_tests()