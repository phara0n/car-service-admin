import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCarById } from '../store/slices/carSlice';
import { fetchCarPrediction, refreshCarPrediction } from '../store/slices/predictionSlice';

const CarPredictions: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedCar, loading: carLoading } = useAppSelector((state) => state.cars);
  const { selectedCarPrediction, loading: predictionLoading } = useAppSelector((state) => state.predictions);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (carId) {
      const id = parseInt(carId, 10);
      dispatch(fetchCarById(id));
      dispatch(fetchCarPrediction(id));
    }
  }, [dispatch, carId]);

  const handleRefreshPredictions = async () => {
    if (carId) {
      setRefreshing(true);
      await dispatch(refreshCarPrediction(parseInt(carId, 10)));
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getStatusColor = (daysToGo: number, mileageToGo: number): string => {
    if (daysToGo < 0 || mileageToGo < 0) {
      return 'text-red-600'; // Overdue
    } else if (daysToGo < 7 || mileageToGo < 300) {
      return 'text-orange-600'; // Due very soon
    } else if (daysToGo < 30 || mileageToGo < 1000) {
      return 'text-yellow-600'; // Due soon
    } else {
      return 'text-green-600'; // Not urgent
    }
  };

  const getDaysLabel = (days: number): string => {
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    }
    return `${days} days remaining`;
  };

  const getMileageLabel = (miles: number): string => {
    if (miles < 0) {
      return `${Math.abs(miles)} miles overdue`;
    }
    return `${miles} miles remaining`;
  };

  if (carLoading || predictionLoading) {
    return <div className="container mx-auto p-4">Loading car data...</div>;
  }

  if (!selectedCar || !selectedCarPrediction) {
    return <div className="container mx-auto p-4">Car not found.</div>;
  }

  const car = selectedCar;
  const prediction = selectedCarPrediction;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Predictions</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Car Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg font-medium">{car.year} {car.make} {car.model}</p>
            <p>License Plate: {car.license_plate}</p>
            <p>VIN: {car.vin}</p>
          </div>
          <div>
            <p>Initial Mileage: {car.initial_mileage.toLocaleString()} miles</p>
            <p>Current Mileage: {car.current_mileage.toLocaleString()} miles</p>
            <p>Average Daily Mileage: {car.average_daily_mileage.toFixed(1)} miles/day</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Upcoming Services</h2>
        <button 
          className="btn btn-primary"
          onClick={handleRefreshPredictions}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Predictions'}
        </button>
      </div>

      {prediction.services_due.length === 0 ? (
        <div className="card">
          <p>No upcoming services predicted for this vehicle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prediction.services_due.map((service) => (
            <div key={service.id} className="card border">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{service.service_type}</h3>
                <span className={`font-medium ${getStatusColor(service.days_to_go, service.mileage_to_go)}`}>
                  {service.days_to_go < 0 || service.mileage_to_go < 0 
                    ? 'OVERDUE' 
                    : service.days_to_go < 7 || service.mileage_to_go < 300
                      ? 'DUE SOON'
                      : 'UPCOMING'}
                </span>
              </div>
              
              <div className="mt-4">
                <p><strong>Due Date:</strong> {formatDate(service.next_service_date)}</p>
                <p><strong>Due at Mileage:</strong> {service.next_service_mileage.toLocaleString()} miles</p>
                
                <div className="mt-3 pt-3 border-t">
                  <p className={getStatusColor(service.days_to_go, service.mileage_to_go)}>
                    <strong>{getDaysLabel(service.days_to_go)}</strong>
                  </p>
                  <p className={getStatusColor(service.days_to_go, service.mileage_to_go)}>
                    <strong>{getMileageLabel(service.mileage_to_go)}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Prediction Details</h2>
        <div className="card">
          <p className="mb-2">
            <strong>Prediction Method:</strong> Based on historical mileage patterns and manufacturer recommendations
          </p>
          <p className="mb-2">
            <strong>Data Points:</strong> Current mileage, average daily usage, service intervals
          </p>
          <p>
            <strong>Note:</strong> Predictions become more accurate as more mileage data is collected. Regular mileage 
            updates improve accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarPredictions; 