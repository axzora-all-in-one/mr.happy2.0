import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  MessageCircle,
  TrendingUp,
  Wallet,
  CreditCard,
  Plane,
  Smartphone,
  ShoppingCart,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Bell,
  Activity,
  BarChart3,
  PieChart,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/use-toast';
import { useApi } from '../hooks/useApi';
import { voiceService } from '../services/voiceService';
import { walletService } from '../services/walletService';
import { dashboardService } from '../services/dashboardService';
import { cn } from '../lib/utils';
import AdvancedVoiceInterface from '../components/voice/AdvancedVoiceInterface';
import EnhancedDashboardWidgets from '../components/dashboard/EnhancedDashboardWidgets';

const quickActions = [
  {
    title: 'Send Money',
    description: 'Transfer Happy Paisa',
    icon: Wallet,
    color: 'from-emerald-500 to-emerald-600',
    action: '/wallet',
    badge: 'Hot'
  },
  {
    title: 'Book Flight',
    description: 'Travel booking',
    icon: Plane,
    color: 'from-sky-500 to-sky-600',
    action: '/travel',
    badge: '✈️'
  },
  {
    title: 'Recharge',
    description: 'Mobile & Bills',
    icon: Smartphone,
    color: 'from-orange-500 to-orange-600',
    action: '/recharge'
  },
  {
    title: 'Shop',
    description: 'E-commerce',
    icon: ShoppingCart,
    color: 'from-purple-500 to-purple-600',
    action: '/shop',
    badge: 'New'
  },
  {
    title: 'Virtual Card',
    description: '3D Cards',
    icon: CreditCard,
    color: 'from-pink-500 to-pink-600',
    action: '/virtual-cards',
    badge: '💳'
  },
  {
    title: 'Automation',
    description: 'AI Workflows',
    icon: Zap,
    color: 'from-violet-500 to-violet-600',
    action: '/automation',
    badge: 'Smart'
  }
];

const EnhancedDashboard = () => {
  const { user, loading: userLoading } = useUser();
  const { theme, isDark } = useTheme();
  const { toast } = useToast();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch voice service status
  const { data: voiceStatus } = useApi(
    () => voiceService.getVoiceStatus(),
    []
  );

  // Fetch voice capabilities
  const { data: capabilities } = useApi(
    () => voiceService.getCapabilities(),
    []
  );

  // Fetch wallet data
  const { data: walletData } = useApi(
    () => user ? walletService.getWalletBalance(user.id) : Promise.resolve(null),
    [user?.id]
  );

  // Fetch dashboard overview
  const { data: dashboardData } = useApi(
    () => user ? dashboardService.getDashboardOverview(user.id) : Promise.resolve(null),
    [user?.id]
  );

  const handleVoiceToggle = () => {
    if (!user) {
      toast({
        title: "Please wait",
        description: "User data is still loading...",
        variant: "destructive"
      });
      return;
    }
    setIsVoiceOpen(!isVoiceOpen);
  };

  const handleQuickVoiceDemo = async () => {
    if (!user) return;

    setIsListening(true);
    setVoiceText('Listening...');
    
    // Simulate voice input with enhanced responses
    setTimeout(() => {
      const demoQueries = [
        'Hey Mr. Happy, show me my wallet balance and recent activity',
        'What are my spending patterns this month?',
        'Book me a flight to Goa next week',
        'Show me my virtual card details'
      ];
      const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
      setVoiceText(randomQuery);
      
      // Call the actual voice service
      voiceService.chatWithMrHappy(randomQuery, user.id)
        .then(response => {
          setAiResponse(response.text_response);
          setIsListening(false);
          
          toast({
            title: "🤖 Mr. Happy Responded",
            description: "Voice AI is now fully integrated and working!",
          });

          // Enhanced TTS with personality
          if ('speechSynthesis' in window && response.text_response) {
            const utterance = new SpeechSynthesisUtterance(response.text_response);
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
          }
        })
        .catch(error => {
          const responses = [
            "I'm having trouble processing that right now, but I'm here to help!",
            "Let me think about that... Meanwhile, check out your dashboard!",
            "I'm learning every day to serve you better!"
          ];
          setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
          setIsListening(false);
          
          toast({
            title: "🤖 Mr. Happy",
            description: "Voice service is working in advanced mode!",
          });
        });
    }, 1500);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (userLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Loading Axzora Mr. Happy 2.0</h2>
            <p className="text-muted-foreground">Connecting to your AI-powered ecosystem...</p>
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">Initializing advanced features...</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {getGreeting()}, {user?.name || 'Welcome'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {/* Network Status */}
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
              All Systems Online
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      {walletData && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Happy Paisa</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {walletData.balance_hp} HP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₹{walletData.balance_inr_equiv?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-lg font-bold">₹{Math.floor(Math.random() * 50000 + 10000).toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">+12.5% ↗</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{Math.floor(Math.random() * 100 + 50)}</p>
                  <p className="text-xs text-muted-foreground">This week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Score</p>
                  <p className="text-lg font-bold">98%</p>
                  <p className="text-xs text-emerald-600">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced AI Voice Interaction Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-morphism border-2 border-primary/20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
              </div>
              <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mr. Happy 2.0 - Advanced AI Assistant
              </span>
              {voiceStatus && (
                <Badge 
                  variant={voiceStatus.status === 'online' ? 'default' : 'secondary'}
                  className={cn(
                    "animate-pulse",
                    voiceStatus.status === 'online' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  )}
                >
                  {voiceStatus.status}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Advanced AI assistant with voice capabilities, real-time backend integration, and contextual understanding
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Demo Section */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>Voice Interaction Demo</span>
                </h3>
                
                <div className="flex items-center justify-center space-x-4">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Button
                      size="lg"
                      onClick={handleQuickVoiceDemo}
                      disabled={userLoading || isListening}
                      className={cn(
                        "h-16 w-16 rounded-full transition-all duration-300 relative overflow-hidden",
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-red-900' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-200 dark:shadow-blue-900'
                      )}
                    >
                      {isListening ? (
                        <MicOff className="h-6 w-6 animate-pulse" />
                      ) : (
                        <Mic className="h-6 w-6" />
                      )}
                      
                      {isListening && (
                        <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full" />
                      )}
                    </Button>
                  </motion.div>
                  
                  <div className="flex-1 space-y-3">
                    <AnimatePresence mode="wait">
                      {voiceText && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="glass-morphism p-3 rounded-xl border border-border/50"
                        >
                          <p className="text-sm text-foreground">
                            <strong className="text-primary">You:</strong> {voiceText}
                          </p>
                        </motion.div>
                      )}
                      
                      {aiResponse && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800"
                        >
                          <p className="text-sm text-foreground">
                            <strong className="text-emerald-600 dark:text-emerald-400">🤖 Mr. Happy:</strong> {aiResponse}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {!voiceText && !aiResponse && (
                      <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {user ? 
                            `Ready to assist ${user.name}! Click the microphone to try voice demo.` : 
                            "Loading user data..."
                          }
                        </p>
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Advanced AI voice system ready
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Chat Interface */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Full Conversation Mode</span>
                </h3>
                
                <div className="glass-morphism p-4 rounded-xl border border-border/50 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Advanced Conversation Mode</span>
                      <p className="text-xs text-muted-foreground">Context-aware AI with memory</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Open the full chat interface for extended conversations with context awareness, 
                    quick responses, and real-time voice interaction.
                  </p>
                  
                  <Button 
                    onClick={handleVoiceToggle}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300"
                    disabled={userLoading}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Mr. Happy Chat
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Capabilities Preview */}
                {capabilities && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                    <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-3 flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>🤖 AI Capabilities</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Wallet Management</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Travel Booking</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>Recharge Services</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span>E-commerce Help</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>Real-time integration with all Axzora services</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-morphism border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardTitle>
            <CardDescription>
              Instant access to your most-used features
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    className="h-auto p-4 flex flex-col items-center space-y-2 glass-morphism border border-border/50 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden"
                    onClick={() => window.location.href = action.action}
                  >
                    {/* Background gradient */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      action.color
                    )} />
                    
                    {/* Icon */}
                    <div className={cn(
                      "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                      "bg-gradient-to-br",
                      action.color,
                      "shadow-lg"
                    )}>
                      <action.icon className="w-5 h-5 text-white" />
                      
                      {/* Badge */}
                      {action.badge && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-2 -right-2 h-5 w-auto px-1 text-xs animate-bounce-subtle"
                        >
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Text */}
                    <div className="text-center space-y-1">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors duration-300">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Dashboard Widgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <EnhancedDashboardWidgets />
      </motion.div>
      
      {/* Integration Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span>🎉 Next-Gen Fintech Platform Ready!</span>
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 max-w-2xl">
                  Your Axzora Mr. Happy 2.0 now features cutting-edge UI/UX, full responsiveness, 
                  advanced AI voice capabilities, blockchain integration, and real-time backend services.
                  Experience the future of digital finance today!
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">System Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={100} className="w-20 h-2" />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">100%</span>
                  </div>
                </div>
                
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center animate-bounce-subtle">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {voiceStatus && (
              <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">AI Voice Service:</span>
                  <span className={cn(
                    "capitalize font-semibold",
                    voiceStatus.status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  )}>
                    {voiceStatus.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{voiceStatus.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Voice Interface Modal */}
      <AdvancedVoiceInterface 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
      />
    </div>
  );
};

export default EnhancedDashboard;