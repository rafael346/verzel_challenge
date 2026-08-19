import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrganizerDashboardPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))

describe('OrganizerDashboardPage', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password: _password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer, status: 'authenticated' })
  })

  it("lists only the logged-in organizer's events", () => {
    render(<OrganizerDashboardPage />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('shows an empty state when the organizer has no events', () => {
    useDataStore.setState({ events: [], tickets: [], pendingReservations: [] })
    render(<OrganizerDashboardPage />)
    expect(screen.getByText('Nenhum evento cadastrado.')).toBeInTheDocument()
  })

  it("does not show another organizer's events", () => {
    useDataStore.setState((state) => ({
      events: [
        ...state.events,
        {
          id: 'event-other-organizer',
          title: 'Evento de Outro Organizador',
          category: 'show',
          description: '',
          date: '2026-11-01T20:00:00.000Z',
          location: 'Manaus, AM',
          organizerId: 'someone-else',
          ticketMode: 'quantity',
          price: 50,
          totalCapacity: 10,
          sold: 0,
          reservedQuantity: 0,
        },
      ],
    }))
    render(<OrganizerDashboardPage />)
    expect(screen.queryByText('Evento de Outro Organizador')).not.toBeInTheDocument()
  })

  it('deletes the event when the user confirms', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<OrganizerDashboardPage />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()

    const buttons = screen.getAllByText('Excluir')
    fireEvent.click(buttons[0])

    expect(useDataStore.getState().events.find((e) => e.id === 'event-movie-1')).toBeUndefined()
    expect(screen.queryByText('Duna: Parte Três')).not.toBeInTheDocument()
  })

  it('keeps the event when the user cancels the confirmation', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<OrganizerDashboardPage />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()

    const buttons = screen.getAllByText('Excluir')
    fireEvent.click(buttons[0])

    expect(useDataStore.getState().events.find((e) => e.id === 'event-movie-1')).toBeDefined()
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
  })
})
