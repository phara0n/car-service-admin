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
      const cars = await getCarsByCustomerId(customerId);
      return cars;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customer cars');
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
  async (carData, { rejectWithValue }) => {
    try {
      // Ensure customer_id is provided
      if (!carData.customer_id) {
        return rejectWithValue('Customer ID is required');
      }
      
      const newCar = await createCar({
        customer_id: carData.customer_id,
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
      });
      return newCar;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add car');
    }
  }
);

export const editCar = createAsyncThunk<Car, { carId: number; carData: Partial<Car> }>(
  'cars/editCar',
  async ({ carId, carData }, { rejectWithValue }) => {
    try {
      const updatedCar = await updateCar(carId, carData);
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
        }
        if (state.selectedCar && state.selectedCar.id === action.payload.id) {
          state.selectedCar = action.payload;
        }
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