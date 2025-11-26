import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { authApi, SignUpData, SignInData, User } from '@/lib/api';
import { setToken, removeToken, getToken } from '@/lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = getToken();
    if (token && !user) {
      // Try to fetch user data
      authApi.getCurrentUser()
        .then(setUser)
        .catch(() => {
          // Token is invalid, remove it
          removeToken();
        });
    }
  }, [user, setUser]);

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const signOut = () => {
    removeToken();
    setUser(null);
    router.push('/');
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
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
      setIsLoading(false);
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
