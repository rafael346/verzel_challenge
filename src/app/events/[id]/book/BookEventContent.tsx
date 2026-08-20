'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SeatGrid } from '@/components/SeatGrid'
import { QuantityStepper } from '@/components/QuantityStepper'
import { useDataStore } from '@/lib/stores/dataStore'
import { getEvent } from '@/lib/api/events'
import { createReservation, getAvailability } from '@/lib/api/reservations'
import { useAsync } from '@/lib/hooks/useAsync'
import { ApiError } from '@/lib/api/client'

export function BookEventContent({ id }: { id: string }) {
  const { data: event, loading: loadingEvent, error: eventError } = useAsync(() => getEvent(id), [id])
  const {
    data: availability,
    loading: loadingAvailability,
    error: availabilityError,
    refetch: refetchAvailability,
  } = useAsync(() => getAvailability(id), [id])
  const setPendingReservation = useDataStore((s) => s.setPendingReservation)
  const [selectedSeats, setSelectedSeats] = useState<{ row: number; col: number }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [bookingError, setBookingError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  if (loadingEvent || loadingAvailability) return <p className="text-text-muted">Carregando evento...</p>
  if (eventError || availabilityError || !event || !availability) {
    return <p className="text-text-muted">Evento não encontrado.</p>
  }

  function toggleSeat(row: number, col: number) {
    setSelectedSeats((prev) =>
      prev.some((p) => p.row === row && p.col === col)
        ? prev.filter((p) => !(p.row === row && p.col === col))
        : [...prev, { row, col }]
    )
  }

  async function goToCheckout() {
    setBookingError('')
    setSubmitting(true)
    try {
      const reservation =
        event!.ticketMode === 'seatmap'
          ? await createReservation(id, { seats: selectedSeats })
          : await createReservation(id, { quantity })
      setPendingReservation(reservation)
      router.push(`/checkout?reservationId=${reservation.id}`)
    } catch (err) {
      setSubmitting(false)
      setBookingError(err instanceof ApiError ? err.message : 'Erro inesperado. Tente novamente.')
      refetchAvailability()
    }
  }

  const isSeatmap = availability.mode === 'seatmap'
  const total = isSeatmap ? selectedSeats.length * (event.seatPrice ?? 0) : quantity * (event.price ?? 0)
  const availableQuantity = availability.mode === 'quantity' ? availability.available : 0
  const canContinue = isSeatmap ? selectedSeats.length > 0 : quantity > 0 && availableQuantity > 0

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-4">{event.title}</h1>

      {availability.mode === 'seatmap' ? (
        <div className="overflow-x-auto">
          <SeatGrid
            seats={availability.seats}
            rows={availability.rows}
            cols={availability.cols}
            selected={selectedSeats}
            onToggle={toggleSeat}
          />
        </div>
      ) : (
        <QuantityStepper value={quantity} min={1} max={Math.max(availableQuantity, 1)} onChange={setQuantity} />
      )}

      <p className="text-text mt-4">Total: <span className="text-gold font-semibold">R$ {total.toFixed(2)}</span></p>
      {bookingError && <p className="text-wine text-sm mt-1">{bookingError}</p>}

      <button
        type="button"
        disabled={!canContinue || submitting}
        onClick={goToCheckout}
        className="mt-4 bg-wine text-text rounded-[3px] px-4 py-2 text-sm disabled:opacity-40"
      >
        Continuar para pagamento
      </button>
    </div>
  )
}
