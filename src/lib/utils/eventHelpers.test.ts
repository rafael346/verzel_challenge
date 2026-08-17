import { describe, it, expect } from 'vitest'
import { filterEvents, getEventPrice, isEventSoldOut } from './eventHelpers'
import { Event } from '@/lib/types'

const movieEvent: Event = {
  id: '1',
  title: 'Duna: Parte Três',
  category: 'movie',
  description: '',
  date: '2026-09-01T19:00:00.000Z',
  location: 'São Paulo, SP',
  organizerId: 'org-1',
  ticketMode: 'seatmap',
  rows: 1,
  cols: 2,
  seatPrice: 32,
  seats: [
    { row: 1, col: 1, status: 'available' },
    { row: 1, col: 2, status: 'sold' },
  ],
}

const showEvent: Event = {
  id: '2',
  title: 'Festival Verão Sonoro',
  category: 'show',
  description: '',
  date: '2026-10-15T20:00:00.000Z',
  location: 'Rio de Janeiro, RJ',
  organizerId: 'org-1',
  ticketMode: 'quantity',
  price: 150,
  totalCapacity: 10,
  sold: 10,
  reservedQuantity: 0,
}

describe('getEventPrice', () => {
  it('returns seatPrice for seatmap events', () => {
    expect(getEventPrice(movieEvent)).toBe(32)
  })
  it('returns price for quantity events', () => {
    expect(getEventPrice(showEvent)).toBe(150)
  })
})

describe('isEventSoldOut', () => {
  it('is false when at least one seat is available', () => {
    expect(isEventSoldOut(movieEvent)).toBe(false)
  })
  it('is true for a quantity event with no remaining capacity', () => {
    expect(isEventSoldOut(showEvent)).toBe(true)
  })
})

describe('filterEvents', () => {
  const events = [movieEvent, showEvent]

  it('filters by text query on title', () => {
    expect(filterEvents(events, { query: 'duna' })).toEqual([movieEvent])
  })
  it('filters by category', () => {
    expect(filterEvents(events, { category: 'show' })).toEqual([showEvent])
  })
  it('filters by location substring', () => {
    expect(filterEvents(events, { location: 'Rio' })).toEqual([showEvent])
  })
  it('filters by price range', () => {
    expect(filterEvents(events, { minPrice: 100 })).toEqual([showEvent])
    expect(filterEvents(events, { maxPrice: 50 })).toEqual([movieEvent])
  })
  it('returns all events when no filters are set', () => {
    expect(filterEvents(events, {})).toEqual(events)
  })
})
