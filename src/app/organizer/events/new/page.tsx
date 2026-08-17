'use client'

import { useRouter } from 'next/navigation'
import { RoleGuard } from '@/components/RoleGuard'
import { EventForm } from '@/components/EventForm'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'

function NewEventContent() {
  const currentUser = useAuthStore((s) => s.currentUser)
  const createEvent = useDataStore((s) => s.createEvent)
  const router = useRouter()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Novo evento</h1>
      <EventForm
        submitLabel="Criar evento"
        onSubmit={(data) => {
          createEvent({ ...data, organizerId: currentUser!.id })
          router.push('/organizer')
        }}
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
