import { ParkingSpot } from '@/types';

/**
 * Formats a ParkingSpot's address fields into a single readable address string
 */
export function formatAddress(spot: ParkingSpot): string {
  const parts = [
    spot.street,
    spot.city,
    spot.province,
    spot.postalCode,
    spot.country
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Formats a short version of the address (street, city)
 */
export function formatShortAddress(spot: ParkingSpot): string {
  return `${spot.street}, ${spot.city}`;
}

/**
 * Uses Google Maps Geocoding API to convert an address to lat/lng coordinates
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key not found');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng
      };
    } else {
      console.error('Geocoding failed:', data.status);
      return null;
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}
