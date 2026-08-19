import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, fetchCurrentUser, logout } from './auth'
import { apiFetch, setToken, clearToken } from './client'

vi.mock('./client', () => ({
  apiFetch: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}))

describe('login', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
    vi.mocked(setToken).mockReset()
  })

  it('posts the email and password and stores the returned token', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ token: 'tok-123', tipoAcesso: 'CLIENTE' })

    await login('cliente@verzel.com', 'senha123')

    expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'cliente@verzel.com', senha: 'senha123' }),
    })
    expect(setToken).toHaveBeenCalledWith('tok-123')
  })
})

describe('fetchCurrentUser', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('maps a CLIENTE profile to a customer AuthUser', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: 'u1',
      nome: 'Carlos',
      sobrenome: 'Cliente',
      email: 'cliente@verzel.com',
      tipoAcesso: 'CLIENTE',
    })

    const user = await fetchCurrentUser()

    expect(apiFetch).toHaveBeenCalledWith('/auth/me')
    expect(user).toEqual({ id: 'u1', name: 'Carlos Cliente', email: 'cliente@verzel.com', role: 'customer' })
  })

  it('maps ORGANIZADOR to organizer and PORTARIA to gate', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      id: 'u2',
      nome: 'Ana',
      sobrenome: 'Organizadora',
      email: 'organizador@verzel.com',
      tipoAcesso: 'ORGANIZADOR',
    })
    expect((await fetchCurrentUser()).role).toBe('organizer')

    vi.mocked(apiFetch).mockResolvedValue({
      id: 'u3',
      nome: 'Paula',
      sobrenome: 'Portaria',
      email: 'portaria@verzel.com',
      tipoAcesso: 'PORTARIA',
    })
    expect((await fetchCurrentUser()).role).toBe('gate')
  })
})

describe('logout', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
    vi.mocked(clearToken).mockReset()
  })

  it('calls the logout endpoint and clears the local token', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ message: 'Logout realizado com sucesso' })

    await logout()

    expect(apiFetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
    expect(clearToken).toHaveBeenCalledOnce()
  })

  it('still clears the local token when the request fails', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new Error('network error'))

    await expect(logout()).resolves.toBeUndefined()
    expect(clearToken).toHaveBeenCalledOnce()
  })
})
