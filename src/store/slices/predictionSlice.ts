import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  CarDueSoon, 
  getCarsDueSoon, 
  getCarPrediction, 
  refreshCarPrediction as apiRefreshCarPrediction,
} from '../../api/predictions';

// Define the state type
interface PredictionState {
  carsDueSoon: CarDueSoon[];
  selectedCarPrediction: CarDueSoon | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PredictionState = {
  carsDueSoon: [],
  selectedCarPrediction: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCarsDueSoon = createAsyncThunk(
  'predictions/fetchDueSoon',
  async (_, { rejectWithValue }) => {
    try {
      return await getCarsDueSoon();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cars due soon');
    }
  }
);

export const fetchCarPrediction = createAsyncThunk(
  'predictions/fetchForCar',
  async (carId: number, { rejectWithValue }) => {
    try {
      return await getCarPrediction(carId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch car predictions');
    }
  }
);

export const refreshCarPrediction = createAsyncThunk(
  'predictions/refresh',
  async (carId: number, { rejectWithValue }) => {
    try {
      return await apiRefreshCarPrediction(carId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update car predictions');
    }
  }
);

// Create the prediction slice
const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    clearSelectedPrediction: (state) => {
      state.selectedCarPrediction = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cars due soon
      .addCase(fetchCarsDueSoon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarsDueSoon.fulfilled, (state, action: PayloadAction<CarDueSoon[]>) => {
        state.loading = false;
        state.carsDueSoon = action.payload;
      })
      .addCase(fetchCarsDueSoon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch car prediction
      .addCase(fetchCarPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarPrediction.fulfilled, (state, action: PayloadAction<CarDueSoon>) => {
        state.loading = false;
        state.selectedCarPrediction = action.payload;
      })
      .addCase(fetchCarPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Refresh car prediction
      .addCase(refreshCarPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshCarPrediction.fulfilled, (state, action: PayloadAction<CarDueSoon>) => {
        state.loading = false;
        state.selectedCarPrediction = action.payload;
        
        // Update the entry in carsDueSoon if it exists
        if (action.payload.car && state.carsDueSoon.length > 0) {
          const index = state.carsDueSoon.findIndex(
            item => item.car.id === action.payload.car.id
          );
          
          if (index !== -1) {
            // Create a new array with the updated entry
            state.carsDueSoon = [
              ...state.carsDueSoon.slice(0, index),
              action.payload,
              ...state.carsDueSoon.slice(index + 1)
            ];
          }
        }
      })
      .addCase(refreshCarPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { clearSelectedPrediction, clearError } = predictionSlice.actions;
export default predictionSlice.reducer; 