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

  if (loadingTickets) return <p className="text-text-muted">Carregando ingresso...</p>
  if (!ticket) return <p className="text-text-muted">Ingresso não encontrado.</p>
  if (loadingEvent) return <p className="text-text-muted">Carregando ingresso...</p>
  if (!event) return <p className="text-text-muted">Ingresso não encontrado.</p>

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
    <div className="max-w-sm mx-auto border border-border rounded-[3px] p-6 bg-bg text-center">
      <h1 className="font-display text-2xl font-semibold">{event.title}</h1>
      <p className="text-text-muted text-sm mt-1">
        {new Date(event.date).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
      </p>
      <p className="text-text-muted text-sm">{event.location}</p>
      <p className="mt-2 text-sm text-text">{ticket.seat ? `Assento: ${ticket.seat.row}-${ticket.seat.col}` : 'Pista'}</p>
      <span
        className={`inline-block text-[0.62rem] uppercase tracking-wide rounded-[2px] px-2 py-0.5 mt-2 ${
          ticket.status === 'used' ? 'bg-neutral/[0.15] text-neutral' : 'bg-success/[0.15] text-success'
        }`}
      >
        {ticket.status === 'used' ? 'Utilizado' : 'Válido'}
      </span>

      <div className="mt-6 flex justify-center">
        <TicketQRCode code={ticket.code} />
      </div>

      {ticket.status === 'valid' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="border border-border rounded-[3px] px-4 py-2 text-sm text-text hover:border-gold disabled:opacity-50"
          >
            {sharing ? 'Gerando link...' : 'Compartilhar ingresso'}
          </button>
          {shareError && <p className="text-wine text-sm mt-2">{shareError}</p>}
          {shareUrl && (
            <div className="mt-3 flex gap-2 text-left">
              <input
                readOnly
                value={shareUrl}
                className="border border-border-subtle bg-surface rounded-[3px] p-2 flex-1 text-sm text-text-muted"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="bg-wine text-text rounded-[3px] px-3 py-2 text-sm"
              >
                {copied ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
