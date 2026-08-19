import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SharedTicketContent } from './SharedTicketContent'
import * as sharingApi from '@/lib/api/sharing'
import * as eventsApi from '@/lib/api/events'
import { ApiError } from '@/lib/api/client'
import { seedEvents } from '@/lib/seed'

vi.mock('@/lib/api/sharing')
vi.mock('@/lib/api/events')

const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!
const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!

describe('SharedTicketContent', () => {
  beforeEach(() => {
    vi.mocked(sharingApi.getSharedTicket).mockReset()
    vi.mocked(eventsApi.getEvent).mockReset()
  })

  it('shows the event, seat, status, and a QR code for the shared ticket', async () => {
    vi.mocked(sharingApi.getSharedTicket).mockResolvedValue({
      ticketId: 'ing-1',
      eventId: 'event-show-1',
      eventTitle: 'Festival Verão Sonoro',
      status: 'valid',
    })
    vi.mocked(eventsApi.getEvent).mockResolvedValue(showEvent)

    render(<SharedTicketContent token="share-token-1" />)

    expect(await screen.findByText('Festival Verão Sonoro')).toBeInTheDocument()
    expect(screen.getByText('Pista')).toBeInTheDocument()
    expect(screen.getByText('Válido')).toBeInTheDocument()
    expect(screen.getByText('ing-1')).toBeInTheDocument()
  })

  it('shows the seat for a seatmap ticket', async () => {
    vi.mocked(sharingApi.getSharedTicket).mockResolvedValue({
      ticketId: 'ing-2',
      eventId: 'event-movie-1',
      eventTitle: 'Duna: Parte Três',
      seat: { row: 2, col: 3 },
      status: 'valid',
    })
    vi.mocked(eventsApi.getEvent).mockResolvedValue(movieEvent)

    render(<SharedTicketContent token="share-token-2" />)

    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Assento: 2-3')).toBeInTheDocument()
  })

  it('shows a not-found message for an invalid token', async () => {
    vi.mocked(sharingApi.getSharedTicket).mockRejectedValue(new ApiError(404, 'Ingresso não encontrado'))

    render(<SharedTicketContent token="does-not-exist" />)

    expect(await screen.findByText('Ingresso não encontrado.')).toBeInTheDocument()
  })
})
