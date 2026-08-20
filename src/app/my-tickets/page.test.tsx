import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyTicketsPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import * as eventsApi from '@/lib/api/events'
import * as reservationsApi from '@/lib/api/reservations'
import { seedEvents, seedUsers } from '@/lib/seed'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))
vi.mock('@/lib/api/events')
vi.mock('@/lib/api/reservations')

const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!
const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!

describe('MyTicketsPage', () => {
  beforeEach(() => {
    const { password, ...customer } = seedUsers.find((u) => u.role === 'customer')!
    useAuthStore.setState({ currentUser: customer, status: 'authenticated' })
    vi.mocked(eventsApi.getEvent).mockReset()
    vi.mocked(reservationsApi.getMyTickets).mockReset()
  })

  it('lists the tickets belonging to the logged-in customer', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(reservationsApi.getMyTickets).mockResolvedValue([
      {
        id: 'ticket-1',
        code: 'ticket-1',
        eventId: 'event-show-1',
        userId: 'user-customer',
        status: 'valid',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    render(<MyTicketsPage />)
    expect(await screen.findByText('Festival Verão Sonoro')).toBeInTheDocument()
    expect(screen.getByText('Pista')).toBeInTheDocument()
    expect(reservationsApi.getMyTickets).toHaveBeenCalledWith('user-customer')
  })

  it('shows an empty state when the customer has no tickets', async () => {
    vi.mocked(reservationsApi.getMyTickets).mockResolvedValue([])
    render(<MyTicketsPage />)
    expect(await screen.findByText('Você ainda não tem ingressos.')).toBeInTheDocument()
  })

  it('shows the seat position for a seatmap ticket', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    vi.mocked(reservationsApi.getMyTickets).mockResolvedValue([
      {
        id: 'ticket-2',
        code: 'ticket-2',
        eventId: 'event-movie-1',
        userId: 'user-customer',
        seat: { row: 2, col: 3 },
        status: 'valid',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    render(<MyTicketsPage />)
    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Assento: 2-3')).toBeInTheDocument()
  })

  it('shows the "Utilizado" badge for a used ticket', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(reservationsApi.getMyTickets).mockResolvedValue([
      {
        id: 'ticket-3',
        code: 'ticket-3',
        eventId: 'event-show-1',
        userId: 'user-customer',
        status: 'used',
        purchasedAt: '2026-01-01T00:00:00.000Z',
      },
    ])

    render(<MyTicketsPage />)
    await screen.findByText('Festival Verão Sonoro')
    expect(screen.getByText('Utilizado')).toBeInTheDocument()
  })
})
