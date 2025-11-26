'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Loader2, MapPin } from 'lucide-react';
import Tile from '@/components/Tile';

interface AddressMapPreviewProps {
  address: string;
  onCoordinatesChange?: (lat: number, lng: number) => void;
}

export default function AddressMapPreview({ address, onCoordinatesChange }: AddressMapPreviewProps) {
  const [coordinates, setCoordinates] = useState({ lat: 49.2827, lng: -123.1207 }); // Default: Vancouver
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Geocode address to get lat/lng
  useEffect(() => {
    // Only geocode if we have at least a street and something else (roughly 10 chars) 
    // to prevent rapid geocoding on partial inputs
    if (!address || address.length < 10) {
      // Don't reset to default immediately while typing, but don't geocode
      return;
    }

    const geocodeAddress = async () => {
      setIsGeocoding(true);
      setError(null);

      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const newCoords = { lat: location.lat, lng: location.lng };
          setCoordinates(newCoords);

          // Notify parent component of coordinates
          if (onCoordinatesChange) {
            onCoordinatesChange(newCoords.lat, newCoords.lng);
          }
        } else {
          // Silent fail on partial matches to avoid UI clutter
        }
      } catch (err) {
        // Silent fail
        console.error('Geocoding error:', err);
      } finally {
        setIsGeocoding(false);
      }
    };

    // Debounce geocoding
    const timeoutId = setTimeout(geocodeAddress, 1000);
    return () => clearTimeout(timeoutId);
  }, [address, onCoordinatesChange]);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="relative">
      <Tile className="relative h-[200px] p-0 overflow-hidden border-gray-200 bg-gray-50 rounded-xl">
        {isGeocoding && (
          <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2 text-xs font-medium text-gray-600">
            <Loader2 size={12} className="animate-spin text-black" />
            <span>Finding location...</span>
          </div>
        )}

        <APIProvider apiKey={googleMapsApiKey}>
          <Map
            defaultCenter={coordinates}
            center={coordinates}
            defaultZoom={15}
            disableDefaultUI={true}
            gestureHandling="none"
            style={{ width: '100%', height: '100%' }}
          >
            <Marker position={coordinates} />
          </Map>
        </APIProvider>
      </Tile>

      {!error && !isGeocoding && address.length > 5 && (
        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1 pl-1">
          <MapPin size={12} />
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}