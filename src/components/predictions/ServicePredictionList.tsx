import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCarsDueSoon } from '../../store/slices/predictionSlice';

const ServicePredictionList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { carsDueSoon, loading, error } = useAppSelector(state => state.predictions);

  useEffect(() => {
    dispatch(fetchCarsDueSoon());
  }, [dispatch]);

  // Format date as "Month DD, YYYY"
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Calculate urgency class based on days/mileage to go
  const getUrgencyClass = (daysToGo: number, mileageToGo: number): string => {
    if (daysToGo < 0 || mileageToGo < 0) {
      return 'bg-red-100 text-red-800'; // Overdue
    } else if (daysToGo < 7 || mileageToGo < 300) {
      return 'bg-orange-100 text-orange-800'; // Due very soon
    } else if (daysToGo < 30 || mileageToGo < 1000) {
      return 'bg-yellow-100 text-yellow-800'; // Due soon
    } else {
      return 'bg-green-100 text-green-800'; // Not urgent
    }
  };

  // Get status text
  const getStatusText = (daysToGo: number, mileageToGo: number): string => {
    if (daysToGo < 0 || mileageToGo < 0) {
      return 'OVERDUE';
    } else if (daysToGo < 7 || mileageToGo < 300) {
      return 'URGENT';
    } else if (daysToGo < 30 || mileageToGo < 1000) {
      return 'DUE SOON';
    } else {
      return 'SCHEDULED';
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading service predictions...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading predictions: {error}</div>;
  }

  if (carsDueSoon.length === 0) {
    return (
      <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-green-800">All Cars Are Up to Date</h3>
        <p className="text-green-600 mt-2">There are no vehicles due for service at this time.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {carsDueSoon.flatMap(car => 
            car.services_due.map(service => (
              <tr key={`${car.car.id}-${service.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{car.car.year} {car.car.make} {car.car.model}</div>
                  <div className="text-sm text-gray-500">{car.car.license_plate}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>{car.customer.name}</div>
                  <div className="text-sm text-gray-500">
                    <a href={`tel:${car.customer.phone}`} className="hover:underline">{car.customer.phone}</a>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{service.service_type}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDate(service.next_service_date)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className={service.days_to_go < 0 ? 'text-red-600' : 'text-gray-600'}>
                    {service.days_to_go < 0 
                      ? `${Math.abs(service.days_to_go)} days overdue` 
                      : `${service.days_to_go} days remaining`}
                  </div>
                  <div className={service.mileage_to_go < 0 ? 'text-red-600 text-sm' : 'text-gray-500 text-sm'}>
                    {service.mileage_to_go < 0 
                      ? `${Math.abs(service.mileage_to_go).toLocaleString()} miles overdue` 
                      : `${service.mileage_to_go.toLocaleString()} miles remaining`}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyClass(service.days_to_go, service.mileage_to_go)}`}>
                    {getStatusText(service.days_to_go, service.mileage_to_go)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap space-x-2">
                  <Link to={`/car-predictions/${car.car.id}`} className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Details
                  </Link>
                  <Link to={`/appointments/new?carId=${car.car.id}&serviceId=${service.id}`} className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200">
                    Schedule
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServicePredictionList; 