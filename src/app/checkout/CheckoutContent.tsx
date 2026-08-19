'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { getEvent } from '@/lib/api/events'
import { confirmReservation, cancelReservation } from '@/lib/api/reservations'
import { useAsync } from '@/lib/hooks/useAsync'
import { ApiError } from '@/lib/api/client'

const EXPIRED_STATUSES = new Set([403, 404, 410])

export function CheckoutContent() {
  const searchParams = useSearchParams()
  const reservationId = searchParams.get('reservationId') ?? ''
  const pendingReservation = useDataStore((s) => s.pendingReservation)
  const setPendingReservation = useDataStore((s) => s.setPendingReservation)
  const addTickets = useDataStore((s) => s.addTickets)
  const currentUser = useAuthStore((s) => s.currentUser)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const reservation =
    pendingReservation && pendingReservation.id === reservationId ? pendingReservation : null

  const { data: event } = useAsync(
    () => (reservation ? getEvent(reservation.eventId) : Promise.resolve(null)),
    [reservation?.eventId]
  )

  useEffect(() => {
    return () => {
      const current = useDataStore.getState().pendingReservation
      if (current && current.id === reservationId) {
        cancelReservation(reservationId).catch(() => {})
      }
    }
  }, [reservationId])

  if (!reservation) {
    return (
      <div>
        <p className="text-slate-500">Reserva não encontrada. Volte e selecione o evento novamente.</p>
        <Link href="/" className="underline">
          Voltar para eventos
        </Link>
      </div>
    )
  }

  async function pay(paymentMethodId: string) {
    setSubmitting(true)
    try {
      const tickets = await confirmReservation(reservationId, paymentMethodId, currentUser!.id)
      addTickets(tickets)
      setPendingReservation(null)
      router.push('/checkout/success')
    } catch (err) {
      setSubmitting(false)
      const status = err instanceof ApiError ? err.status : 0
      const reason = EXPIRED_STATUSES.has(status) ? 'expired' : 'declined'
      router.push(`/checkout/declined?reason=${reason}`)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Pagamento</h1>
      {event && <p className="font-semibold">{event.title}</p>}
      <p>
        {reservation.items.some((item) => item.row !== undefined)
          ? `Assentos: ${reservation.items.map((item) => `${item.row}-${item.col}`).join(', ')}`
          : `Quantidade: ${reservation.items.length}`}
      </p>
      <p className="font-semibold mt-2">Total: R$ {reservation.total.toFixed(2)}</p>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => pay('pm_card_visa')}
          disabled={submitting}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Simular aprovação
        </button>
        <button
          onClick={() => pay('pm_card_chargeDeclined')}
          disabled={submitting}
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Simular recusa
        </button>
      </div>
    </div>
  )
}
