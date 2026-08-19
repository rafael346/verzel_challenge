import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrganizerDashboardPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import * as eventsApi from '@/lib/api/events'
import { seedEvents, seedUsers } from '@/lib/seed'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))
vi.mock('@/lib/api/events')

describe('OrganizerDashboardPage', () => {
  beforeEach(() => {
    const { password: _password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer, status: 'authenticated' })
    vi.mocked(eventsApi.listEvents).mockReset()
    vi.mocked(eventsApi.deleteEvent).mockReset()
  })

  it("lists only the logged-in organizer's events", async () => {
    vi.mocked(eventsApi.listEvents).mockResolvedValue(seedEvents)
    render(<OrganizerDashboardPage />)
    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('shows an empty state when the organizer has no events', async () => {
    vi.mocked(eventsApi.listEvents).mockResolvedValue([])
    render(<OrganizerDashboardPage />)
    expect(await screen.findByText('Nenhum evento cadastrado.')).toBeInTheDocument()
  })

  it("does not show another organizer's events", async () => {
    vi.mocked(eventsApi.listEvents).mockResolvedValue([
      ...seedEvents,
      {
        id: 'event-other-organizer',
        title: 'Evento de Outro Organizador',
        category: 'show',
        description: '',
        date: '2026-11-01T20:00:00.000Z',
        location: 'Manaus, AM',
        organizerId: 'someone-else',
        ticketMode: 'quantity',
        price: 50,
        totalCapacity: 10,
      },
    ])
    render(<OrganizerDashboardPage />)
    await screen.findByText('Duna: Parte Três')
    expect(screen.queryByText('Evento de Outro Organizador')).not.toBeInTheDocument()
  })

  it('deletes the event when the user confirms', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(eventsApi.listEvents)
      .mockResolvedValueOnce(seedEvents)
      .mockResolvedValueOnce(seedEvents.filter((e) => e.id !== 'event-movie-1'))
    vi.mocked(eventsApi.deleteEvent).mockResolvedValue(undefined)

    render(<OrganizerDashboardPage />)
    await screen.findByText('Duna: Parte Três')

    fireEvent.click(screen.getAllByText('Excluir')[0])

    await waitFor(() => expect(eventsApi.deleteEvent).toHaveBeenCalledWith('event-movie-1'))
    await waitFor(() => expect(screen.queryByText('Duna: Parte Três')).not.toBeInTheDocument())
  })

  it('keeps the event when the user cancels the confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    vi.mocked(eventsApi.listEvents).mockResolvedValue(seedEvents)

    render(<OrganizerDashboardPage />)
    await screen.findByText('Duna: Parte Três')

    fireEvent.click(screen.getAllByText('Excluir')[0])

    expect(eventsApi.deleteEvent).not.toHaveBeenCalled()
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
  })
})
