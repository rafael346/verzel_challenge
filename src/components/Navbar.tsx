'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/stores/authStore'

export function Navbar() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const logout = useAuthStore((s) => s.logout)

  return (
    <nav className="flex items-center justify-between px-4 py-4 border-b border-border bg-bg text-text">
      <Link href="/" className="font-display font-bold text-lg">
        EventTix
      </Link>
      <div className="flex items-center gap-5 text-xs uppercase tracking-wide text-text-muted">
        {currentUser?.role !== 'gate' && (
          <Link href="/" className="hover:text-gold">
            Eventos
          </Link>
        )}
        {currentUser?.role === 'customer' && (
          <Link href="/my-tickets" className="hover:text-gold">
            Meus ingressos
          </Link>
        )}
        {currentUser?.role === 'organizer' && (
          <Link href="/organizer" className="hover:text-gold">
            Meus eventos
          </Link>
        )}
        {currentUser?.role === 'gate' && (
          <Link href="/gate" className="hover:text-gold">
            Portaria
          </Link>
        )}
        {currentUser ? (
          <button onClick={logout} className="normal-case tracking-normal hover:text-gold">
            Sair ({currentUser.name})
          </button>
        ) : (
          <Link href="/login" className="hover:text-gold">
            Entrar
          </Link>
        )}
      </div>
    </nav>
  )
}
