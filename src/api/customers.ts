import apiClient from './config';

// Customer interfaces
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
  
  // Tunisian market specific fields
  national_id?: string;
  region_code?: string;
}

// API functions
export const getCustomers = async (): Promise<Customer[]> => {
  const response = await apiClient.get('/customers');
  return response.data;
};

export const getCustomer = async (id: number): Promise<Customer> => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (customerData: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.post('/customers', customerData);
  return response.data;
};

export const updateCustomer = async (id: number, customerData: Partial<Customer>): Promise<Customer> => {
  const response = await apiClient.put(`/customers/${id}`, customerData);
  return response.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
}; 