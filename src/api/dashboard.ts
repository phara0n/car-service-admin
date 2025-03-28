import apiClient from './config';

export interface DashboardStats {
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

export interface MileageTrend {
  name: string;
  average: number;
}

export interface ServiceDistribution {
  name: string;
  value: number;
}

export interface AppointmentDistribution {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: number;
  type: 'appointment' | 'service' | 'mileage' | 'customer';
  description: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface UpcomingAppointment {
  id: number;
  customerName: string;
  carDetails: string;
  date: string;
  time: string;
  services: string[];
  status: string;
}

export const dashboardApi = {
  getStats: () => apiClient.get<DashboardStats>('/dashboard/stats'),
  
  getMileageTrends: () => apiClient.get<MileageTrend[]>('/dashboard/mileage_trends'),
  
  getServiceDistribution: () => apiClient.get<ServiceDistribution[]>('/dashboard/service_distribution'),
  
  getAppointmentDistribution: () => apiClient.get<AppointmentDistribution[]>('/dashboard/appointment_distribution'),
  
  getRecentActivity: () => apiClient.get<RecentActivity[]>('/dashboard/recent_activity'),
  
  getUpcomingAppointments: () => apiClient.get<UpcomingAppointment[]>('/dashboard/upcoming_appointments'),
}; 