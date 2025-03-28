import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { addCustomer, editCustomer, fetchCustomerById, clearSelectedCustomer } from '../../store/slices/customerSlice';
import { Customer } from '../../api/customers';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { 
  Save, 
  ArrowLeft, 
  UserPlus, 
  Pencil, 
  User, 
  MapPin, 
  Mail, 
  Phone,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface CustomerFormProps {
  customerId?: number;
  isEdit?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customerId, isEdit = false }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedCustomer, loading, error } = useAppSelector(state => state.customers);
  
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    national_id: '',
    region_code: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Fetch customer details if editing
    if (isEdit && customerId) {
      dispatch(fetchCustomerById(customerId));
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedCustomer());
    };
  }, [dispatch, customerId, isEdit]);
  
  // Populate form with customer data when selectedCustomer changes
  useEffect(() => {
    if (isEdit && selectedCustomer) {
      setFormData({
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address,
        national_id: selectedCustomer.national_id || '',
        region_code: selectedCustomer.region_code || ''
      });
    }
  }, [selectedCustomer, isEdit]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (!formData.address?.trim()) {
      errors.address = 'Address is required';
    }
    
    // Tunisia-specific validation
    if (formData.national_id && formData.national_id.length > 0 && formData.national_id.length !== 8) {
      errors.national_id = 'National ID must be 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEdit && customerId) {
        await dispatch(editCustomer({ customerId, customerData: formData })).unwrap();
        navigate(`/customers/${customerId}`);
      } else {
        const result = await dispatch(addCustomer(formData)).unwrap();
        navigate(`/customers/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };
  
  if (isEdit && loading && !selectedCustomer) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3 text-muted-foreground">Loading customer data...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="dashboard-section-title flex items-center gap-2">
          {isEdit ? <Pencil size={24} className="text-primary" /> : <UserPlus size={24} className="text-primary" />}
          {isEdit ? 'Edit Customer' : 'Add New Customer'}
        </h1>
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Customers
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="dashboard-card">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                Full Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                className={formErrors.name ? 'border-destructive' : ''}
                value={formData.name || ''}
                onChange={handleChange}
                required
              />
              {formErrors.name && (
                <p className="text-destructive text-sm">{formErrors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                className={formErrors.email ? 'border-destructive' : ''}
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
              {formErrors.email && (
                <p className="text-destructive text-sm">{formErrors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                Phone Number <span className="text-destructive">*</span>
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                className={formErrors.phone ? 'border-destructive' : ''}
                value={formData.phone || ''}
                onChange={handleChange}
                required
              />
              {formErrors.phone && (
                <p className="text-destructive text-sm">{formErrors.phone}</p>
              )}
            </div>
            
            <div className="col-span-1 md:col-span-2 space-y-2">
              <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                Address <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="address"
                name="address"
                rows={3}
                className={formErrors.address ? 'border-destructive' : ''}
                value={formData.address || ''}
                onChange={handleChange}
                required
              />
              {formErrors.address && (
                <p className="text-destructive text-sm">{formErrors.address}</p>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border/30">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Tunisian Market Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="national_id" className="text-sm font-medium">
                  National ID
                </label>
                <Input
                  type="text"
                  id="national_id"
                  name="national_id"
                  className={formErrors.national_id ? 'border-destructive' : ''}
                  value={formData.national_id || ''}
                  onChange={handleChange}
                  placeholder="8-digit national ID"
                />
                {formErrors.national_id && (
                  <p className="text-destructive text-sm">{formErrors.national_id}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="region_code" className="text-sm font-medium">
                  Region Code
                </label>
                <Input
                  type="text"
                  id="region_code"
                  name="region_code"
                  value={formData.region_code || ''}
                  onChange={handleChange}
                  placeholder="e.g. TUN, SFA, KAI"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/customers')}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex items-center gap-2">
              <Save size={16} />
              {isEdit ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CustomerForm; 