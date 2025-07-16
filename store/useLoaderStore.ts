import { create } from "zustand";

export const useLoader = create((set) => ({
  loader: 0,
  setLoader: () => set((state: any) => ({ loader: state.loader + 1 })),
}));

