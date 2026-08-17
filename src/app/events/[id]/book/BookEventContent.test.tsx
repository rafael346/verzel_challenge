import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
})
