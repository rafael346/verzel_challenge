'use client'

import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { useAuthStore } from '@/lib/stores/authStore'
import { listEvents, deleteEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'
import { isEventSoldOut } from '@/lib/utils/eventHelpers'

function DashboardContent() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: allEvents, loading, error, refetch } = useAsync(() => listEvents(), [])
  const events = (allEvents ?? []).filter((e) => e.organizerId === currentUser?.id)

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir este evento?')) return
    try {
      await deleteEvent(id)
      refetch()
    } catch {
      window.alert('Não foi possível excluir o evento. Tente novamente.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Meus eventos</h1>
        <Link href="/organizer/events/new" className="bg-slate-800 text-white px-4 py-2 rounded">
          Novo evento
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">Carregando eventos...</p>
      ) : error ? (
        <p className="text-slate-500">{error}</p>
      ) : events.length === 0 ? (
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
              const capacity = event.ticketMode === 'seatmap'
                ? (event.rows ?? 0) * (event.cols ?? 0)
                : event.totalCapacity ?? 0

              return (
                <tr key={event.id} className="border-b">
                  <td className="py-2">{event.title}</td>
                  <td>{new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                  <td>{isEventSoldOut(event) ? 'Esgotado' : 'Ativo'}</td>
                  <td>— / {capacity}</td>
                  <td className="flex gap-2 py-2">
                    <Link href={`/organizer/events/${event.id}`} className="underline">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(event.id)} className="underline text-red-600">
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
