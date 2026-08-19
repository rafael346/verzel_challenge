import { DenyRole } from '@/components/DenyRole'
import { EventDetailContent } from './EventDetailContent'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <DenyRole role="gate" redirectTo="/gate">
      <EventDetailContent id={id} />
    </DenyRole>
  )
}
