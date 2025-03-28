import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCars } from '../../store/slices/carSlice';
import { Car } from '../../api/cars';

const CarList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cars, loading, error } = useAppSelector((state) => state.cars);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('');

  useEffect(() => {
    dispatch(fetchCars());
  }, [dispatch]);

  // Get unique makes for filtering
  const carMakes = Array.from(new Set(cars.map(car => car.make))).sort();

  // Filter cars based on search term and selected make
  const filteredCars = cars.filter(car => {
    const matchesSearch = searchTerm === '' || 
      car.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.year.toString().includes(searchTerm);
    
    const matchesMake = selectedMake === '' || car.make === selectedMake;
    
    return matchesSearch && matchesMake;
  });

  if (loading) {
    return <div className="text-center py-4">Loading cars...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading cars: {error}</div>;
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
        <div className="flex gap-2 flex-col md:flex-row">
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search cars..."
              className="px-3 py-2 border border-gray-300 rounded w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-48">
            <select
              className="px-3 py-2 border border-gray-300 rounded w-full"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
            >
              <option value="">All Makes</option>
              {carMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <Link to="/cars/new" className="btn btn-primary">
            Add New Car
          </Link>
        </div>
      </div>

      {filteredCars.length === 0 ? (
        <div className="text-center py-4">
          {cars.length === 0 ? 'No cars found.' : 'No cars match your filters.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Make/Model</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License Plate</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Mileage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{car.make} {car.model}</div>
                    <div className="text-sm text-gray-500">ID: {car.id}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{car.year}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{car.license_plate}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{car.vin}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {car.current_mileage.toLocaleString()} miles
                    <div className="text-xs text-gray-500">
                      {car.average_daily_mileage > 0 
                        ? `~${car.average_daily_mileage.toFixed(1)} miles/day` 
                        : 'No daily average'}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-2">
                    <Link to={`/car-predictions/${car.id}`} className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                      Predictions
                    </Link>
                    <Link to={`/cars/${car.id}`} className="text-sm px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                      Details
                    </Link>
                    <Link to={`/cars/${car.id}/edit`} className="text-sm px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-center text-gray-500 text-sm">
        Showing {filteredCars.length} of {cars.length} cars
      </div>
    </div>
  );
};

export default CarList; 