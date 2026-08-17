import { RoleGuard } from '@/components/RoleGuard'
import { TicketDetailContent } from './TicketDetailContent'

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params
  return (
    <RoleGuard role="customer">
      <TicketDetailContent ticketId={ticketId} />
    </RoleGuard>
  )
}
