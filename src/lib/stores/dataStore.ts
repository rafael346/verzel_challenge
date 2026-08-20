import { create } from 'zustand'
import { Reservation } from '@/lib/api/reservations'

type DataState = {
  pendingReservation: Reservation | null

  setPendingReservation: (reservation: Reservation | null) => void
}

export const useDataStore = create<DataState>((set) => ({
  pendingReservation: null,

  setPendingReservation: (reservation) => set({ pendingReservation: reservation }),
}))
