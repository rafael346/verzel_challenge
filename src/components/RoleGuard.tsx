'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { Role } from '@/lib/types'

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const router = useRouter()
  const authorized = !!currentUser && currentUser.role === role

  useEffect(() => {
    if (!authorized) {
      router.replace('/login')
    }
  }, [authorized, router])

  if (!authorized) {
    return <p className="p-6 text-slate-500">Redirecionando para login...</p>
  }

  return <>{children}</>
}
