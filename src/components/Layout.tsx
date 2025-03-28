import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './theme-provider';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { cn } from '../lib/utils';

interface LayoutProps {
  children?: React.ReactNode;
}

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Layout error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ color: '#e53935', marginBottom: '1rem' }}>Something went wrong</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '4px',
            overflowX: 'auto',
            marginTop: '1rem',
            color: '#d32f2f'
          }}>
            {this.state.error?.toString() || 'Unknown error'}
          </pre>
          <button 
            onClick={() => window.location.href = '/debug'} 
            style={{ 
              marginTop: '1rem',
              padding: '0.5rem 1rem', 
              background: '#3f51b5', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Go to Debug Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen flex bg-background text-foreground">
        <Sidebar />
        
        <div className="flex flex-col flex-1 max-h-screen overflow-hidden">
          <Header />
          
          <main className="dashboard-main overflow-auto">
            <div className={cn("h-full animate-fade-in")}>
              <ErrorBoundary>
                {children || <Outlet />}
              </ErrorBoundary>
            </div>
          </main>
          
          <footer className="border-t border-border/10 p-4 text-center text-xs text-muted-foreground">
            <p>© 2023 Car Service Management System. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout; 