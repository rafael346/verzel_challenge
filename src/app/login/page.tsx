'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = login(email)
    if (!ok) {
      setError('Email não encontrado. Use uma das contas de teste.')
      return
    }
    setError('')
    router.push('/')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="email@teste.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <input type="password" placeholder="senha (qualquer)" className="border p-2 rounded" />
        <button type="submit" className="bg-slate-800 text-white p-2 rounded">
          Entrar
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <p className="text-xs text-slate-500 mt-2">
          Contas de teste: cliente@teste.com / organizador@teste.com / portaria@teste.com
        </p>
      </form>
    </div>
  )
}
