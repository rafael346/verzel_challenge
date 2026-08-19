import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DeclinedContent } from './DeclinedContent'
import { useDataStore } from '@/lib/stores/dataStore'
import * as reservationsApi from '@/lib/api/reservations'

const push = vi.fn()
let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push }),
  useSearchParams: () => searchParams,
}))
vi.mock('@/lib/api/reservations')

const reservation = {
  id: 'res-1',
  eventId: 'event-show-1',
  items: [{ ticketId: 'ing-1', price: 150 }],
  total: 150,
  expiresAt: '2026-01-01T00:10:00Z',
}

describe('DeclinedContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ pendingReservation: reservation })
    vi.mocked(reservationsApi.cancelReservation).mockReset()
    vi.mocked(reservationsApi.cancelReservation).mockResolvedValue(undefined)
  })

  it('shows "Pagamento recusado" with a retry option by default', () => {
    searchParams = new URLSearchParams()
    render(<DeclinedContent />)
    expect(screen.getByText('Pagamento recusado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument()
  })

  it('retries by returning to checkout with the same reservation id', () => {
    searchParams = new URLSearchParams({ reason: 'declined' })
    render(<DeclinedContent />)

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(push).toHaveBeenCalledWith('/checkout?reservationId=res-1')
    expect(reservationsApi.cancelReservation).not.toHaveBeenCalled()
  })

  it('shows "Reserva expirada" without a retry option when the reservation expired', () => {
    searchParams = new URLSearchParams({ reason: 'expired' })
    render(<DeclinedContent />)

    expect(screen.getByText('Reserva expirada')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument()
  })

  it('cancels the reservation and sends the customer back to the booking page to choose other seats', async () => {
    searchParams = new URLSearchParams({ reason: 'declined' })
    render(<DeclinedContent />)

    fireEvent.click(screen.getByRole('button', { name: 'Escolher outros assentos' }))

    await waitFor(() => expect(reservationsApi.cancelReservation).toHaveBeenCalledWith('res-1'))
    expect(push).toHaveBeenCalledWith('/events/event-show-1/book')
    expect(useDataStore.getState().pendingReservation).toBeNull()
  })
})
