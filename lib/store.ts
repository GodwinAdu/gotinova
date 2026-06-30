import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Cart Store
interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        const state = get()
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        const state = get()
        return state.items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'cart-store',
    }
  )
)

// Wishlist Store
interface WishlistItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.productId === item.productId)
          if (exists) return state
          return { items: [...state.items, item] }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      isInWishlist: (productId) => {
        const state = get()
        return state.items.some((i) => i.productId === productId)
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-store',
    }
  )
)

// UI Store
interface UIStore {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  openSidebar: () => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  isSearchOpen: boolean
  toggleSearch: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
      openSidebar: () => set({ isSidebarOpen: true }),
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      isSearchOpen: false,
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
    }),
    {
      name: 'ui-store',
    }
  )
)

// User Store
interface UserPreferences {
  currency: string
  language: string
  notifications: boolean
  theme: 'light' | 'dark' | 'system'
}

interface UserStore {
  preferences: UserPreferences
  setPreference: (key: keyof UserPreferences, value: any) => void
  resetPreferences: () => void
}

const defaultPreferences: UserPreferences = {
  currency: 'PKR',
  language: 'en',
  notifications: true,
  theme: 'system',
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: 'user-store',
    }
  )
)

// Filter Store
interface FilterState {
  category: string[]
  priceRange: [number, number]
  sortBy: string
  searchQuery: string
  ratingFilter: number
  setCategory: (categories: string[]) => void
  setPriceRange: (range: [number, number]) => void
  setSortBy: (sort: string) => void
  setSearchQuery: (query: string) => void
  setRatingFilter: (rating: number) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  category: [],
  priceRange: [0, 100000],
  sortBy: 'newest',
  searchQuery: '',
  ratingFilter: 0,
  setCategory: (categories) => set({ category: categories }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRatingFilter: (rating) => set({ ratingFilter: rating }),
  resetFilters: () =>
    set({
      category: [],
      priceRange: [0, 100000],
      sortBy: 'newest',
      searchQuery: '',
      ratingFilter: 0,
    }),
}))
