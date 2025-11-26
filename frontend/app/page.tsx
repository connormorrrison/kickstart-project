'use client';

import MapComponent from '@/components/MapComponent';
import SearchOverlay from '@/components/SearchOverlay';
import Button1 from '@/components/Button1';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { selectedSpot, setSelectedSpot, spots, searchCriteria } = useStore();

  // Filter spots based on time and date availability
  const filteredSpots = spots.filter(spot => {
    // Check time availability
    const isTimeAvailable = spot.availableStart <= searchCriteria.startTime &&
      spot.availableEnd >= searchCriteria.endTime;

    // Check date availability (if spot has dates)
    let isDateAvailable = true;
    if (spot.availableDateStart && spot.availableDateEnd) {
      isDateAvailable = searchCriteria.date >= spot.availableDateStart &&
        searchCriteria.date <= spot.availableDateEnd;
    }

    return isTimeAvailable && isDateAvailable;
  });

  return (
    <main style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}>
      <MapComponent
        spots={filteredSpots}
        onSpotSelect={setSelectedSpot}
        selectedSpot={selectedSpot}
      />
      <SearchOverlay />
      <div className="absolute top-5 right-5 z-10">
        <Button1 onClick={() => router.push('/signin')}>
          <User size={18} className="mr-2" />
          Sign In
        </Button1>
      </div>
    </main>
  );
}
