import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navbar } from './Navbar'
import { useAuthStore } from '@/lib/stores/authStore'

describe('Navbar', () => {
  beforeEach(() => {
    useAuthStore.setState({ currentUser: null })
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

  it('logs out and reverts UI to "Entrar" when logout button is clicked', () => {
    useAuthStore.setState({
      currentUser: { id: '1', name: 'Cliente', email: 'cliente@teste.com', role: 'customer' },
    })
    render(<Navbar />)
    expect(screen.getByText('Sair (Cliente)')).toBeInTheDocument()

    const logoutButton = screen.getByText('Sair (Cliente)')
    fireEvent.click(logoutButton)

    expect(screen.getByText('Entrar')).toBeInTheDocument()
    expect(screen.queryByText('Sair (Cliente)')).not.toBeInTheDocument()
  })
})
