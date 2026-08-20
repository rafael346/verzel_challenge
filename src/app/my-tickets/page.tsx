'use client'

import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { useAuthStore } from '@/lib/stores/authStore'
import { getEvent } from '@/lib/api/events'
import { getMyTickets } from '@/lib/api/reservations'
import { useAsync } from '@/lib/hooks/useAsync'
import { Event } from '@/lib/types'

function MyTicketsContent() {
  const currentUser = useAuthStore((s) => s.currentUser)

  const {
    data: tickets,
    loading: loadingTickets,
    error: ticketsError,
  } = useAsync(() => (currentUser ? getMyTickets(currentUser.id) : Promise.resolve([])), [currentUser?.id])

  const eventIds = Array.from(new Set((tickets ?? []).map((t) => t.eventId))).sort()

  const {
    data: eventsById,
    loading: loadingEvents,
    error: eventsError,
  } = useAsync(async () => {
    const events = await Promise.all(eventIds.map((id) => getEvent(id)))
    return events.reduce<Record<string, Event>>((acc, event) => {
      acc[event.id] = event
      return acc
    }, {})
  }, [eventIds.join(',')])

  if (loadingTickets) return <p className="text-text-muted">Carregando ingressos...</p>
  if (ticketsError) return <p className="text-text-muted">{ticketsError}</p>

  if (!tickets || tickets.length === 0) {
    return <p className="text-text-muted">Você ainda não tem ingressos.</p>
  }

  if (loadingEvents) return <p className="text-text-muted">Carregando ingressos...</p>
  if (eventsError) return <p className="text-text-muted">{eventsError}</p>

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-4">Meus ingressos</h1>
      <ul className="flex flex-col gap-3">
        {tickets.map((ticket) => {
          const event = eventsById?.[ticket.eventId]
          return (
            <li key={ticket.id}>
              <Link
                href={`/my-tickets/${ticket.id}`}
                className="block border border-border rounded-[3px] p-3 bg-bg hover:border-gold transition-colors"
              >
                <h2 className="font-display font-semibold text-base">{event?.title ?? 'Evento removido'}</h2>
                <p className="text-xs text-text-muted mt-1">
                  {event ? new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : ''}
                  {event ? ` — ${event.location}` : ''}
                </p>
                <p className="text-sm text-text mt-1">
                  {ticket.seat ? `Assento: ${ticket.seat.row}-${ticket.seat.col}` : 'Pista'}
                </p>
                <span
                  className={`inline-block text-[0.62rem] uppercase tracking-wide rounded-[2px] px-2 py-0.5 mt-2 ${
                    ticket.status === 'used' ? 'bg-neutral/[0.15] text-neutral' : 'bg-success/[0.15] text-success'
                  }`}
                >
                  {ticket.status === 'used' ? 'Utilizado' : 'Válido'}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function MyTicketsPage() {
  return (
    <RoleGuard role="customer">
      <MyTicketsContent />
    </RoleGuard>
  )
}
