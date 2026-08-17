import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyTicketsPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

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
})
