'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoveLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import UserMenu from '@/components/UserMenu';

interface TimeSlot {
  date: string;
  start: number;
  end: number;
}

interface Listing {
  id: number;
  address: string;
  description?: string;
  price: number;
  status: string;
  image: string | null;
  bookings: number;
  rating: number | null;
  lat: number;
  lng: number;
  timeSlots: TimeSlot[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useStore();
  const { signOut } = require('@/hooks/useAuth').useAuth();
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // Calculate stats
  const activeListingsCount = listings.filter(l => l.status === 'active').length;
  const totalBookings = listings.reduce((sum, listing) => sum + listing.bookings, 0);
  const totalTimeSlots = listings.reduce((sum, listing) => sum + listing.timeSlots.length, 0);

  return (
    <main className="min-h-screen w-full bg-gray-50 relative">
      {/* Top Left - Home Button */}
      <div className="absolute top-5 left-5 z-10">
        <Button2 onClick={() => router.push('/')}>
          <MoveLeft size={18} className="mr-2" />
          Home
        </Button2>
      </div>

      {/* Top Right - User Menu and Add Listing */}
      <div className="absolute top-5 right-5 z-10 flex gap-6 items-start">
        <Button1 onClick={() => alert('Add listing modal coming soon!')}>
          <Plus size={18} className="mr-2" />
          Add Listing
        </Button1>
        <UserMenu onSignOut={signOut} showDashboard={false} />
      </div>
    </main>
  );
}
