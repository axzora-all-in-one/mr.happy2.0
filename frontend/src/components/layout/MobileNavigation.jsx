import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Plane, 
  Smartphone, 
  ShoppingCart, 
  Wallet,
  CreditCard,
  Settings,
  MoreHorizontal,
  Sparkles
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';

const mobileNavItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    label: 'Dashboard'
  },
  {
    title: 'Wallet',
    href: '/wallet',
    icon: Wallet,
    label: 'Happy Paisa'
  },
  {
    title: 'Travel',
    href: '/travel',
    icon: Plane,
    label: 'Book Trips',
    badge: 'Hot'
  },
  {
    title: 'Recharge',
    href: '/recharge',
    icon: Smartphone,
    label: 'Mobile & Bills'
  },
  {
    title: 'More',
    href: '/more',
    icon: MoreHorizontal,
    label: 'More Services'
  }
];

const MobileNavigation = ({ className }) => {
  const location = useLocation();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50",
      "md:hidden", // Hide on desktop
      className
    )}>
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/60 backdrop-blur-xl" />
      
      {/* Navigation Items */}
      <div className="relative grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center relative group transition-all duration-300",
                "hover:bg-accent/50 active:scale-95",
                isActive && "text-primary"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full animate-slide-down" />
              )}
              
              {/* Icon container */}
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary shadow-lg shadow-primary/20" 
                  : "group-hover:bg-accent/30"
              )}>
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive ? "animate-bounce-subtle" : "group-hover:scale-110"
                  )} 
                />
                
                {/* Badge */}
                {item.badge && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center animate-pulse"
                  >
                    {item.badge === 'Hot' ? '🔥' : item.badge}
                  </Badge>
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium mt-0.5 transition-all duration-300",
                isActive 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground group-hover:text-foreground"
              )}>
                {item.title}
              </span>
              
              {/* Ripple effect */}
              <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-active:opacity-20 transition-opacity duration-150",
                "bg-gradient-to-t from-primary/30 to-transparent"
              )} />
            </Link>
          );
        })}
      </div>
      
      {/* Mr. Happy Voice Indicator */}
      <div className="absolute top-2 right-4 flex items-center space-x-1">
        <div className="flex space-x-0.5">
          <div className="voice-wave h-2 w-0.5 bg-primary/60 rounded-full animate-voice-wave" />
          <div className="voice-wave h-2 w-0.5 bg-primary/60 rounded-full animate-voice-wave" style={{ animationDelay: '0.1s' }} />
          <div className="voice-wave h-2 w-0.5 bg-primary/60 rounded-full animate-voice-wave" style={{ animationDelay: '0.2s' }} />
        </div>
        <Sparkles className="h-3 w-3 text-primary animate-pulse" />
      </div>
      
      {/* Safe area padding for newer phones */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default MobileNavigation;