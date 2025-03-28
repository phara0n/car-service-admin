import React from 'react';
import ServicePredictionList from '../components/predictions/ServicePredictionList';
import PredictionSummary from '../components/predictions/PredictionSummary';

const Predictions: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Service Predictions</h1>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600">
          View all cars due for service, sorted by urgency. Use this page to schedule maintenance 
          appointments for customers based on their predicted service needs.
        </p>
      </div>
      
      <div className="mb-6">
        <PredictionSummary />
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Cars Due for Service</h2>
        <ServicePredictionList />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800 mt-6">
        <h3 className="font-semibold mb-2">About Service Predictions</h3>
        <p>
          Service predictions are calculated based on manufacturer-recommended service intervals, 
          the car's historical mileage patterns, and average daily usage. More accurate mileage 
          data leads to better predictions.
        </p>
        <p className="mt-2">
          <strong>Note:</strong> Predictions become more accurate over time as more mileage 
          data is collected. Regular mileage updates help improve prediction accuracy.
        </p>
      </div>
    </div>
  );
};

export default Predictions; 