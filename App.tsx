
import React, { useEffect, useState } from 'react';
import Login from './components/Login';
import ListingForm from './components/ListingForm';
import { useEtsyAuth } from './hooks/useEtsyAuth';
import { Instructions } from './components/Instructions';

/**
 * The main App component.
 * It acts as the root of the application, handling authentication state and rendering
 * the appropriate view (Login, ListingForm, or handling the OAuth callback).
 */
export default function App(): React.ReactElement {
  const {
    accessToken,
    login,
    logout,
    handleCallback,
    isLoading,
    error,
  } = useEtsyAuth();
  
  const [isHandlingCallback, setIsHandlingCallback] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      // Check if the current URL is an OAuth redirect
      const params = new URLSearchParams(window.location.search);
      if (params.has('code') || params.has('error')) {
        await handleCallback();
        // Clean the URL after handling the callback
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      setIsHandlingCallback(false);
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderContent = () => {
    if (isLoading || isHandlingCallback) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      );
    }

    if (error) {
        const isRedirectError = error.toLowerCase().includes('redirect') && error.toLowerCase().includes('permitted');
        
        return (
          <div className="text-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Authentication Error!</strong>
              <p className="mt-1">{error}</p>
            </div>
            
            <button 
              onClick={logout} 
              className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Clear Session and Retry Login
            </button>
  
            {isRedirectError && (
              <>
                <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 text-left max-w-3xl mx-auto" role="alert">
                  <p className="font-bold">How to fix this common issue:</p>
                  <p>This error means the "Callback URL" in your Etsy Developer Console doesn't match this app's address. Please follow the setup instructions below carefully.</p>
                </div>
                <Instructions />
              </>
            )}
          </div>
        );
      }
    
    if (accessToken) {
      return <ListingForm onLogout={logout} />;
    }

    return (
        <>
            <Login onLogin={login} />
            <Instructions />
        </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-orange-600">Etsy Listing Builder</h1>
          {accessToken && (
            <button
              onClick={logout}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
          <p>Built for efficiency. Connect your Etsy store to get started.</p>
      </footer>
    </div>
  );
}
