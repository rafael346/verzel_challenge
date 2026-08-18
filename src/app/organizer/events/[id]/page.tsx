import { RoleGuard } from '@/components/RoleGuard'
import { EditEventContent } from './EditEventContent'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <RoleGuard role="organizer">
      <EditEventContent id={id} />
    </RoleGuard>
  )
}
