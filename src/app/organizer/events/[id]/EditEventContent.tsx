'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { EventForm } from '@/components/EventForm'
import { useAuthStore } from '@/lib/stores/authStore'
import { getEvent, updateEvent } from '@/lib/api/events'
import { useAsync } from '@/lib/hooks/useAsync'
import { ApiError } from '@/lib/api/client'
import { EventFormRawValues, ParsedEventInput } from '@/lib/utils/eventFormValidation'

function toDateTimeLocal(iso: string): string {
  const date = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export function EditEventContent({ id }: { id: string }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: event, loading, error } = useAsync(() => getEvent(id), [id])
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>()
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  if (loading) return <p className="text-slate-500">Carregando evento...</p>
  if (error || !event || event.organizerId !== currentUser?.id) {
    return <p className="text-slate-500">Evento não encontrado.</p>
  }

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

  async function handleSubmit(data: ParsedEventInput) {
    setSubmitting(true)
    setServerError(undefined)
    setServerFieldErrors({})
    try {
      await updateEvent(id, data)
      router.push('/organizer')
    } catch (err) {
      setSubmitting(false)
      if (err instanceof ApiError) {
        setServerError(err.message)
        setServerFieldErrors(err.fieldErrors ?? {})
      } else {
        setServerError('Erro inesperado. Tente novamente.')
      }
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editar evento</h1>
      <EventForm
        key={id}
        submitLabel="Salvar alterações"
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
        serverFieldErrors={serverFieldErrors}
      />
    </div>
  )
}
