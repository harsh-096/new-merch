import { create } from "zustand";
import { persist } from "zustand/middleware";
import { siteConfig } from "@/lib/config";

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  variantId?: string;
  size: string;
  material?: string;
  finish?: string;
  quantity: number;
  unitPrice: number;
  artworkUrl?: string;
  artworkFileName?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateArtwork: (id: string, url: string, fileName: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const id = `${item.productId}-${item.size}-${item.material || ""}-${item.finish || ""}-${Date.now()}`;
        set((state) => ({
          items: [...state.items, { ...item, id }],
          isOpen: true,
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      updateArtwork: (id, url, fileName) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, artworkUrl: url, artworkFileName: fileName }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    }),
    {
      name: siteConfig.cartStorageKey,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
