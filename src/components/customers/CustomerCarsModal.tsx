import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCarsByCustomerId, removeCar } from '../../store/slices/carSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Car,
  Eye,
  Wrench,
  Edit,
  Plus,
  AlertCircle,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import DeleteConfirmation from '../ui/delete-confirmation';
import { toast } from 'react-toastify';

interface CustomerCarsModalProps {
  customerId: number;
  customerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerCarsModal: React.FC<CustomerCarsModalProps> = ({
  customerId,
  customerName,
  open,
  onOpenChange
}) => {
  const dispatch = useAppDispatch();
  const { cars, loading, error } = useAppSelector(state => state.cars);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      dispatch(fetchCarsByCustomerId(customerId));
    }
  }, [dispatch, customerId, open]);
  
  // Function to handle deleting a car
  const handleDeleteCar = (carId: number, carName: string) => {
    setCarToDelete({ id: carId, name: carName });
    setDeleteConfirmOpen(true);
  };
  
  // Function to confirm deletion
  const confirmDeleteCar = async () => {
    if (!carToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(removeCar(carToDelete.id)).unwrap();
      toast.success(`Car has been deleted successfully.`);
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error(`Failed to delete car: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car size={20} className="text-primary" />
            {customerName}'s Cars
          </DialogTitle>
          <DialogDescription>
            Manage cars for this customer
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading cars...</span>
          </div>
        ) : error ? (
          <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-lg flex items-center gap-2 text-destructive">
            <AlertCircle size={16} />
            <span>Error loading cars: {error}</span>
          </div>
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Car size={40} className="text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground mb-4">No cars registered for this customer.</p>
            <Button asChild>
              <Link to={`/cars/add?customer=${customerId}`} className="flex items-center gap-2">
                <Plus size={16} />
                Add Car for {customerName}
              </Link>
            </Button>
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
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/cars/${car.id}/edit`} className="flex items-center gap-1">
                            <Edit size={14} />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                          <Link to={`/car-predictions/${car.id}`} className="flex items-center gap-1">
                            <Wrench size={14} />
                            Service
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleDeleteCar(car.id, `${car.year} ${car.make} ${car.model}`)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button asChild variant="default">
            <Link to={`/cars/add?customer=${customerId}`} className="flex items-center gap-2">
              <Plus size={16} />
              Add New Car
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Delete Confirmation Dialog */}
      {carToDelete && (
        <DeleteConfirmation
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDeleteCar}
          title="Delete Car"
          description="Are you sure you want to delete this car? This action cannot be undone."
          isLoading={isDeleting}
          itemName={carToDelete.name}
        />
      )}
    </Dialog>
  );
};

export default CustomerCarsModal; 