import React, { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCars, removeCar } from '../../store/slices/carSlice';
import { fetchCustomers, fetchCustomerById } from '../../store/slices/customerSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'react-toastify';
import { PlusCircle, Search, Trash2, Edit, User, Calendar } from 'lucide-react';
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

// CustomerName component as a memoized component to prevent unnecessary re-renders
const CustomerName = memo(({ customerId }: { customerId: number | null }) => {
  const [customerName, setCustomerName] = useState<string>(customerId ? 'Loading...' : 'No Customer');
  const customerList = useAppSelector(state => state.customers.customers);
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (!customerId) {
      setCustomerName('No Customer');
      return;
    }
    
    // Reset state when customerId changes
    setCustomerName('Loading...'); 
    
    // First try to find the customer in the Redux store
    // Normalize the customer ID to ensure consistent comparison
    const normalizedCustomerId = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
    
    // Find customer with normalized ID comparison
    const customer = customerList.find(c => {
      // Normalize customer ID from the list
      const normalizedCustomerListId = typeof c.id === 'string' ? parseInt(c.id, 10) : c.id;
      
      // Compare normalized IDs
      return normalizedCustomerListId === normalizedCustomerId;
    });
    
    if (customer) {
      setCustomerName(customer.name);
      return;
    }
    
    // If not found in store, fetch from API
    const fetchCustomer = async () => {
      try {
        // Ensure customerId is a number before API call
        const idForFetch = typeof customerId === 'string' ? parseInt(customerId, 10) : customerId;
        const result = await dispatch(fetchCustomerById(idForFetch)).unwrap();
        setCustomerName(result.name);
      } catch (error) {
        console.error(`Error fetching customer ${customerId}:`, error);
        setCustomerName('Unknown Customer');
      }
    };
    
    fetchCustomer();
  }, [customerId, customerList, dispatch]);
  
  return <span className="text-sm">{customerName}</span>;
});

const CarsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cars, loading, error } = useAppSelector(state => state.cars);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);
  
  // Load cars and customers data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCars()).unwrap(),
          dispatch(fetchCustomers()).unwrap()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const refreshInterval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [dispatch]);
  
  // Handle delete confirmation
  const handleDeleteClick = (carId: number) => {
    setCarToDelete(carId);
    setDeleteDialogOpen(true);
  };
  
  // Handle actual deletion
  const handleDeleteConfirm = async () => {
    if (carToDelete) {
      try {
        await dispatch(removeCar(carToDelete)).unwrap();
        toast.success('Car deleted successfully');
      } catch (error) {
        toast.error(`Failed to delete car: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    setDeleteDialogOpen(false);
    setCarToDelete(null);
  };
  
  // Filter cars based on search term
  const filteredCars = cars.filter(
    car => 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (car.year && car.year.toString().includes(searchTerm))
  );
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cars</h1>
        <Button 
          onClick={() => navigate('/cars/new')}
          variant="taxi"
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add Car
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
          placeholder="Search cars by make, model, or license plate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="border rounded-md shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Make & Model</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>Customer</TableHead>
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
            ) : filteredCars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {searchTerm ? 'No cars match your search' : 'No cars found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCars.map(car => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">
                    {car.make} {car.model}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-muted-foreground" />
                      {car.year}
                    </div>
                  </TableCell>
                  <TableCell>{car.license_plate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-muted-foreground" />
                      <CustomerName customerId={car.customer_id} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => navigate(`/cars/edit/${car.id}`)}
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        onClick={() => handleDeleteClick(car.id)}
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
              This action cannot be undone. This will permanently delete the car.
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
    </div>
  );
};

export default CarsList; 