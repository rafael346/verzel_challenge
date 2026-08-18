import { EventDetailContent } from './EventDetailContent'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <EventDetailContent id={id} />
}
