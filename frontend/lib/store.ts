import { create } from 'zustand';

interface SearchCriteria {
  date: string;
  startTime: string;
  endTime: string;
}

interface User {
  name: string;
  email: string;
}

interface AppState {
  searchCriteria: SearchCriteria;
  setSearchCriteria: (criteria: Partial<SearchCriteria>) => void;
  user: User | null;
  authModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // initial state
  searchCriteria: {
    date: '',
    startTime: '09:00',
    endTime: '17:00',
  },
  user: null, // set to { name: 'Connor', email: '...' } to test logged in state
  authModalOpen: false,

  // actions
  setSearchCriteria: (newCriteria) =>
    set((state) => ({
      searchCriteria: { ...state.searchCriteria, ...newCriteria },
    })),

  setAuthModalOpen: (isOpen) => set({ authModalOpen: isOpen }),
}));