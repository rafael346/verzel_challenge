import { create } from 'zustand'
import { AuthUser } from '@/lib/types'
import { ApiError, getToken, clearToken } from '@/lib/api/client'
import * as authApi from '@/lib/api/auth'

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export type LoginResult = { success: true } | { error: string; fieldErrors?: Record<string, string> }

export type AuthState = {
  currentUser: AuthUser | null
  status: AuthStatus
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  init: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  status: 'idle',

  login: async (email, password) => {
    set({ status: 'loading' })
    try {
      await authApi.login(email, password)
      const user = await authApi.fetchCurrentUser()
      set({ currentUser: user, status: 'authenticated' })
      return { success: true }
    } catch (err) {
      set({ currentUser: null, status: 'unauthenticated' })
      if (err instanceof ApiError) {
        if (err.status === 401) return { error: 'Email ou senha inválidos' }
        return { error: err.message, fieldErrors: err.fieldErrors }
      }
      return { error: 'Erro inesperado. Tente novamente.' }
    }
  },

  logout: async () => {
    await authApi.logout()
    set({ currentUser: null, status: 'unauthenticated' })
  },

  init: async () => {
    const token = getToken()
    if (!token) {
      set({ status: 'unauthenticated' })
      return
    }
    set({ status: 'loading' })
    try {
      const user = await authApi.fetchCurrentUser()
      set({ currentUser: user, status: 'authenticated' })
    } catch {
      clearToken()
      set({ currentUser: null, status: 'unauthenticated' })
    }
  },
}))
