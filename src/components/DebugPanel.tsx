import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { testBackendConnection, testAuthentication } from '../utils/testBackend';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const DebugPanel: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [authStatus, setAuthStatus] = useState<{ success: boolean; message: string; token?: string } | null>(null);
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [isTestingAuth, setIsTestingAuth] = useState(false);

  useEffect(() => {
    // Test backend connection on mount
    handleTestBackend();
  }, []);

  const handleTestBackend = async () => {
    setIsTestingBackend(true);
    try {
      const result = await testBackendConnection();
      setBackendStatus(result);
    } catch (error) {
      setBackendStatus({
        success: false,
        message: 'Error testing backend connection'
      });
    } finally {
      setIsTestingBackend(false);
    }
  };

  const handleTestAuth = async () => {
    setIsTestingAuth(true);
    try {
      // Use admin credentials from seeds
      const result = await testAuthentication('admin@example.com', 'password123');
      setAuthStatus(result);
    } catch (error) {
      setAuthStatus({
        success: false,
        message: 'Error testing authentication'
      });
    } finally {
      setIsTestingAuth(false);
    }
  };

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-2xl font-bold mb-6">Debug Panel</h1>

      <div className="grid gap-6">
        {/* Backend Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle>Backend Connection</CardTitle>
            <CardDescription>
              Test the connection to the backend API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backendStatus && (
              <Alert variant={backendStatus.success ? "default" : "destructive"} className="mb-4">
                <div className="flex items-center gap-2">
                  {backendStatus.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{backendStatus.success ? 'Success' : 'Error'}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {backendStatus.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleTestBackend} disabled={isTestingBackend}>
              {isTestingBackend ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                'Test Backend Connection'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Authentication Test */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>
              Test login with admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authStatus && (
              <Alert variant={authStatus.success ? "default" : "destructive"} className="mb-4">
                <div className="flex items-center gap-2">
                  {authStatus.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{authStatus.success ? 'Authentication Successful' : 'Authentication Failed'}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {authStatus.message}
                  {authStatus.success && authStatus.token && (
                    <div className="mt-2">
                      <strong>Token:</strong>{' '}
                      <span className="text-xs break-all">{authStatus.token.substring(0, 30)}...</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleTestAuth} disabled={isTestingAuth}>
              {isTestingAuth ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                'Test Authentication'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
            <CardDescription>
              Information about the current environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>API URL:</strong> http://localhost:3000/api/v1
              </div>
              <div>
                <strong>Auth Endpoint:</strong> /auth/login
              </div>
              <div>
                <strong>Users Endpoint:</strong> /users
              </div>
              <div>
                <strong>Customers Endpoint:</strong> /customers
              </div>
              <div>
                <strong>Cars Endpoint:</strong> /cars
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPanel; 