import React from 'react';

const DebugInfo = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="fixed bottom-0 left-0 bg-gray-900 text-white p-4 max-w-sm overflow-auto text-xs">
      <h3 className="font-bold">Debug Info</h3>
      <div className="mt-2">
        <p><strong>Auth Status:</strong> {token ? 'Logged In' : 'Not Logged In'}</p>
        {user && (
          <div className="mt-2">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Is Superadmin:</strong> {user.is_superadmin ? 'Yes' : 'No'}</p>
          </div>
        )}
        {token && (
          <div className="mt-2">
            <p><strong>Token (first 20 chars):</strong> {token.substring(0, 20)}...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugInfo; 