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
      className="flex gap-3 border rounded p-4 hover:shadow transition bg-white"
    >
      <EventPoster event={event} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h2 className="font-bold text-lg">{event.title}</h2>
          {soldOut && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Esgotado</span>
          )}
        </div>
        <p className="text-sm text-slate-600">{CATEGORY_LABELS[event.category]}</p>
        <p className="text-sm text-slate-600">{date}</p>
        <p className="text-sm text-slate-600">{event.location}</p>
        <p className="font-semibold mt-2">R$ {price.toFixed(2)}</p>
      </div>
    </Link>
  )
}
