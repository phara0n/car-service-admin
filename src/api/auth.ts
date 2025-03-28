import apiClient from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    is_superadmin: boolean;
  };
}

// Handle login and store JWT
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Send credentials both directly and wrapped in auth to ensure compatibility
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email: credentials.email,
    password: credentials.password,
    auth: credentials  // Also include as auth object for backward compatibility
  });
  
  const { token, user } = response.data;
  
  // Store token and user info in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  return response.data;
};

// Check if token is valid
export const verifyToken = async (): Promise<boolean> => {
  try {
    await apiClient.get('/auth/verify');
    return true;
  } catch (error) {
    return false;
  }
};

// Log out user
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Get current user from localStorage
export const getCurrentUser = (): { id: number; name: string; email: string; role: string } | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Check if user has specific role
export const hasRole = (role: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === role;
};

// Check if user is superadmin
export const isSuperAdmin = (): boolean => {
  return hasRole('superadmin');
};

// Check if user is admin or superadmin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return user.role === 'admin' || user.role === 'superadmin';
}; 