import { describe, it, expect, beforeEach } from 'vitest'
import { useDataStore } from './dataStore'
import type { Reservation } from '@/lib/api/reservations'

function resetStore() {
  useDataStore.setState({ pendingReservation: null })
}

const sampleReservation: Reservation = {
  id: 'res-1',
  eventId: 'event-show-1',
  items: [{ ticketId: 'ing-1', price: 150 }],
  total: 150,
  expiresAt: '2026-01-01T00:10:00.000Z',
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
