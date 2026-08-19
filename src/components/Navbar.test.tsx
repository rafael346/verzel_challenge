import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Navbar } from './Navbar'
import { useAuthStore } from '@/lib/stores/authStore'
import * as authApi from '@/lib/api/auth'

vi.mock('@/lib/api/auth')

describe('Navbar', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null, status: 'idle' })
    vi.mocked(authApi.logout).mockReset()
  })

  it('shows an "Entrar" link when logged out', () => {
    render(<Navbar />)
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('shows the "Meus ingressos" link for a customer', () => {
    useAuthStore.setState({
      currentUser: { id: '1', name: 'Cliente', email: 'cliente@teste.com', role: 'customer' },
    })
    render(<Navbar />)
    expect(screen.getByText('Meus ingressos')).toBeInTheDocument()
    expect(screen.queryByText('Meus eventos')).not.toBeInTheDocument()
  })

  it('shows the "Meus eventos" link for an organizer', () => {
    useAuthStore.setState({
      currentUser: { id: '2', name: 'Org', email: 'organizador@teste.com', role: 'organizer' },
    })
    render(<Navbar />)
    expect(screen.getByText('Meus eventos')).toBeInTheDocument()
  })

  it('shows the "Portaria" link for a gate role', () => {
    useAuthStore.setState({
      currentUser: { id: '3', name: 'Portaria', email: 'portaria@teste.com', role: 'gate' },
    })
    render(<Navbar />)
    expect(screen.getByText('Portaria')).toBeInTheDocument()
    expect(screen.queryByText('Meus ingressos')).not.toBeInTheDocument()
    expect(screen.queryByText('Meus eventos')).not.toBeInTheDocument()
  })

  it('logs out and reverts UI to "Entrar" when logout button is clicked', async () => {
    vi.mocked(authApi.logout).mockResolvedValue(undefined)
    useAuthStore.setState({
      currentUser: { id: '1', name: 'Cliente', email: 'cliente@teste.com', role: 'customer' },
      status: 'authenticated',
    })
    render(<Navbar />)
    expect(screen.getByText('Sair (Cliente)')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Sair (Cliente)'))

    await waitFor(() => expect(screen.getByText('Entrar')).toBeInTheDocument())
    expect(screen.queryByText('Sair (Cliente)')).not.toBeInTheDocument()
  })
})
