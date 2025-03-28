import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Add dark class to html element for default dark theme
document.documentElement.classList.add('dark');

// Simple error handler to catch rendering issues
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  
  // If the root element exists but is empty, show a minimal UI
  const rootElement = document.getElementById('root');
  if (rootElement && rootElement.childNodes.length === 0) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #d32f2f;">React App Failed to Load</h1>
        <p>There was an error initializing the application.</p>
        <p><strong>Error:</strong> ${event.error?.message || 'Unknown error'}</p>
        <p>Please check the console for more details.</p>
        <a href="/debug.html" style="
          display: inline-block;
          margin-top: 15px;
          padding: 10px 15px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        ">Go to Debug Page</a>
      </div>
    `;
  }
});

// Get container and create root
const container = document.getElementById('root');
if (!container) {
  console.error('Root element not found in the document!');
} else {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Error rendering React app:', err);
    container.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #d32f2f;">React App Failed to Load</h1>
        <p>There was an error initializing the application.</p>
        <p><strong>Error:</strong> ${err instanceof Error ? err.message : 'Unknown error'}</p>
        <p>Please check the console for more details.</p>
        <a href="/debug.html" style="
          display: inline-block;
          margin-top: 15px;
          padding: 10px 15px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        ">Go to Debug Page</a>
      </div>
    `;
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
