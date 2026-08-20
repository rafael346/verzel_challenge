import Link from 'next/link'
import { Event } from '@/lib/types'
import { EventPoster } from '@/components/EventPoster'
import { CATEGORY_LABELS, getEventPrice, isEventSoldOut } from '@/lib/utils/eventHelpers'

export function EventCard({ event }: { event: Event }) {
  const soldOut = isEventSoldOut(event)
  const price = getEventPrice(event)
  const date = new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <Link
      href={`/events/${event.id}`}
      className="flex gap-3 border border-border rounded-[3px] p-3 bg-bg hover:border-gold transition-colors"
    >
      <div className={soldOut ? 'grayscale brightness-75' : undefined}>
        <EventPoster event={event} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <span className="inline-block text-[0.62rem] uppercase tracking-wide bg-border text-gold rounded-[2px] px-2 py-0.5">
            {CATEGORY_LABELS[event.category]}
          </span>
          {soldOut && (
            <span className="text-[0.62rem] uppercase tracking-wide bg-wine text-text rounded-[2px] px-2 py-0.5">
              Esgotado
            </span>
          )}
        </div>
        <h2 className="font-display font-semibold text-base mt-2">{event.title}</h2>
        <p className="text-xs text-text-muted mt-1">{date}</p>
        <p className="text-xs text-text-muted">{event.location}</p>
        <p className="text-sm text-gold mt-2">a partir de R$ {price.toFixed(2)}</p>
      </div>
    </Link>
  )
}
