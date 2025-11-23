'use client';

import { create } from 'zustand';
import { ParkingSpot, User } from '@/types';
import { MOCK_SPOTS } from './mockData';

interface AppState {
    user: User | null;
    setUser: (user: User | null) => void;
    spots: ParkingSpot[];
    addSpot: (spot: ParkingSpot) => void;
    selectedSpot: ParkingSpot | null;
    setSelectedSpot: (spot: ParkingSpot | null) => void;
    searchCriteria: {
        location: string;
        date: string;
        startTime: string;
        endTime: string;
    };
    setSearchCriteria: (criteria: Partial<AppState['searchCriteria']>) => void;
    isFilterActive: boolean;
    setFilterActive: (isActive: boolean) => void;
    isAuthModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
    fetchSpots: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    spots: MOCK_SPOTS,
    addSpot: (spot) => set((state) => ({ spots: [...state.spots, spot] })),
    selectedSpot: null,
    setSelectedSpot: (selectedSpot) => set({ selectedSpot }),
    searchCriteria: {
        location: '',
        date: (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        startTime: '09:00',
        endTime: '17:00',
    },
    setSearchCriteria: (criteria) =>
        set((state) => ({
            searchCriteria: { ...state.searchCriteria, ...criteria },
        })),
    isFilterActive: false,
    setFilterActive: (isActive) => set({ isFilterActive: isActive }),
    isAuthModalOpen: false,
    setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
    fetchSpots: async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/postings/all');
            if (!response.ok) throw new Error('Failed to fetch spots');

            const data = await response.json();
            const spotsData = data.data || data;

            const mappedSpots: ParkingSpot[] = spotsData.map((spot: any) => ({
                id: spot.id.toString(),
                title: `Parking at ${spot.address}`,
                description: 'Available parking spot',
                address: spot.address,
                lat: spot.lat,
                lng: spot.lng,
                pricePerHour: spot.price,
                hostId: spot.host_id.toString(),
                availableStart: `${spot.start.toString().padStart(2, '0')}:00`,
                availableEnd: spot.end === 0 ? '23:59' : `${spot.end.toString().padStart(2, '0')}:00`,
                availableDateStart: spot.date,
                availableDateEnd: spot.date,
                images: ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60'],
            }));
            set({ spots: mappedSpots });
        } catch (error) {
            console.error('Error fetching spots:', error);
        }
    },
}));
