// src/app/checkout/declined/DeclinedContent.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeclinedContent } from './DeclinedContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push }),
  useSearchParams: () => searchParams,
}))

describe('DeclinedContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer })
  })

  it('retries the same quantity reservation and goes back to checkout', () => {
    searchParams = new URLSearchParams({ eventId: 'event-show-1', quantity: '2' })
    render(<DeclinedContent />)

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    const reservation = useDataStore.getState().pendingReservations[0]
    expect(reservation.quantity).toBe(2)
    expect(push).toHaveBeenCalledWith(`/checkout?reservationId=${reservation.id}`)
  })

  it('sends the customer back to the booking page to choose other seats', () => {
    searchParams = new URLSearchParams({ eventId: 'event-movie-1', seats: '1-1,1-2' })
    render(<DeclinedContent />)

    fireEvent.click(screen.getByRole('button', { name: 'Escolher outros assentos' }))
    expect(push).toHaveBeenCalledWith('/events/event-movie-1/book')
  })
})
