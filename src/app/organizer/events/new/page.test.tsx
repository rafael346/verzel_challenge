import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import NewEventPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedUsers } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))

describe('NewEventPage', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ events: [], tickets: [], pendingReservations: [] })
    const { password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer })
  })

  it('creates an event for the logged-in organizer and redirects to the dashboard', () => {
    render(<NewEventPage />)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Novo Show' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição' } })
    fireEvent.change(screen.getByLabelText('Local'), { target: { value: 'São Paulo, SP' } })
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2099-01-01T20:00' } })
    fireEvent.change(screen.getByLabelText('Preço'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Capacidade total'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar evento' }))

    const created = useDataStore.getState().events.find((e) => e.title === 'Novo Show')
    expect(created?.organizerId).toBe('user-organizer')
    expect(push).toHaveBeenCalledWith('/organizer')
  })
})
