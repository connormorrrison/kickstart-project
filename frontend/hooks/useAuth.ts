import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authApi, SignUpData, SignInData, User } from '@/lib/api';
import { setToken, removeToken, getToken } from '@/lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const { user, setUser, isLoading, setLoading } = useStore();
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getToken();
    console.log('AuthProvider: Checking token...', token ? 'Token found' : 'No token');

    if (token && !user) {
      console.log('AuthProvider: Fetching user...');
      setLoading(true);
      // Try to fetch user data
      authApi.getCurrentUser()
        .then((userData) => {
          console.log('AuthProvider: User fetched successfully', userData);
          setUser(userData);
        })
        .catch((err) => {
          console.error('AuthProvider: Failed to fetch user', err);
          // Token is invalid, remove it
          removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user, setUser, setLoading]);

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    setError(null);
    try {
      // Register the user
      const newUser = await authApi.signUp(data);

      // Automatically sign in after registration
      const tokenResponse = await authApi.signIn({
        email: data.email,
        password: data.password,
      });

      setToken(tokenResponse.access_token);
      setUser(newUser);

      // Redirect to home
      router.push('/');

      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setLoading(true);
    setError(null);
    try {
      // Get token
      const tokenResponse = await authApi.signIn(data);
      setToken(tokenResponse.access_token);

      // Get user data
      const userData = await authApi.getCurrentUser();
      setUser(userData);

      // Redirect to home
      router.push('/');

      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    removeToken();
    setUser(null);
    router.push('/');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    changePassword,
  };
};
