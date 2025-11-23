'use client';

import { useEffect, useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';

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
        if (!address || address.trim().length < 5) {
            // Reset to default if address is too short
            setCoordinates({ lat: 49.2827, lng: -123.1207 });
            setError(null);
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
                    setError('Address not found');
                }
            } catch (err) {
                setError('Failed to geocode address');
                console.error('Geocoding error:', err);
            } finally {
                setIsGeocoding(false);
            }
        };

        // Debounce geocoding to avoid too many API calls
        const timeoutId = setTimeout(geocodeAddress, 1000);
        return () => clearTimeout(timeoutId);
    }, [address]); // Only re-run when address changes

    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    return (
        <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 500 }}>
                Location Preview
            </label>

            <div style={{
                border: '1px solid #e5e5e5',
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative',
                height: '200px',
                background: '#f9f9f9'
            }}>
                {isGeocoding && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 10
                    }}>
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Finding location...</span>
                    </div>
                )}

                {error && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'white',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        color: '#dc2626',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 10
                    }}>
                        {error}
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
            </div>

            {!error && !isGeocoding && address.length > 5 && (
                <p style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '6px'
                }}>
                    📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
            )}
        </div>
    );
}
