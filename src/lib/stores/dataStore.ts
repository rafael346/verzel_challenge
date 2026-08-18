import { create } from 'zustand'
import { Event, EventCategory, Ticket, TicketMode } from '@/lib/types'
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

type DataState = {
  events: Event[]
  tickets: Ticket[]
  pendingReservations: PendingReservation[]

  createEvent: (input: NewEventInput) => Event
  updateEvent: (id: string, updates: Partial<Event>) => { success: true } | { error: string }
  deleteEvent: (id: string) => void

  reserveSeats: (eventId: string, seats: { row: number; col: number }[]) => { reservationId: string } | { error: string }
  reserveQuantity: (eventId: string, quantity: number) => { reservationId: string } | { error: string }
  releaseReservation: (reservationId: string) => void

  confirmPayment: (reservationId: string, userId: string) => Ticket[] | { error: string }
  declinePayment: (reservationId: string) => void

  validateTicket: (code: string, eventId: string) => ValidationResult
}

export const useDataStore = create<DataState>((set, get) => ({
  events: seedEvents.map((e) => ({ ...e, seats: e.seats ? e.seats.map((s) => ({ ...s })) : undefined })),
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

    let resolvedUpdates = updates

    if (event.ticketMode === 'seatmap' && (updates.rows !== undefined || updates.cols !== undefined)) {
      const newRows = updates.rows ?? event.rows ?? 0
      const newCols = updates.cols ?? event.cols ?? 0
      const soldCount = (event.seats ?? []).filter((s) => s.status === 'sold').length
      if (newRows * newCols < soldCount) {
        return { error: 'Novo mapa é menor que a quantidade de assentos já vendidos' }
      }
      const oldSeats = event.seats ?? []
      resolvedUpdates = {
        ...resolvedUpdates,
        seats: buildSeats(newRows, newCols).map((seat) => {
          const existing = oldSeats.find((s) => s.row === seat.row && s.col === seat.col)
          return existing ? { ...seat, status: existing.status } : seat
        }),
      }
    }
    if (event.ticketMode === 'quantity' && updates.totalCapacity !== undefined) {
      if (updates.totalCapacity < (event.sold ?? 0)) {
        return { error: 'Nova capacidade é menor que a quantidade já vendida' }
      }
    }

    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...resolvedUpdates } : e)),
    }))
    return { success: true }
  },

  deleteEvent: (id) => {
    set((state) => ({ events: state.events.filter((e) => e.id !== id) }))
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
