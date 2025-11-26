'use client';

import MapComponent from '@/components/MapComponent';
import SearchOverlay from '@/components/SearchOverlay';
import Button1 from '@/components/Button1';
import UserMenu from '@/components/UserMenu';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { selectedSpot, setSelectedSpot, spots, searchCriteria, user } = useStore();
  const { signOut } = require('@/hooks/useAuth').useAuth();

  // TODO: Implement proper availability filtering with new data structure
  const filteredSpots = spots;

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
