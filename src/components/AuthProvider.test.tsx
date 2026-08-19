import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuthStore } from '@/lib/stores/authStore'
import { setUnauthorizedHandler } from '@/lib/api/client'

vi.mock('@/lib/api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/client')>()
  return { ...actual, setUnauthorizedHandler: vi.fn() }
})

const replace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('AuthProvider', () => {
  beforeEach(() => {
    replace.mockClear()
    vi.mocked(setUnauthorizedHandler).mockClear()
    useAuthStore.setState({ currentUser: null, status: 'idle' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children immediately without waiting for init to resolve', () => {
    vi.spyOn(useAuthStore.getState(), 'init').mockReturnValue(new Promise(() => {}))

    render(
      <AuthProvider>
        <p>conteúdo</p>
      </AuthProvider>
    )

    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('calls init exactly once on mount', () => {
    const init = vi.spyOn(useAuthStore.getState(), 'init').mockResolvedValue(undefined)

    render(
      <AuthProvider>
        <p>conteúdo</p>
      </AuthProvider>
    )

    expect(init).toHaveBeenCalledTimes(1)
  })

  it('registers an unauthorized handler that clears the session and redirects to /login', () => {
    vi.spyOn(useAuthStore.getState(), 'init').mockResolvedValue(undefined)
    useAuthStore.setState({
      currentUser: { id: '1', name: 'Cliente', email: 'cliente@verzel.com', role: 'customer' },
      status: 'authenticated',
    })

    render(
      <AuthProvider>
        <p>conteúdo</p>
      </AuthProvider>
    )

    const handler = vi.mocked(setUnauthorizedHandler).mock.calls[0][0]
    handler?.()

    expect(useAuthStore.getState().currentUser).toBeNull()
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(replace).toHaveBeenCalledWith('/login')
  })
})
