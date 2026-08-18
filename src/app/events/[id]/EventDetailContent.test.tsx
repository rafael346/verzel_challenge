import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventDetailContent } from './EventDetailContent'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents } from '@/lib/seed'

describe('EventDetailContent', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
  })

  it('shows the event details and a buy link', () => {
    render(<EventDetailContent id="event-movie-1" />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Sessão de cinema com poltronas numeradas.')).toBeInTheDocument()
    expect(screen.getByText('Filme')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Comprar ingresso' })).toHaveAttribute(
      'href',
      '/events/event-movie-1/book'
    )
  })

  it('shows a not-found message for an unknown id', () => {
    render(<EventDetailContent id="does-not-exist" />)
    expect(screen.getByText('Evento não encontrado.')).toBeInTheDocument()
  })

  it('disables the buy link when the event is sold out', () => {
    useDataStore.setState((state) => ({
      events: state.events.map((e) =>
        e.id === 'event-show-1' ? { ...e, sold: e.totalCapacity } : e
      ),
    }))
    render(<EventDetailContent id="event-show-1" />)
    expect(screen.getByText('Esgotado')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Comprar ingresso' })).not.toBeInTheDocument()
  })
})
