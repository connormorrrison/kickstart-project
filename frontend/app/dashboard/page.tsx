'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoveLeft, Search } from 'lucide-react';
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

      {/* Top Right - User Menu */}
      <div className="absolute top-5 right-5 z-10 flex flex-col gap-3 items-end">
        <UserMenu onSignOut={signOut} showDashboard={false} />
      </div>

      {/* Welcome Section */}
      <div className="pt-24 px-8">
        <div>
          <h1 className="text-3xl font-normal text-gray-900">
            Welcome back, {user.first_name}
          </h1>
          <p className="mt-1 text-base font-normal text-gray-500">
            Manage your current bookings and current listings.
          </p>
        </div>

        {/* Stats Tiles */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <Tile className="p-6">
            <h2 className="text-base font-normal text-gray-500">Total Bookings</h2>
            <p className="mt-2 text-3xl font-normal text-gray-900">{totalBookings}</p>
          </Tile>
          <Tile className="p-6">
            <h2 className="text-base font-normal text-gray-500">Active Listings</h2>
            <p className="mt-2 text-3xl font-normal text-gray-900">{activeListingsCount}</p>
          </Tile>
        </div>

        {/* Your Bookings Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-normal text-gray-900">Your Bookings</h2>
            <Button1 onClick={() => router.push('/search')}>
              <Search size={18} className="mr-2" />
              Find Parking
            </Button1>
          </div>
          
          <div className="grid gap-4">
            {/* Using Tile for empty state */}
            <Tile className="p-8 flex justify-center items-center">
              <p className="text-base text-gray-500">You have no active bookings.</p>
            </Tile>
          </div>
        </div>

        {/* Your Listings Section */}
        <div className="mt-12 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-normal text-gray-900">Your Listings</h2>
            <Button1 onClick={() => alert('Add listing modal coming soon!')}>
              <Plus size={18} className="mr-2" />
              Add Listing
            </Button1>
          </div>
          
          <div className="grid gap-4">
            {listings.length === 0 ? (
              // Using Tile for empty state
              <Tile className="p-8 flex justify-center items-center">
                <p className="text-base text-gray-500">You haven't listed any spots yet.</p>
              </Tile>
            ) : (
              // Listings sorted by recently added (descending ID)
              listings
                .sort((a, b) => b.id - a.id)
                .map((listing) => (
                  <Tile key={listing.id} className="p-4">
                     <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{listing.address}</p>
                          <p className="text-sm text-gray-500 mt-1">${listing.price}/hr</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-sm ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {listing.status}
                        </span>
                     </div>
                  </Tile>
                ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}