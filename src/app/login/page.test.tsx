import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'

const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    push.mockClear()
    useAuthStore.setState({ currentUser: null })
  })

  it('logs in with a known seeded email and redirects home', () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('email@teste.com'), { target: { value: 'cliente@teste.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(useAuthStore.getState().currentUser?.role).toBe('customer')
    expect(push).toHaveBeenCalledWith('/')
  })

  it('shows an error for an unknown email', () => {
    render(<LoginPage />)
    fireEvent.change(screen.getByPlaceholderText('email@teste.com'), { target: { value: 'ninguem@teste.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(screen.getByText(/Email não encontrado/)).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })
})
