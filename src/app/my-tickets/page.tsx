'use client'

import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'

function MyTicketsContent() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const tickets = useDataStore((s) => s.tickets.filter((t) => t.userId === currentUser?.id))
  const events = useDataStore((s) => s.events)

  if (tickets.length === 0) {
    return <p className="text-slate-500">Você ainda não tem ingressos.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Meus ingressos</h1>
      <ul className="flex flex-col gap-3">
        {tickets.map((ticket) => {
          const event = events.find((e) => e.id === ticket.eventId)
          return (
            <li key={ticket.id} className="border rounded p-4 bg-white">
              <Link href={`/my-tickets/${ticket.id}`} className="font-semibold underline">
                {event?.title ?? 'Evento removido'}
              </Link>
              <p className="text-sm text-slate-600">
                {event ? new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : ''} — {event?.location}
              </p>
              <p className="text-sm">
                {ticket.seat ? `Assento: ${ticket.seat.row}-${ticket.seat.col}` : `Quantidade: ${ticket.quantity}`}
              </p>
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
