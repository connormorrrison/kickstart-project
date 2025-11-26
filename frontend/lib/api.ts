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

    const formData = new URLSearchParams();
    formData.append('username', data.email); // OAuth2 expects 'username' field
    formData.append('password', data.password);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
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
