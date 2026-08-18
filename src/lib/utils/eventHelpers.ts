import { Event, EventCategory } from '@/lib/types'

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  show: 'Show',
  movie: 'Filme',
  theater: 'Teatro',
}

export type EventFilters = {
  query?: string
  category?: EventCategory
  dateFrom?: string
  dateTo?: string
  location?: string
  minPrice?: number
  maxPrice?: number
}

export function getEventPrice(event: Event): number {
  return event.ticketMode === 'seatmap' ? event.seatPrice ?? 0 : event.price ?? 0
}

export function isEventSoldOut(event: Event): boolean {
  if (event.ticketMode === 'seatmap') {
    const seats = event.seats ?? []
    if (seats.length === 0) return false
    return seats.every((s) => s.status !== 'available')
  }
  return (event.sold ?? 0) + (event.reservedQuantity ?? 0) >= (event.totalCapacity ?? 0)
}

export function filterEvents(events: Event[], filters: EventFilters): Event[] {
  return events.filter((event) => {
    if (filters.query && !event.title.toLowerCase().includes(filters.query.toLowerCase())) return false
    if (filters.category && event.category !== filters.category) return false
    if (filters.location && !event.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.dateFrom && new Date(event.date) < new Date(filters.dateFrom)) return false
    if (filters.dateTo) {
      const dateToEnd = new Date(filters.dateTo)
      dateToEnd.setUTCHours(23, 59, 59, 999)
      if (new Date(event.date) > dateToEnd) return false
    }
    const price = getEventPrice(event)
    if (filters.minPrice !== undefined && price < filters.minPrice) return false
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false
    return true
  })
}
