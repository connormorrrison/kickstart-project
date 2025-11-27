'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Home, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import UserMenu from '@/components/UserMenu';
import AddListingModal from '@/components/AddListingModal';
import { PopInOutEffect } from '@/components/PopInOutEffect';
import { bookingsApi, spotsApi, Booking, ParkingSpot } from '@/lib/api';

// --- Helpers ---

// Google Static Maps URL
const getStaticMapUrl = (lat: number, lng: number) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return '';
  // Size 400x200 matches the tile image aspect ratio
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&scale=2&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
};

// Convert "17:00:00" to "5:00 PM"
const formatTime = (timeStr: string) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Sorter for days of the week
const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading } = useStore();
  const { signOut } = useAuth();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [listings, setListings] = React.useState<ParkingSpot[]>([]);
  const [bookingSpots, setBookingSpots] = React.useState<Map<string, ParkingSpot>>(new Map());
  const [isAddListingModalOpen, setIsAddListingModalOpen] = React.useState(false);

  React.useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) return;

    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchData = async () => {
      try {
        const userBookings = await bookingsApi.list();
        setBookings(userBookings);

        const allSpots = await spotsApi.list();
        // Filter spots to show only those owned by the current user
        const userListings = allSpots.filter(spot => spot.host_id === user.id);
        setListings(userListings);

        const spotMap = new Map<string, ParkingSpot>();
        for (const booking of userBookings) {
          try {
            const spot = await spotsApi.get(booking.spot_id);
            spotMap.set(booking.spot_id, spot);
          } catch (error) {
            console.error(`Failed to fetch spot ${booking.spot_id}:`, error);
          }
        }
        setBookingSpots(spotMap);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, [user, router]);

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </main>
    );
  }

  if (!user) return null;

  const activeListingsCount = listings.filter(l => l.is_active).length;
  const totalBookings = bookings.length;

  const handleListingAdded = async () => {
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
      {/* Fixed Header Elements */}
      <div className="fixed top-5 left-5 z-20">
        <Button2 onClick={() => router.push('/')}>
          <Home size={18} className="mr-2" />
          Home
        </Button2>
      </div>

      <div className="fixed top-5 right-5 z-20 flex flex-col gap-3 items-end">
        <UserMenu onSignOut={signOut} showDashboard={false} />
      </div>

      {/* Main Content */}
      <div className="pt-24 px-8 max-w-[1200px] mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-normal text-black">
            Welcome back, {user.first_name}
          </h1>
          <p className="mt-1 text-base font-normal text-gray-500">
            Manage your current bookings and listings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <PopInOutEffect isVisible={true}>
            <Tile className="p-6">
              <h2 className="text-base font-normal text-gray-500">Total Bookings</h2>
              <p className="mt-2 text-xl font-normal text-gray-900">{totalBookings}</p>
            </Tile>
          </PopInOutEffect>
          <PopInOutEffect isVisible={true}>
            <Tile className="p-6">
              <h2 className="text-base font-normal text-gray-500">Active Listings</h2>
              <p className="mt-2 text-xl font-normal text-gray-900">{activeListingsCount}</p>
            </Tile>
          </PopInOutEffect>
        </div>

        {/* Bookings Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-normal text-black">Your Bookings</h2>
            <Button1 onClick={() => router.push('/')}>
              <Search size={18} className="mr-2" />
              Find Parking
            </Button1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.length === 0 ? (
              <PopInOutEffect isVisible={true}>
                <Tile className="p-8 flex justify-center items-center h-full">
                  <p className="text-base font-normal text-gray-500">No active bookings</p>
                </Tile>
              </PopInOutEffect>
            ) : (
              bookings.map((booking) => {
                const spot = bookingSpots.get(booking.spot_id);
                return (
                  <PopInOutEffect key={booking.id} isVisible={true}>
                    <Tile className="overflow-hidden p-0 flex flex-col h-full">
                      {/* Image */}
                      <div className="w-full h-32 bg-gray-200 relative shrink-0">
                        {spot ? (
                          <img
                            src={getStaticMapUrl(spot.lat, spot.lng)}
                            alt="Location"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            Loading...
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-4 flex-1">
                        <div>
                          {/* Consistent mb-1 for title spacing */}
                          <h3 className="text-base font-normal text-gray-500 mb-1">Address</h3>
                          <p className="text-base font-normal text-black">
                            {spot ? `${spot.street}, ${spot.city}, ${spot.province} ${spot.postal_code}, ${spot.country}` : 'Loading...'}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-base font-normal text-gray-500 mb-1">Date & Time</h3>
                          <p className="text-base font-normal text-black">
                            {new Date(booking.booking_date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-base font-normal text-black">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </p>
                        </div>

                        <div className="mt-auto pt-2 flex items-center justify-between">
                          <div>
                            {/* Consistent mb-1 for title spacing (was missing on Total) */}
                            <h3 className="text-base font-normal text-gray-500 mb-1">Total</h3>
                            <p className="text-lg font-normal text-black">${booking.total_price.toFixed(2)}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-base font-normal ${booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </Tile>
                  </PopInOutEffect>
                );
              })
            )}
          </div>
        </div>

        {/* Listings Section */}
        <div className="pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-normal text-black">Your Listings</h2>
            <Button1 onClick={() => setIsAddListingModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Listing
            </Button1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.length === 0 ? (
              <PopInOutEffect isVisible={true}>
                <Tile className="p-8 flex justify-center items-center h-full">
                  <p className="text-base font-normal text-gray-500">No listings yet</p>
                </Tile>
              </PopInOutEffect>
            ) : (
              listings.map((listing) => {
                // Sort intervals Mon-Sun
                const sortedIntervals = listing.availability_intervals?.sort((a, b) =>
                  dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
                );

                return (
                  <PopInOutEffect key={listing.id} isVisible={true}>
                    <Tile className="overflow-hidden p-0 flex flex-col h-full">
                      {/* Image */}
                      <div className="w-full h-32 bg-gray-200 relative shrink-0">
                        <img
                          src={getStaticMapUrl(listing.lat, listing.lng)}
                          alt="Location"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-6 flex-1">

                        {/* Address Block */}
                        <div>
                          {/* Consistent mb-1 for title spacing */}
                          <h3 className="text-base font-normal text-gray-500 mb-1">Address</h3>
                          <p className="text-base font-normal text-black">
                            {listing.street}, {listing.city}, {listing.province} {listing.postal_code}, {listing.country}
                          </p>
                        </div>

                        {/* Availability Block */}
                        <div>
                          {/* Consistent mb-1 for title spacing */}
                          <h3 className="text-base font-normal text-gray-500 mb-1">Full Availability</h3>
                          <div className="flex flex-col gap-2">
                            {sortedIntervals && sortedIntervals.length > 0 ? (
                              sortedIntervals.map((interval, idx) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-base font-normal text-black">
                                    {interval.day},
                                  </span>
                                  <span className="text-base font-normal text-black">
                                    {formatTime(interval.start_time)} - {formatTime(interval.end_time)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-base font-normal text-gray-400">No availability set</p>
                            )}
                          </div>
                        </div>

                        {/* Rate Block */}
                        <div className="mt-auto">
                          {/* Consistent mb-1 for title spacing */}
                          <h3 className="text-base font-normal text-gray-500 mb-1">Hourly Rate</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-normal text-black">
                              ${listing.price_per_hour.toFixed(2)}/hour
                            </p>
                            {/* Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-base font-normal ${listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {listing.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>

                      </div>
                    </Tile>
                  </PopInOutEffect>
                );
              })
            )}
          </div>
        </div>
      </div>

      <AddListingModal
        isOpen={isAddListingModalOpen}
        onClose={() => setIsAddListingModalOpen(false)}
        onListingAdded={handleListingAdded}
      />
    </main>
  );
}