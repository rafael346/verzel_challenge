'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { Role } from '@/lib/types'

export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const status = useAuthStore((s) => s.status)
  const router = useRouter()
  const authorized = !!currentUser && currentUser.role === role
  const resolved = status === 'authenticated' || status === 'unauthenticated'

  useEffect(() => {
    if (resolved && !authorized) {
      router.replace('/login')
    }
  }, [resolved, authorized, router])

  if (!resolved) {
    return <p className="p-6 text-slate-500">Carregando...</p>
  }

  if (!authorized) {
    return <p className="p-6 text-slate-500">Redirecionando para login...</p>
  }

  return <>{children}</>
}
