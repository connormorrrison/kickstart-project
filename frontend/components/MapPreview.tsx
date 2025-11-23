'use client';

import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface MapPreviewProps {
    lat: number;
    lng: number;
    height?: string;
}

export default function MapPreview({ lat, lng, height = '250px' }: MapPreviewProps) {
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    return (
        <div style={{
            position: 'relative',
            height,
            background: '#f9f9f9',
            overflow: 'hidden'
        }}>
            <APIProvider apiKey={googleMapsApiKey}>
                <Map
                    defaultCenter={{ lat, lng }}
                    center={{ lat, lng }}
                    defaultZoom={15}
                    disableDefaultUI={false}
                    gestureHandling="cooperative"
                    style={{ width: '100%', height: '100%' }}
                >
                    <Marker position={{ lat, lng }} />
                </Map>
            </APIProvider>
        </div>
    );
}
