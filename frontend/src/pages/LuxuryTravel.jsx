import React, { useState, useEffect } from 'react';
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Calendar, 
  Users, 
  Search,
  Mic,
  MicOff,
  Star,
  Clock,
  Wallet,
  Filter,
  SortDesc,
  Heart,
  Share2,
  ArrowUpRight,
  Sparkles,
  Globe,
  Mountain,
  Palmtree,
  Building,
  Car,
  Coffee,
  Wifi,
  Shield,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Sun,
  Cloud,
  Snowflake,
  ArrowLeft,
  ArrowRight,
  Info,
  Phone,
  Mail,
  Timer,
  Award,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';
import api from '../services/api';

const LuxuryTravel = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  // Voice recognition setup
  const { speak, cancel } = useSpeechSynthesis();
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      handleVoiceCommand(result);
    },
  });

  // State management
  const [activeTab, setActiveTab] = useState('flights');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [favorites, setFavorites] = useState(new Set());
  
  // Flight search state
  const [flightSearch, setFlightSearch] = useState({
    origin: 'DEL',
    destination: 'GOA',
    departureDate: '',
    returnDate: '',
    adults: 1,
    children: 0,
    travelClass: 'ECONOMY',
    tripType: 'round-trip'
  });

  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState({
    cityCode: 'GOA',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    rooms: 1
  });

  // Popular destinations
  const popularDestinations = [
    {
      code: 'GOA',
      name: 'Goa',
      country: 'India',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop',
      description: 'Tropical paradise with pristine beaches',
      season: 'Oct - Mar',
      icon: Palmtree,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      code: 'DXB',
      name: 'Dubai',
      country: 'UAE',
      image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop',
      description: 'Luxury shopping and modern architecture',
      season: 'Nov - Apr',
      icon: Building,
      color: 'from-amber-500 to-orange-600'
    },
    {
      code: 'SIN',
      name: 'Singapore',
      country: 'Singapore',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
      description: 'Garden city with world-class dining',
      season: 'Year-round',
      icon: Globe,
      color: 'from-purple-500 to-pink-600'
    },
    {
      code: 'LHR',
      name: 'London',
      country: 'UK',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
      description: 'Historic charm meets modern luxury',
      season: 'May - Sep',
      icon: Mountain,
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    setFlightSearch(prev => ({
      ...prev,
      departureDate: formatDate(tomorrow),
      returnDate: formatDate(nextWeek)
    }));
    
    setHotelSearch(prev => ({
      ...prev,
      checkInDate: formatDate(tomorrow),
      checkOutDate: formatDate(nextWeek)
    }));
  }, []);

  // Voice command handler
  const handleVoiceCommand = (command) => {
    const lowercaseCommand = command.toLowerCase();
    
    if (lowercaseCommand.includes('search flights')) {
      setActiveTab('flights');
      speak({ text: 'Switching to flight search' });
    } else if (lowercaseCommand.includes('search hotels')) {
      setActiveTab('hotels');
      speak({ text: 'Switching to hotel search' });
    } else if (lowercaseCommand.includes('book') || lowercaseCommand.includes('search')) {
      handleSearch();
      speak({ text: 'Starting your search' });
    } else if (lowercaseCommand.includes('goa')) {
      if (activeTab === 'flights') {
        setFlightSearch(prev => ({ ...prev, destination: 'GOA' }));
      } else {
        setHotelSearch(prev => ({ ...prev, cityCode: 'GOA' }));
      }
      speak({ text: 'Setting destination to Goa' });
    } else if (lowercaseCommand.includes('dubai')) {
      if (activeTab === 'flights') {
        setFlightSearch(prev => ({ ...prev, destination: 'DXB' }));
      } else {
        setHotelSearch(prev => ({ ...prev, cityCode: 'DXB' }));
      }
      speak({ text: 'Setting destination to Dubai' });
    } else {
      speak({ text: 'I can help you search for flights, hotels, or destinations. Try saying "search flights to Goa"' });
    }
  };

  // Handle search
  const handleSearch = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let searchData = {};

      if (activeTab === 'flights') {
        endpoint = '/api/amadeus/flights/search';
        searchData = {
          origin: flightSearch.origin,
          destination: flightSearch.destination,
          departure_date: flightSearch.departureDate,
          return_date: flightSearch.tripType === 'round-trip' ? flightSearch.returnDate : null,
          adults: flightSearch.adults,
          children: flightSearch.children,
          travel_class: flightSearch.travelClass,
          max_results: 20
        };
      } else if (activeTab === 'hotels') {
        endpoint = '/api/amadeus/hotels/search';
        searchData = {
          city_code: hotelSearch.cityCode,
          check_in_date: hotelSearch.checkInDate,
          check_out_date: hotelSearch.checkOutDate,
          adults: hotelSearch.adults,
          rooms: hotelSearch.rooms,
          max_results: 20
        };
      }

      const response = await api.post(endpoint, searchData);
      setSearchResults(response.data);
      
      toast({
        title: "Search Completed! ✈️",
        description: `Found ${response.data?.flights?.length || response.data?.hotels?.length || 0} luxury options for you.`,
      });
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to complete search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle destination selection
  const selectDestination = (destination) => {
    if (activeTab === 'flights') {
      setFlightSearch(prev => ({ ...prev, destination: destination.code }));
    } else {
      setHotelSearch(prev => ({ ...prev, cityCode: destination.code }));
    }
    
    toast({
      title: `${destination.name} Selected! 🌟`,
      description: `Ready to search for ${activeTab} in this amazing destination.`,
    });
  };

  // Toggle favorites
  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative py-16 px-4 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3)_0%,transparent_50%)]" />
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Luxury Travel
              </span>
              <br />
              <span className="text-2xl lg:text-4xl text-muted-foreground">
                Powered by AI & Voice
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Experience the world's finest destinations with our AI-powered travel platform. 
              Search by voice, pay with Happy Paisa, and enjoy luxury at every step.
            </p>

            {/* Voice Search Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center"
            >
              <Button
                size="lg"
                onClick={listening ? stop : listen}
                disabled={loading}
                className={cn(
                  "h-16 px-8 rounded-2xl text-lg font-semibold transition-all duration-300 relative overflow-hidden",
                  listening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-red-900 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-200 dark:shadow-blue-900'
                )}
              >
                {listening ? (
                  <>
                    <MicOff className="w-6 h-6 mr-3" />
                    Listening... Tap to stop
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6 mr-3" />
                    Voice Search
                  </>
                )}
                
                {listening && (
                  <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-2xl" />
                )}
              </Button>
            </motion.div>

            <p className="text-sm text-muted-foreground mt-4">
              Try saying: "Search flights to Goa" or "Find hotels in Dubai"
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {/* Popular Destinations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            <Sparkles className="w-8 h-8 inline-block mr-3 text-amber-500" />
            Trending Luxury Destinations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((destination, index) => (
              <motion.div
                key={destination.code}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectDestination(destination)}
                className="group cursor-pointer"
              >
                <Card className="glass-morphism border-border/50 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={destination.image} 
                      alt={destination.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br shadow-lg",
                        destination.color
                      )}>
                        <destination.icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{destination.name}</h3>
                      <p className="text-sm opacity-90">{destination.country}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-2">{destination.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        <Sun className="w-3 h-3 mr-1" />
                        Best: {destination.season}
                      </Badge>
                      <ArrowUpRight className="w-4 h-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Search Interface */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-morphism border-border/50 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <Compass className="w-7 h-7 text-primary" />
                <span>Luxury Travel Search</span>
                <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                  <Award className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </CardTitle>
              <CardDescription>
                Search flights, hotels, and destinations with AI-powered recommendations
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="flights" className="flex items-center space-x-2">
                    <Plane className="w-4 h-4" />
                    <span>Flights</span>
                  </TabsTrigger>
                  <TabsTrigger value="hotels" className="flex items-center space-x-2">
                    <Hotel className="w-4 h-4" />
                    <span>Hotels</span>
                  </TabsTrigger>
                  <TabsTrigger value="inspiration" className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Inspiration</span>
                  </TabsTrigger>
                </TabsList>

                {/* Flight Search */}
                <TabsContent value="flights" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="origin">From</Label>
                      <Select value={flightSearch.origin} onValueChange={(value) => setFlightSearch(prev => ({ ...prev, origin: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Origin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DEL">Delhi (DEL)</SelectItem>
                          <SelectItem value="BOM">Mumbai (BOM)</SelectItem>
                          <SelectItem value="BLR">Bangalore (BLR)</SelectItem>
                          <SelectItem value="MAA">Chennai (MAA)</SelectItem>
                          <SelectItem value="CCU">Kolkata (CCU)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="destination">To</Label>
                      <Select value={flightSearch.destination} onValueChange={(value) => setFlightSearch(prev => ({ ...prev, destination: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOA">Goa (GOA)</SelectItem>
                          <SelectItem value="DXB">Dubai (DXB)</SelectItem>
                          <SelectItem value="SIN">Singapore (SIN)</SelectItem>
                          <SelectItem value="LHR">London (LHR)</SelectItem>
                          <SelectItem value="BKK">Bangkok (BKK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="departure">Departure</Label>
                      <Input
                        id="departure"
                        type="date"
                        value={flightSearch.departureDate}
                        onChange={(e) => setFlightSearch(prev => ({ ...prev, departureDate: e.target.value }))}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="return">Return</Label>
                      <Input
                        id="return"
                        type="date"
                        value={flightSearch.returnDate}
                        onChange={(e) => setFlightSearch(prev => ({ ...prev, returnDate: e.target.value }))}
                        disabled={flightSearch.tripType === 'one-way'}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Trip Type</Label>
                      <Select value={flightSearch.tripType} onValueChange={(value) => setFlightSearch(prev => ({ ...prev, tripType: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="round-trip">Round Trip</SelectItem>
                          <SelectItem value="one-way">One Way</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Passengers</Label>
                      <Select value={flightSearch.adults.toString()} onValueChange={(value) => setFlightSearch(prev => ({ ...prev, adults: parseInt(value) }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Class</Label>
                      <Select value={flightSearch.travelClass} onValueChange={(value) => setFlightSearch(prev => ({ ...prev, travelClass: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ECONOMY">Economy</SelectItem>
                          <SelectItem value="PREMIUM_ECONOMY">Premium Economy</SelectItem>
                          <SelectItem value="BUSINESS">Business</SelectItem>
                          <SelectItem value="FIRST">First Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Searching Flights...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-3" />
                        Search Luxury Flights
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* Hotel Search */}
                <TabsContent value="hotels" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Select value={hotelSearch.cityCode} onValueChange={(value) => setHotelSearch(prev => ({ ...prev, cityCode: value }))}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOA">Goa</SelectItem>
                          <SelectItem value="DXB">Dubai</SelectItem>
                          <SelectItem value="SIN">Singapore</SelectItem>
                          <SelectItem value="LON">London</SelectItem>
                          <SelectItem value="BKK">Bangkok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Check-in</Label>
                      <Input
                        type="date"
                        value={hotelSearch.checkInDate}
                        onChange={(e) => setHotelSearch(prev => ({ ...prev, checkInDate: e.target.value }))}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Check-out</Label>
                      <Input
                        type="date"
                        value={hotelSearch.checkOutDate}
                        onChange={(e) => setHotelSearch(prev => ({ ...prev, checkOutDate: e.target.value }))}
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Guests & Rooms</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={hotelSearch.adults.toString()} onValueChange={(value) => setHotelSearch(prev => ({ ...prev, adults: parseInt(value) }))}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={hotelSearch.rooms.toString()} onValueChange={(value) => setHotelSearch(prev => ({ ...prev, rooms: parseInt(value) }))}>
                          <SelectTrigger className="h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num} Room{num > 1 ? 's' : ''}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                        Searching Hotels...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-3" />
                        Search Luxury Hotels
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* Inspiration */}
                <TabsContent value="inspiration" className="space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Discover Your Next Adventure</h3>
                    <p className="text-muted-foreground">
                      Let our AI suggest amazing destinations based on your preferences and budget
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Palmtree className="w-12 h-12 mx-auto mb-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" />
                          <h4 className="font-semibold mb-2">Beach Paradise</h4>
                          <p className="text-sm text-muted-foreground">Tropical destinations with crystal clear waters</p>
                        </CardContent>
                      </Card>

                      <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Building className="w-12 h-12 mx-auto mb-4 text-blue-500 group-hover:scale-110 transition-transform duration-300" />
                          <h4 className="font-semibold mb-2">City Escapes</h4>
                          <p className="text-sm text-muted-foreground">Cosmopolitan cities with luxury experiences</p>
                        </CardContent>
                      </Card>

                      <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Mountain className="w-12 h-12 mx-auto mb-4 text-purple-500 group-hover:scale-110 transition-transform duration-300" />
                          <h4 className="font-semibold mb-2">Adventure Awaits</h4>
                          <p className="text-sm text-muted-foreground">Thrilling destinations for the adventurous soul</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.section>

        {/* Search Results */}
        <AnimatePresence>
          {searchResults && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-12"
            >
              <Card className="glass-morphism border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <span>Search Results</span>
                      <Badge variant="secondary">
                        {searchResults?.flights?.length || searchResults?.hotels?.length || 0} results
                      </Badge>
                    </CardTitle>
                    
                    <div className="flex items-center space-x-2">
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="duration">Duration</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Results will be displayed here */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Search results will appear here after your search completes.</p>
                    <p className="text-sm mt-2">Use voice search or the form above to find your perfect trip!</p>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Happy Paisa Integration */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                    <Wallet className="w-6 h-6" />
                    <span>Pay with Happy Paisa</span>
                  </h3>
                  <p className="text-emerald-600 dark:text-emerald-400 max-w-2xl">
                    Enjoy seamless payments with your digital wallet. Earn rewards on every booking 
                    and get exclusive discounts for Happy Paisa users.
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Instant payments</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Earn rewards</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Exclusive discounts</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-xl">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">Your Balance</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {user ? '15.0 HP' : '-- HP'}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      ≈ ₹{user ? '15,000' : '---'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default LuxuryTravel;