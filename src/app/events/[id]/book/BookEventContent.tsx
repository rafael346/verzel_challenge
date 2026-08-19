'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SeatGrid } from '@/components/SeatGrid'
import { QuantityStepper } from '@/components/QuantityStepper'
import { useDataStore } from '@/lib/stores/dataStore'
import { getEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'

export function BookEventContent({ id }: { id: string }) {
  const { data: fetchedEvent, loading: fetching, error: fetchError } = useAsync(() => getEvent(id), [id])
  const registerEvent = useDataStore((s) => s.registerEvent)
  const event = useDataStore((s) => s.events.find((e) => e.id === id))
  const reserveSeats = useDataStore((s) => s.reserveSeats)
  const reserveQuantity = useDataStore((s) => s.reserveQuantity)
  const [selectedSeats, setSelectedSeats] = useState<{ row: number; col: number }[]>([])
  const [quantity, setQuantity] = useState(1)
  const [bookingError, setBookingError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (fetchedEvent) registerEvent(fetchedEvent)
  }, [fetchedEvent, registerEvent])

  if (fetching) return <p className="text-slate-500">Carregando evento...</p>
  if (fetchError || !event) return <p className="text-slate-500">Evento não encontrado.</p>

  function toggleSeat(row: number, col: number) {
    setSelectedSeats((prev) =>
      prev.some((p) => p.row === row && p.col === col)
        ? prev.filter((p) => !(p.row === row && p.col === col))
        : [...prev, { row, col }]
    )
  }

  function goToCheckout() {
    if (event!.ticketMode === 'seatmap') {
      const result = reserveSeats(event!.id, selectedSeats)
      if ('error' in result) return setBookingError(result.error)
      router.push(`/checkout?reservationId=${result.reservationId}`)
    } else {
      const result = reserveQuantity(event!.id, quantity)
      if ('error' in result) return setBookingError(result.error)
      router.push(`/checkout?reservationId=${result.reservationId}`)
    }
  }

  const isSeatmap = event.ticketMode === 'seatmap'
  const total = isSeatmap ? selectedSeats.length * (event.seatPrice ?? 0) : quantity * (event.price ?? 0)
  const availableQuantity = (event.totalCapacity ?? 0) - (event.sold ?? 0) - (event.reservedQuantity ?? 0)
  const canContinue = isSeatmap ? selectedSeats.length > 0 : quantity > 0 && availableQuantity > 0

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{event.title}</h1>

      {isSeatmap ? (
        <SeatGrid
          seats={event.seats ?? []}
          rows={event.rows ?? 0}
          cols={event.cols ?? 0}
          selected={selectedSeats}
          onToggle={toggleSeat}
        />
      ) : (
        <QuantityStepper value={quantity} min={1} max={Math.max(availableQuantity, 1)} onChange={setQuantity} />
      )}

      <p className="font-semibold mt-4">Total: R$ {total.toFixed(2)}</p>
      {bookingError && <p className="text-red-600 text-sm">{bookingError}</p>}

      <button
        type="button"
        disabled={!canContinue}
        onClick={goToCheckout}
        className="mt-4 bg-slate-800 text-white px-4 py-2 rounded disabled:opacity-40"
      >
        Continuar para pagamento
      </button>
    </div>
  )
}
