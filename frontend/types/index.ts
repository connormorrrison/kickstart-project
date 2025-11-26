export interface ParkingSpot {
    id: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    postal_code?: string; // API returns this
    country: string;
    lat: number;
    lng: number;
    pricePerHour: number;
    price_per_hour?: number; // API returns this
    hostId: number;
    host_id?: number; // API returns this
    hostName?: string;
    is_active?: boolean;
    created_at?: string;
    availabilityIntervals?: Array<{ day: string; start: string; end: string; start_time?: string; end_time?: string }>;
    availability_intervals?: Array<{ day: string; start_time: string; end_time: string }>; // API returns this
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    is_active: boolean;
}

export interface Booking {
    id: string;
    spotId: string;
    userId: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'cancelled';
}
