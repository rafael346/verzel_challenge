import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import { ApiError } from '@/lib/api/client'
import * as authApi from '@/lib/api/auth'

vi.mock('@/lib/api/auth')

vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/client')>()
  return { ...actual, getToken: vi.fn() }
})

import { getToken } from '@/lib/api/client'

const testUser = { id: '1', name: 'Carlos Cliente', email: 'cliente@verzel.com', role: 'customer' as const }

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null, status: 'idle' })
    vi.mocked(authApi.login).mockReset()
    vi.mocked(authApi.fetchCurrentUser).mockReset()
    vi.mocked(authApi.logout).mockReset()
    vi.mocked(getToken).mockReset()
  })

  it('starts in idle status with no current user', () => {
    expect(useAuthStore.getState().status).toBe('idle')
    expect(useAuthStore.getState().currentUser).toBeNull()
  })

  describe('init', () => {
    it('goes straight to unauthenticated when no token is stored', async () => {
      vi.mocked(getToken).mockReturnValue(null)
      await useAuthStore.getState().init()
      expect(useAuthStore.getState().status).toBe('unauthenticated')
    })

    it('rehydrates the session from a stored token', async () => {
      vi.mocked(getToken).mockReturnValue('valid-token')
      vi.mocked(authApi.fetchCurrentUser).mockResolvedValue(testUser)
      await useAuthStore.getState().init()
      expect(useAuthStore.getState().status).toBe('authenticated')
      expect(useAuthStore.getState().currentUser).toEqual(testUser)
    })

    it('ends unauthenticated when the stored token is rejected', async () => {
      vi.mocked(getToken).mockReturnValue('expired-token')
      vi.mocked(authApi.fetchCurrentUser).mockRejectedValue(new ApiError(401, 'Token inválido ou expirado'))
      await useAuthStore.getState().init()
      expect(useAuthStore.getState().status).toBe('unauthenticated')
      expect(useAuthStore.getState().currentUser).toBeNull()
    })
  })

  describe('login', () => {
    it('logs in and populates the current user on success', async () => {
      vi.mocked(authApi.login).mockResolvedValue(undefined)
      vi.mocked(authApi.fetchCurrentUser).mockResolvedValue(testUser)

      const result = await useAuthStore.getState().login('cliente@verzel.com', 'senha123')

      expect(result).toEqual({ success: true })
      expect(useAuthStore.getState().status).toBe('authenticated')
      expect(useAuthStore.getState().currentUser).toEqual(testUser)
      expect(authApi.login).toHaveBeenCalledWith('cliente@verzel.com', 'senha123')
    })

    it('maps a 401 to a friendly invalid-credentials message', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Credenciais inválidas'))

      const result = await useAuthStore.getState().login('cliente@verzel.com', 'errada')

      expect(result).toEqual({ error: 'Email ou senha inválidos' })
      expect(useAuthStore.getState().status).toBe('unauthenticated')
    })

    it('surfaces field errors from a 400 validation response', async () => {
      vi.mocked(authApi.login).mockRejectedValue(
        new ApiError(400, 'Dados inválidos', { email: 'deve ser um email válido' })
      )

      const result = await useAuthStore.getState().login('invalido', 'senha123')

      expect(result).toEqual({ error: 'Dados inválidos', fieldErrors: { email: 'deve ser um email válido' } })
    })
  })

  describe('logout', () => {
    it('clears the current user and marks the session unauthenticated', async () => {
      useAuthStore.setState({ currentUser: testUser, status: 'authenticated' })
      vi.mocked(authApi.logout).mockResolvedValue(undefined)

      await useAuthStore.getState().logout()

      expect(authApi.logout).toHaveBeenCalledOnce()
      expect(useAuthStore.getState().currentUser).toBeNull()
      expect(useAuthStore.getState().status).toBe('unauthenticated')
    })
  })
})
