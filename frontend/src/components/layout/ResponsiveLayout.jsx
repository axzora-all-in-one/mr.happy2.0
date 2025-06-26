import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import EnhancedSidebar from './EnhancedSidebar';
import MobileNavigation from './MobileNavigation';
import EnhancedHeader from './EnhancedHeader';
import { useTheme } from '../../contexts/ThemeContext';

const ResponsiveLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  // Handle responsive breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse sidebar on smaller desktop screens
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setSidebarCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Auto-hide mobile navigation on certain pages
  const hideMobileNav = ['/voice', '/chat'].includes(location.pathname);

  const handleVoiceToggle = () => {
    setIsVoiceListening(!isVoiceListening);
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={cn(
      "flex h-screen bg-gradient-to-br from-background via-background to-accent/5 overflow-hidden transition-all duration-300",
      theme === 'dark' && "from-background via-background/95 to-accent/10"
    )}>
      {/* Desktop Sidebar */}
      <EnhancedSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={handleSidebarToggle}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <EnhancedHeader 
          onVoiceToggle={handleVoiceToggle}
          isListening={isVoiceListening}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={handleSidebarToggle}
        />
        
        {/* Page Content */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          "bg-gradient-to-b from-background/50 to-background",
          isMobile ? "pb-20" : "pb-4" // Add bottom padding for mobile nav
        )}>
          {/* Content wrapper with proper padding */}
          <div className={cn(
            "min-h-full",
            isMobile ? "px-4 py-4" : "px-6 py-6"
          )}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && !hideMobileNav && (
        <MobileNavigation />
      )}
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] [background-size:20px_20px] animate-pulse" />
      </div>
    </div>
  );
};

export default ResponsiveLayout;