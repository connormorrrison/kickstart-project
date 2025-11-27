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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const router = useRouter();
  const { selectedSpot, setSelectedSpot, spots, setSpots, searchCriteria, user } = useStore();
  const { signOut } = require('@/hooks/useAuth').useAuth();
  const [filteredSpots, setFilteredSpots] = useState<any[]>(spots || []);

  // Fetch spots from API on mount
  useEffect(() => {
    const fetchSpots = async () => {
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
      }
    };

    fetchSpots();
  }, [searchCriteria.location, setSpots]);

  // Filter spots by availability (date/time) - accounts for bookings when date is selected
  useEffect(() => {
    const filterSpots = async () => {
      if (!Array.isArray(spots)) {
        setFilteredSpots([]);
        return;
      }

      // If no date is set, show all spots
      if (!searchCriteria.date) {
        setFilteredSpots(spots);
        return;
      }

      try {
        // Get the day of week for the selected date
        // Use UTC methods to avoid timezone issues (YYYY-MM-DD is parsed as UTC midnight)
        const selectedDate = new Date(searchCriteria.date);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDay = dayNames[selectedDate.getUTCDay()];

        console.log(`Filtering for Date: ${searchCriteria.date}, Day: ${selectedDay}`);

        // Fetch actual availability (with bookings) for each spot on the selected date
        const spotsWithAvailability = await Promise.all(
          spots.map(async (spot) => {
            // First check if spot has base availability for this day
            if (!spot.availabilityIntervals || spot.availabilityIntervals.length === 0) {
              return { spot, hasAvailability: false };
            }

            const dayIntervals = spot.availabilityIntervals.filter(
              (interval: any) => interval.day === selectedDay
            );

            if (dayIntervals.length === 0) {
              console.log(`Spot ${spot.id} (${spot.street}) closed on ${selectedDay} (Client check)`);
              return { spot, hasAvailability: false };
            }

            // Fetch actual availability (accounting for bookings) from the API
            try {
              const response = await fetch(
                `${API_URL}/spots/${spot.id}/availability/${searchCriteria.date}`
              );

              if (!response.ok) {
                return { spot, hasAvailability: false };
              }

              const availabilityData = await response.json();
              console.log(`Spot ${spot.id} availability for ${searchCriteria.date}:`, availabilityData);

              // If no time range specified, include spot if it has operating hours (even if fully booked)
              if (!searchCriteria.startTime || !searchCriteria.endTime) {
                // Check operating_hours instead of available_slots
                if (availabilityData.operating_hours && availabilityData.operating_hours.length > 0) {
                  return { spot, hasAvailability: true };
                }
                // Fallback: if operating_hours is missing but available_slots has data (shouldn't happen with new backend, but safe)
                if (availabilityData.available_slots && availabilityData.available_slots.length > 0) {
                  return { spot, hasAvailability: true };
                }
                return { spot, hasAvailability: false };
              }

              // If time range IS specified, we check OPERATING HOURS (ignoring bookings)
              // This ensures the pin shows up if the spot is open, even if booked.
              const intervalsToCheck = availabilityData.operating_hours && availabilityData.operating_hours.length > 0
                ? availabilityData.operating_hours
                : availabilityData.available_slots; // Fallback

              if (!intervalsToCheck || intervalsToCheck.length === 0) {
                console.log(`Spot ${spot.id} has no intervals to check (Backend check)`);
                return { spot, hasAvailability: false };
              }

              // Check if any available slot covers the requested time range
              const parseTime = (timeStr: string) => {
                // Handle 12-hour format with AM/PM (e.g., "9:00 AM")
                const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                if (match12) {
                  let [, hours, minutes, period] = match12;
                  let h = parseInt(hours);
                  const m = parseInt(minutes);

                  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
                  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
                  return h * 60 + m;
                }

                // Handle 24-hour format (e.g., "09:00" or "17:00")
                const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
                if (match24) {
                  let [, hours, minutes] = match24;
                  return parseInt(hours) * 60 + parseInt(minutes);
                }

                return 0;
              };

              const searchStart = parseTime(searchCriteria.startTime);
              const searchEnd = parseTime(searchCriteria.endTime);

              const hasMatchingSlot = intervalsToCheck.some((slot: any) => {
                const slotStart = parseTime(slot.start_time);
                const slotEnd = parseTime(slot.end_time);

                // The slot must fully cover the requested time range
                return slotStart <= searchStart && slotEnd >= searchEnd;
              });

              return { spot, hasAvailability: hasMatchingSlot };
            } catch (error) {
              console.error(`Error fetching availability for spot ${spot.id}:`, error);
              return { spot, hasAvailability: false };
            }
          })
        );

        // Filter to only spots with availability
        const available = spotsWithAvailability
          .filter(({ hasAvailability }) => hasAvailability)
          .map(({ spot }) => spot);

        setFilteredSpots(available);
      } catch (error) {
        console.error('Error filtering spots:', error);
        setFilteredSpots(spots);
      }
    };

    filterSpots();
  }, [spots, searchCriteria.date, searchCriteria.startTime, searchCriteria.endTime]);

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
