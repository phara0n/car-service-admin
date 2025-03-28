import React from 'react';
import CarList from '../components/cars/CarList';

const Cars: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Car Management</h1>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">
          Manage all vehicles in the system. View details, update mileage, and check service predictions.
        </p>
      </div>
      
      <div className="mb-6">
        <CarList />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
        <h3 className="font-semibold mb-2">About Car Management</h3>
        <p>
          The car management system allows you to track all registered vehicles, manage their details, 
          and monitor their service schedules. Each car's service prediction is calculated based on 
          its mileage history and recommended service intervals.
        </p>
        <p className="mt-2">
          Regular mileage updates help improve prediction accuracy. You can update a car's 
          mileage from its details page.
        </p>
      </div>
    </div>
  );
};

export default Cars; 