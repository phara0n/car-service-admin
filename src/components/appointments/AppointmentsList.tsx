import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import apiClient from '../../api/config';

interface Service {
  id: number;
  name: string;
  price: number | string;
}

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
}

interface Appointment {
  id: number;
  date: string;
  status: string;
  customer: Customer;
  car: Car;
  services: Service[];
  total_price: number | string;
  notes?: string;
}

const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await apiClient.get('/appointments');
        setAppointments(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);
  
  const getStatusBadge = (status: string) => {
    let variant;
    switch (status.toLowerCase()) {
      case 'completed':
        variant = 'bg-green-500';
        break;
      case 'scheduled':
        variant = 'bg-blue-500';
        break;
      case 'canceled':
        variant = 'bg-red-500';
        break;
      case 'pending':
        variant = 'bg-yellow-500';
        break;
      default:
        variant = 'bg-gray-500';
    }
    return (
      <Badge className={`${variant} text-white`}>
        {status}
      </Badge>
    );
  };

  // Helper function to safely format prices
  const formatPrice = (price: number | string) => {
    // Ensure price is a number before using toFixed
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Link to="/appointments/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Services</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-muted-foreground">
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(appointment.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.car.make} {appointment.car.model} ({appointment.car.year})
                      <div className="text-xs text-muted-foreground">
                        {appointment.car.license_plate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {appointment.services.map((service) => (
                          <Badge key={service.id} variant="outline" className="text-xs">
                            {service.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      ${formatPrice(appointment.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Link to={`/appointments/${appointment.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/appointments/${appointment.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsList; 