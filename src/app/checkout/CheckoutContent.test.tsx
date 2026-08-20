import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StrictMode } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutContent } from './CheckoutContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import * as eventsApi from '@/lib/api/events'
import * as reservationsApi from '@/lib/api/reservations'
import { ApiError } from '@/lib/api/client'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push }),
  useSearchParams: () => searchParams,
}))
vi.mock('@/lib/api/events')
vi.mock('@/lib/api/reservations')

const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!
const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!

const quantityReservation = {
  id: 'res-1',
  eventId: 'event-show-1',
  items: [
    { ticketId: 'ing-1', price: 150 },
    { ticketId: 'ing-2', price: 150 },
  ],
  total: 300,
  expiresAt: '2026-01-01T00:10:00Z',
}

const seatReservation = {
  id: 'res-2',
  eventId: 'event-movie-1',
  items: [
    { ticketId: 'ing-3', row: 1, col: 1, price: 32 },
    { ticketId: 'ing-4', row: 1, col: 2, price: 32 },
  ],
  total: 64,
  expiresAt: '2026-01-01T00:10:00Z',
}

describe('CheckoutContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ pendingReservation: null })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer })
    vi.mocked(eventsApi.getEvent).mockReset()
    vi.mocked(reservationsApi.confirmReservation).mockReset()
    vi.mocked(reservationsApi.cancelReservation).mockReset()
    vi.mocked(reservationsApi.cancelReservation).mockResolvedValue(undefined)
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
  })

  it('shows the reservation summary and confirms payment on approval', async () => {
    useDataStore.setState({ pendingReservation: quantityReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-1' })
    vi.mocked(reservationsApi.confirmReservation).mockResolvedValue([
      {
        id: 'ing-1',
        code: 'ing-1',
        eventId: 'event-show-1',
        userId: 'user-customer',
        status: 'valid',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'ing-2',
        code: 'ing-2',
        eventId: 'event-show-1',
        userId: 'user-customer',
        status: 'valid',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    render(<CheckoutContent />)
    expect(await screen.findByText('Festival Verão Sonoro')).toBeInTheDocument()
    expect(screen.getByText('Total: R$ 300.00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Simular aprovação' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout/success'))
    expect(reservationsApi.confirmReservation).toHaveBeenCalledWith('res-1', 'pm_card_visa', 'user-customer')
    expect(useDataStore.getState().pendingReservation).toBeNull()
  })

  it('redirects to the declined page with reason=declined on a payment decline', async () => {
    useDataStore.setState({ pendingReservation: quantityReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-1' })
    vi.mocked(reservationsApi.confirmReservation).mockRejectedValue(new ApiError(402, 'Pagamento recusado'))

    render(<CheckoutContent />)
    await screen.findByText('Festival Verão Sonoro')
    fireEvent.click(screen.getByRole('button', { name: 'Simular recusa' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout/declined?reason=declined'))
    expect(reservationsApi.confirmReservation).toHaveBeenCalledWith('res-1', 'pm_card_chargeDeclined', 'user-customer')
    expect(useDataStore.getState().pendingReservation).toEqual(quantityReservation)
  })

  it('redirects to the declined page with reason=expired when the reservation has expired', async () => {
    useDataStore.setState({ pendingReservation: quantityReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-1' })
    vi.mocked(reservationsApi.confirmReservation).mockRejectedValue(new ApiError(410, 'Reserva expirada'))

    render(<CheckoutContent />)
    await screen.findByText('Festival Verão Sonoro')
    fireEvent.click(screen.getByRole('button', { name: 'Simular aprovação' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/checkout/declined?reason=expired'))
  })

  it('shows the correct total and seats for a seatmap reservation', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    useDataStore.setState({ pendingReservation: seatReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-2' })

    render(<CheckoutContent />)
    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Assentos: 1-1, 1-2')).toBeInTheDocument()
    expect(screen.getByText('Total: R$ 64.00')).toBeInTheDocument()
  })

  it('shows a not-found message when the reservation no longer exists', async () => {
    searchParams = new URLSearchParams({ reservationId: 'does-not-exist' })
    render(<CheckoutContent />)
    expect(await screen.findByText(/Reserva não encontrada/)).toBeInTheDocument()
  })

  it('cancels the reservation when the user navigates away without deciding', async () => {
    useDataStore.setState({ pendingReservation: quantityReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-1' })

    const { unmount } = render(<CheckoutContent />)
    unmount()

    await waitFor(() => expect(reservationsApi.cancelReservation).toHaveBeenCalledWith('res-1'))
  })

  it('does not cancel the reservation when React Strict Mode double-invokes the effect (mount-cleanup-mount)', async () => {
    useDataStore.setState({ pendingReservation: quantityReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-1' })

    render(
      <StrictMode>
        <CheckoutContent />
      </StrictMode>
    )
    await screen.findByText('Festival Verão Sonoro')

    expect(reservationsApi.cancelReservation).not.toHaveBeenCalled()
  })

  it('does not throw when unmounting after the reservation was already confirmed', async () => {
    useDataStore.setState({ pendingReservation: quantityReservation })
    searchParams = new URLSearchParams({ reservationId: 'res-1' })
    vi.mocked(reservationsApi.confirmReservation).mockResolvedValue([
      {
        id: 'ing-1',
        code: 'ing-1',
        eventId: 'event-show-1',
        userId: 'user-customer',
        status: 'valid',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'ing-2',
        code: 'ing-2',
        eventId: 'event-show-1',
        userId: 'user-customer',
        status: 'valid',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    const { unmount } = render(<CheckoutContent />)
    await screen.findByText('Festival Verão Sonoro')
    fireEvent.click(screen.getByRole('button', { name: 'Simular aprovação' }))
    await waitFor(() => expect(useDataStore.getState().pendingReservation).toBeNull())

    expect(() => unmount()).not.toThrow()
    await Promise.resolve()
    expect(reservationsApi.cancelReservation).not.toHaveBeenCalled()
  })
})
