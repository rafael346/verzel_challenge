import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EventPoster } from './EventPoster'
import { Event } from '@/lib/types'

const baseEvent: Event = {
  id: 'e1',
  title: 'Duna: Parte Três',
  category: 'movie',
  description: '',
  date: '2026-09-01T19:00:00.000Z',
  location: 'São Paulo, SP',
  organizerId: 'org-1',
  ticketMode: 'seatmap',
}

describe('EventPoster', () => {
  it('renders the poster image when posterUrl is set', () => {
    render(
      <EventPoster
        event={{ ...baseEvent, posterUrl: 'https://image.tmdb.org/t/p/w500/abc.jpg' }}
        size="sm"
      />
    )
    const img = screen.getByAltText('Duna: Parte Três')
    expect(img).toHaveAttribute('src', expect.stringContaining('image.tmdb.org'))
  })

  it('renders a category placeholder when there is no posterUrl', () => {
    render(<EventPoster event={baseEvent} size="sm" />)
    expect(
      screen.getByRole('img', { name: 'Sem poster disponível para Duna: Parte Três' })
    ).toHaveTextContent('🎬')
  })

  it('renders a different placeholder per category', () => {
    render(<EventPoster event={{ ...baseEvent, category: 'show' }} size="sm" />)
    expect(screen.getByText('🎤')).toBeInTheDocument()
  })
})
