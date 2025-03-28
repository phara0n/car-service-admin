import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { addCar, editCar, fetchCarById, clearSelectedCar } from '../../store/slices/carSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';
import { addCustomer } from '../../store/slices/customerSlice';
import { Car } from '../../api/cars';
import { Customer } from '../../api/customers';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { PlusCircle, UserPlus, X, CheckCircle, Car as CarIcon } from 'lucide-react';

interface CarFormProps {
  carId?: number;
  isEdit?: boolean;
}

const CarForm: React.FC<CarFormProps> = ({ carId, isEdit = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedCar, loading, error } = useAppSelector(state => state.cars);
  const { customers, loading: customersLoading } = useAppSelector(state => state.customers);
  
  const [formData, setFormData] = useState<Partial<Car>>({
    customer_id: 0,
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    initial_mileage: 0,
    current_mileage: 0,
    // Tunisian market specific fields
    customs_clearance_number: '',
    technical_visit_date: '',
    insurance_category: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    national_id: '',
    region_code: ''
  });
  const [customerFormErrors, setCustomerFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Fetch car details if editing
    if (isEdit && carId) {
      dispatch(fetchCarById(carId));
    }
    
    // Fetch customers list
    dispatch(fetchCustomers());
    
    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedCar());
    };
  }, [dispatch, carId, isEdit]);
  
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Convert numeric fields to numbers
    if (
      ['customer_id', 'year', 'initial_mileage', 'current_mileage'].includes(name) && 
      type === 'number'
    ) {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseInt(value, 10)
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
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.customer_id) {
      errors.customer_id = 'Customer ID is required';
    }
    
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
    
    if (!formData.current_mileage) {
      errors.current_mileage = 'Current mileage is required';
    }
    
    if (!formData.initial_mileage) {
      errors.initial_mileage = 'Initial mileage is required';
    }
    
    if (formData.current_mileage && formData.initial_mileage && formData.current_mileage < formData.initial_mileage) {
      errors.current_mileage = 'Current mileage cannot be less than initial mileage';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateCustomerForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!customerFormData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!customerFormData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(customerFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!customerFormData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!customerFormData.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    // Tunisia-specific validation
    if (customerFormData.national_id && customerFormData.national_id.length > 0 && customerFormData.national_id.length !== 8) {
      errors.national_id = 'National ID must be 8 characters';
    }
    
    setCustomerFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCreateCustomer = async () => {
    if (!validateCustomerForm()) {
      return;
    }
    
    try {
      const newCustomer = await dispatch(addCustomer(customerFormData)).unwrap();
      setFormData({
        ...formData,
        customer_id: newCustomer.id
      });
      setShowCustomerForm(false);
      
      // Clear customer form data
      setCustomerFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        national_id: '',
        region_code: ''
      });
    } catch (error) {
      console.error('Error creating customer:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEdit && carId) {
        await dispatch(editCar({ carId, carData: formData })).unwrap();
        navigate(`/cars/${carId}`);
      } else {
        const result = await dispatch(addCar(formData)).unwrap();
        navigate(`/cars/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };
  
  if (isEdit && loading && !selectedCar) {
    return <div className="flex items-center justify-center py-8">
      <div className="animate-pulse">Loading car data...</div>
    </div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <CarIcon size={24} className="text-primary" />
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Car' : 'Add New Car'}
        </h1>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-card text-card-foreground rounded-lg border shadow-md">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="customer_id" className="block text-sm font-medium">
                Customer <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <Select
                  value={formData.customer_id?.toString() || ""}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      customer_id: parseInt(value, 10)
                    });
                    if (formErrors.customer_id) {
                      setFormErrors({
                        ...formErrors,
                        customer_id: ''
                      });
                    }
                  }}
                >
                  <SelectTrigger className={`w-full ${formErrors.customer_id ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
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
                  variant={showCustomerForm ? "destructive" : "taxi"}
                  size="sm"
                >
                  {showCustomerForm ? <X size={16} /> : <UserPlus size={16} />}
                </Button>
              </div>
              {formErrors.customer_id && (
                <p className="text-destructive text-sm mt-1">{formErrors.customer_id}</p>
              )}
            </div>
            
            {/* Customer Form */}
            {showCustomerForm && (
              <div className="col-span-1 md:col-span-2 bg-muted/40 p-6 rounded-lg border border-border mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center">
                    <UserPlus size={18} className="mr-2 text-primary" />
                    Add New Customer
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCustomerForm(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="name"
                      name="name"
                      className={customerFormErrors.name ? 'border-destructive' : ''}
                      value={customerFormData.name || ''}
                      onChange={handleCustomerChange}
                    />
                    {customerFormErrors.name && (
                      <p className="text-destructive text-sm">{customerFormErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      className={customerFormErrors.email ? 'border-destructive' : ''}
                      value={customerFormData.email || ''}
                      onChange={handleCustomerChange}
                    />
                    {customerFormErrors.email && (
                      <p className="text-destructive text-sm">{customerFormErrors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium">
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={customerFormErrors.phone ? 'border-destructive' : ''}
                      value={customerFormData.phone || ''}
                      onChange={handleCustomerChange}
                    />
                    {customerFormErrors.phone && (
                      <p className="text-destructive text-sm">{customerFormErrors.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium">
                      Address <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      className={`w-full rounded-md border ${customerFormErrors.address ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm`}
                      value={customerFormData.address || ''}
                      onChange={handleCustomerChange}
                    />
                    {customerFormErrors.address && (
                      <p className="text-destructive text-sm">{customerFormErrors.address}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <label htmlFor="national_id" className="block text-sm font-medium">
                      National ID
                    </label>
                    <Input
                      type="text"
                      id="national_id"
                      name="national_id"
                      className={customerFormErrors.national_id ? 'border-destructive' : ''}
                      value={customerFormData.national_id || ''}
                      onChange={handleCustomerChange}
                      placeholder="8-digit national ID"
                    />
                    {customerFormErrors.national_id && (
                      <p className="text-destructive text-sm">{customerFormErrors.national_id}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="region_code" className="block text-sm font-medium">
                      Region Code
                    </label>
                    <Input
                      type="text"
                      id="region_code"
                      name="region_code"
                      value={customerFormData.region_code || ''}
                      onChange={handleCustomerChange}
                      placeholder="e.g. TUN, SFA, KAI"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button
                    type="button"
                    onClick={handleCreateCustomer}
                    variant="taxi"
                    className="flex items-center"
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Create Customer
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCustomerForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="license_plate" className="block text-sm font-medium">
                License Plate <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                id="license_plate"
                name="license_plate"
                className={formErrors.license_plate ? 'border-destructive' : ''}
                value={formData.license_plate || ''}
                onChange={handleChange}
              />
              {formErrors.license_plate && (
                <p className="text-destructive text-sm">{formErrors.license_plate}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="make" className="block text-sm font-medium">
                Make <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                id="make"
                name="make"
                className={formErrors.make ? 'border-destructive' : ''}
                value={formData.make || ''}
                onChange={handleChange}
              />
              {formErrors.make && (
                <p className="text-destructive text-sm">{formErrors.make}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium">
                Model <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                id="model"
                name="model"
                className={formErrors.model ? 'border-destructive' : ''}
                value={formData.model || ''}
                onChange={handleChange}
              />
              {formErrors.model && (
                <p className="text-destructive text-sm">{formErrors.model}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="year" className="block text-sm font-medium">
                Year <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                id="year"
                name="year"
                className={formErrors.year ? 'border-destructive' : ''}
                value={formData.year || ''}
                onChange={handleChange}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {formErrors.year && (
                <p className="text-destructive text-sm">{formErrors.year}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="vin" className="block text-sm font-medium">
                VIN
              </label>
              <Input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="initial_mileage" className="block text-sm font-medium">
                Initial Mileage <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                id="initial_mileage"
                name="initial_mileage"
                className={formErrors.initial_mileage ? 'border-destructive' : ''}
                value={formData.initial_mileage || 0}
                onChange={handleChange}
                min="0"
              />
              {formErrors.initial_mileage && (
                <p className="text-destructive text-sm">{formErrors.initial_mileage}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="current_mileage" className="block text-sm font-medium">
                Current Mileage <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                id="current_mileage"
                name="current_mileage"
                className={formErrors.current_mileage ? 'border-destructive' : ''}
                value={formData.current_mileage || 0}
                onChange={handleChange}
                min={formData.initial_mileage || 0}
              />
              {formErrors.current_mileage && (
                <p className="text-destructive text-sm">{formErrors.current_mileage}</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 mb-4 border-t border-border pt-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-1.5 h-5 bg-primary mr-2 rounded-sm"></span>
              Tunisian Market Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="customs_clearance_number" className="block text-sm font-medium">
                  Customs Clearance Number
                </label>
                <Input
                  type="text"
                  id="customs_clearance_number"
                  name="customs_clearance_number"
                  value={formData.customs_clearance_number || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="technical_visit_date" className="block text-sm font-medium">
                  Technical Visit Date
                </label>
                <Input
                  type="date"
                  id="technical_visit_date"
                  name="technical_visit_date"
                  value={formData.technical_visit_date || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="insurance_category" className="block text-sm font-medium">
                  Insurance Category
                </label>
                <Input
                  type="text"
                  id="insurance_category"
                  name="insurance_category"
                  value={formData.insurance_category || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button
              type="submit"
              disabled={loading}
              variant="taxi"
              className="font-semibold"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Car' : 'Add Car'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/cars')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CarForm; 