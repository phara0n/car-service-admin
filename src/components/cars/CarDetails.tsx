import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCarById, fetchMileageRecords, updateCarMileage, removeCar } from '../../store/slices/carSlice';
import { MileageUpdate } from '../../api/cars';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Car, 
  Edit, 
  Settings, 
  Gauge, 
  Trash2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import DeleteConfirmation from '../ui/delete-confirmation';
import { toast } from 'react-toastify';

interface CarDetailsProps {
  carId: number;
}

const CarDetails: React.FC<CarDetailsProps> = ({ carId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedCar, mileageRecords, loading, error } = useAppSelector(state => state.cars);
  
  const [showMileageForm, setShowMileageForm] = useState(false);
  const [newMileage, setNewMileage] = useState('');
  const [mileageNote, setMileageNote] = useState('');
  const [mileageError, setMileageError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    dispatch(fetchCarById(carId));
    dispatch(fetchMileageRecords(carId));
  }, [dispatch, carId]);
  
  const handleUpdateMileage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMileageError('');
    
    const mileageValue = parseInt(newMileage);
    
    if (!mileageValue || isNaN(mileageValue)) {
      setMileageError('Please enter a valid mileage');
      return;
    }
    
    if (selectedCar && mileageValue <= selectedCar.current_mileage) {
      setMileageError('New mileage must be greater than current mileage');
      return;
    }
    
    const mileageData: MileageUpdate = {
      current_mileage: mileageValue,
      notes: mileageNote
    };
    
    try {
      await dispatch(updateCarMileage({ carId, mileageData }));
      setShowMileageForm(false);
      setNewMileage('');
      setMileageNote('');
    } catch (error) {
      console.error('Error updating mileage:', error);
    }
  };
  
  // Function to handle deletion
  const handleDeleteCar = () => {
    setDeleteConfirmOpen(true);
  };
  
  // Function to confirm deletion
  const confirmDeleteCar = async () => {
    if (!selectedCar) return;
    
    setIsDeleting(true);
    try {
      await dispatch(removeCar(selectedCar.id)).unwrap();
      toast.success(`Car has been deleted successfully.`);
      setDeleteConfirmOpen(false);
      navigate('/cars');
    } catch (error) {
      toast.error(`Failed to delete car: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (loading && !selectedCar) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-muted-foreground">Loading car details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading car: {error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!selectedCar) {
    return (
      <div className="flex justify-center p-6 text-muted-foreground">
        Car not found
      </div>
    );
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="dashboard-card">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="dashboard-section-title flex items-center gap-2">
              <Car size={24} className="text-primary" />
              {selectedCar.year} {selectedCar.make} {selectedCar.model}
            </h1>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <Link to={`/cars/${selectedCar.id}/edit`} className="flex items-center gap-1">
                  <Edit size={14} />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                asChild
              >
                <Link to={`/car-predictions/${selectedCar.id}`} className="flex items-center gap-1">
                  <Settings size={14} />
                  Service Predictions
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleDeleteCar}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <Car size={18} className="text-primary" />
                Vehicle Information
              </h2>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="font-medium">License Plate:</span> {selectedCar.license_plate}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">VIN:</span> {selectedCar.vin || 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Year:</span> {selectedCar.year}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Customer ID:</span> {selectedCar.customer_id}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <Gauge size={18} className="text-primary" />
                Mileage Information
              </h2>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="font-medium">Initial Mileage:</span> {selectedCar.initial_mileage.toLocaleString()} miles
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Current Mileage:</span> {selectedCar.current_mileage.toLocaleString()} miles
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium">Average Daily:</span> {selectedCar.average_daily_mileage.toFixed(1)} miles/day
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMileageForm(true)}
                  className="mt-2"
                >
                  Update Mileage
                </Button>
              </div>
            </div>
          </div>
        
          {selectedCar.customs_clearance_number || selectedCar.technical_visit_date || selectedCar.insurance_category ? (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                Tunisian Market Information
              </h2>
              <div className="space-y-3">
                {selectedCar.customs_clearance_number && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Customs Clearance Number:</span> {selectedCar.customs_clearance_number}
                  </p>
                )}
                {selectedCar.technical_visit_date && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Technical Visit Date:</span> {formatDate(selectedCar.technical_visit_date)}
                  </p>
                )}
                {selectedCar.insurance_category && (
                  <p className="flex items-center gap-2">
                    <span className="font-medium">Insurance Category:</span> {selectedCar.insurance_category}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      {selectedCar && (
        <DeleteConfirmation
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDeleteCar}
          title="Delete Car"
          description="Are you sure you want to delete this car? This action cannot be undone."
          isLoading={isDeleting}
          itemName={`${selectedCar.year} ${selectedCar.make} ${selectedCar.model}`}
        />
      )}
    </div>
  );
};

export default CarDetails; 