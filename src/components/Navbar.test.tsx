import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
