import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  Car, 
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
  getMileageRecords,
  MileageRecord,
  MileageUpdate,
  updateMileage,
  getCarsByCustomerId
} from '../../api/cars';
import { fetchCustomerById } from '../slices/customerSlice';

// Define the state type
interface CarState {
  cars: Car[];
  selectedCar: Car | null;
  mileageRecords: MileageRecord[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CarState = {
  cars: [],
  selectedCar: null,
  mileageRecords: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCars = createAsyncThunk<Car[], void>(
  'cars/fetchCars',
  async (_, { rejectWithValue }) => {
    try {
      const cars = await getCars();
      return cars;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cars');
    }
  }
);

export const fetchCarsByCustomerId = createAsyncThunk<Car[], number>(
  'cars/fetchCarsByCustomerId',
  async (customerId, { rejectWithValue }) => {
    try {
      console.log(`fetchCarsByCustomerId thunk - Fetching cars for customer ID: ${customerId}`);
      const cars = await getCarsByCustomerId(customerId);
      console.log(`fetchCarsByCustomerId thunk - Found ${cars.length} cars for customer ${customerId}`);
      return cars;
    } catch (error) {
      console.error('Error in fetchCarsByCustomerId:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch cars');
    }
  }
);

export const fetchCarById = createAsyncThunk<Car, number>(
  'cars/fetchCarById',
  async (carId, { rejectWithValue }) => {
    try {
      const car = await getCar(carId);
      return car;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch car details');
    }
  }
);

export const addCar = createAsyncThunk<Car, Partial<Car>>(
  'cars/addCar',
  async (carData, { rejectWithValue, dispatch }) => {
    try {
      // Create a type-safe car object with required fields
      const sanitizedData: Omit<Car, 'id' | 'created_at' | 'updated_at' | 'average_daily_mileage'> = {
        customer_id: carData.customer_id === undefined || carData.customer_id === null
          ? null
          : (typeof carData.customer_id === 'string'
              ? parseInt(carData.customer_id, 10)
              : carData.customer_id),
        make: carData.make || '',
        model: carData.model || '',
        year: carData.year || new Date().getFullYear(),
        vin: carData.vin || '',
        license_plate: carData.license_plate || '',
        initial_mileage: carData.initial_mileage || 0,
        current_mileage: carData.current_mileage || 0,
        customs_clearance_number: carData.customs_clearance_number,
        technical_visit_date: carData.technical_visit_date,
        insurance_category: carData.insurance_category
      };
      
      console.log('addCar thunk - Sanitized data:', sanitizedData);
      
      const newCar = await createCar(sanitizedData);
      
      // Refresh all cars to ensure state is updated
      dispatch(fetchCars());
      // If the car has a customer, fetch that customer's details
      if (newCar.customer_id) {
        console.log('Fetching customer details for new car with customer_id:', newCar.customer_id);
        dispatch(fetchCustomerById(newCar.customer_id));
      }
      
      return newCar;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add car');
    }
  }
);

export const editCar = createAsyncThunk<Car, { carId: number; carData: Partial<Car> }>(
  'cars/editCar',
  async ({ carId, carData }, { rejectWithValue, dispatch }) => {
    try {
      console.log('editCar thunk - Original data:', carData);
      
      // Ensure customer_id is properly formatted
      const sanitizedData = {
        ...carData,
        customer_id: carData.customer_id === undefined || carData.customer_id === null
          ? null
          : (typeof carData.customer_id === 'string'
              ? parseInt(carData.customer_id, 10)
              : carData.customer_id)
      };
      
      console.log('editCar thunk - Sanitized data:', sanitizedData);
      
      const updatedCar = await updateCar(carId, sanitizedData);
      
      // If the car has a customer, fetch that customer's details
      if (updatedCar.customer_id) {
        console.log('Fetching customer details for updated car with customer_id:', updatedCar.customer_id);
        dispatch(fetchCustomerById(updatedCar.customer_id));
      }
      
      return updatedCar;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update car');
    }
  }
);

export const removeCar = createAsyncThunk<number, number>(
  'cars/removeCar',
  async (carId, { rejectWithValue }) => {
    try {
      await deleteCar(carId);
      return carId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete car');
    }
  }
);

export const fetchMileageRecords = createAsyncThunk<MileageRecord[], number>(
  'cars/fetchMileageRecords',
  async (carId, { rejectWithValue }) => {
    try {
      const records = await getMileageRecords(carId);
      return records;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch mileage records');
    }
  }
);

export const updateCarMileage = createAsyncThunk<
  Car,
  { carId: number; mileageData: MileageUpdate }
>(
  'cars/updateCarMileage',
  async ({ carId, mileageData }, { rejectWithValue }) => {
    try {
      const updatedCar = await updateMileage(carId, mileageData);
      return updatedCar;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update mileage');
    }
  }
);

// Create the car slice
const carSlice = createSlice({
  name: 'cars',
  initialState,
  reducers: {
    clearSelectedCar: (state) => {
      state.selectedCar = null;
    },
    clearMileageRecords: (state) => {
      state.mileageRecords = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all cars
      .addCase(fetchCars.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch cars by customer ID
      .addCase(fetchCarsByCustomerId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarsByCustomerId.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = action.payload;
      })
      .addCase(fetchCarsByCustomerId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch car by ID
      .addCase(fetchCarById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCar = action.payload;
      })
      .addCase(fetchCarById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add new car
      .addCase(addCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCar.fulfilled, (state, action) => {
        state.loading = false;
        state.cars.push(action.payload);
      })
      .addCase(addCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Edit car
      .addCase(editCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCar.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.cars.findIndex(car => car.id === action.payload.id);
        if (index !== -1) {
          state.cars[index] = action.payload;
        } else {
          // If the car wasn't found, add it to the array
          state.cars.push(action.payload);
        }
        
        // Update selectedCar if it matches the updated car's id
        if (state.selectedCar && state.selectedCar.id === action.payload.id) {
          state.selectedCar = action.payload;
        }
        
        console.log('Car updated in store:', action.payload);
        console.log('Updated car customer_id:', action.payload.customer_id);
      })
      .addCase(editCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove car
      .addCase(removeCar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCar.fulfilled, (state, action) => {
        state.loading = false;
        state.cars = state.cars.filter(car => car.id !== action.payload);
        if (state.selectedCar && state.selectedCar.id === action.payload) {
          state.selectedCar = null;
        }
      })
      .addCase(removeCar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch mileage records
      .addCase(fetchMileageRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMileageRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.mileageRecords = action.payload;
      })
      .addCase(fetchMileageRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update car mileage
      .addCase(updateCarMileage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarMileage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update car in cars array
        const index = state.cars.findIndex(car => car.id === action.payload.id);
        if (index !== -1) {
          state.cars[index] = action.payload;
        }
        
        // Update selectedCar if it's the same car
        if (state.selectedCar && state.selectedCar.id === action.payload.id) {
          state.selectedCar = action.payload;
        }
        
        // Note: Need to fetch mileage records again after updating
        // This is handled in the component by dispatching fetchMileageRecords
      })
      .addCase(updateCarMileage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearSelectedCar, clearMileageRecords } = carSlice.actions;
export default carSlice.reducer; 