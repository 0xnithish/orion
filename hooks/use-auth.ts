"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from './use-auth-store'

export function useAuth() {
  const router = useRouter()
  const authData = useAuthStore((state) => state.authData)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const clearAuth = useAuthStore((state) => state.logout)

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    if (!authData?.isAuthenticated) {
      router.push('/auth')
    }
  }, [authData?.isAuthenticated, hasHydrated, router])

  const logout = () => {
    clearAuth()
    router.push('/auth')
  }

  const getAuthData = () => authData

  return {
    logout,
    getAuthData,
    isLoading: !hasHydrated,
    isAuthenticated: !!authData?.isAuthenticated
  }
}