// Utility functions to transform API data to frontend format
import { ParkingSpot as APIParkingSpot } from './api';
import { ParkingSpot } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch host name by user ID
 */
async function fetchHostName(hostId: number): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/users/${hostId}`);
    if (!response.ok) {
      console.error(`Failed to fetch host name for user ${hostId}: ${response.status}`);
      return 'Host'; // Fallback if user not found
    }
    const data = await response.json();
    const fullName = `${data.first_name} ${data.last_name}`;
    console.log(`Fetched host name for user ${hostId}: ${fullName}`);
    return fullName;
  } catch (error) {
    console.error('Failed to fetch host name:', error);
    return 'Host'; // Fallback on error
  }
}

/**
 * Normalize API parking spot data to frontend format
 */
export async function normalizeSpot(apiSpot: APIParkingSpot): Promise<ParkingSpot> {
  const hostName = await fetchHostName(apiSpot.host_id);

  return {
    id: apiSpot.id,
    street: apiSpot.street,
    city: apiSpot.city,
    province: apiSpot.province,
    postalCode: apiSpot.postal_code,
    postal_code: apiSpot.postal_code,
    country: apiSpot.country,
    lat: apiSpot.lat,
    lng: apiSpot.lng,
    pricePerHour: apiSpot.price_per_hour,
    price_per_hour: apiSpot.price_per_hour,
    hostId: apiSpot.host_id,
    host_id: apiSpot.host_id,
    hostName: hostName,
    is_active: apiSpot.is_active,
    created_at: apiSpot.created_at,
    availabilityIntervals: apiSpot.availability_intervals?.map(interval => ({
      day: interval.day,
      start: interval.start_time,
      end: interval.end_time,
      start_time: interval.start_time,
      end_time: interval.end_time,
    })),
    availability_intervals: apiSpot.availability_intervals,
  };
}

/**
 * Normalize multiple spots
 */
export async function normalizeSpots(apiSpots: APIParkingSpot[]): Promise<ParkingSpot[]> {
  return Promise.all(apiSpots.map(normalizeSpot));
}
