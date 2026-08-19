import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { BookEventContent } from './BookEventContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import * as eventsApi from '@/lib/api/events'
import { ApiError } from '@/lib/api/client'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))
vi.mock('@/lib/api/events')

const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!
const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!

describe('BookEventContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ events: [], tickets: [], pendingReservations: [] })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer, status: 'authenticated' })
    vi.mocked(eventsApi.getEvent).mockReset()
  })

  it('reserves selected seats and goes to checkout for a seatmap event', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    render(<BookEventContent id="event-movie-1" />)

    fireEvent.click(await screen.findByRole('button', { name: 'Assento fileira 1, coluna 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    const reservation = useDataStore.getState().pendingReservations[0]
    expect(reservation.seats).toEqual([{ row: 1, col: 1 }])
    expect(push).toHaveBeenCalledWith(`/checkout?reservationId=${reservation.id}`)
  })

  it('reserves a quantity and goes to checkout for a quantity event', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    render(<BookEventContent id="event-show-1" />)

    fireEvent.click(await screen.findByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    const reservation = useDataStore.getState().pendingReservations[0]
    expect(reservation.quantity).toBe(2)
    expect(push).toHaveBeenCalledWith(`/checkout?reservationId=${reservation.id}`)
  })

  it('shows an inline error and does not navigate when a selected seat is grabbed by another user first', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    render(<BookEventContent id="event-movie-1" />)

    fireEvent.click(await screen.findByRole('button', { name: 'Assento fileira 1, coluna 1' }))

    // Simulate a race: another tab/user reserves the same seat before this one confirms.
    act(() => {
      useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }])
    })

    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    expect(screen.getByText('Um ou mais assentos não estão disponíveis')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('disables the checkout button for a sold-out quantity event', async () => {
    // Pre-seed dataStore with the sold-out state under the same id the mocked getEvent will
    // resolve with — registerEvent is a no-op when the id is already present, so this
    // pre-seeded state is what BookEventContent ends up reading.
    useDataStore.setState((state) => ({
      events: [...state.events, { ...showEvent, sold: showEvent.totalCapacity }],
    }))
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)

    render(<BookEventContent id="event-show-1" />)

    expect(await screen.findByRole('button', { name: 'Continuar para pagamento' })).toBeDisabled()
  })

  it('shows a not-found message for an unknown event id', async () => {
    vi.mocked(eventsApi.getEvent).mockRejectedValue(new ApiError(404, 'Evento não encontrado'))
    render(<BookEventContent id="does-not-exist" />)
    expect(await screen.findByText('Evento não encontrado.')).toBeInTheDocument()
  })
})
