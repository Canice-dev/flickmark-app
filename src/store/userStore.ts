import { create } from "zustand";

type UserState = {
  isSeller: boolean;
  isSynced: boolean;
  setIsSeller: (isSeller: boolean) => void;
  setIsSynced: (isSynced: boolean) => void;
  reset: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  isSeller: false,
  isSynced: false,
  setIsSeller: (isSeller) => set({ isSeller }),
  setIsSynced: (isSynced) => set({ isSynced }),
  reset: () => set({ isSeller: false, isSynced: false }),
}));
