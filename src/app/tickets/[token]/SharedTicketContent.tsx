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

  if (loading) return <p className="text-text-muted">Carregando ingresso...</p>
  if (error || !sharedTicket) return <p className="text-text-muted">Ingresso não encontrado.</p>

  return (
    <div className="max-w-sm mx-auto border border-border rounded-[3px] p-6 bg-bg text-center">
      <h1 className="font-display text-2xl font-semibold">{sharedTicket.eventTitle}</h1>
      {event && (
        <>
          <p className="text-text-muted text-sm mt-1">
            {new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
          </p>
          <p className="text-text-muted text-sm">{event.location}</p>
        </>
      )}
      <p className="mt-2 text-sm text-text">
        {sharedTicket.seat ? `Assento: ${sharedTicket.seat.row}-${sharedTicket.seat.col}` : 'Pista'}
      </p>
      <span
        className={`inline-block text-[0.62rem] uppercase tracking-wide rounded-[2px] px-2 py-0.5 mt-2 ${
          sharedTicket.status === 'used' ? 'bg-neutral/[0.15] text-neutral' : 'bg-success/[0.15] text-success'
        }`}
      >
        {sharedTicket.status === 'used' ? 'Utilizado' : 'Válido'}
      </span>
      <div className="mt-6 flex justify-center">
        <TicketQRCode code={sharedTicket.ticketId} />
      </div>
    </div>
  )
}
