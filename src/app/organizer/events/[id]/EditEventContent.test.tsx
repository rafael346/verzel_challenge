import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EditEventContent } from './EditEventContent'
import { useAuthStore } from '@/lib/stores/authStore'
import * as eventsApi from '@/lib/api/events'
import { ApiError } from '@/lib/api/client'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))
vi.mock('@/lib/api/events')

const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!
const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!

describe('EditEventContent', () => {
  beforeEach(() => {
    push.mockClear()
    const { password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer })
    vi.mocked(eventsApi.getEvent).mockReset()
    vi.mocked(eventsApi.updateEvent).mockReset()
  })

  it('pre-fills the form with the existing event and saves changes', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(eventsApi.updateEvent).mockResolvedValue(showEvent)

    render(<EditEventContent id="event-show-1" />)

    expect(await screen.findByLabelText('Título')).toHaveValue('Festival Verão Sonoro')

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Festival Atualizado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/organizer'))
    expect(eventsApi.updateEvent).toHaveBeenCalledWith(
      'event-show-1',
      expect.objectContaining({ title: 'Festival Atualizado' })
    )
  })

  it('does not show a TMDB badge for a manually created event', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(eventsApi.updateEvent).mockResolvedValue(showEvent)

    render(<EditEventContent id="event-show-1" />)
    await screen.findByLabelText('Título')

    expect(screen.queryByText('Sincronizado do TMDB')).toBeNull()
  })

  it('shows a TMDB badge for a TMDB-synced event', async () => {
    const syncedEvent = { ...movieEvent, tmdbId: 787699, posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg' }
    vi.mocked(eventsApi.getEvent).mockResolvedValue(syncedEvent)
    vi.mocked(eventsApi.updateEvent).mockResolvedValue(syncedEvent)

    render(<EditEventContent id="event-movie-1" />)

    expect(await screen.findByText('Sincronizado do TMDB')).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown event id', async () => {
    vi.mocked(eventsApi.getEvent).mockRejectedValue(new ApiError(404, 'Evento não encontrado'))
    render(<EditEventContent id="does-not-exist" />)
    expect(await screen.findByText('Evento não encontrado.')).toBeInTheDocument()
  })

  it('pre-fills a seatmap event and saves changes', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    vi.mocked(eventsApi.updateEvent).mockResolvedValue(movieEvent)

    render(<EditEventContent id="event-movie-1" />)

    expect(await screen.findByLabelText('Título')).toHaveValue('Duna: Parte Três')
    expect(screen.getByLabelText('Fileiras')).toHaveValue(5)
    expect(screen.getByLabelText('Colunas')).toHaveValue(8)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Duna: Parte Quatro' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/organizer'))
    expect(eventsApi.updateEvent).toHaveBeenCalledWith(
      'event-movie-1',
      expect.objectContaining({ title: 'Duna: Parte Quatro' })
    )
  })

  it('does not shift the event date when saving without changing it', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(eventsApi.updateEvent).mockResolvedValue(showEvent)

    render(<EditEventContent id="event-show-1" />)
    await screen.findByLabelText('Título')

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(eventsApi.updateEvent).toHaveBeenCalled())
    const [, data] = vi.mocked(eventsApi.updateEvent).mock.calls[0]
    expect(data.date).toBe(showEvent.date)
  })

  it('does not shift a seatmap event date when saving without changing it', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    vi.mocked(eventsApi.updateEvent).mockResolvedValue(movieEvent)

    render(<EditEventContent id="event-movie-1" />)
    await screen.findByLabelText('Título')

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    await waitFor(() => expect(eventsApi.updateEvent).toHaveBeenCalled())
    const [, data] = vi.mocked(eventsApi.updateEvent).mock.calls[0]
    expect(data.date).toBe(movieEvent.date)
  })

  it('shows a not-found message when the event belongs to a different organizer', async () => {
    useAuthStore.setState({
      currentUser: { id: 'user-organizer-2', name: 'Outro Organizador', email: 'outro@teste.com', role: 'organizer' },
    })
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)

    render(<EditEventContent id="event-show-1" />)
    expect(await screen.findByText('Evento não encontrado.')).toBeInTheDocument()
  })

  it('shows a server error and does not navigate when the update is rejected', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)
    vi.mocked(eventsApi.updateEvent).mockRejectedValue(new ApiError(400, 'Dados inválidos'))

    render(<EditEventContent id="event-show-1" />)
    await screen.findByLabelText('Título')
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(await screen.findByText('Dados inválidos')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })
})
