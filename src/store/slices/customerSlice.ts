import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  Customer,
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../api/customers';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null
};

export const fetchCustomers = createAsyncThunk<Customer[], void>(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const customers = await getCustomers();
      return customers;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customers');
    }
  }
);

export const fetchCustomerById = createAsyncThunk<Customer, number>(
  'customers/fetchCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const customer = await getCustomer(customerId);
      return customer;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch customer details');
    }
  }
);

export const addCustomer = createAsyncThunk<Customer, Partial<Customer>>(
  'customers/addCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const newCustomer = await createCustomer(customerData);
      return newCustomer;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to add customer');
    }
  }
);

export const editCustomer = createAsyncThunk<Customer, { customerId: number; customerData: Partial<Customer> }>(
  'customers/editCustomer',
  async ({ customerId, customerData }, { rejectWithValue }) => {
    try {
      const updatedCustomer = await updateCustomer(customerId, customerData);
      return updatedCustomer;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update customer');
    }
  }
);

export const removeCustomer = createAsyncThunk<number, number>(
  'customers/removeCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      await deleteCustomer(customerId);
      return customerId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete customer');
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add new customer
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Edit customer
      .addCase(editCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer && state.selectedCustomer.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(editCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove customer
      .addCase(removeCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
        if (state.selectedCustomer && state.selectedCustomer.id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(removeCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer; 