import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TicketDetailContent } from './TicketDetailContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'
import { Ticket } from '@/lib/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))

describe('TicketDetailContent', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer })
  })

  it('shows the ticket QR code and event details', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 1) as { reservationId: string }
    const [ticket] = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]

    render(<TicketDetailContent ticketId={ticket.id} />)
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
    expect(screen.getByText(ticket.code)).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown ticket id', () => {
    render(<TicketDetailContent ticketId="does-not-exist" />)
    expect(screen.getByText('Ingresso não encontrado.')).toBeInTheDocument()
  })

  it("shows a not-found message for another customer's ticket id", () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 1) as { reservationId: string }
    const [ticket] = useDataStore.getState().confirmPayment(reservationId, 'someone-else') as Ticket[]

    render(<TicketDetailContent ticketId={ticket.id} />)
    expect(screen.getByText('Ingresso não encontrado.')).toBeInTheDocument()
  })

  it('shows the seat position for a seatmap ticket', () => {
    const { reservationId } = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 2, col: 3 }]) as { reservationId: string }
    const [ticket] = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]

    render(<TicketDetailContent ticketId={ticket.id} />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Assento: 2-3')).toBeInTheDocument()
  })

  it('shows the "Utilizado" badge and still shows the QR code for a used ticket', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 1) as { reservationId: string }
    const [ticket] = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]
    useDataStore.setState((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? { ...t, status: 'used' } : t)),
    }))

    render(<TicketDetailContent ticketId={ticket.id} />)
    expect(screen.getByText('Utilizado')).toBeInTheDocument()
    expect(screen.getByText(ticket.code)).toBeInTheDocument()
  })
})
