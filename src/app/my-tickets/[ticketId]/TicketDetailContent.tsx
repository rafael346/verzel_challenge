'use client'

import { useState } from 'react'
import { TicketQRCode } from '@/components/TicketQRCode'
import { useAuthStore } from '@/lib/stores/authStore'
import { getEvent } from '@/lib/api/events'
import { getMyTickets } from '@/lib/api/reservations'
import { shareTicket } from '@/lib/api/sharing'
import { useAsync } from '@/lib/hooks/useAsync'
import { ApiError } from '@/lib/api/client'

export function TicketDetailContent({ ticketId }: { ticketId: string }) {
  const currentUser = useAuthStore((s) => s.currentUser)
  const { data: tickets, loading: loadingTickets } = useAsync(
    () => (currentUser ? getMyTickets(currentUser.id) : Promise.resolve([])),
    [currentUser?.id]
  )
  const ticket = tickets?.find((t) => t.id === ticketId)
  const { data: event, loading: loadingEvent } = useAsync(
    () => (ticket ? getEvent(ticket.eventId) : Promise.resolve(null)),
    [ticket?.eventId]
  )
  const [shareUrl, setShareUrl] = useState('')
  const [shareError, setShareError] = useState('')
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  if (loadingTickets) return <p className="text-slate-500">Carregando ingresso...</p>
  if (!ticket) return <p className="text-slate-500">Ingresso não encontrado.</p>
  if (loadingEvent) return <p className="text-slate-500">Carregando ingresso...</p>
  if (!event) return <p className="text-slate-500">Ingresso não encontrado.</p>

  async function handleShare() {
    setSharing(true)
    setShareError('')
    setCopied(false)
    try {
      const { token } = await shareTicket(ticketId)
      setShareUrl(`${window.location.origin}/tickets/${token}`)
    } catch (err) {
      setShareError(err instanceof ApiError ? err.message : 'Erro ao compartilhar. Tente novamente.')
    } finally {
      setSharing(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-slate-600">{new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
      <p className="text-slate-600">{event.location}</p>
      <p className="mt-2">{ticket.seat ? `Assento: ${ticket.seat.row}-${ticket.seat.col}` : 'Pista'}</p>
      <span
        className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
          ticket.status === 'used' ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'
        }`}
      >
        {ticket.status === 'used' ? 'Utilizado' : 'Válido'}
      </span>
      <div className="mt-6">
        <TicketQRCode code={ticket.code} />
      </div>

      {ticket.status === 'valid' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="border px-4 py-2 rounded disabled:opacity-50"
          >
            {sharing ? 'Gerando link...' : 'Compartilhar ingresso'}
          </button>
          {shareError && <p className="text-red-600 text-sm mt-2">{shareError}</p>}
          {shareUrl && (
            <div className="mt-2 flex gap-2">
              <input readOnly value={shareUrl} className="border p-2 rounded flex-1 text-sm" />
              <button type="button" onClick={handleCopy} className="bg-slate-800 text-white px-3 py-2 rounded text-sm">
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
