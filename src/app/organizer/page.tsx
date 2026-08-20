'use client'

import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { Skeleton } from '@/components/Skeleton'
import { StateBox } from '@/components/StateBox'
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
        <h1 className="font-display text-2xl font-semibold">Meus eventos</h1>
        <Link href="/organizer/events/new" className="bg-wine text-text rounded-[3px] px-4 py-2 text-sm">
          Novo evento
        </Link>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="flex flex-col gap-3">
          <span className="sr-only">Carregando eventos...</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-[3px] p-3 flex flex-col gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <StateBox
          variant="error"
          title="Não foi possível carregar os eventos"
          description={error}
          action={{ label: 'Tentar novamente', onClick: refetch }}
        />
      ) : events.length === 0 ? (
        <p className="text-text-muted">Nenhum evento cadastrado.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => {
            const capacity =
              event.ticketMode === 'seatmap' ? (event.rows ?? 0) * (event.cols ?? 0) : event.totalCapacity ?? 0
            const soldOut = isEventSoldOut(event)

            return (
              <li key={event.id} className="border border-border rounded-[3px] p-3 bg-bg">
                <div className="flex justify-between items-start gap-2">
                  <h2 className="font-display font-semibold text-base">{event.title}</h2>
                  <span
                    className={`inline-block text-[0.62rem] uppercase tracking-wide rounded-[2px] px-2 py-0.5 ${
                      soldOut ? 'bg-wine text-text' : 'bg-success/[0.15] text-success'
                    }`}
                  >
                    {soldOut ? 'Esgotado' : 'Ativo'}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </p>
                <p className="text-xs text-text-muted">Vendidos: — / {capacity}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <Link href={`/organizer/events/${event.id}`} className="text-gold hover:underline">
                    Editar
                  </Link>
                  <button type="button" onClick={() => handleDelete(event.id)} className="text-wine hover:underline">
                    Excluir
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
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
