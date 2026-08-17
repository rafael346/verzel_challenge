'use client'

import { useMemo, useState } from 'react'
import { useDataStore } from '@/lib/stores/dataStore'
import { EventCard } from '@/components/EventCard'
import { filterEvents, EventFilters } from '@/lib/utils/eventHelpers'
import { EventCategory } from '@/lib/types'

export default function HomePage() {
  const events = useDataStore((s) => s.events)
  const [filters, setFilters] = useState<EventFilters>({})

  const filtered = useMemo(() => filterEvents(events, filters), [events, filters])

  function update<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Eventos</h1>

      <div className="flex flex-wrap gap-2 mb-6 items-end">
        <input
          placeholder="Buscar por título..."
          className="border p-2 rounded flex-1 min-w-[200px]"
          onChange={(e) => update('query', e.target.value)}
        />
        <select
          className="border p-2 rounded"
          onChange={(e) => update('category', e.target.value as EventCategory)}
        >
          <option value="">Todas as categorias</option>
          <option value="show">Show</option>
          <option value="movie">Filme</option>
          <option value="theater">Teatro</option>
        </select>
        <input
          placeholder="Local/cidade"
          className="border p-2 rounded"
          onChange={(e) => update('location', e.target.value)}
        />
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Data inicial
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => update('dateFrom', e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          Data final
          <input
            type="date"
            className="border p-2 rounded"
            onChange={(e) => update('dateTo', e.target.value)}
          />
        </label>
        <input
          type="number"
          placeholder="Preço mín."
          className="border p-2 rounded w-28"
          onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : undefined)}
        />
        <input
          type="number"
          placeholder="Preço máx."
          className="border p-2 rounded w-28"
          onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500">Nenhum evento encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}
