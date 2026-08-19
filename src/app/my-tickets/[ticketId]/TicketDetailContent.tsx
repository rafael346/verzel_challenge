'use client'

import { TicketQRCode } from '@/components/TicketQRCode'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { getEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'

export function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const ticket = useDataStore((s) => s.tickets.find((t) => t.id === ticketId && t.userId === currentUser?.id))
  const { data: event, loading } = useAsync(
    () => (ticket ? getEvent(ticket.eventId) : Promise.resolve(null)),
    [ticket?.eventId]
  )

  if (!ticket) return <p className="text-slate-500">Ingresso não encontrado.</p>
  if (loading) return <p className="text-slate-500">Carregando ingresso...</p>
  if (!event) return <p className="text-slate-500">Ingresso não encontrado.</p>

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-slate-600">{new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p className="text-slate-600">{event.location}</p>
      <p className="mt-2">{ticket.seat ? `Assento: ${ticket.seat.row}-${ticket.seat.col}` : 'Pista'}</p>
      <span
        className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
          ticket.status === 'used' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'
        }`}
      >
        {ticket.status === 'used' ? 'Utilizado' : 'Válido'}
      </span>
      <div className="mt-6">
        <TicketQRCode code={ticket.code} />
      </div>
    </div>
  )
}
