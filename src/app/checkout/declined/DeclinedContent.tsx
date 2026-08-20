'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useDataStore } from '@/lib/stores/dataStore'
import { cancelReservation } from '@/lib/api/reservations'
import { StateBox } from '@/components/StateBox'

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
      <StateBox
        variant="error"
        title={reason === 'expired' ? 'Reserva expirada' : 'Pagamento recusado'}
        description={
          reason === 'expired'
            ? 'O tempo para concluir esta reserva acabou.'
            : 'Não foi possível confirmar o pagamento simulado.'
        }
      />
      <div className="flex gap-3 mt-4">
        {reason === 'declined' && (
          <button onClick={handleRetry} className="bg-wine text-text rounded-[3px] px-4 py-2 text-sm">
            Tentar novamente
          </button>
        )}
        <button
          onClick={handleChooseOthers}
          className="border border-border rounded-[3px] px-4 py-2 text-sm text-text hover:border-gold"
        >
          Escolher outros assentos
        </button>
      </div>
    </div>
  )
}
