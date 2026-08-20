'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setFieldErrors({})

    const result = await login(email, password)

    setSubmitting(false)
    if ('error' in result) {
      setError(result.error)
      setFieldErrors(result.fieldErrors ?? {})
      return
    }
    const role = useAuthStore.getState().currentUser?.role
    router.push(role === 'gate' ? '/gate' : '/')
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-display text-xl font-semibold mb-4">Entrar</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted">
          Email
          <input
            type="email"
            placeholder="email@verzel.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-surface border border-border-subtle rounded-[3px] px-3 py-2 text-sm text-text normal-case tracking-normal"
          />
          {fieldErrors.email && (
            <span className="text-wine text-xs normal-case tracking-normal">{fieldErrors.email}</span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted">
          Senha
          <input
            type="password"
            placeholder="senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-surface border border-border-subtle rounded-[3px] px-3 py-2 text-sm text-text normal-case tracking-normal"
          />
          {fieldErrors.senha && (
            <span className="text-wine text-xs normal-case tracking-normal">{fieldErrors.senha}</span>
          )}
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="bg-wine text-text rounded-[3px] p-2 text-sm disabled:opacity-50"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        {error && (
          <p role="alert" className="text-wine text-sm">
            {error}
          </p>
        )}
        <p className="text-xs text-text-muted mt-2">
          Contas de teste: organizador@verzel.com / cliente@verzel.com / portaria@verzel.com (senha: senha123)
        </p>
      </form>
    </div>
  )
}
