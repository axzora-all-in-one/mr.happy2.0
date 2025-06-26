import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Mic, 
  MicOff, 
  User, 
  Wallet, 
  Loader2,
  Menu,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useApi } from '../../hooks/useApi';
import { walletService } from '../../services/walletService';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../lib/utils';

const EnhancedHeader = ({ 
  onVoiceToggle, 
  isListening = false, 
  sidebarCollapsed,
  onSidebarToggle 
}) => {
  const { user, loading: userLoading } = useUser();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchFocused, setSearchFocused] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch wallet balance for header display
  const { data: walletData, loading: walletLoading } = useApi(
    () => user ? walletService.getWalletBalance(user.id) : Promise.resolve(null),
    [user?.id]
  );

  // Fetch notifications
  const { data: notificationsData } = useApi(
    () => user ? dashboardService.getNotifications(user.id, 5) : Promise.resolve({ notifications: [] }),
    [user?.id]
  );

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Enhanced voice interaction with user context
      setTimeout(() => {
        const responses = [
          `Found ${Math.floor(Math.random() * 50) + 1} results for "${searchQuery}"`,
          `Here's what I found about "${searchQuery}"`,
          `${searchQuery} - I can help you with that!`
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        alert(`🤖 Mr. Happy: ${randomResponse}. ${user ? `${user.name}, h` : 'H'}ow can I assist you further?`);
      }, 800);
    }
  };

  const handleVoiceCommand = () => {
    onVoiceToggle();
    
    // Enhanced voice feedback
    if (!isListening) {
      // Start listening feedback
      const utterance = new SpeechSynthesisUtterance(
        user ? `Hello ${user.name}, I'm listening` : "Hello, I'm listening"
      );
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      if ('speechSynthesis' in window) {
        speechSynthesis.speak(utterance);
      }
    }
  };

  if (userLoading) {
    return (
      <header className="h-16 bg-background/95 backdrop-blur-xl border-b border-border/50 flex items-center justify-center">
        <div className="flex items-center space-x-3 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading Axzora...</span>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-background/95 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/90 to-background/80" />
      
      <div className="relative container flex h-full items-center justify-between px-4">
        {/* Left Section - Logo & Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden w-9 h-9 rounded-xl hover:bg-accent/50 transition-all duration-300"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - Hidden on small mobile */}
          <div className="hidden xs:flex items-center space-x-3 animate-slide-right">
            <div className="relative group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              {/* Status indicator */}
              <div className={cn(
                "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background transition-all duration-300",
                isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md" />
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gradient bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Axzora
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Mr. Happy 2.0
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Enhanced Search */}
        <div className="flex-1 max-w-lg mx-4">
          <form onSubmit={handleSearch} className="relative group">
            <div className={cn(
              "relative transition-all duration-300",
              searchFocused && "transform scale-105"
            )}>
              <Input
                type="text"
                placeholder={user ? `Ask Mr. Happy anything, ${user.name}...` : "Ask Mr. Happy anything..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={cn(
                  "pl-10 pr-20 h-10 rounded-2xl transition-all duration-300",
                  "bg-accent/30 border-2 border-transparent",
                  "hover:bg-accent/50 focus:bg-background/80 focus:border-primary/50",
                  "backdrop-blur-sm placeholder:text-muted-foreground/70",
                  searchFocused && "shadow-lg shadow-primary/20"
                )}
              />
              
              {/* Search icon */}
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-all duration-300",
                searchFocused ? "text-primary" : "text-muted-foreground"
              )} />
              
              {/* Voice and search buttons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button
                  type="button"
                  size="sm"
                  variant={isListening ? "destructive" : "secondary"}
                  onClick={handleVoiceCommand}
                  className={cn(
                    "h-6 w-6 p-0 rounded-full transition-all duration-300",
                    isListening 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-200 dark:shadow-red-900" 
                      : "bg-primary/10 hover:bg-primary/20 text-primary hover:scale-110"
                  )}
                >
                  {isListening ? (
                    <MicOff className="h-3 w-3" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                </Button>
                
                <Button 
                  type="submit" 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 rounded-full hover:bg-accent/50 hover:scale-110 transition-all duration-300"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Voice wave indicator */}
              {isListening && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-0.5">
                  <div className="voice-wave bg-red-500" />
                  <div className="voice-wave bg-red-500" />
                  <div className="voice-wave bg-red-500" />
                </div>
              )}
            </div>
            
            {/* Search suggestions overlay */}
            {searchFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl p-3 animate-slide-down">
                <p className="text-xs text-muted-foreground mb-2">Quick suggestions:</p>
                <div className="space-y-1">
                  <button className="w-full text-left text-sm hover:bg-accent/50 p-2 rounded-lg transition-colors">
                    💰 Check my wallet balance
                  </button>
                  <button className="w-full text-left text-sm hover:bg-accent/50 p-2 rounded-lg transition-colors">
                    ✈️ Book a flight to {searchQuery}
                  </button>
                  <button className="w-full text-left text-sm hover:bg-accent/50 p-2 rounded-lg transition-colors">
                    📱 Recharge my mobile
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center space-x-3">
          {/* Network Status */}
          <div className={cn(
            "hidden sm:flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
            isOnline 
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" 
              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
          )}>
            {isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Happy Paisa Balance */}
          <div className="hidden md:flex items-center space-x-2 glass-morphism px-3 py-1.5 rounded-2xl border border-border/50 transition-all duration-300 hover:scale-105 group">
            <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:animate-bounce" />
            {walletLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-muted animate-pulse rounded" />
                <div className="w-8 h-4 bg-muted animate-pulse rounded" />
              </div>
            ) : walletData ? (
              <>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {walletData.balance_hp} HP
                </span>
                <span className="text-xs text-muted-foreground">
                  (₹{walletData.balance_inr_equiv?.toLocaleString()})
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Loading...</span>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative w-9 h-9 rounded-xl hover:bg-accent/50 transition-all duration-300 hover:scale-110"
              >
                <Bell className={cn(
                  "h-4 w-4 transition-all duration-300",
                  unreadCount > 0 && "animate-bounce"
                )} />
                {unreadCount > 0 && (
                  <>
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                    {/* Pulse ring */}
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-20" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 glass-morphism">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="animate-pulse">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((notif) => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-sm">{notif.title}</span>
                      <div className="flex items-center space-x-2">
                        {!notif.read && (
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(notif.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem className="text-center text-muted-foreground">
                  No notifications
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center cursor-pointer hover:bg-accent/50">
                <span className="text-sm text-primary font-medium">View all notifications</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative w-9 h-9 rounded-xl p-0 hover:bg-accent/50 transition-all duration-300 hover:scale-110">
                  <Avatar className="w-9 h-9 border-2 border-background shadow-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-morphism">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Live Connected</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/50">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/50">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Happy Paisa Wallet</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/50">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/50">
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-accent/50 text-red-600 dark:text-red-400">
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default EnhancedHeader;