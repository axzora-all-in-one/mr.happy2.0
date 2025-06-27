import api from './api';

class AmadeusService {
  constructor() {
    this.baseURL = '/api/amadeus';
  }

  // Flight Services
  async searchFlights(searchParams) {
    try {
      const response = await api.post(`${this.baseURL}/flights/search`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching flights:', error);
      throw error;
    }
  }

  async getFlightInspiration(params) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`${this.baseURL}/flights/inspiration?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error getting flight inspiration:', error);
      throw error;
    }
  }

  async getPopularRoutes() {
    try {
      const response = await api.get(`${this.baseURL}/flights/popular-routes`);
      return response.data;
    } catch (error) {
      console.error('Error getting popular routes:', error);
      throw error;
    }
  }

  // Hotel Services
  async searchHotels(searchParams) {
    try {
      const response = await api.post(`${this.baseURL}/hotels/search`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  // Destination Services
  async searchDestinations(searchParams) {
    try {
      const response = await api.post(`${this.baseURL}/destinations/search`, searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw error;
    }
  }

  async getDestinationWeather(cityCode) {
    try {
      const response = await api.get(`${this.baseURL}/destinations/${cityCode}/weather`);
      return response.data;
    } catch (error) {
      console.error('Error getting destination weather:', error);
      throw error;
    }
  }

  // Health Check
  async checkHealth() {
    try {
      const response = await api.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking Amadeus health:', error);
      throw error;
    }
  }

  // Utility methods
  convertHappyPaisaToINR(hpAmount) {
    return hpAmount * 1000; // 1 HP = ₹1000
  }

  convertINRToHappyPaisa(inrAmount) {
    return inrAmount / 1000;
  }

  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatHappyPaisa(amount) {
    return `${amount.toFixed(3)} HP`;
  }

  // Voice command processing
  processVoiceCommand(command) {
    const lowercaseCommand = command.toLowerCase();
    const processedCommand = {
      intent: 'unknown',
      entities: {},
      confidence: 0
    };

    // Flight search patterns
    if (lowercaseCommand.includes('flight') || lowercaseCommand.includes('fly')) {
      processedCommand.intent = 'search_flights';
      processedCommand.confidence = 0.9;

      // Extract destinations
      const destinations = this.extractDestinations(lowercaseCommand);
      if (destinations.from) processedCommand.entities.origin = destinations.from;
      if (destinations.to) processedCommand.entities.destination = destinations.to;

      // Extract dates
      const dates = this.extractDates(lowercaseCommand);
      if (dates.departure) processedCommand.entities.departureDate = dates.departure;
      if (dates.return) processedCommand.entities.returnDate = dates.return;

      // Extract class
      if (lowercaseCommand.includes('business')) processedCommand.entities.travelClass = 'BUSINESS';
      if (lowercaseCommand.includes('first')) processedCommand.entities.travelClass = 'FIRST';
      if (lowercaseCommand.includes('economy')) processedCommand.entities.travelClass = 'ECONOMY';
    }

    // Hotel search patterns
    else if (lowercaseCommand.includes('hotel') || lowercaseCommand.includes('stay')) {
      processedCommand.intent = 'search_hotels';
      processedCommand.confidence = 0.9;

      const destinations = this.extractDestinations(lowercaseCommand);
      if (destinations.to) processedCommand.entities.cityCode = destinations.to;

      const dates = this.extractDates(lowercaseCommand);
      if (dates.checkin) processedCommand.entities.checkInDate = dates.checkin;
      if (dates.checkout) processedCommand.entities.checkOutDate = dates.checkout;
    }

    // General search patterns
    else if (lowercaseCommand.includes('search') || lowercaseCommand.includes('find')) {
      processedCommand.intent = 'general_search';
      processedCommand.confidence = 0.7;
    }

    return processedCommand;
  }

  extractDestinations(command) {
    const destinations = {
      from: null,
      to: null
    };

    const cityMap = {
      'delhi': 'DEL',
      'mumbai': 'BOM',
      'bangalore': 'BLR',
      'chennai': 'MAA',
      'kolkata': 'CCU',
      'goa': 'GOA',
      'dubai': 'DXB',
      'singapore': 'SIN',
      'london': 'LHR',
      'bangkok': 'BKK',
      'new york': 'JFK',
      'paris': 'CDG',
      'tokyo': 'NRT'
    };

    // Look for "from X to Y" pattern
    const fromToMatch = command.match(/from\s+(\w+(?:\s+\w+)*)\s+to\s+(\w+(?:\s+\w+)*)/i);
    if (fromToMatch) {
      const fromCity = fromToMatch[1].toLowerCase().trim();
      const toCity = fromToMatch[2].toLowerCase().trim();
      destinations.from = cityMap[fromCity] || fromCity.toUpperCase();
      destinations.to = cityMap[toCity] || toCity.toUpperCase();
    } else {
      // Look for "to X" pattern
      const toMatch = command.match(/to\s+(\w+(?:\s+\w+)*)/i);
      if (toMatch) {
        const toCity = toMatch[1].toLowerCase().trim();
        destinations.to = cityMap[toCity] || toCity.toUpperCase();
      }

      // Look for individual city mentions
      for (const [city, code] of Object.entries(cityMap)) {
        if (command.includes(city)) {
          if (!destinations.to) destinations.to = code;
        }
      }
    }

    return destinations;
  }

  extractDates(command) {
    const dates = {
      departure: null,
      return: null,
      checkin: null,
      checkout: null
    };

    // Look for specific date patterns (YYYY-MM-DD)
    const datePattern = /(\d{4}-\d{2}-\d{2})/g;
    const dateMatches = command.match(datePattern);
    if (dateMatches) {
      dates.departure = dateMatches[0];
      dates.checkin = dateMatches[0];
      if (dateMatches.length > 1) {
        dates.return = dateMatches[1];
        dates.checkout = dateMatches[1];
      }
    }

    // Look for relative dates
    const today = new Date();
    if (command.includes('today')) {
      dates.departure = today.toISOString().split('T')[0];
      dates.checkin = today.toISOString().split('T')[0];
    } else if (command.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dates.departure = tomorrow.toISOString().split('T')[0];
      dates.checkin = tomorrow.toISOString().split('T')[0];
    } else if (command.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      dates.departure = nextWeek.toISOString().split('T')[0];
      dates.checkin = nextWeek.toISOString().split('T')[0];
    }

    return dates;
  }

  // Generate voice response for search results
  generateVoiceResponse(results, searchType) {
    if (!results || (!results.flights && !results.hotels)) {
      return "I couldn't find any results for your search. Please try different criteria.";
    }

    if (searchType === 'flights' && results.flights) {
      const flightCount = results.flights.length;
      const cheapestFlight = results.flights.reduce((min, flight) => 
        flight.price.total_price < min.price.total_price ? flight : min
      );
      
      return `I found ${flightCount} flights for you. The cheapest option costs ${this.formatCurrency(cheapestFlight.price.total_price)} or ${this.formatHappyPaisa(cheapestFlight.price.happy_paisa.amount)}. Would you like to see more details?`;
    }

    if (searchType === 'hotels' && results.hotels) {
      const hotelCount = results.hotels.length;
      const cheapestHotel = results.hotels.reduce((min, hotel) => 
        hotel.offers[0].price.total < min.offers[0].price.total ? hotel : min
      );
      
      return `I found ${hotelCount} hotels for you. The best deal starts at ${this.formatCurrency(cheapestHotel.offers[0].price.total)} per night. Shall I show you the options?`;
    }

    return "I found some great options for your trip. Check the results below!";
  }
}

export const amadeusService = new AmadeusService();
export default amadeusService;