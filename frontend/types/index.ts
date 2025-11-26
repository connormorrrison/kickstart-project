export interface ParkingSpot {
    id: string;
    title: string;
    description: string;
    address: string;
    lat: number;
    lng: number;
    pricePerHour: number;
    hostId: string;
    hostName?: string;
    availableStart: string; // ISO time string
    availableEnd: string; // ISO time string
    availabilityIntervals?: Array<{ start: string; end: string }>; // Multiple time ranges
    availableDateStart?: string; // YYYY-MM-DD
    availableDateEnd?: string; // YYYY-MM-DD
    images: string[];
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
