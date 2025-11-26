'use client';

import MapComponent from '@/components/MapComponent';
import SearchOverlay from '@/components/SearchOverlay';
import Button1 from '@/components/Button1';
import UserMenu from '@/components/UserMenu';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { spotsApi } from '@/lib/api';
import { normalizeSpots } from '@/lib/dataTransform';

export default function Home() {
  const router = useRouter();
  const { selectedSpot, setSelectedSpot, spots, setSpots, searchCriteria, user } = useStore();
  const { signOut } = require('@/hooks/useAuth').useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch spots from API on mount
  useEffect(() => {
    const fetchSpots = async () => {
      setIsLoading(true);
      try {
        const filters: any = {};

        // Add city filter if location is set
        if (searchCriteria.location) {
          filters.city = searchCriteria.location;
        }

        const apiSpots = await spotsApi.list(filters);
        const normalizedSpots = await normalizeSpots(apiSpots);
        setSpots(normalizedSpots);
      } catch (error) {
        console.error('Failed to fetch parking spots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpots();
  }, [searchCriteria.location, setSpots]);

  // Filter spots by availability (date/time)
  const filteredSpots = Array.isArray(spots) ? spots.filter(spot => {
    // If no date is set, show all spots
    if (!searchCriteria.date) {
      return true;
    }

    // Get the day of week for the selected date
    const selectedDate = new Date(searchCriteria.date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDay = dayNames[selectedDate.getDay()];

    // Check if spot has availability for this day
    if (!spot.availabilityIntervals || spot.availabilityIntervals.length === 0) {
      return false;
    }

    // Find intervals for the selected day
    const dayIntervals = spot.availabilityIntervals.filter(interval =>
      interval.day === selectedDay
    );

    // If no availability on this day, filter out
    if (dayIntervals.length === 0) {
      return false;
    }

    // If no time range specified, just filter by day
    if (!searchCriteria.startTime || !searchCriteria.endTime) {
      return true;
    }

    // Convert search times to comparable format (24-hour minutes)
    const parseTime = (timeStr: string) => {
      const [time, period] = timeStr.toLowerCase().split(/(?=[ap]m)/);
      let [hours, minutes] = time.split(':').map(Number);

      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    const searchStart = parseTime(searchCriteria.startTime);
    const searchEnd = parseTime(searchCriteria.endTime);

    // Check if any interval covers the requested time range
    return dayIntervals.some(interval => {
      const intervalStart = parseTime(interval.start);
      const intervalEnd = parseTime(interval.end);

      // The spot is available if the interval fully covers the requested time
      return intervalStart <= searchStart && intervalEnd >= searchEnd;
    });
  }) : [];

  return (
    <main style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <MapComponent
        spots={filteredSpots}
        onSpotSelect={setSelectedSpot}
        selectedSpot={selectedSpot}
      />
      <SearchOverlay />
      <div className="absolute top-5 right-5 z-10">
        {user ? (
          <UserMenu onSignOut={signOut} showDashboard={true} />
        ) : (
          <Button1 onClick={() => router.push('/signin')}>
            <User size={18} className="mr-2" />
            Sign In
          </Button1>
        )}
      </div>
    </main>
  );
}
