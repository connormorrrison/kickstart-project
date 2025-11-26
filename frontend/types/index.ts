export interface ParkingSpot {
    id: string;
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    lat: number;
    lng: number;
    pricePerHour: number;
    hostId: number;
    hostName?: string;
    availabilityIntervals?: Array<{ day: string; start: string; end: string }>;
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
