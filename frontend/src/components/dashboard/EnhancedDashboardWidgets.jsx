import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Wallet,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  MapPin,
  Cloud,
  Smartphone,
  Plane,
  ShoppingCart,
  Zap,
  Users,
  Globe,
  Star,
  Target,
  Award,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useUser } from '../../contexts/UserContext';
import { useApi } from '../../hooks/useApi';
import { walletService } from '../../services/walletService';
import { dashboardService } from '../../services/dashboardService';
import { cn } from '../../lib/utils';

const EnhancedDashboardWidgets = () => {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState('week');
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: walletData, loading: walletLoading } = useApi(
    () => user ? walletService.getWalletBalance(user.id) : Promise.resolve(null),
    [user?.id]
  );

  const { data: recentActivity, loading: activityLoading } = useApi(
    () => user ? dashboardService.getRecentActivity(user.id, 10) : Promise.resolve({ activities: [] }),
    [user?.id]
  );

  const { data: statsData } = useApi(
    () => user ? dashboardService.getStatistics(user.id) : Promise.resolve({}),
    [user?.id]
  );

  // Mock data for enhanced features
  const spendingCategories = [
    { name: 'Travel', amount: 15420, percentage: 35, color: 'from-sky-500 to-sky-600', icon: Plane },
    { name: 'Food & Dining', amount: 8750, percentage: 20, color: 'from-orange-500 to-orange-600', icon: Activity },
    { name: 'Shopping', amount: 6200, percentage: 14, color: 'from-purple-500 to-purple-600', icon: ShoppingCart },
    { name: 'Recharge & Bills', amount: 5600, percentage: 13, color: 'from-green-500 to-green-600', icon: Smartphone },
    { name: 'Others', amount: 7830, percentage: 18, color: 'from-gray-500 to-gray-600', icon: Activity }
  ];

  const financialGoals = [
    { name: 'Travel Fund', current: 25000, target: 50000, icon: Plane, color: 'sky' },
    { name: 'Emergency Fund', current: 75000, target: 100000, icon: Target, color: 'emerald' },
    { name: 'Shopping Budget', current: 8500, target: 15000, icon: ShoppingCart, color: 'purple' }
  ];

  const achievementBadges = [
    { name: 'Budget Master', description: 'Stayed within budget for 3 months', icon: Award, earned: true },
    { name: 'Travel Enthusiast', description: 'Booked 5+ trips this year', icon: Plane, earned: true },
    { name: 'Saver Pro', description: 'Saved 20% of income', icon: Target, earned: false },
    { name: 'Digital Native', description: 'Used all digital services', icon: Sparkles, earned: true }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount, showFull = true) => {
    if (!showBalance && !showFull) return '••••••';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRangeData = (range) => {
    const data = {
      week: { income: 12500, expenses: 8750, transactions: 24 },
      month: { income: 65000, expenses: 42300, transactions: 156 },
      year: { income: 780000, expenses: 520000, transactions: 1844 }
    };
    return data[range] || data.week;
  };

  const currentData = getTimeRangeData(timeRange);

  return (
    <div className="space-y-6">
      {/* Enhanced Wallet Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Wallet Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2"
        >
          <Card className="glass-morphism border-border/50 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16" />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <span>Happy Paisa Wallet</span>
                  </CardTitle>
                  <CardDescription>Blockchain-powered digital currency</CardDescription>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="w-8 h-8 rounded-full"
                  >
                    {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="w-8 h-8 rounded-full"
                  >
                    <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative space-y-6">
              {/* Balance Display */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {walletData ? (
                      showBalance ? `${walletData.balance_hp} HP` : '••••• HP'
                    ) : (
                      <div className="w-24 h-8 bg-muted animate-pulse rounded" />
                    )}
                  </span>
                  <span className="text-lg text-muted-foreground">
                    {walletData && showBalance && (
                      `≈ ${formatCurrency(walletData.balance_inr_equiv)}`
                    )}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5% this month</span>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                    Blockchain Verified
                  </Badge>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: ArrowUpRight, label: 'Send', color: 'text-blue-600' },
                  { icon: ArrowDownRight, label: 'Receive', color: 'text-emerald-600' },
                  { icon: CreditCard, label: 'Cards', color: 'text-purple-600' },
                  { icon: BarChart3, label: 'Analytics', color: 'text-orange-600' }
                ].map((action, index) => (
                  <Button
                    key={action.label}
                    variant="ghost"
                    className="h-auto p-3 flex flex-col items-center space-y-1 glass-morphism border border-border/30 hover:border-primary/30 transition-all duration-300 group"
                  >
                    <action.icon className={cn("w-5 h-5 group-hover:scale-110 transition-transform duration-300", action.color)} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Star className="w-5 h-5 text-amber-500" />
                <span>Financial Health</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Health Score */}
              <div className="text-center space-y-2">
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="85, 100"
                      className="text-emerald-500"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="0, 100"
                      className="text-muted-foreground/20"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">85</span>
                  </div>
                </div>
                
                <div>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">Excellent</p>
                  <p className="text-xs text-muted-foreground">Your financial health is great!</p>
                </div>
              </div>
              
              {/* Health Factors */}
              <div className="space-y-3">
                {[
                  { label: 'Savings Rate', value: 85, color: 'emerald' },
                  { label: 'Budget Adherence', value: 90, color: 'blue' },
                  { label: 'Investment Score', value: 75, color: 'purple' }
                ].map((factor) => (
                  <div key={factor.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{factor.label}</span>
                      <span className="font-medium">{factor.value}%</span>
                    </div>
                    <Progress value={factor.value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Spending Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  <span>Spending Categories</span>
                </CardTitle>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs">
                    This {timeRange}
                  </Button>
                  <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {spendingCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-accent/30 transition-colors duration-300 group cursor-pointer"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300",
                    category.color
                  )}>
                    <category.icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{category.name}</span>
                      <span className="text-sm font-semibold">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={category.percentage} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{category.percentage}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <Button variant="outline" className="w-full mt-4 group">
                View Detailed Report
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <span>Financial Goals</span>
              </CardTitle>
              <CardDescription>Track your savings and investment targets</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {financialGoals.map((goal, index) => {
                const progress = (goal.current / goal.target) * 100;
                const isCompleted = progress >= 100;
                
                return (
                  <motion.div
                    key={goal.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-300 group cursor-pointer",
                      isCompleted 
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30" 
                        : "bg-accent/30 border-border/50 hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                        isCompleted 
                          ? "bg-emerald-500 text-white" 
                          : `bg-${goal.color}-100 dark:bg-${goal.color}-900/30 text-${goal.color}-600 dark:text-${goal.color}-400`
                      )}>
                        <goal.icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{goal.name}</span>
                          {isCompleted && (
                            <Badge variant="default" className="bg-emerald-500 text-white">
                              <Award className="w-3 h-3 mr-1" />
                              Completed!
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Progress 
                        value={Math.min(progress, 100)} 
                        className={cn(
                          "h-2",
                          isCompleted && "bg-emerald-100 dark:bg-emerald-900/30"
                        )} 
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{Math.round(progress)}% completed</span>
                        <span className={cn(
                          "font-medium",
                          isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                        )}>
                          {formatCurrency(goal.target - goal.current)} remaining
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              
              <Button variant="outline" className="w-full group">
                <Target className="w-4 h-4 mr-2" />
                Set New Goal
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
                
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {recentActivity?.activities?.length || 0} transactions
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs">
                    View All
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {activityLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3">
                      <div className="w-10 h-10 bg-muted animate-pulse rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-muted animate-pulse rounded" />
                        <div className="w-20 h-3 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="w-16 h-4 bg-muted animate-pulse rounded" />
                    </div>
                  ))
                ) : recentActivity?.activities?.length > 0 ? (
                  recentActivity.activities.slice(0, 6).map((activity, index) => (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-accent/30 transition-colors duration-300 group cursor-pointer"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300",
                        activity.type === 'credit' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      )}>
                        {activity.type === 'credit' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{activity.description}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold text-sm",
                          activity.type === 'credit' 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-red-600 dark:text-red-400'
                        )}>
                          {activity.type === 'credit' ? '+' : '-'}{activity.amount_hp} HP
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{activity.amount_inr_equiv?.toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-morphism border-border/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Achievements</span>
              </CardTitle>
              <CardDescription>Your financial milestones</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {achievementBadges.map((badge, index) => (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-300 group cursor-pointer",
                    badge.earned 
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30" 
                      : "bg-accent/30 border-border/50 hover:bg-accent/50 opacity-60"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300",
                      badge.earned 
                        ? "bg-amber-500 text-white shadow-lg" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      <badge.icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{badge.name}</span>
                        {badge.earned && (
                          <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <Button variant="outline" className="w-full group mt-4">
                <Award className="w-4 h-4 mr-2" />
                View All Achievements
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedDashboardWidgets;