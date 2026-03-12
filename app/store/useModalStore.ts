import { create } from 'zustand';

interface ModalState {
  isOpen: boolean;
  isSearchOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  isSearchOpen: false,
  openSignIn: () => set({ isOpen: true }),
  closeSignIn: () => set({ isOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  closeAll: () => set({ isOpen: false, isSearchOpen: false }),
}));