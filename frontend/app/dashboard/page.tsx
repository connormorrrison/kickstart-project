'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Home, Search, Calendar, Clock, MapPin } from 'lucide-react';
import { useStore } from '@/lib/store';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import UserMenu from '@/components/UserMenu';
import AddListingModal from '@/components/AddListingModal';
import { PopInOutEffect } from '@/components/PopInOutEffect';
import { bookingsApi, spotsApi, Booking, ParkingSpot } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useStore();
  const { signOut } = require('@/hooks/useAuth').useAuth();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [listings, setListings] = React.useState<ParkingSpot[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAddListingModalOpen, setIsAddListingModalOpen] = React.useState(false);

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  // Fetch bookings and listings
  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Fetch user's bookings
        const userBookings = await bookingsApi.list();
        setBookings(userBookings);

        // Fetch all spots and filter by host_id
        const allSpots = await spotsApi.list();
        const userListings = allSpots.filter(spot => spot.host_id === user.id);
        setListings(userListings);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return null;
  }

  // Calculate stats
  const activeListingsCount = listings.filter(l => l.is_active).length;
  const totalBookings = bookings.length;

  const handleListingAdded = async () => {
    // Refresh listings
    try {
      const allSpots = await spotsApi.list();
      const userListings = allSpots.filter(spot => spot.host_id === user.id);
      setListings(userListings);
    } catch (error) {
      console.error('Failed to refresh listings:', error);
    }
    setIsAddListingModalOpen(false);
  };

  return (
    <main className="min-h-screen w-full bg-gray-50 relative">
      {/* Top Left - Home Button (Fixed) */}
      <div className="fixed top-5 left-5 z-20">
        <Button2 onClick={() => router.push('/')}>
          <Home size={18} className="mr-2" />
          Home
        </Button2>
      </div>

      {/* Top Right - User Menu (Fixed) */}
      <div className="fixed top-5 right-5 z-20 flex flex-col gap-3 items-end">
        <UserMenu onSignOut={signOut} showDashboard={false} />
      </div>

      {/* Welcome Section */}
      <div className="pt-24 px-8 pb-12">
        <div>
          <h1 className="text-3xl font-normal text-gray-900">
            Welcome back, {user.first_name}
          </h1>
          <p className="mt-1 text-base font-normal text-gray-500">
            Manage your current bookings and current listings
          </p>
        </div>

        {/* Stats Tiles */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <PopInOutEffect isVisible={true}>
            <Tile className="p-6">
              <h2 className="text-base font-normal text-gray-500">Total Bookings</h2>
              <p className="mt-2 text-3xl font-normal text-gray-900">{totalBookings}</p>
            </Tile>
          </PopInOutEffect>
          <PopInOutEffect isVisible={true}>
            <Tile className="p-6">
              <h2 className="text-base font-normal text-gray-500">Active Listings</h2>
              <p className="mt-2 text-3xl font-normal text-gray-900">{activeListingsCount}</p>
            </Tile>
          </PopInOutEffect>
        </div>

        {/* Your Bookings Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-normal text-gray-900">Your Bookings</h2>
            <Button1 onClick={() => router.push('/')}>
              <Search size={18} className="mr-2" />
              Find Parking
            </Button1>
          </div>

          <div className="grid gap-4">
            {bookings.length === 0 ? (
              <PopInOutEffect isVisible={true}>
                <Tile className="p-8 flex justify-center items-center">
                  <p className="text-base text-gray-500">You have no active bookings</p>
                </Tile>
              </PopInOutEffect>
            ) : (
              bookings.map((booking) => (
                <PopInOutEffect key={booking.id} isVisible={true}>
                  <Tile className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar size={18} className="text-gray-500" />
                          <span className="font-normal text-gray-900">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <Clock size={18} className="text-gray-500" />
                          <span className="font-normal text-gray-900">
                            {booking.start_time} - {booking.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={18} className="text-gray-500" />
                          <span className="font-normal text-gray-500 text-sm">
                            Spot ID: {booking.spot_id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded text-sm font-normal ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-lg font-normal text-gray-900">
                          ${booking.total_price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Tile>
                </PopInOutEffect>
              ))
            )}
          </div>
        </div>

        {/* Your Listings Section */}
        <div className="mt-12 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-normal text-gray-900">Your Listings</h2>
            <Button1 onClick={() => setIsAddListingModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Listing
            </Button1>
          </div>

          <div className="grid gap-4">
            {listings.length === 0 ? (
              <PopInOutEffect isVisible={true}>
                <Tile className="p-8 flex justify-center items-center">
                  <p className="text-base text-gray-500">You haven't listed any spots yet</p>
                </Tile>
              </PopInOutEffect>
            ) : (
              listings.map((listing) => (
                <PopInOutEffect key={listing.id} isVisible={true}>
                  <Tile className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-normal text-lg text-gray-900 mb-2">
                          {listing.street}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <MapPin size={16} />
                          <span>{listing.city}, {listing.province}</span>
                        </div>
                        <p className="text-base text-gray-900">
                          ${listing.price_per_hour.toFixed(2)}/hr
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-normal ${
                        listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </Tile>
                </PopInOutEffect>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Listing Modal */}
      <AddListingModal 
        isOpen={isAddListingModalOpen} 
        onClose={() => setIsAddListingModalOpen(false)}
        onListingAdded={handleListingAdded}
      />
    </main>
  );
}