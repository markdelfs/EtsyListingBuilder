/**
 * IMPORTANT: Replace this with your own Etsy App's Keystring (Client ID).
 * You can find this in your Etsy Developer Console.
 */
export const ETSY_CLIENT_ID = 'nx91avyv8obewqab00c4r0pl';

/**
 * The Redirect URI must match EXACTLY one of the URLs you've configured
 * in your Etsy App's settings under "Callback URLs".
 * 
 * For a single-page app like this, the redirect should be to the root of the application.
 * The app's code will handle the `?code=` parameter on the main page.
 * 
 * YOU MUST update your Etsy Developer Console to use this URL.
 * 
 * Example for local development (assuming your app runs on port 5173):
 * // export const REDIRECT_URI = 'http://localhost:5173/';
 */
export const REDIRECT_URI = 'https://etsy-listing-builder-7053051000.us-west1.run.app/';

/**
 * These are the permissions your app is requesting from the user.
 * listings_w: Write access to listings
 * listings_r: Read access to listings
 * shops_r: Read access to shop information
 * email_r: Read user's email address (often required)
 */
export const ETSY_SCOPES = [
  'listings_w',
  'listings_r',
  'shops_r',
  'email_r',
].join(' ');

// Base URL for all Etsy API v3 requests
export const ETSY_API_BASE_URL = 'https://api.etsy.com/v3';

// Etsy's authorization endpoint
export const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect';

// Etsy's token exchange endpoint
export const ETSY_TOKEN_URL = `${ETSY_API_BASE_URL}/public/oauth/token`;


// Mappings for UI dropdowns to Etsy-specific IDs
// A more robust app might fetch these from the API, but constants are fine for this use case.

export const ETSY_COLORS = [
    { name: 'Black', id: '1' },
    { name: 'Blue', id: '2' },
    { name: 'Brown', id: '12' },
    { name: 'Clear', id: '13' },
    { name: 'Gray', id: '4' },
    { name: 'Green', id: '5' },
    { name: 'Orange', id: '6' },
    { name: 'Purple', id: '8' },
    { name: 'Red', id: '9' },
    { name: 'White', id: '10' },
    { name: 'Yellow', id: '11' },
];

export const ETSY_HOLIDAYS = [
    { name: 'Christmas', id: '1' },
    { name: 'Hanukkah', id: '7' },
    { name: 'Halloween', id: '8' },
    { name: 'Thanksgiving', id: '13' },
    { name: 'Easter', id: '2' },
    { name: 'St Patricks Day', id: '12' },
    { name: 'Valentines Day', id: '14' },
    { name: 'New Years', id: '10' },
    { name: 'Mothers Day', id: '9' },
    { name: 'Fathers Day', id: '3' },
    { name: 'Fourth of July', id: '4' },
    { name: 'None', id: '0' },
];