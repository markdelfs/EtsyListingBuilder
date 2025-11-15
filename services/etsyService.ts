
import {
  ETSY_CLIENT_ID,
  ETSY_AUTH_URL,
  ETSY_SCOPES,
  REDIRECT_URI,
  ETSY_TOKEN_URL,
  ETSY_API_BASE_URL,
} from '../constants';
import type { ListingFormData, EtsyApiError, CreateListingResponse, UserInfo } from '../types';

// --- OAuth 2.0 PKCE Flow ---

/**
 * Generates a cryptographically random string for the PKCE code verifier.
 * @returns {string} The code verifier.
 */
const generateCodeVerifier = (): string => {
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Hashes the code verifier to create the code challenge.
 * @param {string} verifier - The code verifier string.
 * @returns {Promise<string>} The resulting code challenge.
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Initiates the OAuth login process by redirecting the user to Etsy.
 */
export const redirectToEtsyAuth = async (): Promise<void> => {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem('etsy_code_verifier', verifier);

  const state = Math.random().toString(36).substring(7);
  sessionStorage.setItem('etsy_oauth_state', state);

  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ETSY_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: ETSY_SCOPES,
    state: state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${ETSY_AUTH_URL}?${params.toString()}`;
};

/**
 * Exchanges the authorization code received from Etsy for an access token.
 * @param {string} code - The authorization code from the redirect URL.
 * @returns {Promise<string>} The access token.
 */
export const exchangeCodeForToken = async (code: string): Promise<string> => {
  const verifier = sessionStorage.getItem('etsy_code_verifier');
  if (!verifier) {
    throw new Error('Code verifier not found in session storage.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: ETSY_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code: code,
    code_verifier: verifier,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });

  if (!response.ok) {
    // Attempt to parse error, but fallback if it's not JSON (e.g., network error)
    try {
        const errorData: EtsyApiError = await response.json();
        throw new Error(`Failed to fetch access token: ${errorData.error || response.statusText}`);
    } catch (e) {
        throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('API response did not include an access_token.');
  }
  
  sessionStorage.removeItem('etsy_code_verifier');
  return data.access_token;
};


// --- API Helper ---

/**
 * A wrapper around the fetch API to make authenticated requests to the Etsy API.
 * @param {string} endpoint - The API endpoint to call (e.g., '/application/users/me').
 * @param {RequestInit} options - Standard fetch options.
 * @param {string} accessToken - The user's access token.
 * @returns {Promise<T>} The JSON response from the API.
 */
const etsyApiFetch = async <T,>(endpoint: string, options: RequestInit, accessToken: string): Promise<T> => {
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${accessToken}`);
  headers.set('x-api-key', ETSY_CLIENT_ID);
  
  // Do not set Content-Type for multipart/form-data, browser does it better
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${ETSY_API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Etsy API Error: ${response.status} ${response.statusText}`;
    try {
        const errorBody = await response.json();
        errorMsg += ` - ${errorBody.error || JSON.stringify(errorBody)}`;
    } catch (e) {
        // Ignore if response is not JSON
    }
    throw new Error(errorMsg);
  }
  
  if (response.status === 204) { // No Content
      return null as T;
  }

  return response.json() as Promise<T>;
};

// --- API Service Functions ---

/**
 * Fetches the current user's information, including their shop_id.
 * @param {string} accessToken - The user's access token.
 * @returns {Promise<UserInfo>} The user's info.
 */
export const getMe = async (accessToken: string): Promise<UserInfo> => {
    return etsyApiFetch<UserInfo>('/application/users/me', { method: 'GET' }, accessToken);
};

/**
 * Creates a new draft listing in the specified shop.
 * @param {number} shopId - The ID of the shop to create the listing in.
 * @param {ListingFormData} formData - The data from the listing form.
 * @param {string} accessToken - The user's access token.
 * @returns {Promise<CreateListingResponse>} The response containing the new listing's ID.
 */
export const createListing = async (shopId: number, formData: ListingFormData, accessToken: string): Promise<CreateListingResponse> => {
    const sku = formData.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    const body = {
        title: formData.title,
        description: formData.description,
        quantity: 999,
        price: 3.00,
        who_made: 'i_did',
        when_made: '2020_2029', // Corresponds to the current decade
        taxonomy_id: 2078, // Digital Prints
        shipping_profile_id: null, // Not needed for digital items
        shop_section_id: 41824610,
        is_supply: false,
        type: 'digital',
        state: 'draft',
        tags: formData.tags,
        sku: [sku],
        primary_color_id: formData.primaryColorId !== '0' ? parseInt(formData.primaryColorId, 10) : null,
        secondary_color_id: formData.secondaryColorId !== '0' ? parseInt(formData.secondaryColorId, 10) : null,
        occasion_id: null, // Occasions and Holidays are different fields.
        holiday_id: formData.holidayId !== '0' ? parseInt(formData.holidayId, 10) : null,
        is_personalizable: false,
    };
    
    return etsyApiFetch<CreateListingResponse>(
        `/application/shops/${shopId}/listings`, 
        { method: 'POST', body: JSON.stringify(body) }, 
        accessToken
    );
};

/**
 * Uploads an image to an existing listing.
 * @param {number} listingId - The ID of the listing.
 * @param {File} imageFile - The image file to upload.
 * @param {number} rank - The display order of the image (1-10).
 * @param {string} accessToken - The user's access token.
 */
export const uploadImage = async (listingId: number, imageFile: File, rank: number, accessToken: string): Promise<void> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('rank', rank.toString());
    
    // This endpoint doesn't return a JSON body on success (204 No Content or 201 Created)
    await etsyApiFetch<void>(
        `/application/listings/${listingId}/images`,
        { method: 'POST', body: formData },
        accessToken
    );
};

/**
 * Uploads a digital product file to an existing listing.
 * @param {number} listingId - The ID of the listing.
 * @param {File} productFile - The ZIP file to upload.
 * @param {string} accessToken - The user's access token.
 */
export const uploadFile = async (listingId: number, productFile: File, accessToken: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', productFile);
    formData.append('name', productFile.name);
    
    await etsyApiFetch<void>(
        `/application/listings/${listingId}/files`,
        { method: 'POST', body: formData },
        accessToken
    );
};
