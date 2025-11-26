// Mock API for testing without a real backend
import { User, SignUpData, SignInData, TokenResponse } from './api';

const MOCK_USERS: Array<User & { password: string }> = [];
let nextId = 1;

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthApi = {
  signUp: async (data: SignUpData): Promise<User> => {
    await delay(500);

    // Check if email already exists
    if (MOCK_USERS.find(u => u.email === data.email)) {
      throw new Error('Email already exists');
    }

    const newUser: User & { password: string } = {
      id: nextId++,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    MOCK_USERS.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  signIn: async (data: SignInData): Promise<TokenResponse> => {
    await delay(500);

    const user = MOCK_USERS.find(u => u.email === data.email && u.password === data.password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Generate a fake token
    const token = btoa(`${user.email}:${Date.now()}`);

    return {
      access_token: token,
      token_type: 'bearer',
    };
  },

  getCurrentUser: async (token: string): Promise<User> => {
    await delay(300);

    // Decode the fake token to get email
    try {
      const decoded = atob(token);
      const email = decoded.split(':')[0];

      const user = MOCK_USERS.find(u => u.email === email);

      if (!user) {
        throw new Error('User not found');
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch {
      throw new Error('Invalid token');
    }
  },
};
