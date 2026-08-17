'use client'

import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/EventForm'
import { useDataStore } from '@/lib/stores/dataStore'
import { EventFormRawValues } from '@/lib/utils/eventFormValidation'

function toDateTimeLocal(iso: string): string {
  return iso.slice(0, 16)
}

export function EditEventContent({ id }: { id: string }) {
  const event = useDataStore((s) => s.events.find((e) => e.id === id))
  const updateEvent = useDataStore((s) => s.updateEvent)
  const router = useRouter()

  if (!event) return <p className="text-slate-500">Evento não encontrado.</p>

  const initialValues: Partial<EventFormRawValues> = {
    title: event.title,
    category: event.category,
    description: event.description,
    location: event.location,
    date: toDateTimeLocal(event.date),
    ticketMode: event.ticketMode,
    rows: event.rows?.toString() ?? '',
    cols: event.cols?.toString() ?? '',
    seatPrice: event.seatPrice?.toString() ?? '',
    price: event.price?.toString() ?? '',
    totalCapacity: event.totalCapacity?.toString() ?? '',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar evento</h1>
      <EventForm
        key={id}
        submitLabel="Salvar alterações"
        initialValues={initialValues}
        onSubmit={(data) => {
          const result = updateEvent(id, data)
          if ('error' in result) {
            window.alert(result.error)
            return
          }
          router.push('/organizer')
        }}
      />
    </div>
  )
}
