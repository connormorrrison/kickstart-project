import { getToken } from './auth';
import { mockAuthApi } from './mock-api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  is_active: boolean;
}

export interface SignUpData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

// Parking Spot Types
export interface AvailabilityInterval {
  day: string;
  start_time: string;
  end_time: string;
}

export interface ParkingSpot {
  id: string;
  host_id: number;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  lat: number;
  lng: number;
  price_per_hour: number;
  created_at: string;
  is_active: boolean;
  availability_intervals?: AvailabilityInterval[];
}

export interface ParkingSpotCreate {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  lat: number;
  lng: number;
  price_per_hour: number;
  availability_intervals: AvailabilityInterval[];
}

// Booking Types
export interface Booking {
  id: string;
  spot_id: string;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  created_at: string;
}

export interface BookingCreate {
  spot_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
}

// Helper function to handle API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'An error occurred');
  }
  return response.json();
};

// Auth API calls
export const authApi = {
  // Sign up
  signUp: async (data: SignUpData): Promise<User> => {
    if (USE_MOCK_API) {
      return mockAuthApi.signUp(data);
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Sign in
  signIn: async (data: SignInData): Promise<TokenResponse> => {
    if (USE_MOCK_API) {
      return mockAuthApi.signIn(data);
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    if (USE_MOCK_API) {
      return mockAuthApi.getCurrentUser(token);
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Change password
  changePassword: async (data: PasswordChangeData): Promise<{ message: string }> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete account
  deleteAccount: async (): Promise<{ message: string }> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};

// Parking Spots API calls
export const spotsApi = {
  // List all parking spots with optional filters
  list: async (filters?: {
    city?: string;
    min_price?: number;
    max_price?: number;
    is_active?: boolean;
  }): Promise<ParkingSpot[]> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.min_price !== undefined) params.append('min_price', filters.min_price.toString());
    if (filters?.max_price !== undefined) params.append('max_price', filters.max_price.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());

    const url = `${API_URL}/spots${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Get a specific parking spot by ID
  get: async (spotId: string): Promise<ParkingSpot> => {
    const response = await fetch(`${API_URL}/spots/${spotId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  // Create a new parking spot (requires authentication)
  create: async (data: ParkingSpotCreate): Promise<ParkingSpot> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/spots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Bookings API calls
export const bookingsApi = {
  // List all bookings for the current user
  list: async (statusFilter?: string): Promise<Booking[]> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);

    const url = `${API_URL}/bookings${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Get a specific booking by ID
  get: async (bookingId: string): Promise<Booking> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Create a new booking
  create: async (data: BookingCreate): Promise<Booking> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Cancel a booking
  cancel: async (bookingId: string): Promise<{ success: boolean; message: string }> => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
};
