'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { setUnauthorizedHandler } from '@/lib/api/client'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const initialized = useRef(false)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      useAuthStore.setState({ currentUser: null, status: 'unauthenticated' })
      router.replace('/login')
    })
    return () => setUnauthorizedHandler(null)
  }, [router])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    useAuthStore.getState().init()
  }, [])

  return <>{children}</>
}
