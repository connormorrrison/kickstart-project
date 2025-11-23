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
    isAuthModalOpen: boolean;
    setAuthModalOpen: (isOpen: boolean) => void;
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
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
    },
    setSearchCriteria: (criteria) =>
        set((state) => ({
            searchCriteria: { ...state.searchCriteria, ...criteria },
        })),
    isAuthModalOpen: false,
    setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
}));
