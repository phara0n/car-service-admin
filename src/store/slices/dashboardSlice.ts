import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi } from '../../api/dashboard';
import type { DashboardStats, MileageTrend, ServiceDistribution, AppointmentDistribution, RecentActivity, UpcomingAppointment } from '../../api/dashboard';

interface DashboardState {
  stats: DashboardStats | null;
  mileageTrends: MileageTrend[];
  serviceDistribution: ServiceDistribution[];
  appointmentDistribution: AppointmentDistribution[];
  recentActivity: RecentActivity[];
  upcomingAppointments: UpcomingAppointment[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  mileageTrends: [],
  serviceDistribution: [],
  appointmentDistribution: [],
  recentActivity: [],
  upcomingAppointments: [],
  loading: false,
  error: null,
};

export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchData',
  async () => {
    const [
      statsResponse,
      mileageTrendsResponse,
      serviceDistributionResponse,
      appointmentDistributionResponse,
      recentActivityResponse,
      upcomingAppointmentsResponse,
    ] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getMileageTrends(),
      dashboardApi.getServiceDistribution(),
      dashboardApi.getAppointmentDistribution(),
      dashboardApi.getRecentActivity(),
      dashboardApi.getUpcomingAppointments(),
    ]);

    return {
      stats: statsResponse.data,
      mileageTrends: mileageTrendsResponse.data,
      serviceDistribution: serviceDistributionResponse.data,
      appointmentDistribution: appointmentDistributionResponse.data,
      recentActivity: recentActivityResponse.data,
      upcomingAppointments: upcomingAppointmentsResponse.data,
    };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.mileageTrends = action.payload.mileageTrends;
        state.serviceDistribution = action.payload.serviceDistribution;
        state.appointmentDistribution = action.payload.appointmentDistribution;
        state.recentActivity = action.payload.recentActivity;
        state.upcomingAppointments = action.payload.upcomingAppointments;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard data';
      });
  },
});

export default dashboardSlice.reducer; 