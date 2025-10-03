"use client"

import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'

export interface AuthData {
  name: string
  phone: string
  countryCode: string
  otp: string
  isAuthenticated: boolean
}

interface AuthState {
  authData: AuthData | null
  hasHydrated: boolean
  setAuthData: (data: AuthData) => void
  logout: () => void
  setHydrated: (value: boolean) => void
}

const createStorage = () => {
  if (typeof window === 'undefined') {
    const memoryStorage: StateStorage = {
      getItem: () => null,
      setItem: () => void 0,
      removeItem: () => void 0
    }
    return memoryStorage
  }

  return window.localStorage
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authData: null,
      hasHydrated: false,
      setAuthData: (data) => set({ authData: { ...data, isAuthenticated: true } }),
      logout: () => set({ authData: null }),
      setHydrated: (value) => set({ hasHydrated: value })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(createStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)
