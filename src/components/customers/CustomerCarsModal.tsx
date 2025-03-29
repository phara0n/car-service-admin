import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchCustomerById } from '../../store/slices/customerSlice';
import { fetchCars, removeCar } from '../../store/slices/carSlice';
import { Car } from '../../api/cars';
import { Button } from '../ui/button';
import { Trash2, Edit, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
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

interface CustomerCarsModalProps {
  customerId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerCarsModal: React.FC<CustomerCarsModalProps> = ({
  customerId,
  open,
  onOpenChange,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedCustomer, loading: customerLoading } = useAppSelector(state => state.customers);
  const { cars, loading: carsLoading } = useAppSelector(state => state.cars);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<number | null>(null);

  useEffect(() => {
    if (open && customerId) {
      // Load the customer details and all cars
      dispatch(fetchCustomerById(customerId));
      dispatch(fetchCars());
    }
  }, [dispatch, open, customerId]);

  // Filter cars for this specific customer
  const customerCars = cars.filter(car => {
    if (!customerId) return false;
    
    // Normalize customer_id to ensure consistent comparison
    const carCustomerId = typeof car.customer_id === 'string'
      ? parseInt(car.customer_id, 10)
      : car.customer_id;
    
    return carCustomerId === customerId;
  });

  const handleDeleteClick = (carId: number) => {
    setCarToDelete(carId);
    setDeleteDialogOpen(true);
  };

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

  const handleAddNewCar = () => {
    onOpenChange(false); // Close this modal
    navigate(`/cars/new?customer=${customerId}`); // Navigate to new car form with pre-selected customer
  };

  const handleEditCar = (carId: number) => {
    onOpenChange(false); // Close this modal
    navigate(`/cars/edit/${carId}`);
  };

  const loading = customerLoading || carsLoading;
  const customerName = selectedCustomer?.name || 'Customer';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{customerName}'s Cars</DialogTitle>
            <DialogDescription>
              {customerCars.length === 0
                ? `${customerName} doesn't have any cars yet.`
                : `${customerName} has ${customerCars.length} car${customerCars.length === 1 ? '' : 's'}.`}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : customerCars.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">No cars found</p>
                <p className="text-muted-foreground">This customer doesn't have any cars yet.</p>
              </div>
              <Button variant="default" onClick={handleAddNewCar} className="mt-2">
                Add a Car
              </Button>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerCars.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell className="font-medium">
                        {car.make} {car.model}
                      </TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.license_plate}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEditCar(car.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="default" onClick={handleAddNewCar} className="flex items-center gap-2">
              <Plus size={16} />
              Add New Car
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default CustomerCarsModal; 