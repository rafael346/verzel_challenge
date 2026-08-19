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
