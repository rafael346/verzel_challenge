'use client'

import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { isEventSoldOut } from '@/lib/utils/eventHelpers'

function DashboardContent() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const events = useDataStore((s) => s.events.filter((e) => e.organizerId === currentUser?.id))
  const deleteEvent = useDataStore((s) => s.deleteEvent)

  function handleDelete(id: string, sold: number) {
    const message =
      sold > 0
        ? 'Este evento já tem ingressos vendidos. Excluir mesmo assim?'
        : 'Excluir este evento?'
    if (window.confirm(message)) deleteEvent(id)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meus eventos</h1>
        <Link href="/organizer/events/new" className="bg-slate-800 text-white px-4 py-2 rounded">
          Novo evento
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-slate-500">Nenhum evento cadastrado.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Título</th>
              <th>Data</th>
              <th>Status</th>
              <th>Vendidos</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const sold = event.ticketMode === 'seatmap'
                ? (event.seats ?? []).filter((s) => s.status === 'sold').length
                : event.sold ?? 0
              const capacity = event.ticketMode === 'seatmap'
                ? (event.rows ?? 0) * (event.cols ?? 0)
                : event.totalCapacity ?? 0

              return (
                <tr key={event.id} className="border-b">
                  <td className="py-2">{event.title}</td>
                  <td>{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                  <td>{isEventSoldOut(event) ? 'Esgotado' : 'Ativo'}</td>
                  <td>{sold} / {capacity}</td>
                  <td className="flex gap-2 py-2">
                    <Link href={`/organizer/events/${event.id}`} className="underline">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(event.id, sold)} className="underline text-red-600">
                      Excluir
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function OrganizerDashboardPage() {
  return (
    <RoleGuard role="organizer">
      <DashboardContent />
    </RoleGuard>
  )
}
