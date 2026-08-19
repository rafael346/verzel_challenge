import { apiFetch } from './client'

type CompartilhamentoResponseDto = { linkPublico: string }

function parseToken(linkPublico: string): string {
  const path = new URL(linkPublico).pathname
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1]
}

export async function shareTicket(ticketId: string): Promise<{ token: string }> {
  const dto = await apiFetch<CompartilhamentoResponseDto>(`/ingressos/${ticketId}/compartilhar`, {
    method: 'POST',
  })
  return { token: parseToken(dto.linkPublico) }
}

type StatusIngresso = 'RESERVADO' | 'VENDIDO' | 'CANCELADA' | 'EXPIRADA' | 'USADO'

type IngressoPublicoResponseDto = {
  ingressoId: string
  eventoId: string
  eventoNome: string
  fileira: number | null
  coluna: number | null
  status: StatusIngresso
}

export type SharedTicket = {
  ticketId: string
  eventId: string
  eventTitle: string
  seat?: { row: number; col: number }
  status: 'valid' | 'used'
}

const TICKET_STATUS_BY_STATUS_INGRESSO: Record<string, 'valid' | 'used'> = {
  VENDIDO: 'valid',
  USADO: 'used',
}

function mapIngressoPublico(dto: IngressoPublicoResponseDto): SharedTicket {
  return {
    ticketId: dto.ingressoId,
    eventId: dto.eventoId,
    eventTitle: dto.eventoNome,
    seat: dto.fileira !== null && dto.coluna !== null ? { row: dto.fileira, col: dto.coluna } : undefined,
    status: TICKET_STATUS_BY_STATUS_INGRESSO[dto.status] ?? 'valid',
  }
}

export async function getSharedTicket(token: string): Promise<SharedTicket> {
  const dto = await apiFetch<IngressoPublicoResponseDto>(`/ingressos/compartilhados/${token}`)
  return mapIngressoPublico(dto)
}
