import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { UserProvider } from "./contexts/UserContext";
import { AnalyticsProvider } from "./contexts/AnalyticsContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ResponsiveLayout from "./components/layout/ResponsiveLayout";

// Pages
import EnhancedDashboard from "./pages/EnhancedDashboard";
import Travel from "./pages/Travel";
import Recharge from "./pages/Recharge";
import ShopUpdated from "./pages/ShopUpdated";
import WalletUpdated from "./pages/WalletUpdated";
import VirtualCards from "./pages/VirtualCards";
import AutomationHub from "./components/automation/AutomationHub";
import AnalyticsDashboard from "./components/analytics/AnalyticsDashboard";

// Placeholder pages for "Coming Soon" items
import ComingSoonPage from "./components/ui/ComingSoonPage";

const App = () => {
  return (
    <div className="App">
      <ThemeProvider>
        <UserProvider>
          <AnalyticsProvider>
            <BrowserRouter>
              <ResponsiveLayout>
                <Routes>
                  {/* Main Pages */}
                  <Route path="/" element={<EnhancedDashboard />} />
                  <Route path="/travel" element={<Travel />} />
                  <Route path="/recharge" element={<Recharge />} />
                  <Route path="/shop" element={<ShopUpdated />} />
                  <Route path="/wallet" element={<WalletUpdated />} />
                  <Route path="/virtual-cards" element={<VirtualCards />} />
                  <Route path="/automation" element={<AutomationHub userId="43f08807-ea8e-4f96-ab9b-4b529b4b7475" />} />
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  
                  {/* Coming Soon Pages with Enhanced UI */}
                  <Route 
                    path="/git" 
                    element={
                      <ComingSoonPage 
                        title="Git Activity" 
                        description="Development tracking and version control insights"
                        icon="GitBranch"
                        features={[
                          "Real-time commit tracking",
                          "Code contribution analytics", 
                          "Branch management insights",
                          "Team collaboration metrics"
                        ]}
                      />
                    } 
                  />
                  <Route 
                    path="/weather" 
                    element={
                      <ComingSoonPage 
                        title="Weather Intelligence" 
                        description="AI-powered weather forecasts and travel planning"
                        icon="Cloud"
                        features={[
                          "Hyperlocal weather forecasts",
                          "Travel weather insights",
                          "Weather-based recommendations",
                          "Climate impact analysis"
                        ]}
                      />
                    } 
                  />
                  <Route 
                    path="/payments" 
                    element={
                      <ComingSoonPage 
                        title="Payment History" 
                        description="Comprehensive transaction management and insights"
                        icon="CreditCard"
                        features={[
                          "Advanced transaction filtering",
                          "Spending pattern analysis",
                          "Receipt management",
                          "Tax reporting tools"
                        ]}
                      />
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ComingSoonPage 
                        title="Settings Panel" 
                        description="Personalized app configuration and preferences"
                        icon="Settings"
                        features={[
                          "Account customization",
                          "Privacy & security settings",
                          "Notification preferences",
                          "Integration management"
                        ]}
                      />
                    } 
                  />
                  
                  {/* More Page for Mobile Navigation */}
                  <Route 
                    path="/more" 
                    element={
                      <ComingSoonPage 
                        title="More Services" 
                        description="Additional features and integrations"
                        icon="Grid"
                        features={[
                          "Banking services",
                          "Investment tools",
                          "Insurance products",
                          "Third-party integrations"
                        ]}
                      />
                    } 
                  />
                </Routes>
              </ResponsiveLayout>
            </BrowserRouter>
            
            {/* Enhanced Toast Notifications */}
            <Toaster />
          </AnalyticsProvider>
        </UserProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;