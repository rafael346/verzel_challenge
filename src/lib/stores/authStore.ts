import { create } from 'zustand'
import { User } from '@/lib/types'
import { seedUsers } from '@/lib/seed'

export type AuthUser = Omit<User, 'password'>

export type AuthState = {
  currentUser: AuthUser | null
  login: (email: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  login: (email) => {
    const user = seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return false
    const { password: _password, ...safeUser } = user
    set({ currentUser: safeUser })
    return true
  },
  logout: () => set({ currentUser: null }),
}))
