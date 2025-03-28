import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCarsDueSoon } from '../store/slices/predictionSlice';
import { fetchCars } from '../store/slices/carSlice';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FaCarAlt, FaUsers, FaTools, FaFileAlt, FaPlus, FaArrowRight } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { carsDueSoon } = useAppSelector((state) => state.predictions);
  const { cars } = useAppSelector((state) => state.cars);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCarsDueSoon());
    dispatch(fetchCars());
  }, [dispatch]);

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-baseline mb-8">
          <h1 className="text-3xl font-bold text-indigo-300 mr-4">Dashboard</h1>
          {user && <span className="text-gray-400">Welcome back</span>}
        </div>
        
        {/* Quick Summary */}
        <Card className="mb-12 border-gray-800 bg-gray-900 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-white">Quick Summary</h2>
            <p className="text-gray-400">
              Manage your garage operations from this dashboard. Track vehicles, customers, and service records all in one place.
            </p>
          </CardContent>
        </Card>
        
        {/* Main Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Cars Section */}
          <Card className="border-gray-800 bg-gray-900 shadow-xl relative">
            <div className="absolute top-6 right-6 text-gray-500">
              <FaCarAlt size={24} />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Cars</h2>
              <p className="text-gray-400 mb-6">
                Track and manage your vehicle inventory with detailed records.
              </p>
              <ul className="space-y-2 mb-8 text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Vehicle registration details</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Maintenance history</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Owner information</span>
                </li>
              </ul>
              <Link to="/cars">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                  View Cars <span className="ml-2"><FaArrowRight size={14} /></span>
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Customers Section */}
          <Card className="border-gray-800 bg-gray-900 shadow-xl relative">
            <div className="absolute top-6 right-6 text-gray-500">
              <FaUsers size={24} />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Customers</h2>
              <p className="text-gray-400 mb-6">
                Keep track of all your customers and their contact information.
              </p>
              <ul className="space-y-2 mb-8 text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Customer profiles</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Contact details</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Service history</span>
                </li>
              </ul>
              <Link to="/customers">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                  View Customers <span className="ml-2"><FaArrowRight size={14} /></span>
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Services Section */}
          <Card className="border-gray-800 bg-gray-900 shadow-xl relative">
            <div className="absolute top-6 right-6 text-gray-500">
              <FaTools size={24} />
            </div>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">Services</h2>
              <p className="text-gray-400 mb-6">
                Log and track all service operations performed on vehicles.
              </p>
              <ul className="space-y-2 mb-8 text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Service records</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Scheduled maintenance</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Repair history</span>
                </li>
              </ul>
              <Link to="/services">
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                  View Services <span className="ml-2"><FaArrowRight size={14} /></span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors shadow-xl cursor-pointer">
              <Link to="/cars/add">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 text-gray-400">
                    <FaPlus size={24} />
                  </div>
                  <p className="text-gray-300 text-center">Add New Car</p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors shadow-xl cursor-pointer">
              <Link to="/customers/add">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 text-gray-400">
                    <FaPlus size={24} />
                  </div>
                  <p className="text-gray-300 text-center">Add New Customer</p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors shadow-xl cursor-pointer">
              <Link to="/services/schedule">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 text-gray-400">
                    <FaTools size={24} />
                  </div>
                  <p className="text-gray-300 text-center">Schedule Service</p>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border-gray-800 bg-gray-900 hover:bg-gray-800 transition-colors shadow-xl cursor-pointer">
              <Link to="/reports">
                <CardContent className="p-6 flex flex-col items-center justify-center">
                  <div className="mb-4 text-gray-400">
                    <FaFileAlt size={24} />
                  </div>
                  <p className="text-gray-300 text-center">Generate Report</p>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 