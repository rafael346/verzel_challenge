import { describe, it, expect, beforeEach } from 'vitest'
import { useDataStore } from './dataStore'
import type { Ticket } from '@/lib/types'
import type { Reservation } from '@/lib/api/reservations'

function resetStore() {
  useDataStore.setState({ tickets: [], pendingReservation: null })
}

const sampleReservation: Reservation = {
  id: 'res-1',
  eventId: 'event-show-1',
  items: [{ ticketId: 'ing-1', price: 150 }],
  total: 150,
  expiresAt: '2026-01-01T00:10:00.000Z',
}

const sampleTicket: Ticket = {
  id: 'ticket-1',
  code: 'ticket-1',
  eventId: 'event-movie-1',
  userId: 'user-customer',
  seat: { row: 1, col: 1 },
  status: 'valid',
  purchasedAt: '2026-01-01T00:00:00.000Z',
}

describe('dataStore: setPendingReservation', () => {
  beforeEach(resetStore)

  it('stores a reservation', () => {
    useDataStore.getState().setPendingReservation(sampleReservation)
    expect(useDataStore.getState().pendingReservation).toEqual(sampleReservation)
  })

  it('clears the reservation when set to null', () => {
    useDataStore.getState().setPendingReservation(sampleReservation)
    useDataStore.getState().setPendingReservation(null)
    expect(useDataStore.getState().pendingReservation).toBeNull()
  })
})

describe('dataStore: addTickets', () => {
  beforeEach(resetStore)

  it('appends tickets to the existing list', () => {
    useDataStore.getState().addTickets([sampleTicket])
    expect(useDataStore.getState().tickets).toEqual([sampleTicket])

    const secondTicket: Ticket = { ...sampleTicket, id: 'ticket-2', code: 'ticket-2' }
    useDataStore.getState().addTickets([secondTicket])
    expect(useDataStore.getState().tickets).toEqual([sampleTicket, secondTicket])
  })
})

describe('dataStore: validateTicket', () => {
  beforeEach(resetStore)

  it('returns invalid for an unknown code', () => {
    const result = useDataStore.getState().validateTicket('does-not-exist', 'event-movie-1')
    expect(result.result).toBe('invalid')
  })

  it('returns wrong-event when the ticket belongs to a different event', () => {
    useDataStore.getState().addTickets([sampleTicket])
    const result = useDataStore.getState().validateTicket(sampleTicket.code, 'event-show-1')
    expect(result.result).toBe('wrong-event')
  })

  it('returns valid for a fresh ticket on the right event, and marks it used', () => {
    useDataStore.getState().addTickets([sampleTicket])
    const result = useDataStore.getState().validateTicket(sampleTicket.code, 'event-movie-1')
    expect(result.result).toBe('valid')
    expect(useDataStore.getState().tickets.find((t) => t.id === sampleTicket.id)?.status).toBe('used')
  })

  it('returns already-used on a second scan of the same code', () => {
    useDataStore.getState().addTickets([sampleTicket])
    useDataStore.getState().validateTicket(sampleTicket.code, 'event-movie-1')
    const result = useDataStore.getState().validateTicket(sampleTicket.code, 'event-movie-1')
    expect(result.result).toBe('already-used')
  })
})
