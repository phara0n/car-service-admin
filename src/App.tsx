import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import store from './store';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CarsList from './components/cars/CarsList';
import CarDetails from './components/cars/CarDetails';
import CarForm from './components/cars/CarForm';
import CarPredictionPage from './components/predictions/CarPredictionPage';
import CustomersList from './components/customers/CustomersList';
import CustomerDetails from './components/customers/CustomerDetails';
import CustomerForm from './components/customers/CustomerForm';
import Login from './pages/Login';
import { isAuthenticated } from './api/auth';
import DebugPanel from './components/DebugPanel';
import './App.css';

// Add a minimal fallback component to handle errors at the application root level
const FallbackApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '2rem auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#121212', 
      color: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h1 style={{ color: '#90caf9', marginBottom: '1rem' }}>Car Service Management System</h1>
      <p>Welcome to the Car Service Management System. Please use the navigation links to access different sections.</p>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem',
        marginTop: '2rem',
        flexWrap: 'wrap'
      }}>
        <a 
          href="/customers" 
          style={{
            padding: '1rem',
            backgroundColor: '#1e88e5',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Customers</span>
        </a>
        
        <a 
          href="/cars" 
          style={{
            padding: '1rem',
            backgroundColor: '#43a047',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Cars</span>
        </a>
        
        <a 
          href="/debug" 
          style={{
            padding: '1rem',
            backgroundColor: '#f57c00',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>Debug</span>
        </a>
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  try {
    return (
      <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/debug" element={<DebugPanel />} />
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              
              {/* Cars routes */}
              <Route path="cars" element={<CarsList />} />
              <Route path="cars/add" element={<CarForm />} />
              <Route path="cars/:id" element={<CarDetailsWrapper />} />
              <Route path="cars/:id/edit" element={<CarEditWrapper />} />
              
              {/* Customers routes */}
              <Route path="customers" element={<CustomersList />} />
              <Route path="customers/add" element={<CustomerForm />} />
              <Route path="customers/:id" element={<CustomerDetailsWrapper />} />
              <Route path="customers/:id/edit" element={<CustomerEditWrapper />} />
              
              {/* Service prediction routes */}
              <Route path="car-predictions/:id" element={<CarPredictionWrapper />} />
              
              {/* Redirect other routes to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </Router>
      </Provider>
    );
  } catch (error) {
    console.error('Error rendering main App component:', error);
    return <FallbackApp />;
  }
};

// Wrapper components to handle params
const CarDetailsWrapper: React.FC = () => {
  const id = parseInt(window.location.pathname.split('/')[2]);
  return <CarDetails carId={id} />;
};

const CarEditWrapper: React.FC = () => {
  const id = parseInt(window.location.pathname.split('/')[2]);
  return <CarForm carId={id} isEdit />;
};

const CustomerDetailsWrapper: React.FC = () => {
  const id = parseInt(window.location.pathname.split('/')[2]);
  return <CustomerDetails customerId={id} />;
};

const CustomerEditWrapper: React.FC = () => {
  const id = parseInt(window.location.pathname.split('/')[2]);
  return <CustomerForm customerId={id} isEdit />;
};

const CarPredictionWrapper: React.FC = () => {
  const id = parseInt(window.location.pathname.split('/')[2]);
  return <CarPredictionPage carId={id} />;
};

export default App;
