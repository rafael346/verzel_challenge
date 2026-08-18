import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyTicketsPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'
import { Ticket } from '@/lib/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))

describe('MyTicketsPage', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer })
  })

  it('lists the tickets belonging to the logged-in customer', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 2) as { reservationId: string }
    useDataStore.getState().confirmPayment(reservationId, 'user-customer')

    render(<MyTicketsPage />)
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
    expect(screen.getByText('Quantidade: 2')).toBeInTheDocument()
  })

  it('shows an empty state when the customer has no tickets', () => {
    render(<MyTicketsPage />)
    expect(screen.getByText('Você ainda não tem ingressos.')).toBeInTheDocument()
  })

  it("does not show another customer's tickets", () => {
    useDataStore.setState((state) => ({
      tickets: [
        ...state.tickets,
        {
          id: 'ticket-other-user',
          code: 'code-other-user',
          eventId: 'event-show-1',
          userId: 'someone-else',
          quantity: 1,
          status: 'valid',
          purchasedAt: new Date().toISOString(),
        },
      ],
    }))
    render(<MyTicketsPage />)
    expect(screen.queryByText('Festival Verão Sonoro')).not.toBeInTheDocument()
  })

  it('shows the seat position for a seatmap ticket', () => {
    const { reservationId } = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 2, col: 3 }]) as {
      reservationId: string
    }
    useDataStore.getState().confirmPayment(reservationId, 'user-customer')

    render(<MyTicketsPage />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Assento: 2-3')).toBeInTheDocument()
  })

  it('shows the "Utilizado" badge for a used ticket', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 1) as { reservationId: string }
    const [ticket] = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]
    useDataStore.setState((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? { ...t, status: 'used' } : t)),
    }))

    render(<MyTicketsPage />)
    expect(screen.getByText('Utilizado')).toBeInTheDocument()
  })
})
