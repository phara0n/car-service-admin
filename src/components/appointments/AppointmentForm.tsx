import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import apiClient from '../../api/config';

interface AppointmentFormProps {
  appointmentId?: number;
}

interface Customer {
  id: number;
  name: string;
}

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  customer_id: number;
}

interface Service {
  id: number;
  name: string;
  price: number | string;
  duration: number;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ appointmentId }) => {
  const navigate = useNavigate();
  const isEditMode = !!appointmentId;
  
  const [formData, setFormData] = useState({
    customer_id: '',
    car_id: '',
    date: '',
    time: '',
    status: 'scheduled',
    notes: '',
    service_ids: [] as number[]
  });
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch customers, cars, and services on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        };
        
        // Fetch customers
        const customersResponse = await apiClient.get('/customers');
        setCustomers(customersResponse.data);
        
        // Fetch all cars
        const carsResponse = await apiClient.get('/cars');
        setCars(carsResponse.data);
        
        // Fetch services
        const servicesResponse = await apiClient.get('/services');
        setServices(servicesResponse.data);
        
        // If editing, fetch appointment data
        if (isEditMode && appointmentId) {
          const appointmentResponse = await apiClient.get(`/appointments/${appointmentId}`);
          const appointment = appointmentResponse.data;
          
          // Format date and time from appointment
          const dateObj = new Date(appointment.date);
          const formattedDate = dateObj.toISOString().split('T')[0];
          const formattedTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);
          
          setFormData({
            customer_id: appointment.customer.id.toString(),
            car_id: appointment.car.id.toString(),
            date: formattedDate,
            time: formattedTime,
            status: appointment.status,
            notes: appointment.notes || '',
            service_ids: appointment.services.map((s: any) => s.id)
          });
          
          // Set available cars for this customer
          setAvailableCars(cars.filter(car => car.customer_id === appointment.customer.id));
        }
        
        setFetchLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
        setFetchLoading(false);
      }
    };
    
    fetchData();
  }, [appointmentId, isEditMode]);

  // Update available cars when customer changes
  useEffect(() => {
    if (formData.customer_id) {
      const customerCars = cars.filter(car => car.customer_id === parseInt(formData.customer_id));
      setAvailableCars(customerCars);
      
      // Reset car selection if the selected car doesn't belong to this customer
      if (formData.car_id && !customerCars.some(car => car.id === parseInt(formData.car_id))) {
        setFormData(prev => ({ ...prev, car_id: '' }));
      }
    } else {
      setAvailableCars([]);
      setFormData(prev => ({ ...prev, car_id: '' }));
    }
  }, [formData.customer_id, cars]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServiceToggle = (serviceId: number) => {
    setFormData(prev => {
      const currentServices = [...prev.service_ids];
      if (currentServices.includes(serviceId)) {
        return { ...prev, service_ids: currentServices.filter(id => id !== serviceId) };
      } else {
        return { ...prev, service_ids: [...currentServices, serviceId] };
      }
    });
  };

  const formatPrice = (price: number | string) => {
    // Ensure price is a number before using toFixed
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const dateTime = `${formData.date}T${formData.time}:00`;
      
      const payload = {
        customer_id: parseInt(formData.customer_id),
        car_id: parseInt(formData.car_id),
        date: dateTime,
        status: formData.status,
        notes: formData.notes,
        service_ids: formData.service_ids
      };

      if (isEditMode) {
        await apiClient.put(`/appointments/${appointmentId}`, payload);
        toast.success('Appointment updated successfully');
      } else {
        await apiClient.post('/appointments', payload);
        toast.success('Appointment created successfully');
      }
      
      navigate('/appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(isEditMode ? 'Failed to update appointment' : 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Appointment' : 'Schedule New Appointment'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Selection */}
              <div className="space-y-2">
                <Label htmlFor="customer_id">Customer</Label>
                <select
                  id="customer_id"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Car Selection */}
              <div className="space-y-2">
                <Label htmlFor="car_id">Vehicle</Label>
                <select
                  id="car_id"
                  name="car_id"
                  value={formData.car_id}
                  onChange={handleChange}
                  disabled={!formData.customer_id}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Vehicle</option>
                  {availableCars.map(car => (
                    <option key={car.id} value={car.id}>
                      {car.make} {car.model} ({car.year}) - {car.license_plate}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            {/* Status Selection (only for edit mode) */}
            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            )}
            
            {/* Services Selection */}
            <div className="space-y-2">
              <Label>Services</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {services.map(service => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`service-${service.id}`}
                      checked={formData.service_ids.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-4 h-4"
                    />
                    <label htmlFor={`service-${service.id}`} className="text-sm">
                      {service.name} (${formatPrice(service.price)})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/appointments')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    {isEditMode ? 'Updating...' : 'Scheduling...'}
                  </>
                ) : (
                  isEditMode ? 'Update Appointment' : 'Schedule Appointment'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentForm; 