import { RoleGuard } from '@/components/RoleGuard'
import { BookEventContent } from './BookEventContent'

export default async function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <RoleGuard role="customer">
      <BookEventContent id={id} />
    </RoleGuard>
  )
}
