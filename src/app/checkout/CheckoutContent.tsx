'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'

export function CheckoutContent() {
  const searchParams = useSearchParams()
  const reservationId = searchParams.get('reservationId') ?? ''
  const reservation = useDataStore((s) => s.pendingReservations.find((r) => r.id === reservationId))
  const event = useDataStore((s) => s.events.find((e) => e.id === reservation?.eventId))
  const confirmPayment = useDataStore((s) => s.confirmPayment)
  const declinePayment = useDataStore((s) => s.declinePayment)
  const currentUser = useAuthStore((s) => s.currentUser)
  const router = useRouter()

  useEffect(() => {
    return () => {
      if (reservationId) {
        useDataStore.getState().releaseReservation(reservationId)
      }
    }
  }, [reservationId])

  if (!reservation || !event) {
    return (
      <div>
        <p className="text-slate-500">Reserva não encontrada. Volte e selecione o evento novamente.</p>
        <Link href="/" className="underline">
          Voltar para eventos
        </Link>
      </div>
    )
  }

  const total = reservation.seats
    ? reservation.seats.length * (event.seatPrice ?? 0)
    : (reservation.quantity ?? 0) * (event.price ?? 0)

  function handleApprove() {
    const result = confirmPayment(reservationId, currentUser!.id)
    if ('error' in result) return
    router.push('/checkout/success')
  }

  function handleDecline() {
    declinePayment(reservationId)
    const params = new URLSearchParams({ eventId: event!.id })
    if (reservation!.seats) params.set('seats', reservation!.seats.map((s) => `${s.row}-${s.col}`).join(','))
    if (reservation!.quantity) params.set('quantity', String(reservation!.quantity))
    router.push(`/checkout/declined?${params.toString()}`)
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Pagamento</h1>
      <p className="font-semibold">{event.title}</p>
      <p>
        {reservation.seats
          ? `Assentos: ${reservation.seats.map((s) => `${s.row}-${s.col}`).join(', ')}`
          : `Quantidade: ${reservation.quantity}`}
      </p>
      <p className="font-semibold mt-2">Total: R$ {total.toFixed(2)}</p>

      <div className="flex gap-3 mt-6">
        <button onClick={handleApprove} className="bg-green-600 text-white px-4 py-2 rounded">
          Simular aprovação
        </button>
        <button onClick={handleDecline} className="bg-red-600 text-white px-4 py-2 rounded">
          Simular recusa
        </button>
      </div>
    </div>
  )
}
