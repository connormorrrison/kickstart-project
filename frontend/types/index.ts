export interface ParkingSpot {
    id: string;
    title: string;
    description: string;
    address: string;
    lat: number;
    lng: number;
    pricePerHour: number;
    hostId: string;
    availableStart: string; // ISO time string
    availableEnd: string; // ISO time string
    availableDateStart?: string; // YYYY-MM-DD
    availableDateEnd?: string; // YYYY-MM-DD
    images: string[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    isHost: boolean;
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
