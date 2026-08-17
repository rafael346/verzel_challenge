import { create } from 'zustand'
import { User } from '@/lib/types'
import { seedUsers } from '@/lib/seed'

type AuthState = {
  currentUser: User | null
  login: (email: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  login: (email) => {
    const user = seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) return false
    set({ currentUser: user })
    return true
  },
  logout: () => set({ currentUser: null }),
}))
