// Token management
export const TOKEN_KEY = 'access_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Za-z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Name validation
export const validateName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Name cannot be empty';
  }
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(name)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  return null;
};

// Email validation (basic, browser will do more)
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email cannot be empty';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format';
  }
  return null;
};
