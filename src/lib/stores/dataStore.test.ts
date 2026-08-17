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

  it('deletes an event', () => {
    useDataStore.getState().deleteEvent('event-show-1')
    expect(useDataStore.getState().events.find((e) => e.id === 'event-show-1')).toBeUndefined()
  })
})
