import { SharedTicketContent } from './SharedTicketContent'

export default async function SharedTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <SharedTicketContent token={token} />
}
