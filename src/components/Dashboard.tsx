import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Calendar, Wrench, TrendingUp, AlertCircle, BarChart3, ClipboardCheck, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import apiClient from '../api/config';
import { toast } from 'react-toastify';
import { Button } from './ui/button';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Default placeholder data
const defaultMileageTrends = [
  { name: 'Jan', average: 0 },
  { name: 'Feb', average: 0 },
  { name: 'Mar', average: 0 },
  { name: 'Apr', average: 0 },
  { name: 'May', average: 0 },
  { name: 'Jun', average: 0 },
];

const defaultServiceDistribution = [
  { name: 'No Data', value: 1 },
];

const defaultAppointmentDistribution = [
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 0 },
];

interface DashboardStats {
  totalCars: number;
  totalCustomers: number;
  totalAppointments: number;
  totalServices: number;
  carsDueForService: number;
  upcomingAppointments: number;
  monthlyGrowth: {
    cars: number;
    customers: number;
  };
}

interface ActivityItem {
  id: number | string;
  type: string;
  description: string;
  timestamp: string;
}

interface Appointment {
  id: number;
  date: string;
  customer: {
    name: string;
  };
  car: {
    make: string;
    model: string;
  };
  services: Array<{
    name: string;
  }>;
  status: string;
}

const Dashboard: React.FC = () => {
  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [mileageTrends, setMileageTrends] = useState(defaultMileageTrends);
  const [serviceDistribution, setServiceDistribution] = useState(defaultServiceDistribution);
  const [appointmentDistribution, setAppointmentDistribution] = useState(defaultAppointmentDistribution);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Function to safely fetch data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch Dashboard Stats
      const statsResponse = await apiClient.get('/dashboard/stats');
      setStats(statsResponse.data);

      // Fetch Service Distribution
      try {
        const serviceResponse = await apiClient.get('/dashboard/service_distribution');
        if (serviceResponse.data && serviceResponse.data.length > 0) {
          setServiceDistribution(serviceResponse.data);
        }
      } catch (error) {
        console.error('Error fetching service distribution:', error);
        // Keep using default data
      }

      // Fetch Appointment Distribution
      try {
        const appointmentResponse = await apiClient.get('/dashboard/appointment_distribution');
        if (appointmentResponse.data && appointmentResponse.data.length > 0) {
          setAppointmentDistribution(appointmentResponse.data);
        }
      } catch (error) {
        console.error('Error fetching appointment distribution:', error);
        // Keep using default data
      }

      // Fetch Recent Activity
      try {
        const activityResponse = await apiClient.get('/dashboard/recent_activity');
        if (activityResponse.data) {
          setRecentActivity(activityResponse.data);
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setRecentActivity([]);
      }

      // Fetch Upcoming Appointments
      try {
        const upcomingResponse = await apiClient.get('/dashboard/upcoming_appointments');
        if (upcomingResponse.data) {
          setUpcomingAppointments(upcomingResponse.data);
        }
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        setUpcomingAppointments([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [retryCount]);

  // Retry handler
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-muted-foreground mb-4">No dashboard data available</div>
        <Button onClick={handleRetry}>Retry</Button>
      </div>
    );
  }
  
  // Safe accessor function for growth data
  const getGrowthPercentage = (value: any) => {
    if (typeof value === 'number') {
      return value;
    }
    return 0;
  };
  
  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Format timestamp safely
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid timestamp';
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your car service management dashboard</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cars</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalCars || 0}</h3>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {getGrowthPercentage(stats.monthlyGrowth?.cars)}% from last month
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Car className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalCustomers || 0}</h3>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {getGrowthPercentage(stats.monthlyGrowth?.customers)}% from last month
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Appointments</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalAppointments || 0}</h3>
                <p className="text-xs text-amber-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {stats.upcomingAppointments || 0} upcoming today
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Services</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalServices || 0}</h3>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <ClipboardCheck className="h-3 w-3 mr-1" />
                  {stats.carsDueForService || 0} due for service
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-600/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Services by Type</h3>
                <p className="text-sm text-muted-foreground">Distribution of services performed</p>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {serviceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Appointments by Day</h3>
                <p className="text-sm text-muted-foreground">Weekly appointment distribution</p>
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={appointmentDistribution}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <Link to="/activity" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="mt-1">
                      {activity.type === 'appointment' && <Calendar className="h-4 w-4 text-amber-500" />}
                      {activity.type === 'service' && <Wrench className="h-4 w-4 text-green-600" />}
                      {activity.type === 'mileage' && <Car className="h-4 w-4 text-primary" />}
                      {activity.type === 'customer' && <Users className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Upcoming Appointments</h3>
              <Link to="/appointments" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appointment.customer?.name || 'Unknown customer'}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.car?.make || 'Unknown'} {appointment.car?.model || 'car'} - {formatDate(appointment.date)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Link to={`/appointments/${appointment.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">No upcoming appointments</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 