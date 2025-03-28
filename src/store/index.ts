import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import carReducer from './slices/carSlice';
import predictionReducer from './slices/predictionSlice';
import customerReducer from './slices/customerSlice';
import dashboardReducer from './slices/dashboardSlice';

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carReducer,
    predictions: predictionReducer,
    customers: customerReducer,
    dashboard: dashboardReducer,
    // Add more reducers as needed
  },
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  })
});

// Extract type information
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for typed Redux hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store; 