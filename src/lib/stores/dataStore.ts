import { create } from 'zustand'
import { Event, Ticket } from '@/lib/types'
import { seedEvents } from '@/lib/seed'
import { buildSeats } from '@/lib/seats'

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

type DataState = {
  events: Event[]
  tickets: Ticket[]
  pendingReservations: PendingReservation[]

  registerEvent: (event: Event) => void

  reserveSeats: (eventId: string, seats: { row: number; col: number }[]) => { reservationId: string } | { error: string }
  reserveQuantity: (eventId: string, quantity: number) => { reservationId: string } | { error: string }
  releaseReservation: (reservationId: string) => void

  confirmPayment: (reservationId: string, userId: string) => Ticket[] | { error: string }
  declinePayment: (reservationId: string) => void

  validateTicket: (code: string, eventId: string) => ValidationResult
}

// Backfills the mock reservation engine's own bookkeeping fields (seat statuses, or
// sold/reservedQuantity counters) onto an event that came from the real API, which has
// no concept of them. Used by registerEvent to bridge a real event into the still-mock
// booking flow with a fresh, all-available reservation state.
function withFreshReservationState(event: Event): Event {
  if (event.ticketMode === 'seatmap') {
    return { ...event, seats: buildSeats(event.rows ?? 0, event.cols ?? 0) }
  }
  return { ...event, sold: 0, reservedQuantity: 0 }
}

export const useDataStore = create<DataState>((set, get) => ({
  events: seedEvents.map((e) => ({ ...e, seats: e.seats ? e.seats.map((s) => ({ ...s })) : undefined })),
  tickets: [],
  pendingReservations: [],

  registerEvent: (event) => {
    if (get().events.some((e) => e.id === event.id)) return
    set((state) => ({ events: [...state.events, withFreshReservationState(event)] }))
  },

  reserveSeats: (eventId, seats) => {
    const event = get().events.find((e) => e.id === eventId)
    if (!event || event.ticketMode !== 'seatmap') return { error: 'Evento inválido para reserva de assentos' }

    const allAvailable = seats.every((pos) =>
      event.seats?.some((s) => s.row === pos.row && s.col === pos.col && s.status === 'available')
    )
    if (!allAvailable) return { error: 'Um ou mais assentos não estão disponíveis' }

    const reservationId = crypto.randomUUID()
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              seats: e.seats?.map((s) =>
                seats.some((pos) => pos.row === s.row && pos.col === s.col)
                  ? { ...s, status: 'reserved' as const }
                  : s
              ),
            }
          : e
      ),
      pendingReservations: [...state.pendingReservations, { id: reservationId, eventId, seats }],
    }))
    return { reservationId }
  },

  reserveQuantity: (eventId, quantity) => {
    const event = get().events.find((e) => e.id === eventId)
    if (!event || event.ticketMode !== 'quantity') return { error: 'Evento inválido para reserva por quantidade' }

    const available = (event.totalCapacity ?? 0) - (event.sold ?? 0) - (event.reservedQuantity ?? 0)
    if (quantity <= 0 || quantity > available) return { error: 'Quantidade indisponível' }

    const reservationId = crypto.randomUUID()
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, reservedQuantity: (e.reservedQuantity ?? 0) + quantity } : e
      ),
      pendingReservations: [...state.pendingReservations, { id: reservationId, eventId, quantity }],
    }))
    return { reservationId }
  },

  releaseReservation: (reservationId) => {
    const reservation = get().pendingReservations.find((r) => r.id === reservationId)
    if (!reservation) return

    set((state) => ({
      events: state.events.map((e) => {
        if (e.id !== reservation.eventId) return e
        if (reservation.seats) {
          return {
            ...e,
            seats: e.seats?.map((s) =>
              reservation.seats!.some((pos) => pos.row === s.row && pos.col === s.col)
                ? { ...s, status: 'available' as const }
                : s
            ),
          }
        }
        if (reservation.quantity) {
          return { ...e, reservedQuantity: (e.reservedQuantity ?? 0) - reservation.quantity }
        }
        return e
      }),
      pendingReservations: state.pendingReservations.filter((r) => r.id !== reservationId),
    }))
  },

  confirmPayment: (reservationId, userId) => {
    const reservation = get().pendingReservations.find((r) => r.id === reservationId)
    if (!reservation) return { error: 'Reserva não encontrada' }

    const now = new Date().toISOString()
    let newTickets: Ticket[] = []

    set((state) => ({
      events: state.events.map((e) => {
        if (e.id !== reservation.eventId) return e
        if (reservation.seats) {
          newTickets = reservation.seats.map((pos) => ({
            id: crypto.randomUUID(),
            code: crypto.randomUUID(),
            eventId: e.id,
            userId,
            seat: pos,
            status: 'valid' as const,
            purchasedAt: now,
          }))
          return {
            ...e,
            seats: e.seats?.map((s) =>
              reservation.seats!.some((pos) => pos.row === s.row && pos.col === s.col)
                ? { ...s, status: 'sold' as const }
                : s
            ),
          }
        }
        if (reservation.quantity) {
          newTickets = [
            {
              id: crypto.randomUUID(),
              code: crypto.randomUUID(),
              eventId: e.id,
              userId,
              quantity: reservation.quantity,
              status: 'valid' as const,
              purchasedAt: now,
            },
          ]
          return {
            ...e,
            sold: (e.sold ?? 0) + reservation.quantity,
            reservedQuantity: (e.reservedQuantity ?? 0) - reservation.quantity,
          }
        }
        return e
      }),
      tickets: [...state.tickets, ...newTickets],
      pendingReservations: state.pendingReservations.filter((r) => r.id !== reservationId),
    }))

    return newTickets
  },

  declinePayment: (reservationId) => {
    get().releaseReservation(reservationId)
  },

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
