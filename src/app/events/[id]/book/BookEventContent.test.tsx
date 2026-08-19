import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookEventContent } from './BookEventContent'
import { useDataStore } from '@/lib/stores/dataStore'
import * as eventsApi from '@/lib/api/events'
import * as reservationsApi from '@/lib/api/reservations'
import { ApiError } from '@/lib/api/client'
import { buildSeats } from '@/lib/seats'
import { seedEvents } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))
vi.mock('@/lib/api/events')
vi.mock('@/lib/api/reservations')

const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!
const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!

describe('BookEventContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ pendingReservation: null })
    vi.mocked(eventsApi.getEvent).mockReset()
    vi.mocked(reservationsApi.getAvailability).mockReset()
    vi.mocked(reservationsApi.createReservation).mockReset()
  })

  it('reserves selected seats and goes to checkout for a seatmap event', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    vi.mocked(reservationsApi.getAvailability).mockResolvedValue({
      mode: 'seatmap',
      rows: 5,
      cols: 8,
      seats: buildSeats(5, 8),
    })
    vi.mocked(reservationsApi.createReservation).mockResolvedValue({
      id: 'res-1',
      eventId: 'event-movie-1',
      items: [{ ticketId: 'ing-1', row: 1, col: 1, price: 32 }],
      total: 32,
      expiresAt: '2026-01-01T00:10:00Z',
    })

    render(<BookEventContent id="event-movie-1" />)

    fireEvent.click(await screen.findByRole('button', { name: 'Assento fileira 1, coluna 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout?reservationId=res-1'))
    expect(reservationsApi.createReservation).toHaveBeenCalledWith('event-movie-1', {
      seats: [{ row: 1, col: 1 }],
    })
    expect(useDataStore.getState().pendingReservation).toEqual({
      id: 'res-1',
      eventId: 'event-movie-1',
      items: [{ ticketId: 'ing-1', row: 1, col: 1, price: 32 }],
      total: 32,
      expiresAt: '2026-01-01T00:10:00Z',
    })
  })

  it('reserves a quantity and goes to checkout for a quantity event', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(reservationsApi.getAvailability).mockResolvedValue({ mode: 'quantity', available: 50 })
    vi.mocked(reservationsApi.createReservation).mockResolvedValue({
      id: 'res-2',
      eventId: 'event-show-1',
      items: [
        { ticketId: 'ing-2', price: 150 },
        { ticketId: 'ing-3', price: 150 },
      ],
      total: 300,
      expiresAt: '2026-01-01T00:10:00Z',
    })

    render(<BookEventContent id="event-show-1" />)

    fireEvent.click(await screen.findByRole('button', { name: '+' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout?reservationId=res-2'))
    expect(reservationsApi.createReservation).toHaveBeenCalledWith('event-show-1', { quantity: 2 })
  })

  it('shows an inline error and refetches availability when a selected seat is grabbed by another user first', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    vi.mocked(reservationsApi.getAvailability).mockResolvedValue({
      mode: 'seatmap',
      rows: 5,
      cols: 8,
      seats: buildSeats(5, 8),
    })
    vi.mocked(reservationsApi.createReservation).mockRejectedValue(
      new ApiError(409, 'Assento não está mais disponível')
    )

    render(<BookEventContent id="event-movie-1" />)

    fireEvent.click(await screen.findByRole('button', { name: 'Assento fileira 1, coluna 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar para pagamento' }))

    expect(await screen.findByText('Assento não está mais disponível')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
    await waitFor(() => expect(reservationsApi.getAvailability).toHaveBeenCalledTimes(2))
  })

  it('disables the checkout button for a sold-out quantity event', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(reservationsApi.getAvailability).mockResolvedValue({ mode: 'quantity', available: 0 })

    render(<BookEventContent id="event-show-1" />)

    expect(await screen.findByRole('button', { name: 'Continuar para pagamento' })).toBeDisabled()
  })

  it('shows a not-found message for an unknown event id', async () => {
    vi.mocked(eventsApi.getEvent).mockRejectedValue(new ApiError(404, 'Evento não encontrado'))
    vi.mocked(reservationsApi.getAvailability).mockRejectedValue(new ApiError(404, 'Evento não encontrado'))
    render(<BookEventContent id="does-not-exist" />)
    expect(await screen.findByText('Evento não encontrado.')).toBeInTheDocument()
  })
})
