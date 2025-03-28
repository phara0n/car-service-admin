import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCarById } from '../../store/slices/carSlice';

interface CarPredictionPageProps {
  carId: number;
}

const CarPredictionPage: React.FC<CarPredictionPageProps> = ({ carId }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedCar, loading, error } = useAppSelector(state => state.cars);
  
  // This is a temporary implementation of the prediction page
  // In a real implementation, we would fetch predictions from the server
  
  useEffect(() => {
    dispatch(fetchCarById(carId));
  }, [dispatch, carId]);
  
  if (loading && !selectedCar) {
    return <div className="text-center py-4">Loading car data...</div>;
  }
  
  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading car: {error}</div>;
  }
  
  if (!selectedCar) {
    return <div className="text-center py-4">Car not found</div>;
  }
  
  // Calculate some mock service predictions based on mileage
  const currentMileage = selectedCar.current_mileage;
  const dailyMileage = selectedCar.average_daily_mileage;
  
  const mockPredictions = [
    {
      id: 1,
      service: 'Oil Change',
      due_mileage: currentMileage + 5000 - (currentMileage % 5000),
      days_until_due: Math.floor((5000 - (currentMileage % 5000)) / dailyMileage),
      status: 'upcoming'
    },
    {
      id: 2,
      service: 'Tire Rotation',
      due_mileage: currentMileage + 7500 - (currentMileage % 7500),
      days_until_due: Math.floor((7500 - (currentMileage % 7500)) / dailyMileage),
      status: currentMileage % 7500 < 500 ? 'urgent' : 'upcoming'
    },
    {
      id: 3,
      service: 'Brake Inspection',
      due_mileage: currentMileage + 10000 - (currentMileage % 10000),
      days_until_due: Math.floor((10000 - (currentMileage % 10000)) / dailyMileage),
      status: 'upcoming'
    },
    {
      id: 4,
      service: 'Air Filter Replacement',
      due_mileage: currentMileage + 15000 - (currentMileage % 15000),
      days_until_due: Math.floor((15000 - (currentMileage % 15000)) / dailyMileage),
      status: 'upcoming'
    },
    {
      id: 5,
      service: 'Major Service',
      due_mileage: currentMileage + 30000 - (currentMileage % 30000),
      days_until_due: Math.floor((30000 - (currentMileage % 30000)) / dailyMileage),
      status: 'upcoming'
    }
  ];
  
  // Sort by urgency (days until due)
  const sortedPredictions = [...mockPredictions].sort((a, b) => a.days_until_due - b.days_until_due);
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Service Predictions for {selectedCar.year} {selectedCar.make} {selectedCar.model}
        </h1>
        <button
          onClick={() => navigate(`/cars/${carId}`)}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Back to Car Details
        </button>
      </div>
      
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-medium">Car Info</h2>
            <div className="mt-2">
              <p><span className="font-medium">License Plate:</span> {selectedCar.license_plate}</p>
              <p><span className="font-medium">Current Mileage:</span> {selectedCar.current_mileage.toLocaleString()} miles</p>
              <p><span className="font-medium">Average Daily Mileage:</span> {selectedCar.average_daily_mileage.toFixed(1)} miles/day</p>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-700 font-medium">Note: Service predictions are calculated based on average daily mileage and standard service intervals. Actual service needs may vary based on driving conditions and manufacturer recommendations.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-lg font-medium mb-4">Upcoming Service Predictions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due at Mileage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until Due</th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPredictions.map((prediction) => (
                <tr key={prediction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium">{prediction.service}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {prediction.due_mileage.toLocaleString()} miles
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {prediction.days_until_due} days
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span 
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        prediction.status === 'urgent' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {prediction.status === 'urgent' ? 'Due Soon' : 'Upcoming'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6">
          <h3 className="text-md font-medium mb-2">Schedule Service</h3>
          <p className="text-gray-600 mb-4">
            Based on our predictions, we recommend scheduling a service appointment for your vehicle. 
            You can contact our service department to schedule.
          </p>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => alert('This feature would connect to a service scheduling system in a real implementation.')}
          >
            Schedule Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarPredictionPage; 