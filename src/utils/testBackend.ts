import axios from 'axios';

// Function to test the backend connection 
export const testBackendConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Try to fetch customers as a quick test
    const response = await axios.get('http://localhost:3000/api/v1/customers', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      message: `Successfully connected to backend. Found ${response.data.length} customers.`
    };
  } catch (error: any) {
    console.error('Backend connection test failed:', error);
    
    // Check if it's a CORS error
    if (error.message && error.message.includes('Network Error')) {
      return {
        success: false,
        message: 'Network error: This might be due to CORS restrictions or the backend server is not running.'
      };
    }
    
    // Authentication error
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        message: 'Authentication failed. Make sure you are logged in and have a valid token.'
      };
    }
    
    return {
      success: false,
      message: `Failed to connect to backend: ${error.message}`
    };
  }
};

// Function to test authentication
export const testAuthentication = async (email: string, password: string): Promise<{ success: boolean; message: string; token?: string }> => {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      message: 'Authentication successful',
      token: response.data.token
    };
  } catch (error: any) {
    console.error('Authentication test failed:', error);
    
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      };
    }
    
    return {
      success: false,
      message: `Authentication failed: ${error.message}`
    };
  }
}; 