'use client'

import Link from 'next/link'
import { useDataStore } from '@/lib/stores/dataStore'
import { CATEGORY_LABELS, getEventPrice, isEventSoldOut } from '@/lib/utils/eventHelpers'

export function EventDetailContent({ id }: { id: string }) {
  const event = useDataStore((s) => s.events.find((e) => e.id === id))

  if (!event) {
    return <p className="text-slate-500">Evento não encontrado.</p>
  }

  const soldOut = isEventSoldOut(event)
  const price = getEventPrice(event)
  const date = new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-slate-600">{CATEGORY_LABELS[event.category]}</p>
      <p className="text-slate-600">{date}</p>
      <p className="text-slate-600">{event.location}</p>
      <p className="mt-4">{event.description}</p>
      <p className="font-semibold text-lg mt-4">A partir de R$ {price.toFixed(2)}</p>

      {soldOut ? (
        <span className="inline-block mt-4 text-sm bg-red-100 text-red-700 px-3 py-2 rounded">
          Esgotado
        </span>
      ) : (
        <Link
          href={`/events/${event.id}/book`}
          className="inline-block mt-4 bg-slate-800 text-white px-4 py-2 rounded"
        >
          Comprar ingresso
        </Link>
      )}
    </div>
  )
}
