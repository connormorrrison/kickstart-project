'use client';
import * as React from 'react';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import Title2 from '@/components/Title2';
import MapComponent from '@/components/MapComponent';
import { PopInOutEffect } from '@/components/PopInOutEffect';
import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isVisible, setIsVisible] = React.useState(false);
  const { spots } = useStore();

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual sign in logic
    console.log('Sign in with:', { email, password });
  };

  return (
    <main className="min-h-screen w-full relative">
      {/* Background Map - Non-interactive */}
      <div className="absolute inset-0 pointer-events-none">
        <MapComponent
          spots={spots}
          onSpotSelect={() => {}}
          selectedSpot={null}
        />
      </div>

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
            <h1 className="text-2xl font-medium text-center">Sign In</h1>

            <form onSubmit={handleSignIn} className="flex flex-col gap-[24px]">
              <div>
                <Title2>Email</Title2>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              <div>
                <Title2>Password</Title2>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>

              <Button1 type="submit" className="w-full">Sign In</Button1>
            </form>

            <div className="text-center text-base text-gray-600">
              Don't have an account yet?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up here
              </button>
            </div>
          </div>
        </Tile>
      </PopInOutEffect>
      </div>
    </main>
  );
}