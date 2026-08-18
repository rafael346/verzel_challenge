'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/authStore'

export function Navbar() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)

  return (
    <nav className="flex items-center justify-between p-4 bg-slate-800 text-white">
      <Link href="/" className="font-bold">
        EventTix
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/">Eventos</Link>
        {currentUser?.role === 'customer' && <Link href="/my-tickets">Meus ingressos</Link>}
        {currentUser?.role === 'organizer' && <Link href="/organizer">Meus eventos</Link>}
        {currentUser?.role === 'gate' && <Link href="/gate">Portaria</Link>}
        {currentUser ? (
          <button onClick={logout} className="underline">
            Sair ({currentUser.name})
          </button>
        ) : (
          <Link href="/login">Entrar</Link>
        )}
      </div>
    </nav>
  )
}
