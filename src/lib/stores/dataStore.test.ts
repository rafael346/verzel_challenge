import { describe, it, expect, beforeEach } from 'vitest'
import { useDataStore } from './dataStore'
import { seedEvents } from '@/lib/seed'
import type { Ticket } from '@/lib/types'

function resetStore() {
  useDataStore.setState({
    events: JSON.parse(JSON.stringify(seedEvents)),
    tickets: [],
    pendingReservations: [],
  })
}

describe('dataStore: registerEvent', () => {
  beforeEach(resetStore)

  it('registers a seatmap event with a freshly built, all-available seat grid', () => {
    useDataStore.getState().registerEvent({
      id: 'real-event-1',
      title: 'Evento Real',
      category: 'theater',
      description: 'desc',
      date: '2026-11-01T20:00:00.000Z',
      location: 'Curitiba, PR',
      organizerId: 'org-1',
      ticketMode: 'seatmap',
      rows: 2,
      cols: 3,
      seatPrice: 40,
    })
    const event = useDataStore.getState().events.find((e) => e.id === 'real-event-1')
    expect(event?.seats).toHaveLength(6)
    expect(event?.seats?.every((s) => s.status === 'available')).toBe(true)
  })

  it('registers a quantity event with sold/reservedQuantity at 0', () => {
    useDataStore.getState().registerEvent({
      id: 'real-event-2',
      title: 'Evento Real 2',
      category: 'show',
      description: 'desc',
      date: '2026-11-01T20:00:00.000Z',
      location: 'Belo Horizonte, MG',
      organizerId: 'org-1',
      ticketMode: 'quantity',
      price: 90,
      totalCapacity: 100,
    })
    const event = useDataStore.getState().events.find((e) => e.id === 'real-event-2')
    expect(event?.sold).toBe(0)
    expect(event?.reservedQuantity).toBe(0)
  })

  it('does not overwrite an event that is already registered', () => {
    useDataStore.getState().registerEvent({
      id: 'real-event-3',
      title: 'Evento Real 3',
      category: 'show',
      description: 'desc',
      date: '2026-11-01T20:00:00.000Z',
      location: 'Recife, PE',
      organizerId: 'org-1',
      ticketMode: 'quantity',
      price: 50,
      totalCapacity: 10,
    })
    useDataStore.getState().reserveQuantity('real-event-3', 3)

    useDataStore.getState().registerEvent({
      id: 'real-event-3',
      title: 'Evento Real 3 Alterado',
      category: 'show',
      description: 'desc',
      date: '2026-11-01T20:00:00.000Z',
      location: 'Recife, PE',
      organizerId: 'org-1',
      ticketMode: 'quantity',
      price: 50,
      totalCapacity: 10,
    })

    const event = useDataStore.getState().events.find((e) => e.id === 'real-event-3')
    expect(event?.title).toBe('Evento Real 3')
    expect(event?.reservedQuantity).toBe(3)
  })
})

describe('dataStore: reservations', () => {
  beforeEach(resetStore)

  it('reserves available seats and marks them reserved', () => {
    const result = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }])
    expect(result).toHaveProperty('reservationId')
    const event = useDataStore.getState().events.find((e) => e.id === 'event-movie-1')
    expect(event?.seats?.find((s) => s.row === 1 && s.col === 1)?.status).toBe('reserved')
  })

  it('rejects reserving a seat that is not available', () => {
    useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }])
    const result = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }])
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('reserves a quantity within capacity', () => {
    const result = useDataStore.getState().reserveQuantity('event-show-1', 5)
    expect(result).toHaveProperty('reservationId')
    const event = useDataStore.getState().events.find((e) => e.id === 'event-show-1')
    expect(event?.reservedQuantity).toBe(5)
  })

  it('rejects reserving more than available capacity', () => {
    const result = useDataStore.getState().reserveQuantity('event-show-1', 500)
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('releases a seat reservation back to available', () => {
    const { reservationId } = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }]) as { reservationId: string }
    useDataStore.getState().releaseReservation(reservationId)
    const event = useDataStore.getState().events.find((e) => e.id === 'event-movie-1')
    expect(event?.seats?.find((s) => s.row === 1 && s.col === 1)?.status).toBe('available')
    expect(useDataStore.getState().pendingReservations).toHaveLength(0)
  })

  it('releases a quantity reservation back to the pool', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 5) as { reservationId: string }
    useDataStore.getState().releaseReservation(reservationId)
    const event = useDataStore.getState().events.find((e) => e.id === 'event-show-1')
    expect(event?.reservedQuantity).toBe(0)
  })
})

describe('dataStore: payment', () => {
  beforeEach(resetStore)

  it('confirming a seat reservation creates one ticket per seat and marks seats sold', () => {
    const { reservationId } = useDataStore.getState().reserveSeats('event-movie-1', [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ]) as { reservationId: string }

    const tickets = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]
    expect(tickets).toHaveLength(2)
    expect(tickets.every((t) => t.status === 'valid' && t.userId === 'user-customer')).toBe(true)

    const event = useDataStore.getState().events.find((e) => e.id === 'event-movie-1')
    expect(event?.seats?.filter((s) => s.status === 'sold')).toHaveLength(2)
    expect(useDataStore.getState().pendingReservations).toHaveLength(0)
  })

  it('confirming a quantity reservation creates a single ticket with that quantity', () => {
    const { reservationId } = useDataStore.getState().reserveQuantity('event-show-1', 3) as { reservationId: string }
    const tickets = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]
    expect(tickets).toHaveLength(1)
    expect(tickets[0].quantity).toBe(3)

    const event = useDataStore.getState().events.find((e) => e.id === 'event-show-1')
    expect(event?.sold).toBe(3)
    expect(event?.reservedQuantity).toBe(0)
  })

  it('declining a seat reservation releases the seats and creates no ticket', () => {
    const { reservationId } = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }]) as { reservationId: string }
    useDataStore.getState().declinePayment(reservationId)

    expect(useDataStore.getState().tickets).toHaveLength(0)
    const event = useDataStore.getState().events.find((e) => e.id === 'event-movie-1')
    expect(event?.seats?.find((s) => s.row === 1 && s.col === 1)?.status).toBe('available')
  })

  it('confirming an unknown reservation returns an error', () => {
    const result = useDataStore.getState().confirmPayment('does-not-exist', 'user-customer')
    expect(result).toEqual({ error: expect.any(String) })
  })
})

describe('dataStore: validateTicket', () => {
  beforeEach(resetStore)

  function buyOneSeatTicket() {
    const { reservationId } = useDataStore.getState().reserveSeats('event-movie-1', [{ row: 1, col: 1 }]) as { reservationId: string }
    const [ticket] = useDataStore.getState().confirmPayment(reservationId, 'user-customer') as Ticket[]
    return ticket
  }

  it('returns invalid for an unknown code', () => {
    const result = useDataStore.getState().validateTicket('does-not-exist', 'event-movie-1')
    expect(result.result).toBe('invalid')
  })

  it('returns wrong-event when the ticket belongs to a different event', () => {
    const ticket = buyOneSeatTicket()
    const result = useDataStore.getState().validateTicket(ticket.code, 'event-show-1')
    expect(result.result).toBe('wrong-event')
  })

  it('returns valid for a fresh ticket on the right event, and marks it used', () => {
    const ticket = buyOneSeatTicket()
    const result = useDataStore.getState().validateTicket(ticket.code, 'event-movie-1')
    expect(result.result).toBe('valid')
    expect(useDataStore.getState().tickets.find((t) => t.id === ticket.id)?.status).toBe('used')
  })

  it('returns already-used on a second scan of the same code', () => {
    const ticket = buyOneSeatTicket()
    useDataStore.getState().validateTicket(ticket.code, 'event-movie-1')
    const result = useDataStore.getState().validateTicket(ticket.code, 'event-movie-1')
    expect(result.result).toBe('already-used')
  })
})
