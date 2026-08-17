import { create } from 'zustand'
import { Event, EventCategory, Seat, Ticket, TicketMode } from '@/lib/types'
import { seedEvents } from '@/lib/seed'

export type PendingReservation = {
  id: string
  eventId: string
  seats?: { row: number; col: number }[]
  quantity?: number
}

export type ValidationResult = {
  result: 'valid' | 'invalid' | 'already-used' | 'wrong-event'
  ticket?: Ticket
}

export type NewEventInput = {
  title: string
  category: EventCategory
  description: string
  date: string
  location: string
  organizerId: string
  ticketMode: TicketMode
  rows?: number
  cols?: number
  seatPrice?: number
  price?: number
  totalCapacity?: number
}

function buildSeats(rows: number, cols: number): Seat[] {
  const seats: Seat[] = []
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      seats.push({ row, col, status: 'available' })
    }
  }
  return seats
}

type DataState = {
  events: Event[]
  tickets: Ticket[]
  pendingReservations: PendingReservation[]

  createEvent: (input: NewEventInput) => Event
  updateEvent: (id: string, updates: Partial<Event>) => { success: true } | { error: string }
  deleteEvent: (id: string) => void
}

export const useDataStore = create<DataState>((set, get) => ({
  events: seedEvents,
  tickets: [],
  pendingReservations: [],

  createEvent: (input) => {
    const event: Event = {
      id: crypto.randomUUID(),
      title: input.title,
      category: input.category,
      description: input.description,
      date: input.date,
      location: input.location,
      organizerId: input.organizerId,
      ticketMode: input.ticketMode,
      ...(input.ticketMode === 'seatmap'
        ? {
            rows: input.rows,
            cols: input.cols,
            seatPrice: input.seatPrice,
            seats: buildSeats(input.rows ?? 0, input.cols ?? 0),
          }
        : {
            price: input.price,
            totalCapacity: input.totalCapacity,
            sold: 0,
            reservedQuantity: 0,
          }),
    }
    set((state) => ({ events: [...state.events, event] }))
    return event
  },

  updateEvent: (id, updates) => {
    const event = get().events.find((e) => e.id === id)
    if (!event) return { error: 'Evento não encontrado' }

    if (event.ticketMode === 'seatmap' && (updates.rows !== undefined || updates.cols !== undefined)) {
      const newRows = updates.rows ?? event.rows ?? 0
      const newCols = updates.cols ?? event.cols ?? 0
      const soldCount = (event.seats ?? []).filter((s) => s.status === 'sold').length
      if (newRows * newCols < soldCount) {
        return { error: 'Novo mapa é menor que a quantidade de assentos já vendidos' }
      }
    }
    if (event.ticketMode === 'quantity' && updates.totalCapacity !== undefined) {
      if (updates.totalCapacity < (event.sold ?? 0)) {
        return { error: 'Nova capacidade é menor que a quantidade já vendida' }
      }
    }

    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
    return { success: true }
  },

  deleteEvent: (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
  },
}))
