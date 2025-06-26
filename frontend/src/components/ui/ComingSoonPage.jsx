import React from 'react';
import { 
  GitBranch, 
  Cloud, 
  CreditCard, 
  Settings, 
  Grid,
  Calendar,
  Bell,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

const iconMap = {
  GitBranch,
  Cloud,
  CreditCard,
  Settings,
  Grid,
};

const ComingSoonPage = ({ 
  title, 
  description, 
  icon = 'Settings',
  features = [],
  className 
}) => {
  const IconComponent = iconMap[icon] || Settings;
  
  return (
    <div className={cn(
      "min-h-full flex items-center justify-center p-4",
      "bg-gradient-to-br from-background via-background to-accent/5",
      className
    )}>
      <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
        {/* Main Card */}
        <Card className="glass-morphism border-2 border-border/50 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg animate-float">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-gradient bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {title}
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
                {description}
              </CardDescription>
            </div>
            
            {/* Status Badge */}
            <Badge 
              variant="secondary" 
              className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1 rounded-full font-medium animate-pulse"
            >
              🚧 Coming Soon
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Features Preview */}
            {features.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Upcoming Features</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className="flex items-center space-x-3 p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-all duration-300 group animate-slide-right"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center flex items-center justify-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Development Timeline</span>
              </h3>
              
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>
                
                <div className="space-y-6">
                  <div className="relative flex items-center space-x-4">
                    <div className="w-4 h-4 bg-primary rounded-full border-4 border-background shadow-lg animate-pulse"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Design & Planning</p>
                      <p className="text-xs text-muted-foreground">Feature specifications and UI design</p>
                    </div>
                    <Badge variant="default" className="bg-primary/20 text-primary">
                      In Progress
                    </Badge>
                  </div>
                  
                  <div className="relative flex items-center space-x-4">
                    <div className="w-4 h-4 bg-muted rounded-full border-4 border-background"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Development</p>
                      <p className="text-xs text-muted-foreground">Core functionality implementation</p>
                    </div>
                    <Badge variant="secondary">
                      Next
                    </Badge>
                  </div>
                  
                  <div className="relative flex items-center space-x-4">
                    <div className="w-4 h-4 bg-muted rounded-full border-4 border-background"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Testing & Launch</p>
                      <p className="text-xs text-muted-foreground">Quality assurance and deployment</p>
                    </div>
                    <Badge variant="outline">
                      Planned
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                variant="default" 
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 group"
                onClick={() => alert('🔔 You\'ll be notified when this feature is ready!')}
              >
                <Bell className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Notify Me When Ready
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 hover:bg-accent/50 transition-all duration-300 hover:scale-105 group"
                onClick={() => window.history.back()}
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180 group-hover:translate-x-1 transition-transform duration-300" />
                Back to Dashboard
              </Button>
            </div>
            
            {/* Bottom Message */}
            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                This feature is being developed with ❤️ by the Axzora team.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Follow our progress and get early access updates!
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Mr. Happy Assistant Card */}
        <Card className="glass-morphism border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-bounce-subtle">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
                  🤖 Mr. Happy Says
                </h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  "I'm working hard to bring you amazing new features! 
                  While you wait, explore the existing services in your dashboard."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComingSoonPage;