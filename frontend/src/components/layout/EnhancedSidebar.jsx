import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Plane, 
  Smartphone, 
  ShoppingCart, 
  Wallet, 
  Settings,
  GitBranch,
  Cloud,
  Activity,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '../../contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'AI-powered overview',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Happy Paisa',
    href: '/wallet',
    icon: Wallet,
    description: 'Digital currency wallet',
    badge: '₹15K',
    gradient: 'from-emerald-500 to-emerald-600'
  },
  {
    title: 'Travel',
    href: '/travel',
    icon: Plane,
    description: 'Flights, Hotels, Buses',
    badge: 'Hot',
    gradient: 'from-sky-500 to-sky-600'
  },
  {
    title: 'Recharge',
    href: '/recharge',
    icon: Smartphone,
    description: 'Mobile, DTH, Utilities',
    gradient: 'from-orange-500 to-orange-600'
  },
  {
    title: 'E-commerce',
    href: '/shop',
    icon: ShoppingCart,
    description: 'Curated products',
    badge: 'New',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Virtual Cards',
    href: '/virtual-cards',
    icon: CreditCard,
    description: 'Virtual debit cards',
    badge: '3D',
    gradient: 'from-pink-500 to-pink-600'
  },
  {
    title: 'Automation',
    href: '/automation',
    icon: Zap,
    description: 'n8n workflows & AI',
    badge: 'Smart',
    gradient: 'from-violet-500 to-violet-600'
  }
];

const secondaryItems = [
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Usage insights',
    gradient: 'from-indigo-500 to-indigo-600'
  },
  {
    title: 'Git Activity',
    href: '/git',
    icon: GitBranch,
    description: 'Development tracking',
    gradient: 'from-gray-500 to-gray-600'
  },
  {
    title: 'Weather',
    href: '/weather',
    icon: Cloud,
    description: 'Local forecasts',
    gradient: 'from-cyan-500 to-cyan-600'
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: Shield,
    description: 'Transaction history',
    gradient: 'from-red-500 to-red-600'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences',
    gradient: 'from-slate-500 to-slate-600'
  }
];

const EnhancedSidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemPreference, isSystemPreference } = useTheme();
  const [hoveredItem, setHoveredItem] = useState(null);

  const NavItem = ({ item, isActive }) => (
    <Link 
      to={item.href} 
      className="block"
      onMouseEnter={() => setHoveredItem(item.href)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <div className={cn(
        "relative group w-full h-12 mb-2 transition-all duration-300 rounded-xl overflow-hidden",
        isActive && "scale-105"
      )}>
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300",
          item.gradient,
          (isActive || hoveredItem === item.href) && "opacity-10"
        )} />
        
        {/* Glass morphism overlay */}
        <div className={cn(
          "absolute inset-0 backdrop-blur-sm transition-all duration-300",
          isActive 
            ? "bg-primary/20 border border-primary/30" 
            : "bg-transparent group-hover:bg-accent/30 border border-transparent group-hover:border-border/50"
        )} />
        
        {/* Content */}
        <div className={cn(
          "relative flex items-center h-full px-3 transition-all duration-300",
          collapsed && "justify-center"
        )}>
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full animate-slide-right" />
          )}
          
          {/* Icon */}
          <div className={cn(
            "relative flex items-center justify-center transition-all duration-300",
            collapsed ? "w-6 h-6" : "w-6 h-6 mr-3"
          )}>
            <item.icon className={cn(
              "w-5 h-5 transition-all duration-300",
              isActive 
                ? "text-primary animate-pulse" 
                : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
            )} />
            
            {/* Glow effect for active item */}
            {isActive && (
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
            )}
          </div>
          
          {/* Text content */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "font-medium truncate transition-colors duration-300",
                  isActive 
                    ? "text-primary" 
                    : "text-foreground group-hover:text-foreground"
                )}>
                  {item.title}
                </span>
                
                {/* Badge */}
                {item.badge && (
                  <Badge 
                    variant={isActive ? "default" : "secondary"} 
                    className={cn(
                      "text-xs transition-all duration-300 animate-bounce-subtle",
                      isActive && "bg-primary/20 text-primary border-primary/30"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              
              <p className={cn(
                "text-xs truncate transition-colors duration-300 mt-0.5",
                isActive 
                  ? "text-primary/70" 
                  : "text-muted-foreground group-hover:text-muted-foreground"
              )}>
                {item.description}
              </p>
            </div>
          )}
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-20 transition-opacity duration-150 bg-gradient-to-r from-primary/30 to-transparent" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className={cn(
      "hidden md:flex flex-col h-full bg-background/80 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ease-in-out relative",
      collapsed ? "w-20" : "w-72"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-border/50",
        collapsed && "justify-center"
      )}>
        {!collapsed && (
          <div className="flex items-center space-x-3 animate-fade-in-up">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Axzora
              </h1>
              <p className="text-xs text-muted-foreground">Mr. Happy 2.0</p>
            </div>
          </div>
        )}
        
        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-8 h-8 rounded-full hover:bg-accent/50 transition-all duration-300 hover:scale-110"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
        {/* Main Services */}
        <div className="space-y-2">
          {!collapsed && (
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 animate-fade-in-up">
              Services
            </h2>
          )}
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
              />
            ))}
          </div>
        </div>

        {/* Tools & Insights */}
        <div className="space-y-2">
          {!collapsed && (
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2 animate-fade-in-up">
              Tools & Insights
            </h3>
          )}
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={location.pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-4 space-y-4">
        {/* Theme Switcher */}
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <span className="text-sm font-medium text-muted-foreground">
              Theme
            </span>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 rounded-full hover:bg-accent/50 transition-all duration-300 hover:scale-110"
              >
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Monitor className="w-4 h-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={setLightTheme} className="cursor-pointer">
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={setDarkTheme} className="cursor-pointer">
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={setSystemPreference} className="cursor-pointer">
                <Monitor className="w-4 h-4 mr-2" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mr. Happy Status */}
        {!collapsed && (
          <div className="glass-morphism p-3 rounded-xl border border-border/50 animate-fade-in-up">
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Mr. Happy
                </span>
                <p className="text-xs text-muted-foreground">Online & Ready</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 mb-2">
              <div className="voice-wave bg-emerald-500" />
              <div className="voice-wave bg-emerald-500" />
              <div className="voice-wave bg-emerald-500" />
              <div className="voice-wave bg-emerald-500" />
              <div className="voice-wave bg-emerald-500" />
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">
              Advanced AI with voice capabilities and real-time backend integration
            </p>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-8 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Voice Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSidebar;