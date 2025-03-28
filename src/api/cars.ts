import apiClient from './config';

export interface Car {
  id: number;
  customer_id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  initial_mileage: number;
  current_mileage: number;
  average_daily_mileage: number;
  customs_clearance_number?: string; // Tunisian market specific
  technical_visit_date?: string; // Tunisian market specific
  insurance_category?: string; // Tunisian market specific
  created_at: string;
  updated_at: string;
}

export interface MileageRecord {
  id: number;
  car_id: number;
  mileage: number;
  recorded_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MileageUpdate {
  current_mileage: number;
  notes?: string;
}

// Get all cars (admin)
export const getCars = async (): Promise<Car[]> => {
  const response = await apiClient.get<Car[]>('/cars');
  return response.data;
};

// Get a specific car (admin)
export const getCar = async (id: number): Promise<Car> => {
  const response = await apiClient.get<Car>(`/cars/${id}`);
  return response.data;
};

// Create a new car (admin)
export const createCar = async (car: Omit<Car, 'id' | 'created_at' | 'updated_at' | 'average_daily_mileage'>): Promise<Car> => {
  const response = await apiClient.post<Car>('/cars', car);
  return response.data;
};

// Update a car (admin)
export const updateCar = async (id: number, car: Partial<Car>): Promise<Car> => {
  const response = await apiClient.put<Car>(`/cars/${id}`, car);
  return response.data;
};

// Delete a car (admin)
export const deleteCar = async (id: number): Promise<void> => {
  await apiClient.delete(`/cars/${id}`);
};

// Get mileage records for a car (admin/customer)
export const getMileageRecords = async (carId: number): Promise<MileageRecord[]> => {
  const response = await apiClient.get<MileageRecord[]>(`/cars/${carId}/mileage_records`);
  return response.data;
};

// Update car mileage (admin)
export const updateMileage = async (carId: number, mileageData: MileageUpdate): Promise<Car> => {
  const response = await apiClient.patch<Car>(`/cars/${carId}/update_mileage`, mileageData);
  return response.data;
};

// Get cars for a specific customer
export const getCarsByCustomerId = async (customerId: number): Promise<Car[]> => {
  const response = await apiClient.get<Car[]>(`/customers/${customerId}/cars`);
  return response.data;
};

// Customer-specific endpoints

// Get all customer cars
export const getCustomerCars = async (): Promise<Car[]> => {
  const response = await apiClient.get<Car[]>('/customer_portal/cars');
  return response.data;
};

// Get a specific customer car
export const getCustomerCar = async (id: number): Promise<Car> => {
  const response = await apiClient.get<Car>(`/customer_portal/cars/${id}`);
  return response.data;
};

// Update customer car mileage
export const updateCustomerMileage = async (carId: number, mileageData: MileageUpdate): Promise<Car> => {
  const response = await apiClient.patch<Car>(`/customer_portal/cars/${carId}/update_mileage`, mileageData);
  return response.data;
};

// Get mileage records for a customer car
export const getCustomerMileageRecords = async (carId: number): Promise<MileageRecord[]> => {
  const response = await apiClient.get<MileageRecord[]>(`/customer_portal/cars/${carId}/mileage_records`);
  return response.data;
}; 