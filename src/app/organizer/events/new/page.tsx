'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RoleGuard } from '@/components/RoleGuard'
import { EventForm } from '@/components/EventForm'
import { createEvent } from '@/lib/api/events'
import { ApiError } from '@/lib/api/client'
import { ParsedEventInput } from '@/lib/utils/eventFormValidation'

function NewEventContent() {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string>()
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  async function handleSubmit(data: ParsedEventInput) {
    setSubmitting(true)
    setServerError(undefined)
    setServerFieldErrors({})
    try {
      await createEvent(data)
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
      <h1 className="text-2xl font-bold mb-4">Novo evento</h1>
      <EventForm
        submitLabel="Criar evento"
        onSubmit={handleSubmit}
        submitting={submitting}
        serverError={serverError}
        serverFieldErrors={serverFieldErrors}
      />
    </div>
  )
}

export default function NewEventPage() {
  return (
    <RoleGuard role="organizer">
      <NewEventContent />
    </RoleGuard>
  )
}
