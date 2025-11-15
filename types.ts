
// Represents the structure of the main listing creation form
export interface ListingFormData {
  title: string;
  description: string;
  primaryColorId: string;
  secondaryColorId: string;
  holidayId: string;
  tags: string[];
  image1: File | null;
  image2: File | null;
  productFile: File | null;
}

// Interface for Etsy API error responses
export interface EtsyApiError {
  error: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Represents the response from creating a new listing
export interface CreateListingResponse {
  listing_id: number;
  title: string;
  state: string;
  // Add other fields as needed
}

// Represents the response when fetching user info, including shop_id
export interface UserInfo {
  user_id: number;
  shop_id: number;
}
