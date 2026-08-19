import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleGuard } from './RoleGuard'
import { useAuthStore } from '@/lib/stores/authStore'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('RoleGuard', () => {
  beforeEach(() => {
    replace.mockClear()
    useAuthStore.setState({ currentUser: null, status: 'idle' })
  })

  it('shows a loading state without redirecting while the session is still resolving', () => {
    useAuthStore.setState({ status: 'loading' })
    render(
      <RoleGuard role="organizer">
        <p>conteúdo protegido</p>
      </RoleGuard>
    )
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument()
  })

  it('redirects to /login once resolved with no user logged in', () => {
    useAuthStore.setState({ status: 'unauthenticated' })
    render(
      <RoleGuard role="organizer">
        <p>conteúdo protegido</p>
      </RoleGuard>
    )
    expect(replace).toHaveBeenCalledWith('/login')
    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument()
  })

  it('redirects to /login when the logged-in user has the wrong role', () => {
    useAuthStore.setState({
      currentUser: { id: '1', name: 'Cliente', email: 'cliente@verzel.com', role: 'customer' },
      status: 'authenticated',
    })
    render(
      <RoleGuard role="organizer">
        <p>conteúdo protegido</p>
      </RoleGuard>
    )
    expect(replace).toHaveBeenCalledWith('/login')
  })

  it('renders children when the role matches', () => {
    useAuthStore.setState({
      currentUser: { id: '2', name: 'Org', email: 'organizador@verzel.com', role: 'organizer' },
      status: 'authenticated',
    })
    render(
      <RoleGuard role="organizer">
        <p>conteúdo protegido</p>
      </RoleGuard>
    )
    expect(screen.getByText('conteúdo protegido')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
