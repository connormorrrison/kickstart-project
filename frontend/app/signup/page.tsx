'use client';
import * as React from 'react';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import Title2 from '@/components/Title2';
import CustomInput from '@/components/CustomInput';
import PasswordInput from '@/components/PasswordInput';
import MapComponent from '@/components/MapComponent';
import { PopInOutEffect } from '@/components/PopInOutEffect';
import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isVisible, setIsVisible] = React.useState(false);
  const [validationError, setValidationError] = React.useState('');
  const { spots } = useStore();
  const { signUp, isLoading, error } = require('@/hooks/useAuth').useAuth();

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  // Memoize the map component so it doesn't re-render on every keystroke
  const mapBackground = React.useMemo(() => (
    <div className="absolute inset-0 pointer-events-none">
      <MapComponent
        spots={spots}
        onSpotSelect={() => {}}
        selectedSpot={null}
      />
    </div>
  ), [spots]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return;
    }

    try {
      await signUp({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Sign up error:', err);
    }
  };

  return (
    <main className="min-h-screen w-full relative">
      {/* Background Map - Non-interactive */}
      {mapBackground}

      {/* Blur Overlay */}
      <div className="absolute inset-0 backdrop-blur-lg bg-white/10 pointer-events-none" />

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center">
        <div className="absolute top-5 left-5">
          <Button2 onClick={() => router.push('/')}>
            <MoveLeft size={18} className="mr-2" />
            Home
          </Button2>
        </div>

        <PopInOutEffect isVisible={isVisible}>
          <Tile className="w-[400px] p-[24px] shadow-xl">
          <div className="flex flex-col gap-[24px]">
            <h1 className="text-2xl font-medium text-center">Sign Up</h1>

            <form onSubmit={handleSignUp} className="flex flex-col gap-[24px]">
              <div>
                <Title2>First Name</Title2>
                <CustomInput
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div>
                <Title2>Last Name</Title2>
                <CustomInput
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div>
                <Title2>Email</Title2>
                <CustomInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Title2>Password</Title2>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div>
                <Title2>Confirm Password</Title2>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              {(validationError || error) && (
                <div className="text-sm text-red-600 text-center">
                  {validationError || error}
                </div>
              )}

              <Button1 type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button1>
            </form>

            <div className="text-center text-base text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/signin')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </button>
            </div>
          </div>
        </Tile>
      </PopInOutEffect>
      </div>
    </main>
  );
}
