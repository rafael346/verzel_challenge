'use client'

import Link from 'next/link'
import { getEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'
import { EventPoster } from '@/components/EventPoster'
import { CATEGORY_LABELS, getEventPrice, isEventSoldOut } from '@/lib/utils/eventHelpers'

export function EventDetailContent({ id }: { id: string }) {
  const { data: event, loading, error } = useAsync(() => getEvent(id), [id])

  if (loading) return <p className="text-text-muted">Carregando evento...</p>
  if (error || !event) {
    return <p className="text-text-muted">Evento não encontrado.</p>
  }

  const soldOut = isEventSoldOut(event)
  const price = getEventPrice(event)
  const date = new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <div className="max-w-3xl flex flex-col sm:flex-row gap-6">
      <EventPoster event={event} size="lg" />
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-display text-2xl font-semibold">{event.title}</h1>
          {event.tmdbId !== undefined && (
            <span className="text-[0.62rem] uppercase tracking-wide bg-border text-gold rounded-[2px] px-2 py-0.5">
              Sincronizado do TMDB
            </span>
          )}
        </div>
        <p className="text-text-muted mt-2">{CATEGORY_LABELS[event.category]}</p>
        <p className="text-text-muted">{date}</p>
        <p className="text-text-muted">{event.location}</p>
        <p className="text-text mt-4">{event.description}</p>
        <p className="text-gold text-lg mt-4">A partir de R$ {price.toFixed(2)}</p>

        {soldOut ? (
          <span className="inline-block mt-4 text-[0.62rem] uppercase tracking-wide bg-wine text-text rounded-[2px] px-3 py-2">
            Esgotado
          </span>
        ) : (
          <Link
            href={`/events/${event.id}/book`}
            className="inline-block mt-4 bg-wine text-text rounded-[3px] px-4 py-2 text-sm"
          >
            Comprar ingresso
          </Link>
        )}
      </div>
    </div>
  )
}
