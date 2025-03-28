import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCustomerById } from '../../store/slices/customerSlice';
import { fetchCarsByCustomerId } from '../../store/slices/carSlice';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Copy, 
  Car, 
  PlusCircle, 
  Eye, 
  Wrench,
  AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';

interface CustomerDetailsProps {
  customerId: number;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customerId }) => {
  const dispatch = useAppDispatch();
  const { selectedCustomer, loading, error } = useAppSelector(state => state.customers);
  const { cars } = useAppSelector(state => state.cars);
  
  useEffect(() => {
    dispatch(fetchCustomerById(customerId));
    dispatch(fetchCarsByCustomerId(customerId));
  }, [dispatch, customerId]);
  
  if (loading && !selectedCustomer) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-muted-foreground">Loading customer details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading customer: {error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!selectedCustomer) {
    return (
      <div className="flex justify-center p-6 text-muted-foreground">
        Customer not found
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="dashboard-card overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="dashboard-section-title flex items-center gap-2">
              <User size={24} className="text-primary" />
              {selectedCustomer.name}
            </h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <Link to={`/customers/${selectedCustomer.id}/edit`} className="flex items-center gap-1">
                  <Edit size={14} />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                asChild
              >
                <Link to={`/customers/add?clone=${selectedCustomer.id}`} className="flex items-center gap-1">
                  <Copy size={14} />
                  Clone
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                Contact Information
              </h2>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${selectedCustomer.email}`} className="text-primary hover:underline">
                    {selectedCustomer.email}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="font-medium">Phone:</span>{' '}
                  <a href={`tel:${selectedCustomer.phone}`} className="text-primary hover:underline">
                    {selectedCustomer.phone}
                  </a>
                </p>
                <p className="flex gap-2">
                  <MapPin size={16} className="text-muted-foreground mt-1" />
                  <div>
                    <span className="font-medium">Address:</span>{' '}
                    <span className="whitespace-pre-line">{selectedCustomer.address}</span>
                  </div>
                </p>
              </div>
            </div>
            
            {(selectedCustomer.national_id || selectedCustomer.region_code) && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  Tunisian Market Information
                </h2>
                <div className="space-y-3">
                  {selectedCustomer.national_id && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">National ID:</span>
                      <Badge variant="outline">{selectedCustomer.national_id}</Badge>
                    </p>
                  )}
                  {selectedCustomer.region_code && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Region Code:</span>
                      <Badge>{selectedCustomer.region_code}</Badge>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <Card className="dashboard-card overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Car size={20} className="text-primary" />
              Customer's Cars
            </h2>
            <Button variant="default" size="sm" asChild>
              <Link to={`/cars/add?customer=${customerId}`} className="flex items-center gap-1">
                <PlusCircle size={14} />
                Add Car
              </Link>
            </Button>
          </div>
          
          {cars.length === 0 ? (
            <div className="flex justify-center items-center p-6 text-muted-foreground">
              <Car size={18} className="mr-2 opacity-70" />
              No cars registered for this customer.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Car</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cars.map((car) => (
                    <TableRow key={car.id} className="hover:bg-accent/5">
                      <TableCell>
                        <div className="font-medium">
                          {car.year} {car.make} {car.model}
                        </div>
                        {car.vin && (
                          <div className="text-xs text-muted-foreground">
                            VIN: {car.vin}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{car.license_plate}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {car.current_mileage.toLocaleString()} miles
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {car.average_daily_mileage.toFixed(1)} miles/day
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/cars/${car.id}`} className="flex items-center gap-1">
                              <Eye size={14} />
                              View
                            </Link>
                          </Button>
                          <Button variant="secondary" size="sm" asChild>
                            <Link to={`/car-predictions/${car.id}`} className="flex items-center gap-1">
                              <Wrench size={14} />
                              Service
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CustomerDetails; 