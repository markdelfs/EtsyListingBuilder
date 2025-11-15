
import { useState, useCallback, useEffect } from 'react';
import { redirectToEtsyAuth, exchangeCodeForToken } from '../services/etsyService';

const TOKEN_STORAGE_KEY = 'etsy_access_token';

/**
 * Custom hook for managing Etsy authentication.
 * Provides access token, loading/error states, and functions for login/logout.
 */
export const useEtsyAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // On initial load, try to get the token from localStorage
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedToken) {
        setAccessToken(storedToken);
      }
    } catch (e) {
      console.error('Failed to access localStorage:', e);
      setError('Could not access storage. Please enable cookies/localStorage.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiates the login process by redirecting to Etsy.
   */
  const login = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await redirectToEtsyAuth();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during login.';
      console.error(e);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  /**
   * Logs the user out by clearing the access token from state and storage.
   */
  const logout = useCallback(() => {
    setAccessToken(null);
    // Do not clear the error here, so that if logout is called from a failure handler,
    // the error message remains visible to the user.
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove token from localStorage:', e);
    }
    // Optional: could also redirect to a logged-out page
  }, []);

  /**
   * Handles the OAuth callback from Etsy, exchanging the code for a token.
   */
  const handleCallback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      
      const storedState = sessionStorage.getItem('etsy_oauth_state');
      if (!state || state !== storedState) {
        throw new Error('Invalid state parameter received. Possible CSRF attack.');
      }
      sessionStorage.removeItem('etsy_oauth_state'); // Clean up state

      if (code) {
        const token = await exchangeCodeForToken(code);
        setAccessToken(token);
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
      } else {
          const errorParam = params.get('error_description');
          throw new Error(errorParam || 'No authorization code found in URL.');
      }
    } catch (e) {
      let errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during authentication.';
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Failed to fetch. This may be due to a network issue or a browser security policy (CORS). Please check your internet connection and disable any ad-blockers, then try again.';
      }
      console.error(e);
      setError(errorMessage);
      // Clear any potentially stored bad token
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  return { accessToken, isLoading, error, login, logout, handleCallback };
};
