import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shareTicket, getSharedTicket } from './sharing'
import { apiFetch } from './client'

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>()
  return { ...actual, apiFetch: vi.fn() }
})

describe('shareTicket', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('parses the token out of the backend link and posts to compartilhar', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      linkPublico: 'http://localhost:8080/ingressos/compartilhados/abc-123-token',
    })

    const result = await shareTicket('ticket-1')

    expect(apiFetch).toHaveBeenCalledWith('/ingressos/ticket-1/compartilhar', { method: 'POST' })
    expect(result).toEqual({ token: 'abc-123-token' })
  })
})

describe('getSharedTicket', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('maps a seatmap ticket', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ingressoId: 'ing-1',
      eventoId: 'evt-1',
      eventoNome: 'Peça Teste',
      fileira: 2,
      coluna: 3,
      status: 'VENDIDO',
    })

    const shared = await getSharedTicket('abc-123-token')

    expect(apiFetch).toHaveBeenCalledWith('/ingressos/compartilhados/abc-123-token')
    expect(shared).toEqual({
      ticketId: 'ing-1',
      eventId: 'evt-1',
      eventTitle: 'Peça Teste',
      seat: { row: 2, col: 3 },
      status: 'valid',
    })
  })

  it('maps a quantity ticket without a seat', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      ingressoId: 'ing-2',
      eventoId: 'evt-2',
      eventoNome: 'Show Teste',
      fileira: null,
      coluna: null,
      status: 'USADO',
    })

    const shared = await getSharedTicket('def-456-token')

    expect(shared).toEqual({
      ticketId: 'ing-2',
      eventId: 'evt-2',
      eventTitle: 'Show Teste',
      seat: undefined,
      status: 'used',
    })
  })
})
