import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCars } from '../store/slices/carSlice';
import { fetchCustomers } from '../store/slices/customerSlice';
import { FaCarAlt, FaUsers, FaTachometerAlt, FaWrench, FaExclamationTriangle } from 'react-icons/fa';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Car,
  Users,
  Calendar,
  Wrench,
  TrendingUp,
  AlertCircle,
  BarChart3,
  ClipboardCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const mileageData = [
  { name: 'Jan', average: 1200 },
  { name: 'Feb', average: 1400 },
  { name: 'Mar', average: 1300 },
  { name: 'Apr', average: 1500 },
  { name: 'May', average: 1700 },
  { name: 'Jun', average: 1600 },
  { name: 'Jul', average: 1800 },
];

const servicesByType = [
  { name: 'Oil Change', value: 35 },
  { name: 'Brakes', value: 20 },
  { name: 'Tire Rotation', value: 15 },
  { name: 'A/C Service', value: 10 },
  { name: 'Other', value: 20 },
];

const appointmentsByDay = [
  { name: 'Mon', value: 8 },
  { name: 'Tue', value: 12 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 10 },
  { name: 'Fri', value: 14 },
  { name: 'Sat', value: 6 },
  { name: 'Sun', value: 0 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cars, loading: carsLoading } = useAppSelector(state => state.cars);
  const { customers, loading: customersLoading } = useAppSelector(state => state.customers);
  
  useEffect(() => {
    dispatch(fetchCars());
    dispatch(fetchCustomers());
  }, [dispatch]);
  
  // Stats calculations
  const totalCars = cars.length;
  const totalCustomers = customers.length;
  
  // Cars with high daily mileage (> 100 miles/day)
  const highMileageCars = cars.filter(car => car.average_daily_mileage > 100);
  
  // Cars due for service soon (dummy calculation as we don't have the real prediction data here)
  const carsDueSoon = cars.slice(0, 3); // Just for demonstration
  
  // Recent customers (last 5)
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="dashboard-section-title text-2xl md:text-3xl">Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to your car service management dashboard</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cars</p>
              <h3 className="text-2xl font-bold mt-1">
                {carsLoading ? '...' : totalCars}
              </h3>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Customers</p>
              <h3 className="text-2xl font-bold mt-1">
                {customersLoading ? '...' : totalCustomers}
              </h3>
              <p className="text-xs text-green-500 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-dashboard-accent/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-dashboard-accent" />
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Appointments</p>
              <h3 className="text-2xl font-bold mt-1">24</h3>
              <p className="text-xs text-dashboard-warning flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                5 upcoming today
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-dashboard-warning/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-dashboard-warning" />
            </div>
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Services</p>
              <h3 className="text-2xl font-bold mt-1">356</h3>
              <p className="text-xs text-dashboard-success flex items-center mt-1">
                <ClipboardCheck className="h-3 w-3 mr-1" />
                42 completed this month
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-dashboard-success/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-dashboard-success" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Average Mileage Trends</h3>
              <p className="text-sm text-muted-foreground">Monthly average kilometers registered</p>
            </div>
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={mileageData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Area type="monotone" dataKey="average" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="dashboard-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Services by Type</h3>
                <p className="text-sm text-muted-foreground">Distribution of services performed</p>
              </div>
            </div>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={servicesByType}
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
                    {servicesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="dashboard-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Appointments by Day</h3>
                <p className="text-sm text-muted-foreground">Weekly appointment distribution</p>
              </div>
            </div>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={appointmentsByDay}
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
          </Card>
        </div>
      </div>
      
      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 border-b border-border/10 pb-3 last:border-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Car service completed</p>
                  <p className="text-xs text-muted-foreground">BMW X5 • Oil Change and Filter</p>
                  <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="dashboard-card">
          <h3 className="text-lg font-medium mb-4">Upcoming Appointments</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 border-b border-border/10 pb-3 last:border-0">
                <div className="h-8 w-8 rounded-full bg-dashboard-warning/10 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-dashboard-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium">Toyota Corolla • Tire Rotation</p>
                  <p className="text-xs text-muted-foreground">Customer: John Smith</p>
                  <p className="text-xs text-dashboard-warning mt-1">Tomorrow, 10:00 AM</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 