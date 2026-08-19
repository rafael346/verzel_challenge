import { create } from 'zustand'
import { Event, Ticket } from '@/lib/types'
import { seedEvents } from '@/lib/seed'
import { Reservation } from '@/lib/api/reservations'

export type ValidationResult = {
  result: 'valid' | 'invalid' | 'already-used' | 'wrong-event'
  ticket?: Ticket
}

type DataState = {
  events: Event[]
  tickets: Ticket[]
  pendingReservation: Reservation | null

  setPendingReservation: (reservation: Reservation | null) => void
  addTickets: (tickets: Ticket[]) => void

  validateTicket: (code: string, eventId: string) => ValidationResult
}

export const useDataStore = create<DataState>((set, get) => ({
  events: seedEvents.map((e) => ({ ...e, seats: e.seats ? e.seats.map((s) => ({ ...s })) : undefined })),
  tickets: [],
  pendingReservation: null,

  setPendingReservation: (reservation) => set({ pendingReservation: reservation }),

  addTickets: (tickets) => set((state) => ({ tickets: [...state.tickets, ...tickets] })),

  validateTicket: (code, eventId) => {
    const ticket = get().tickets.find((t) => t.code === code)
    if (!ticket) return { result: 'invalid' }
    if (ticket.eventId !== eventId) return { result: 'wrong-event', ticket }
    if (ticket.status === 'used') return { result: 'already-used', ticket }

    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? { ...t, status: 'used' as const } : t)),
    }))
    return { result: 'valid', ticket: { ...ticket, status: 'used' } }
  },
}))
