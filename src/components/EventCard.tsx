import Link from 'next/link'
import { Event } from '@/lib/types'
import { getEventPrice, isEventSoldOut } from '@/lib/utils/eventHelpers'

export function EventCard({ event }: { event: Event }) {
  const soldOut = isEventSoldOut(event)
  const price = getEventPrice(event)
  const date = new Date(event.date).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <Link
      href={`/events/${event.id}`}
      className="block border rounded p-4 hover:shadow transition bg-white"
    >
      <div className="flex justify-between items-start">
        <h2 className="font-bold text-lg">{event.title}</h2>
        {soldOut && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Esgotado</span>
        )}
      </div>
      <p className="text-sm text-slate-600">{event.category}</p>
      <p className="text-sm text-slate-600">{date}</p>
      <p className="text-sm text-slate-600">{event.location}</p>
      <p className="font-semibold mt-2">R$ {price.toFixed(2)}</p>
    </Link>
  )
}
