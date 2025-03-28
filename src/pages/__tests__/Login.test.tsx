import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Login from '../Login';
import { loginUser } from '../../store/slices/authSlice';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the auth slice
jest.mock('../../store/slices/authSlice', () => ({
  loginUser: jest.fn(),
  clearError: jest.fn(),
}));

const mockStore = configureStore([thunk]);

describe('Login Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        loading: false,
        error: null,
      },
    });
    (loginUser as jest.Mock).mockImplementation(() => {
      return { type: 'auth/login/pending' };
    });
  });

  it('renders the login form', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Car Service Management System')).toBeInTheDocument();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows error message when provided by the store', () => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        loading: false,
        error: 'Invalid credentials',
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith({
        email: 'admin@example.com',
        password: 'password',
      });
    });
  });

  it('shows loading state when authentication is in progress', () => {
    store = mockStore({
      auth: {
        isAuthenticated: false,
        loading: true,
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
  });

  it('displays demo credentials', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument();
    expect(screen.getByText('Superadmin: superadmin@example.com / password123')).toBeInTheDocument();
    expect(screen.getByText('Admin: admin@example.com / password123')).toBeInTheDocument();
  });
}); 