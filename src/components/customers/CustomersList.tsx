import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCustomers, removeCustomer } from '../../store/slices/customerSlice';
import { fetchCars } from '../../store/slices/carSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'react-toastify';
import { UserPlus, Search, Trash2, Edit, Car as CarIcon, PhoneCall } from 'lucide-react';
import CustomerCarsModal from './CustomerCarsModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const CustomersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customers, loading, error } = useAppSelector(state => state.customers);
  const { cars } = useAppSelector(state => state.cars);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [customerCarsModalOpen, setCustomerCarsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

  // Load customers and cars data
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchCars());
  }, [dispatch]);

  // Function to get number of cars for a customer
  const getCustomerCarCount = useCallback((customerId: number): number => {
    // Convert both IDs to the same type (number) before comparing
    return cars.filter(car => {
      // Normalize customer ID from car
      const carCustomerId = typeof car.customer_id === 'string' 
        ? parseInt(car.customer_id, 10) 
        : car.customer_id;
      
      // Compare with the customer ID
      return carCustomerId === customerId;
    }).length;
  }, [cars]);

  // Handle delete confirmation
  const handleDeleteClick = (customerId: number) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  // Handle actual deletion
  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await dispatch(removeCustomer(customerToDelete)).unwrap();
        toast.success('Customer deleted successfully');
        // Refresh cars data to update UI
        dispatch(fetchCars());
      } catch (error) {
        toast.error(`Failed to delete customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // Handle view cars click
  const handleViewCarsClick = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setCustomerCarsModalOpen(true);
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(
    customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button 
          onClick={() => navigate('/customers/new')}
          variant="taxi"
          className="flex items-center gap-2"
        >
          <UserPlus size={16} />
          Add Customer
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          className="pl-10"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Cars</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 'No customers match your search' : 'No customers found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map(customer => {
                const carCount = getCustomerCarCount(customer.id);
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <PhoneCall size={14} className="text-muted-foreground" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewCarsClick(customer.id)}
                        variant={carCount > 0 ? "default" : "outline"}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <CarIcon size={14} />
                        {carCount} {carCount === 1 ? 'Car' : 'Cars'}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => navigate(`/customers/edit/${customer.id}`)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDeleteClick(customer.id)}
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              and potentially affect associated cars.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Customer Cars Modal */}
      <CustomerCarsModal 
        open={customerCarsModalOpen} 
        onOpenChange={setCustomerCarsModalOpen} 
        customerId={selectedCustomerId} 
      />
    </div>
  );
};

export default CustomersList; 