import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DenyRole } from './DenyRole'
import { useAuthStore } from '@/lib/stores/authStore'

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('DenyRole', () => {
  beforeEach(() => {
    replace.mockClear()
    useAuthStore.setState({ currentUser: null, status: 'idle' })
  })

  it('shows a loading state without rendering children while the session is still resolving', () => {
    useAuthStore.setState({ status: 'loading' })
    render(
      <DenyRole role="gate" redirectTo="/gate">
        <p>conteúdo</p>
      </DenyRole>
    )
    expect(screen.getByText('Carregando...')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })

  it('renders children for a guest (no logged-in user)', () => {
    useAuthStore.setState({ currentUser: null, status: 'unauthenticated' })
    render(
      <DenyRole role="gate" redirectTo="/gate">
        <p>conteúdo</p>
      </DenyRole>
    )
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('renders children for a user whose role is not denied', () => {
    useAuthStore.setState({
      currentUser: { id: '1', name: 'Cliente', email: 'cliente@verzel.com', role: 'customer' },
      status: 'authenticated',
    })
    render(
      <DenyRole role="gate" redirectTo="/gate">
        <p>conteúdo</p>
      </DenyRole>
    )
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('redirects away and does not render children when the user has the denied role', () => {
    useAuthStore.setState({
      currentUser: { id: '2', name: 'Portaria', email: 'portaria@verzel.com', role: 'gate' },
      status: 'authenticated',
    })
    render(
      <DenyRole role="gate" redirectTo="/gate">
        <p>conteúdo</p>
      </DenyRole>
    )
    expect(replace).toHaveBeenCalledWith('/gate')
    expect(screen.queryByText('conteúdo')).not.toBeInTheDocument()
  })
})
