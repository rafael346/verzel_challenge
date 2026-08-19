'use client'

import { TicketQRCode } from '@/components/TicketQRCode'
import { getSharedTicket } from '@/lib/api/sharing'
import { getEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'

export function SharedTicketContent({ token }: { token: string }) {
  const { data: sharedTicket, loading, error } = useAsync(() => getSharedTicket(token), [token])
  const { data: event } = useAsync(
    () => (sharedTicket ? getEvent(sharedTicket.eventId) : Promise.resolve(null)),
    [sharedTicket?.eventId]
  )

  if (loading) return <p className="text-slate-500">Carregando ingresso...</p>
  if (error || !sharedTicket) return <p className="text-slate-500">Ingresso não encontrado.</p>

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold">{sharedTicket.eventTitle}</h1>
      {event && (
        <>
          <p className="text-slate-600">
            {new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </p>
          <p className="text-slate-600">{event.location}</p>
        </>
      )}
      <p className="mt-2">
        {sharedTicket.seat ? `Assento: ${sharedTicket.seat.row}-${sharedTicket.seat.col}` : 'Pista'}
      </p>
      <span
        className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
          sharedTicket.status === 'used' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'
        }`}
      >
        {sharedTicket.status === 'used' ? 'Utilizado' : 'Válido'}
      </span>
      <div className="mt-6">
        <TicketQRCode code={sharedTicket.ticketId} />
      </div>
    </div>
  )
}
