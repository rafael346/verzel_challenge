import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CheckoutContent } from './CheckoutContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push }),
  useSearchParams: () => searchParams,
}))

describe('CheckoutContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer })
  })

  it('shows the reservation summary and confirms payment on approval', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 2) as { reservationId: string }
    searchParams = new URLSearchParams({ reservationId })

    render(<CheckoutContent />)
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
    expect(screen.getByText('Total: R$ 300.00')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Simular aprovação' }))

    expect(useDataStore.getState().tickets).toHaveLength(1)
    expect(push).toHaveBeenCalledWith('/checkout/success')
  })

  it('releases the reservation and redirects to the declined page on decline', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 2) as { reservationId: string }
    searchParams = new URLSearchParams({ reservationId })

    render(<CheckoutContent />)
    fireEvent.click(screen.getByRole('button', { name: 'Simular recusa' }))

    expect(useDataStore.getState().pendingReservations).toHaveLength(0)
    expect(push).toHaveBeenCalledWith('/checkout/declined?eventId=event-show-1&quantity=2')
  })

  it('shows a not-found message when the reservation no longer exists', () => {
    searchParams = new URLSearchParams({ reservationId: 'does-not-exist' })
    render(<CheckoutContent />)
    expect(screen.getByText(/Reserva não encontrada/)).toBeInTheDocument()
  })
})
