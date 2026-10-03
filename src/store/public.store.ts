import { create } from "zustand";
import { api } from "@/lib/api";

export interface IPublicTestimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  displayOrder: number;
  createdAt: string;
}

interface PublicStore {
  testimonials: IPublicTestimonial[];
  testimonialsLoading: boolean;
  fetchTestimonials: () => Promise<void>;
}

export const usePublicStore = create<PublicStore>((set, get) => ({
  testimonials: [],
  testimonialsLoading: false,

  fetchTestimonials: async () => {
    if (get().testimonialsLoading) return;
    set({ testimonialsLoading: true });
    try {
      const res = await api.get("/testimonials");
      set({ testimonials: res.data?.data ?? [], testimonialsLoading: false });
    } catch {
      set({ testimonialsLoading: false });
    }
  },
}));
