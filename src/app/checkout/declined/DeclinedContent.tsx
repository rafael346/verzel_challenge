'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useDataStore } from '@/lib/stores/dataStore'
import { cancelReservation } from '@/lib/api/reservations'

export function DeclinedContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') === 'expired' ? 'expired' : 'declined'
  const pendingReservation = useDataStore((s) => s.pendingReservation)
  const setPendingReservation = useDataStore((s) => s.setPendingReservation)
  const router = useRouter()

  function handleRetry() {
    if (!pendingReservation) return
    router.push(`/checkout?reservationId=${pendingReservation.id}`)
  }

  async function handleChooseOthers() {
    if (pendingReservation) {
      await cancelReservation(pendingReservation.id).catch(() => {})
      setPendingReservation(null)
    }
    router.push(pendingReservation ? `/events/${pendingReservation.eventId}/book` : '/')
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-red-700 mb-2">
        {reason === 'expired' ? 'Reserva expirada' : 'Pagamento recusado'}
      </h1>
      <p className="text-slate-600 mb-4">
        {reason === 'expired'
          ? 'O tempo para concluir esta reserva acabou.'
          : 'Não foi possível confirmar o pagamento simulado.'}
      </p>
      <div className="flex gap-3">
        {reason === 'declined' && (
          <button onClick={handleRetry} className="bg-slate-800 text-white px-4 py-2 rounded">
            Tentar novamente
          </button>
        )}
        <button onClick={handleChooseOthers} className="border px-4 py-2 rounded">
          Escolher outros assentos
        </button>
      </div>
    </div>
  )
}
