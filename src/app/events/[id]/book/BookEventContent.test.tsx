import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { BookEventContent } from './BookEventContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))

describe('BookEventContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer })
  })

  it('reserves selected seats and goes to checkout for a seatmap event', () => {
    render(<BookEventContent id="event-movie-1" />)
    fireEvent.click(screen.getByRole('button', { name: 'Assento fileira 1, coluna 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    const reservation = useDataStore.getState().pendingReservations[0]
    expect(reservation.seats).toEqual([{ row: 1, col: 1 }])
    expect(push).toHaveBeenCalledWith(`/checkout?reservationId=${reservation.id}`)
  })

  it('reserves a quantity and goes to checkout for a quantity event', () => {
    render(<BookEventContent id="event-show-1" />)
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    const reservation = useDataStore.getState().pendingReservations[0]
    expect(reservation.quantity).toBe(2)
    expect(push).toHaveBeenCalledWith(`/checkout?reservationId=${reservation.id}`)
  })

  it('shows an inline error and does not navigate when a selected seat is grabbed by another user first', () => {
    render(<BookEventContent id="event-movie-1" />)
    fireEvent.click(screen.getByRole('button', { name: 'Assento fileira 1, coluna 1' }))

    // Simulate a race: another tab/user reserves the same seat before this one confirms.
    // The seat stays visually "selected" locally (selection state takes precedence over
    // the seat's live status in SeatGrid), so the button remains clickable — exactly the
    // real race the store-level check in reserveSeats exists to catch.
    act(() => {
      useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    expect(screen.getByText('Um ou mais assentos não estão disponíveis')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('disables the checkout button for a sold-out quantity event', () => {
    useDataStore.setState((state) => ({
      events: state.events.map((e) => (e.id === 'event-show-1' ? { ...e, sold: e.totalCapacity } : e)),
    }))
    render(<BookEventContent id="event-show-1" />)

    expect(screen.getByRole('button', { name: 'Continuar para pagamento' })).toBeDisabled()
  })

  it('shows a not-found message for an unknown event id', () => {
    render(<BookEventContent id="does-not-exist" />)
    expect(screen.getByText('Evento não encontrado.')).toBeInTheDocument()
  })
})
