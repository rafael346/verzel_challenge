import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventDetailContent } from './EventDetailContent'
import * as eventsApi from '@/lib/api/events'
import { ApiError } from '@/lib/api/client'
import { seedEvents } from '@/lib/seed'

vi.mock('@/lib/api/events')

const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!

describe('EventDetailContent', () => {
  beforeEach(() => {
    vi.mocked(eventsApi.getEvent).mockReset()
  })

  it('shows the event details and a buy link', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    render(<EventDetailContent id="event-movie-1" />)

    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Sessão de cinema com poltronas numeradas.')).toBeInTheDocument()
    expect(screen.getByText('Filme')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comprar ingresso' })).toHaveAttribute(
      'href',
      '/events/event-movie-1/book'
    )
  })

  it('does not show a TMDB badge when the event has no tmdbId', async () => {
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)
    render(<EventDetailContent id="event-movie-1" />)

    await screen.findByText('Duna: Parte Três')
    expect(screen.queryByText('Sincronizado do TMDB')).toBeNull()
  })

  it('shows a TMDB badge when the event has a tmdbId', async () => {
    const syncedEvent = { ...movieEvent, tmdbId: 787699, posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg' }
    vi.mocked(eventsApi.getEvent).mockResolvedValue(syncedEvent)
    render(<EventDetailContent id="event-movie-1" />)

    expect(await screen.findByText('Sincronizado do TMDB')).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown id', async () => {
    vi.mocked(eventsApi.getEvent).mockRejectedValue(new ApiError(404, 'Evento não encontrado'))
    render(<EventDetailContent id="does-not-exist" />)
    expect(await screen.findByText('Evento não encontrado.')).toBeInTheDocument()
  })
})
