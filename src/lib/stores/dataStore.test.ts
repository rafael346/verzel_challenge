import { describe, it, expect, beforeEach } from 'vitest'
import { useDataStore } from './dataStore'
import { seedEvents } from '@/lib/seed'

function resetStore() {
  useDataStore.setState({
    events: JSON.parse(JSON.stringify(seedEvents)),
    tickets: [],
    pendingReservations: [],
  })
}

describe('dataStore: event CRUD', () => {
  beforeEach(resetStore)

  it('creates a seatmap event with a generated seat grid', () => {
    const event = useDataStore.getState().createEvent({
      title: 'Peça Nova',
      category: 'theater',
      description: 'desc',
      date: '2026-11-01T20:00:00.000Z',
      location: 'Curitiba, PR',
      organizerId: 'user-organizer',
      ticketMode: 'seatmap',
      rows: 2,
      cols: 3,
      seatPrice: 40,
    })
    expect(event.seats).toHaveLength(6)
    expect(event.seats?.every((s) => s.status === 'available')).toBe(true)
    expect(useDataStore.getState().events).toHaveLength(seedEvents.length + 1)
  })

  it('creates a quantity event with sold/reservedQuantity at 0', () => {
    const event = useDataStore.getState().createEvent({
      title: 'Show Novo',
      category: 'show',
      description: 'desc',
      date: '2026-11-01T20:00:00.000Z',
      location: 'Belo Horizonte, MG',
      organizerId: 'user-organizer',
      ticketMode: 'quantity',
      price: 90,
      totalCapacity: 100,
    })
    expect(event.sold).toBe(0)
    expect(event.reservedQuantity).toBe(0)
  })

  it('updates an event', () => {
    const result = useDataStore.getState().updateEvent('event-show-1', { title: 'Novo Título' })
    expect(result).toEqual({ success: true })
    expect(useDataStore.getState().events.find((e) => e.id === 'event-show-1')?.title).toBe('Novo Título')
  })

  it('rejects reducing quantity capacity below units already sold', () => {
    useDataStore.setState((state) => ({
      events: state.events.map((e) => (e.id === 'event-show-1' ? { ...e, sold: 50 } : e)),
    }))
    const result = useDataStore.getState().updateEvent('event-show-1', { totalCapacity: 10 })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('rejects shrinking a seatmap below the number of seats already sold', () => {
    useDataStore.setState((state) => ({
      events: state.events.map((e) =>
        e.id === 'event-movie-1'
          ? { ...e, seats: e.seats?.map((s, i) => (i < 5 ? { ...s, status: 'sold' as const } : s)) }
          : e
      ),
    }))
    const result = useDataStore.getState().updateEvent('event-movie-1', { rows: 1, cols: 2 })
    expect(result).toEqual({ error: expect.any(String) })
  })

  it('resyncs the seat grid when a seatmap event is resized, preserving in-range statuses', () => {
    useDataStore.setState((state) => ({
      events: state.events.map((e) =>
        e.id === 'event-movie-1'
          ? { ...e, seats: e.seats?.map((s) => (s.row === 1 && s.col === 1 ? { ...s, status: 'sold' as const } : s)) }
          : e
      ),
    }))
    const result = useDataStore.getState().updateEvent('event-movie-1', { rows: 6, cols: 8 })
    expect(result).toEqual({ success: true })

    const updated = useDataStore.getState().events.find((e) => e.id === 'event-movie-1')
    expect(updated?.seats).toHaveLength(48)
    expect(updated?.seats?.find((s) => s.row === 1 && s.col === 1)?.status).toBe('sold')
    expect(updated?.seats?.find((s) => s.row === 6 && s.col === 1)?.status).toBe('available')
  })

  it('deletes an event', () => {
    useDataStore.getState().deleteEvent('event-show-1')
    expect(useDataStore.getState().events.find((e) => e.id === 'event-show-1')).toBeUndefined()
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
