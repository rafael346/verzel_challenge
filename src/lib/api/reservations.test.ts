import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAvailability, createReservation, confirmReservation, cancelReservation } from './reservations'
import { apiFetch } from './client'

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>()
  return { ...actual, apiFetch: vi.fn() }
})

describe('getAvailability', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('maps a seatmap response into an all-available grid minus the occupied seats', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      fileiras: 2,
      colunas: 2,
      assentosOcupados: [{ fileira: 1, coluna: 2 }],
      quantidadeDisponivel: null,
    })

    const availability = await getAvailability('evt-1')

    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-1/disponibilidade')
    expect(availability).toEqual({
      mode: 'seatmap',
      rows: 2,
      cols: 2,
      seats: [
        { row: 1, col: 1, status: 'available' },
        { row: 1, col: 2, status: 'sold' },
        { row: 2, col: 1, status: 'available' },
        { row: 2, col: 2, status: 'available' },
      ],
    })
  })

  it('maps a quantity response into an available count', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      fileiras: null,
      colunas: null,
      assentosOcupados: null,
      quantidadeDisponivel: 37,
    })

    const availability = await getAvailability('evt-2')

    expect(availability).toEqual({ mode: 'quantity', available: 37 })
  })
})

describe('createReservation', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('sends selected seats and maps the response, attaching the eventId', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      reservaId: 'res-1',
      itens: [{ ingressoId: 'ing-1', fileira: 1, coluna: 1, preco: 32 }],
      valorTotal: 32,
      expiraEm: '2026-01-01T00:10:00Z',
    })

    const reservation = await createReservation('evt-1', { seats: [{ row: 1, col: 1 }] })

    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-1/reservas', {
      method: 'POST',
      body: JSON.stringify({ assentos: [{ fileira: 1, coluna: 1 }] }),
    })
    expect(reservation).toEqual({
      id: 'res-1',
      eventId: 'evt-1',
      items: [{ ticketId: 'ing-1', row: 1, col: 1, price: 32 }],
      total: 32,
      expiresAt: '2026-01-01T00:10:00Z',
    })
  })

  it('sends a quantity and maps a multi-item response (one item per unit)', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      reservaId: 'res-2',
      itens: [
        { ingressoId: 'ing-2', fileira: null, coluna: null, preco: 150 },
        { ingressoId: 'ing-3', fileira: null, coluna: null, preco: 150 },
      ],
      valorTotal: 300,
      expiraEm: '2026-01-01T00:10:00Z',
    })

    const reservation = await createReservation('evt-2', { quantity: 2 })

    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-2/reservas', {
      method: 'POST',
      body: JSON.stringify({ quantidade: 2 }),
    })
    expect(reservation.items).toEqual([
      { ticketId: 'ing-2', row: undefined, col: undefined, price: 150 },
      { ticketId: 'ing-3', row: undefined, col: undefined, price: 150 },
    ])
  })
})

describe('confirmReservation', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('maps confirmed IngressoResponse items into Tickets for the given user', async () => {
    vi.mocked(apiFetch).mockResolvedValue([
      {
        id: 'ing-1',
        eventoId: 'evt-1',
        fileira: 1,
        coluna: 1,
        preco: 32,
        status: 'VENDIDO',
        validoAte: '2026-01-01T22:00:00Z',
      },
      {
        id: 'ing-2',
        eventoId: 'evt-1',
        fileira: null,
        coluna: null,
        preco: 150,
        status: 'USADO',
        validoAte: '2026-01-01T22:00:00Z',
      },
    ])

    const tickets = await confirmReservation('res-1', 'pm_card_visa', 'user-1')

    expect(apiFetch).toHaveBeenCalledWith('/reservas/res-1/confirmar', {
      method: 'POST',
      body: JSON.stringify({ paymentMethodId: 'pm_card_visa' }),
    })
    expect(tickets[0]).toMatchObject({
      id: 'ing-1',
      code: 'ing-1',
      eventId: 'evt-1',
      userId: 'user-1',
      seat: { row: 1, col: 1 },
      status: 'valid',
    })
    expect(tickets[1]).toMatchObject({
      id: 'ing-2',
      code: 'ing-2',
      eventId: 'evt-1',
      userId: 'user-1',
      seat: undefined,
      status: 'used',
    })
  })
})

describe('cancelReservation', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('sends a POST to cancelar', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    await cancelReservation('res-1')
    expect(apiFetch).toHaveBeenCalledWith('/reservas/res-1/cancelar', { method: 'POST' })
  })
})
