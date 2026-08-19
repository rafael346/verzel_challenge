'use client'

import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { getEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'
import { Event } from '@/lib/types'

function MyTicketsContent() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const tickets = useDataStore((s) => s.tickets.filter((t) => t.userId === currentUser?.id))
  const eventIds = Array.from(new Set(tickets.map((t) => t.eventId))).sort()

  const { data: eventsById, loading, error } = useAsync(async () => {
    const events = await Promise.all(eventIds.map((id) => getEvent(id)))
    return events.reduce<Record<string, Event>>((acc, event) => {
      acc[event.id] = event
      return acc
    }, {})
  }, [eventIds.join(',')])

  if (tickets.length === 0) {
    return <p className="text-slate-500">Você ainda não tem ingressos.</p>
  }

  if (loading) return <p className="text-slate-500">Carregando ingressos...</p>
  if (error) return <p className="text-slate-500">{error}</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meus ingressos</h1>
      <ul className="flex flex-col gap-3">
        {tickets.map((ticket) => {
          const event = eventsById?.[ticket.eventId]
          return (
            <li key={ticket.id} className="border rounded p-4 bg-white">
              <Link href={`/my-tickets/${ticket.id}`} className="font-semibold underline">
                {event?.title ?? 'Evento removido'}
              </Link>
              <p className="text-sm text-slate-600">
                {event ? new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : ''} — {event?.location}
              </p>
              <p className="text-sm">{ticket.seat ? `Assento: ${ticket.seat.row}-${ticket.seat.col}` : 'Pista'}</p>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  ticket.status === 'used' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'
                }`}
              >
                {ticket.status === 'used' ? 'Utilizado' : 'Válido'}
              </span>
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
