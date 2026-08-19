import { create } from 'zustand'
import { Ticket } from '@/lib/types'
import { Reservation } from '@/lib/api/reservations'

type DataState = {
  tickets: Ticket[]
  pendingReservation: Reservation | null

  setPendingReservation: (reservation: Reservation | null) => void
  addTickets: (tickets: Ticket[]) => void
}

export const useDataStore = create<DataState>((set) => ({
  tickets: [],
  pendingReservation: null,

  setPendingReservation: (reservation) => set({ pendingReservation: reservation }),

  addTickets: (tickets) => set((state) => ({ tickets: [...state.tickets, ...tickets] })),
}))
