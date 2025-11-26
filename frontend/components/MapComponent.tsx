'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { ParkingSpot } from '@/types';

interface MapComponentProps {
    spots: ParkingSpot[];
    onSpotSelect: (spot: ParkingSpot) => void;
    selectedSpot: ParkingSpot | null;
}

const VANCOUVER_CENTER = { lat: 49.2827, lng: -123.1207 };

export default function MapComponent({ spots, onSpotSelect, selectedSpot }: MapComponentProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    // Debug logging
    console.log('API Key loaded:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No');

    if (!apiKey) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f0f0f0',
                color: '#666'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>Map Unavailable</h3>
                    <p>Please provide a Google Maps API Key in .env.local</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                        Restart the dev server after adding the key
                    </p>
                </div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={VANCOUVER_CENTER}
                defaultZoom={13}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
                {spots.map((spot) => {
                    const isSelected = selectedSpot?.id === spot.id;
                    return (
                        <Marker
                            key={spot.id}
                            position={{ lat: spot.lat, lng: spot.lng }}
                            onClick={() => onSpotSelect(spot)}
                            icon={isSelected ? {
                                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                                fillColor: '#2563eb',
                                fillOpacity: 1,
                                strokeColor: '#1e40af',
                                strokeWeight: 2,
                                scale: 2,
                                anchor: new google.maps.Point(12, 22)
                            } : undefined}
                        />
                    );
                })}
            </Map>
        </APIProvider>
    );
}
