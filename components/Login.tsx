
import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

/**
 * Component responsible for displaying the login button and initiating the Etsy OAuth flow.
 */
export default function Login({ onLogin }: LoginProps): React.ReactElement {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Connect Your Etsy Account</h2>
      <p className="mb-6 text-gray-500 max-w-md mx-auto">
        To start creating listings, you need to securely connect your Etsy account.
        This will allow the app to create draft listings on your behalf.
      </p>
      <button
        onClick={onLogin}
        className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105"
      >
        Login with Etsy
      </button>
    </div>
  );
}
