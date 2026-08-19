import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventCard } from './EventCard'
import { Event } from '@/lib/types'

const soldOutEvent: Event = {
  id: 'e1',
  title: 'Peça Esgotada',
  category: 'theater',
  description: '',
  date: '2026-12-01T20:00:00.000Z',
  location: 'Curitiba, PR',
  organizerId: 'org-1',
  ticketMode: 'quantity',
  price: 60,
  totalCapacity: 5,
  sold: 5,
  reservedQuantity: 0,
}

const availableEvent: Event = {
  ...soldOutEvent,
  id: 'e2',
  title: 'Peça Disponível',
  sold: 0,
}

describe('EventCard', () => {
  it('renders title, location and price', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByText('Peça Esgotada')).toBeInTheDocument()
    expect(screen.getByText('Curitiba, PR')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 60/)).toBeInTheDocument()
  })

  it('renders category and formatted date', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByText('Teatro')).toBeInTheDocument()
    expect(screen.getByText('01/12/2026')).toBeInTheDocument()
  })

  it('links to the event detail page', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/events/e1')
  })

  it('shows an "Esgotado" badge when sold out', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByText('Esgotado')).toBeInTheDocument()
  })

  it('does not show an "Esgotado" badge when not sold out', () => {
    render(<EventCard event={availableEvent} />)
    expect(screen.queryByText('Esgotado')).toBeNull()
  })

  it('renders the poster image when the event has a posterUrl', () => {
    render(<EventCard event={{ ...soldOutEvent, posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg' }} />)
    expect(screen.getByAltText('Peça Esgotada')).toHaveAttribute('src', expect.stringContaining('image.tmdb.org'))
  })

  it('renders a category placeholder when the event has no posterUrl', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByRole('img', { name: 'Sem poster disponível para Peça Esgotada' })).toBeInTheDocument()
  })
})
