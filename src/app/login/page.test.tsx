import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import * as authApi from '@/lib/api/auth'
import { ApiError } from '@/lib/api/client'

vi.mock('@/lib/api/auth')

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    push.mockClear()
    vi.mocked(authApi.login).mockReset()
    vi.mocked(authApi.fetchCurrentUser).mockReset()
    useAuthStore.setState({ currentUser: null, status: 'idle' })
  })

  it('logs in with valid credentials and redirects home', async () => {
    vi.mocked(authApi.login).mockResolvedValue(undefined)
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      id: '1',
      name: 'Carlos Cliente',
      email: 'cliente@verzel.com',
      role: 'customer',
    })

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('email@verzel.com'), {
      target: { value: 'cliente@verzel.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
    expect(useAuthStore.getState().currentUser?.role).toBe('customer')
  })

  it('logs in as portaria and redirects to /gate instead of the events page', async () => {
    vi.mocked(authApi.login).mockResolvedValue(undefined)
    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      id: '3',
      name: 'Portaria',
      email: 'portaria@verzel.com',
      role: 'gate',
    })

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('email@verzel.com'), {
      target: { value: 'portaria@verzel.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/gate'))
  })

  it('shows a generic error for invalid credentials (401)', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new ApiError(401, 'Credenciais inválidas'))

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('email@verzel.com'), {
      target: { value: 'cliente@verzel.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'errada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Email ou senha inválidos')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('shows field-level errors for a 400 validation response', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError(400, 'Dados inválidos', { email: 'deve ser um email válido' })
    )

    render(<LoginPage />)
    // A syntactically valid-looking address is used here on purpose: jsdom enforces
    // native HTML5 constraint validation on type="email" inputs and silently blocks
    // the submit event for a malformed value before React's onSubmit ever runs. The
    // backend's stricter @Email validation is what we're simulating rejecting it.
    fireEvent.change(screen.getByPlaceholderText('email@verzel.com'), {
      target: { value: 'invalido@teste.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('deve ser um email válido')).toBeInTheDocument()
  })

  it('disables the submit button while the request is in flight', async () => {
    let resolveLogin: (() => void) | undefined
    vi.mocked(authApi.login).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = () => resolve(undefined)
      })
    )

    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('email@verzel.com'), {
      target: { value: 'cliente@verzel.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('senha'), { target: { value: 'senha123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeDisabled()

    vi.mocked(authApi.fetchCurrentUser).mockResolvedValue({
      id: '1',
      name: 'Carlos Cliente',
      email: 'cliente@verzel.com',
      role: 'customer',
    })
    resolveLogin?.()

    await waitFor(() => expect(push).toHaveBeenCalled())
  })
})
