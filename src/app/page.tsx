'use client'

import { useMemo, useState } from 'react'
import { EventCard } from '@/components/EventCard'
import { EventCardSkeleton } from '@/components/EventCardSkeleton'
import { StateBox } from '@/components/StateBox'
import { DenyRole } from '@/components/DenyRole'
import { filterEvents, EventFilters } from '@/lib/utils/eventHelpers'
import { EventCategory } from '@/lib/types'
import { listEvents } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'

function HomePageContent() {
  const { data: events, loading, error, refetch } = useAsync(() => listEvents(), [])
  const [filters, setFilters] = useState<EventFilters>({})

  const filtered = useMemo(() => filterEvents(events ?? [], filters), [events, filters])

  function update<K extends keyof EventFilters>(key: K, value: EventFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value === '' ? undefined : value }))
  }

  function clearFilters() {
    setFilters({})
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-4">Eventos</h1>

      <div className="mb-6">
        <label className="block mb-3">
          <span className="sr-only">Buscar por título</span>
          <input
            placeholder="Buscar por título..."
            value={filters.query ?? ''}
            onChange={(e) => update('query', e.target.value)}
            className="w-full bg-surface border border-border rounded-[3px] px-3 py-2 font-display text-base text-text placeholder:font-sans placeholder:text-text-faint"
          />
        </label>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted flex-1 min-w-[160px]">
            Categoria
            <select
              value={filters.category ?? ''}
              onChange={(e) => update('category', e.target.value as EventCategory)}
              className="bg-surface border border-border-subtle rounded-[3px] px-2 py-2 text-sm text-text normal-case tracking-normal"
            >
              <option value="">Todas as categorias</option>
              <option value="show">Show</option>
              <option value="movie">Filme</option>
              <option value="theater">Teatro</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted flex-1 min-w-[160px]">
            Local/cidade
            <input
              placeholder="Local/cidade"
              value={filters.location ?? ''}
              onChange={(e) => update('location', e.target.value)}
              className="bg-surface border border-border-subtle rounded-[3px] px-2 py-2 text-sm text-text normal-case tracking-normal"
            />
          </label>

          <div className="flex items-end gap-2">
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted">
              Data inicial
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => update('dateFrom', e.target.value)}
                className="bg-surface border border-border-subtle rounded-[3px] px-2 py-2 text-sm text-text w-36 normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted">
              Data final
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => update('dateTo', e.target.value)}
                className="bg-surface border border-border-subtle rounded-[3px] px-2 py-2 text-sm text-text w-36 normal-case tracking-normal"
              />
            </label>
          </div>

          <div className="flex items-end gap-2">
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted">
              Preço mínimo
              <input
                type="number"
                placeholder="Preço mín."
                value={filters.minPrice ?? ''}
                onChange={(e) => update('minPrice', e.target.value === '' ? undefined : Number(e.target.value))}
                className="bg-surface border border-border-subtle rounded-[3px] px-2 py-2 text-sm text-text w-24 normal-case tracking-normal"
              />
            </label>
            <label className="flex flex-col gap-1 text-[0.65rem] uppercase tracking-wide text-text-muted">
              Preço máximo
              <input
                type="number"
                placeholder="Preço máx."
                value={filters.maxPrice ?? ''}
                onChange={(e) => update('maxPrice', e.target.value === '' ? undefined : Number(e.target.value))}
                className="bg-surface border border-border-subtle rounded-[3px] px-2 py-2 text-sm text-text w-24 normal-case tracking-normal"
              />
            </label>
          </div>

          <button type="button" onClick={clearFilters} className="text-xs text-gold pb-2 hover:underline">
            Limpar filtros
          </button>
        </div>
      </div>

      {loading ? (
        <div role="status" aria-live="polite">
          <span className="sr-only">Carregando eventos...</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : error ? (
        <StateBox
          variant="error"
          title="Não foi possível carregar os eventos"
          description={error}
          action={{ label: 'Tentar novamente', onClick: refetch }}
        />
      ) : filtered.length === 0 ? (
        <p className="text-text-muted">Nenhum evento encontrado.</p>
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

export default function HomePage() {
  return (
    <DenyRole role="gate" redirectTo="/gate">
      <HomePageContent />
    </DenyRole>
  )
}
