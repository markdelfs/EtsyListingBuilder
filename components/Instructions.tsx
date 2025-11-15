import React from 'react';
import { ETSY_CLIENT_ID, REDIRECT_URI } from '../constants';

/**
 * A component to display setup and usage instructions for the user.
 * This is particularly helpful for first-time setup.
 */
export const Instructions: React.FC = () => {
  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-4">Setup Instructions</h2>
      
      <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500">
          <h3 className="text-lg font-bold text-orange-800">Two Common Problems & Solutions</h3>
          <p className="mt-2 text-orange-700">
              1. <strong>"Redirect URL is not permitted" Error:</strong> This means the Callback URL in your Etsy settings doesn't <strong className="underline">exactly match</strong> the URL shown in Step 1 below.
          </p>
          <p className="mt-2 text-orange-700">
              2. <strong>"Cannot GET /callback" Error:</strong> This means your Callback URL in Etsy has an extra `/callback` at the end. You must remove it. Follow Step 1 carefully.
          </p>
      </div>

      <div className="space-y-6 text-gray-600">
        <div>
          <h3 className="font-semibold text-gray-700">1. Configure Your Etsy App's Callback URL</h3>
          <p>
            You must configure your application in the{' '}
            <a href="https://www.etsy.com/developers/your-apps" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              Etsy Developer Console
            </a>.
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 bg-gray-50 p-3 rounded">
            <li>Navigate to your app's dashboard.</li>
            <li>Under the <strong>OAuth</strong> section, find "Callback URLs".</li>
            <li>
              Add the following URL to the list. It must be an <strong className="text-red-600">exact match</strong>, ending in a forward slash `/`.
              <div className="mt-1 p-2 bg-gray-200 text-gray-800 rounded font-mono text-sm break-all">
                {REDIRECT_URI}
              </div>
            </li>
            <li className="mt-2 text-sm text-gray-800">
                <strong>Important:</strong> Do not add <strong>/callback</strong> to the end. Since this is a single-page web app, the redirect must point to the root URL.
            </li>
             <li className="mt-2">
                <strong>For Development:</strong> If running locally, you must add your local URL (e.g. `http://localhost:5173/`).
            </li>
            <li>
                <strong>For Production:</strong> When you deploy this app, you must add your live production URL to the list of Callback URLs (e.g., `https://your-app.vercel.app/`).
            </li>
          </ul>
        </div>

        <div>
            <h3 className="font-semibold text-gray-700">2. Verify Your Client ID</h3>
            <p>This application is currently using the following Client ID (Keystring):</p>
            <div className="mt-1 p-2 bg-gray-200 text-gray-800 rounded font-mono text-sm break-all">
                {ETSY_CLIENT_ID}
            </div>
            <p className="mt-1 text-sm">If this is not correct, you must update it in the `src/constants.ts` file in the source code.</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700">3. How to Run Locally</h3>
          <p>To run this project on your own machine:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Download or clone the source code.</li>
            <li>Open a terminal in the project directory.</li>
            <li>Run `npm install` to install dependencies.</li>
            <li>Run `npm run dev` to start the local development server.</li>
            <li>Open your browser to the URL provided by the dev server (usually `http://localhost:5173`).</li>
          </ol>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700">4. How to Deploy</h3>
          <p>
            You can deploy this React application to static hosting providers like Vercel, Netlify, or Firebase Hosting.
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Push your code to a GitHub/GitLab repository.</li>
            <li>Connect your repository to a service like Vercel.</li>
            <li>Configure the build settings (usually `npm run build` for the build command and `dist` for the output directory).</li>
            <li>
              <strong>Crucially:</strong> Remember to add your Vercel/Netlify production URL to your Etsy App's "Callback URLs" list (see Step 1).
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};