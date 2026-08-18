import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null })
  })

  it('logs in a user matching a seeded email, ignoring case', () => {
    const ok = useAuthStore.getState().login('CLIENTE@teste.com')
    expect(ok).toBe(true)
    expect(useAuthStore.getState().currentUser?.role).toBe('customer')
  })

  it('fails to log in an unknown email', () => {
    const ok = useAuthStore.getState().login('nao-existe@teste.com')
    expect(ok).toBe(false)
    expect(useAuthStore.getState().currentUser).toBeNull()
  })

  it('logs out the current user', () => {
    useAuthStore.getState().login('cliente@teste.com')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().currentUser).toBeNull()
  })
})
