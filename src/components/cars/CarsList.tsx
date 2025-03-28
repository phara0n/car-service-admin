import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCars } from '../../store/slices/carSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, Plus, Eye, Edit, Settings } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CarsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cars, loading, error } = useAppSelector(state => state.cars);
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'customer'>('all');
  const [customerId, setCustomerId] = useState('');
  
  useEffect(() => {
    dispatch(fetchCars());
    
    // Check for customer query parameter
    const customerParam = searchParams.get('customer');
    if (customerParam) {
      setFilterBy('customer');
      setCustomerId(customerParam);
    }
  }, [dispatch, searchParams]);
  
  // Filter and search cars
  const filteredCars = cars.filter(car => {
    const matchesSearch = 
      searchTerm === '' || 
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (car.vin && car.vin.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filterBy === 'all' || 
      (filterBy === 'customer' && customerId !== '' && car.customer_id === parseInt(customerId));
    
    return matchesSearch && matchesFilter;
  });
  
  // Sort cars: newest first based on created_at
  const sortedCars = [...filteredCars].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (value: string) => {
    setFilterBy(value as 'all' | 'customer');
    
    if (value !== 'customer') {
      setCustomerId('');
    }
  };
  
  const handleCustomerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(e.target.value);
  };
  
  // Main container that's always rendered regardless of state
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cars</h1>
          <Link to="/cars/add">
            <Button variant="taxi" className="flex items-center">
              <Plus size={16} className="mr-2" /> Add New Car
            </Button>
          </Link>
        </div>
        
        {loading && cars.length === 0 ? (
          <Card className="mb-6 border border-border shadow-md">
            <CardContent className="flex items-center justify-center py-16">
              <div className="animate-pulse text-taxi-dark font-medium">Loading cars...</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="mb-6 border border-border shadow-md">
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-destructive">Error loading cars: {error}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6 border border-border shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="search" className="block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        className="pl-8"
                        placeholder="Search by make, model, license plate or VIN"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="filter" className="block text-sm font-medium">
                      Filter By
                    </label>
                    <Select
                      value={filterBy}
                      onValueChange={handleFilterChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Cars</SelectItem>
                        <SelectItem value="customer">Customer ID</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {filterBy === 'customer' && (
                    <div className="space-y-2">
                      <label htmlFor="customerId" className="block text-sm font-medium">
                        Customer ID
                      </label>
                      <Input
                        type="number"
                        id="customerId"
                        placeholder="Enter customer ID"
                        value={customerId}
                        onChange={handleCustomerIdChange}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {sortedCars.length === 0 ? (
              <Card className="flex items-center justify-center h-48 rounded-lg border border-border shadow-md">
                <CardContent>
                  <p className="text-muted-foreground">No cars found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-lg border border-border overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Car</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">License Plate</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Mileage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Daily</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sortedCars.map((car) => (
                        <tr key={car.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {car.year} {car.make} {car.model}
                            </div>
                            {car.vin && (
                              <div className="text-xs text-muted-foreground">
                                VIN: {car.vin}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium">{car.license_plate}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {car.customer_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {car.current_mileage.toLocaleString()} miles
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {car.average_daily_mileage.toFixed(1)} miles/day
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <div className="flex justify-center space-x-2">
                              <Link to={`/cars/${car.id}`}>
                                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                                  <Eye size={14} className="mr-1" /> View
                                </Button>
                              </Link>
                              <Link to={`/cars/${car.id}/edit`}>
                                <Button variant="outline" size="sm" className="h-8 px-2 text-xs text-taxi-yellow border-taxi-yellow/30 hover:bg-taxi-yellow/10">
                                  <Edit size={14} className="mr-1" /> Edit
                                </Button>
                              </Link>
                              <Link to={`/car-predictions/${car.id}`}>
                                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                                  <Settings size={14} className="mr-1" /> Service
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-3 bg-muted/20 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Showing {sortedCars.length} of {cars.length} cars
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CarsList; 