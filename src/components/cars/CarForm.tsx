import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCustomers, addCustomer } from '../../store/slices/customerSlice';
import { fetchCarById, addCar, editCar, fetchCars, clearSelectedCar } from '../../store/slices/carSlice';
import { Customer } from '../../api/customers';
import { Car } from '../../api/cars';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { PlusCircle, X, Check, Car as CarIcon, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const CarForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const carId = id ? parseInt(id, 10) : undefined;
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { customers } = useAppSelector(state => state.customers);
  const { selectedCar, loading, error } = useAppSelector(state => state.cars);
  
  // Add separate error state for the component
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Partial<Car>>({
    customer_id: null,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    initial_mileage: 0,
    current_mileage: 0,
    customs_clearance_number: '',
    technical_visit_date: '',
    insurance_category: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  
  // Customer form states
  const [customerFormData, setCustomerFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    national_id: '',
    region_code: ''
  });
  
  const [customerFormErrors, setCustomerFormErrors] = useState<Record<string, string>>({});
  
  // Load data
  useEffect(() => {
    // Load customers list for dropdown
    dispatch(fetchCustomers());
    
    // Create a function to load data asynchronously
    const loadData = async () => {
      // If editing, fetch the car details
      if (isEdit && carId) {
        try {
          await dispatch(fetchCarById(carId)).unwrap();
          setApiError(null);
        } catch (error) {
          console.error('Error fetching car:', error);
          setApiError('Error loading car data. Please try again.');
        }
      }
      
      // Check for customer query parameter (when adding a car from customer view)
      const customerIdParam = searchParams.get('customer');
      if (customerIdParam && !isEdit) {
        const customerId = parseInt(customerIdParam, 10);
        setFormData(prev => ({
          ...prev,
          customer_id: customerId
        }));
      }
    };
    
    loadData();
    
    // Cleanup
    return () => {
      dispatch(clearSelectedCar());
    };
  }, [dispatch, isEdit, carId, searchParams]);
  
  // Populate form with car data when selectedCar changes
  useEffect(() => {
    if (isEdit && selectedCar) {
      setFormData({
        customer_id: selectedCar.customer_id,
        make: selectedCar.make,
        model: selectedCar.model,
        year: selectedCar.year,
        vin: selectedCar.vin || '',
        license_plate: selectedCar.license_plate,
        initial_mileage: selectedCar.initial_mileage,
        current_mileage: selectedCar.current_mileage,
        customs_clearance_number: selectedCar.customs_clearance_number || '',
        technical_visit_date: selectedCar.technical_visit_date 
          ? new Date(selectedCar.technical_visit_date).toISOString().split('T')[0]
          : '',
        insurance_category: selectedCar.insurance_category || ''
      });
    }
  }, [selectedCar, isEdit]);
  
  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.make?.trim()) {
      errors.make = 'Make is required';
    }
    
    if (!formData.model?.trim()) {
      errors.model = 'Model is required';
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      errors.year = 'Please enter a valid year';
    }
    
    if (!formData.license_plate?.trim()) {
      errors.license_plate = 'License plate is required';
    }
    
    if (formData.initial_mileage === undefined || formData.initial_mileage < 0) {
      errors.initial_mileage = 'Initial mileage is required and must be positive';
    }
    
    if (formData.current_mileage === undefined || formData.current_mileage < 0) {
      errors.current_mileage = 'Current mileage is required and must be positive';
    }
    
    if (formData.current_mileage !== undefined && 
        formData.initial_mileage !== undefined && 
        formData.current_mileage < formData.initial_mileage) {
      errors.current_mileage = 'Current mileage cannot be less than initial mileage';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Customer form validation
  const validateCustomerForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!customerFormData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!customerFormData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!customerFormData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!customerFormData.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    setCustomerFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Input change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert numeric fields to numbers
    if (['year', 'initial_mileage', 'current_mileage'].includes(name) && type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseInt(value, 10)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Customer select handler - convert to number or null
  const handleCustomerSelectChange = (value: string) => {
    // Convert the select value to a proper customer_id (null or number)
    const customerId = value === 'no-customer' ? null : parseInt(value, 10);
    
    setFormData({
      ...formData,
      customer_id: customerId
    });
    
    // Clear any errors for this field
    if (formErrors.customer_id) {
      setFormErrors({
        ...formErrors,
        customer_id: ''
      });
    }
  };
  
  // Customer form change handler
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setCustomerFormData({
      ...customerFormData,
      [name]: value
    });
    
    // Clear error for this field
    if (customerFormErrors[name]) {
      setCustomerFormErrors({
        ...customerFormErrors,
        [name]: ''
      });
    }
  };
  
  // Create customer handler
  const handleCreateCustomer = async () => {
    if (!validateCustomerForm()) {
      return;
    }
    
    try {
      const newCustomer = await dispatch(addCustomer(customerFormData)).unwrap();
      
      // Update form data with the new customer
      setFormData({
        ...formData,
        customer_id: newCustomer.id
      });
      
      // Reset customer form and hide it
      setCustomerFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        national_id: '',
        region_code: ''
      });
      setShowCustomerForm(false);
      
      toast.success(`Customer ${newCustomer.name} created successfully`);
    } catch (error) {
      toast.error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a car object with the form data
      const carData: Omit<Car, 'id' | 'created_at' | 'updated_at' | 'average_daily_mileage'> = {
        // Ensure customer_id is the right type (null or number)
        customer_id: formData.customer_id === undefined ? null : formData.customer_id,
        make: formData.make || '',
        model: formData.model || '',
        year: formData.year || new Date().getFullYear(),
        vin: formData.vin || '',
        license_plate: formData.license_plate || '',
        initial_mileage: formData.initial_mileage || 0,
        current_mileage: formData.current_mileage || 0,
        customs_clearance_number: formData.customs_clearance_number,
        technical_visit_date: formData.technical_visit_date,
        insurance_category: formData.insurance_category
      };
      
      // Log the data being submitted
      console.log(`Submitting car data:`, carData);
      console.log(`customer_id type: ${typeof carData.customer_id}, value: ${carData.customer_id}`);
      
      if (isEdit && carId) {
        // Edit existing car
        await dispatch(editCar({ carId, carData })).unwrap();
        toast.success('Car updated successfully');
      } else {
        // Create new car
        await dispatch(addCar(carData)).unwrap();
        toast.success('Car added successfully');
      }
      
      // Refresh car data
      dispatch(fetchCars());
      
      // Navigate back to cars list
      navigate('/cars');
    } catch (error) {
      toast.error(`Failed to save car: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Error saving car:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Loading state
  if (isEdit && loading && !selectedCar) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center mb-6">
        <CarIcon className="mr-2 h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">{isEdit ? 'Edit Car' : 'Add New Car'}</h1>
      </div>
      
      {/* Show API errors */}
      {(apiError || error) && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
          {apiError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-card border rounded-lg shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer selection */}
            <div className="space-y-2">
              <label htmlFor="customer" className="block text-sm font-medium">
                Customer
              </label>
              <div className="flex gap-2">
                <Select
                  value={formData.customer_id === null ? 'no-customer' : formData.customer_id?.toString()}
                  onValueChange={handleCustomerSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-customer">No Customer</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  onClick={() => setShowCustomerForm(!showCustomerForm)}
                  variant={showCustomerForm ? "destructive" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                >
                  {showCustomerForm ? <X size={16} /> : <PlusCircle size={16} />}
                </Button>
              </div>
              {formErrors.customer_id && (
                <p className="mt-1 text-sm text-destructive">{formErrors.customer_id}</p>
              )}
            </div>
            
            {/* Make */}
            <div className="space-y-2">
              <label htmlFor="make" className="block text-sm font-medium">
                Make <span className="text-destructive">*</span>
              </label>
              <Input
                id="make"
                name="make"
                value={formData.make || ''}
                onChange={handleChange}
                className={formErrors.make ? 'border-destructive' : ''}
              />
              {formErrors.make && (
                <p className="mt-1 text-sm text-destructive">{formErrors.make}</p>
              )}
            </div>
            
            {/* Model */}
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium">
                Model <span className="text-destructive">*</span>
              </label>
              <Input
                id="model"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
                className={formErrors.model ? 'border-destructive' : ''}
              />
              {formErrors.model && (
                <p className="mt-1 text-sm text-destructive">{formErrors.model}</p>
              )}
            </div>
            
            {/* Year */}
            <div className="space-y-2">
              <label htmlFor="year" className="block text-sm font-medium">
                Year <span className="text-destructive">*</span>
              </label>
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year || ''}
                onChange={handleChange}
                min={1900}
                max={new Date().getFullYear() + 1}
                className={formErrors.year ? 'border-destructive' : ''}
              />
              {formErrors.year && (
                <p className="mt-1 text-sm text-destructive">{formErrors.year}</p>
              )}
            </div>
            
            {/* License Plate */}
            <div className="space-y-2">
              <label htmlFor="license_plate" className="block text-sm font-medium">
                License Plate <span className="text-destructive">*</span>
              </label>
              <Input
                id="license_plate"
                name="license_plate"
                value={formData.license_plate || ''}
                onChange={handleChange}
                className={formErrors.license_plate ? 'border-destructive' : ''}
              />
              {formErrors.license_plate && (
                <p className="mt-1 text-sm text-destructive">{formErrors.license_plate}</p>
              )}
            </div>
            
            {/* VIN */}
            <div className="space-y-2">
              <label htmlFor="vin" className="block text-sm font-medium">
                VIN
              </label>
              <Input
                id="vin"
                name="vin"
                value={formData.vin || ''}
                onChange={handleChange}
              />
            </div>
            
            {/* Initial Mileage */}
            <div className="space-y-2">
              <label htmlFor="initial_mileage" className="block text-sm font-medium">
                Initial Mileage <span className="text-destructive">*</span>
              </label>
              <Input
                id="initial_mileage"
                name="initial_mileage"
                type="number"
                value={formData.initial_mileage || ''}
                onChange={handleChange}
                min={0}
                className={formErrors.initial_mileage ? 'border-destructive' : ''}
              />
              {formErrors.initial_mileage && (
                <p className="mt-1 text-sm text-destructive">{formErrors.initial_mileage}</p>
              )}
            </div>
            
            {/* Current Mileage */}
            <div className="space-y-2">
              <label htmlFor="current_mileage" className="block text-sm font-medium">
                Current Mileage <span className="text-destructive">*</span>
              </label>
              <Input
                id="current_mileage"
                name="current_mileage"
                type="number"
                value={formData.current_mileage || ''}
                onChange={handleChange}
                min={formData.initial_mileage || 0}
                className={formErrors.current_mileage ? 'border-destructive' : ''}
              />
              {formErrors.current_mileage && (
                <p className="mt-1 text-sm text-destructive">{formErrors.current_mileage}</p>
              )}
            </div>
          </div>
          
          {/* Tunisian Market Information */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-medium mb-4">Tunisian Market Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customs Clearance Number */}
              <div className="space-y-2">
                <label htmlFor="customs_clearance_number" className="block text-sm font-medium">
                  Customs Clearance Number
                </label>
                <Input
                  id="customs_clearance_number"
                  name="customs_clearance_number"
                  value={formData.customs_clearance_number || ''}
                  onChange={handleChange}
                />
              </div>
              
              {/* Technical Visit Date */}
              <div className="space-y-2">
                <label htmlFor="technical_visit_date" className="block text-sm font-medium">
                  Technical Visit Date
                </label>
                <Input
                  id="technical_visit_date"
                  name="technical_visit_date"
                  type="date"
                  value={formData.technical_visit_date || ''}
                  onChange={handleChange}
                />
              </div>
              
              {/* Insurance Category */}
              <div className="space-y-2">
                <label htmlFor="insurance_category" className="block text-sm font-medium">
                  Insurance Category
                </label>
                <Input
                  id="insurance_category"
                  name="insurance_category"
                  value={formData.insurance_category || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          {/* Customer Form (when shown) */}
          {showCustomerForm && (
            <div className="mt-8 border-t pt-6 bg-muted/20 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Create New Customer
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomerForm(false)}
                >
                  <X size={16} className="mr-1" /> Close
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={customerFormData.name || ''}
                    onChange={handleCustomerChange}
                    className={customerFormErrors.name ? 'border-destructive' : ''}
                  />
                  {customerFormErrors.name && (
                    <p className="mt-1 text-sm text-destructive">{customerFormErrors.name}</p>
                  )}
                </div>
                
                {/* Customer Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerFormData.email || ''}
                    onChange={handleCustomerChange}
                    className={customerFormErrors.email ? 'border-destructive' : ''}
                  />
                  {customerFormErrors.email && (
                    <p className="mt-1 text-sm text-destructive">{customerFormErrors.email}</p>
                  )}
                </div>
                
                {/* Customer Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium">
                    Phone <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={customerFormData.phone || ''}
                    onChange={handleCustomerChange}
                    className={customerFormErrors.phone ? 'border-destructive' : ''}
                  />
                  {customerFormErrors.phone && (
                    <p className="mt-1 text-sm text-destructive">{customerFormErrors.phone}</p>
                  )}
                </div>
                
                {/* Customer Address */}
                <div className="space-y-2">
                  <label htmlFor="address" className="block text-sm font-medium">
                    Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="address"
                    name="address"
                    value={customerFormData.address || ''}
                    onChange={handleCustomerChange}
                    className={customerFormErrors.address ? 'border-destructive' : ''}
                  />
                  {customerFormErrors.address && (
                    <p className="mt-1 text-sm text-destructive">{customerFormErrors.address}</p>
                  )}
                </div>
                
                {/* Customer National ID */}
                <div className="space-y-2">
                  <label htmlFor="national_id" className="block text-sm font-medium">
                    National ID
                  </label>
                  <Input
                    id="national_id"
                    name="national_id"
                    value={customerFormData.national_id || ''}
                    onChange={handleCustomerChange}
                  />
                </div>
                
                {/* Customer Region Code */}
                <div className="space-y-2">
                  <label htmlFor="region_code" className="block text-sm font-medium">
                    Region Code
                  </label>
                  <Select 
                    value={customerFormData.region_code || undefined} 
                    onValueChange={(value) => {
                      setCustomerFormData({
                        ...customerFormData,
                        region_code: value
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {['TUN', 'SFA', 'SOU', 'KAI', 'BIZ', 'NAB', 'BEJ', 'JEN', 'KEF', 'SIL', 'KAS', 'MON', 'MAH', 'GAB', 'TOZ', 'GFS', 'MED', 'TAT'].map(code => (
                        <SelectItem key={code} value={code}>{code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-4">
                <Button
                  type="button"
                  onClick={handleCreateCustomer}
                  variant="default"
                  className="mr-2"
                >
                  <Check size={16} className="mr-1" /> Create Customer
                </Button>
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="mt-8 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cars')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="taxi"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Car' : 'Add Car'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CarForm; 