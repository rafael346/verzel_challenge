'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { Role } from '@/lib/types'

export function DenyRole({
  role,
  redirectTo,
  children,
}: {
  role: Role
  redirectTo: string
  children: React.ReactNode
}) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const status = useAuthStore((s) => s.status)
  const router = useRouter()
  const denied = currentUser?.role === role
  const resolved = status === 'authenticated' || status === 'unauthenticated'

  useEffect(() => {
    if (resolved && denied) {
      router.replace(redirectTo)
    }
  }, [resolved, denied, router, redirectTo])

  if (!resolved) {
    return <p className="p-6 text-slate-500">Carregando...</p>
  }

  if (denied) {
    return <p className="p-6 text-slate-500">Redirecionando...</p>
  }

  return <>{children}</>
}
