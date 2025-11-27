'use client';

import { create } from 'zustand';
import { ParkingSpot, User } from '@/types';

interface AppState {
    user: User | null;
    setUser: (user: User | null) => void;
    spots: ParkingSpot[];
    setSpots: (spots: ParkingSpot[]) => void;
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
    isAuthModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    spots: [],
    setSpots: (spots) => set({ spots }),
    addSpot: (spot) => set((state) => ({ spots: [...state.spots, spot] })),
    selectedSpot: null,
    setSelectedSpot: (selectedSpot) => set({ selectedSpot }),
    searchCriteria: {
        location: '',
        date: '',
        startTime: '',
        endTime: '',
    },
    setSearchCriteria: (criteria) =>
        set((state) => ({
            searchCriteria: { ...state.searchCriteria, ...criteria },
        })),
    isAuthModalOpen: false,
    setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
    isLoading: true, // Start as true to prevent premature redirects
    setLoading: (isLoading) => set({ isLoading }),
}));
