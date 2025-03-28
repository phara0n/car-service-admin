import apiClient from './config';

export interface ServicePrediction {
  id: number;
  service_type: string;
  next_service_date: string;
  next_service_mileage: number;
  days_to_go: number;
  mileage_to_go: number;
}

export interface CarPrediction {
  car: {
    id: number;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    current_mileage: number;
  };
  services_due: ServicePrediction[];
}

export interface CarDueSoon {
  car: {
    id: number;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    current_mileage: number;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  services_due: ServicePrediction[];
}

// Get cars due for service soon
export const getCarsDueSoon = async (): Promise<CarDueSoon[]> => {
  const response = await apiClient.get<CarDueSoon[]>('/cars/due_soon');
  return response.data;
};

// Get service predictions for a specific car
export const getCarPrediction = async (carId: number): Promise<CarDueSoon> => {
  const response = await apiClient.get<CarDueSoon>(`/cars/${carId}/predictions`);
  return response.data;
};

// Refresh predictions for a specific car
export const refreshCarPrediction = async (carId: number): Promise<CarDueSoon> => {
  const response = await apiClient.post<CarDueSoon>(`/cars/${carId}/refresh_predictions`);
  return response.data;
};

// Get service predictions for a specific car
export const getCarPredictions = async (carId: number): Promise<CarPrediction> => {
  const response = await apiClient.get<CarPrediction>(`/service_predictions/cars/${carId}`);
  return response.data;
};

// Update service predictions for a car
export const updateCarPredictions = async (carId: number): Promise<CarPrediction> => {
  const response = await apiClient.post<CarPrediction>(`/service_predictions/cars/${carId}/update`);
  return response.data;
};

// Get service predictions for all customer's cars
export const getCustomerPredictions = async (): Promise<CarPrediction[]> => {
  const response = await apiClient.get<CarPrediction[]>('/customer_portal/service_predictions');
  return response.data;
};

// Get service predictions for a specific customer's car
export const getCustomerCarPredictions = async (carId: number): Promise<CarPrediction> => {
  const response = await apiClient.get<CarPrediction>(`/customer_portal/service_predictions/cars/${carId}`);
  return response.data;
}; 