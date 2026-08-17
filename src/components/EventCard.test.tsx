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

describe('EventCard', () => {
  it('renders title, location and price', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByText('Peça Esgotada')).toBeInTheDocument()
    expect(screen.getByText('Curitiba, PR')).toBeInTheDocument()
    expect(screen.getByText(/R\$ 60/)).toBeInTheDocument()
  })

  it('shows an "Esgotado" badge when sold out', () => {
    render(<EventCard event={soldOutEvent} />)
    expect(screen.getByText('Esgotado')).toBeInTheDocument()
  })
})
