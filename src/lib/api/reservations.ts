import { apiFetch } from './client'
import { Seat, Ticket } from '@/lib/types'

type AssentoOcupadoDto = { fileira: number; coluna: number }

type DisponibilidadeDto = {
  fileiras: number | null
  colunas: number | null
  assentosOcupados: AssentoOcupadoDto[] | null
  quantidadeDisponivel: number | null
}

export type SeatAvailability = { mode: 'seatmap'; rows: number; cols: number; seats: Seat[] }
export type QuantityAvailability = { mode: 'quantity'; available: number }
export type Availability = SeatAvailability | QuantityAvailability

function mapDisponibilidade(dto: DisponibilidadeDto): Availability {
  if (dto.quantidadeDisponivel !== null) {
    return { mode: 'quantity', available: dto.quantidadeDisponivel }
  }
  const rows = dto.fileiras ?? 0
  const cols = dto.colunas ?? 0
  const occupied = dto.assentosOcupados ?? []
  const seats: Seat[] = []
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      const isOccupied = occupied.some((o) => o.fileira === row && o.coluna === col)
      seats.push({ row, col, status: isOccupied ? 'sold' : 'available' })
    }
  }
  return { mode: 'seatmap', rows, cols, seats }
}

export async function getAvailability(eventId: string): Promise<Availability> {
  const dto = await apiFetch<DisponibilidadeDto>(`/eventos/${eventId}/disponibilidade`)
  return mapDisponibilidade(dto)
}

type AssentoRequestDto = { fileira: number; coluna: number }
type ReservaRequestDto = { assentos?: AssentoRequestDto[]; quantidade?: number }

type ItemReservaDto = { ingressoId: string; fileira: number | null; coluna: number | null; preco: number }
type ReservaResponseDto = { reservaId: string; itens: ItemReservaDto[]; valorTotal: number; expiraEm: string }

export type ReservationItem = { ticketId: string; row?: number; col?: number; price: number }
export type Reservation = {
  id: string
  eventId: string
  items: ReservationItem[]
  total: number
  expiresAt: string
}

function mapReservaResponse(dto: ReservaResponseDto, eventId: string): Reservation {
  return {
    id: dto.reservaId,
    eventId,
    items: dto.itens.map((item) => ({
      ticketId: item.ingressoId,
      row: item.fileira ?? undefined,
      col: item.coluna ?? undefined,
      price: item.preco,
    })),
    total: dto.valorTotal,
    expiresAt: dto.expiraEm,
  }
}

export async function createReservation(
  eventId: string,
  input: { seats: { row: number; col: number }[] } | { quantity: number }
): Promise<Reservation> {
  const body: ReservaRequestDto =
    'seats' in input
      ? { assentos: input.seats.map((s) => ({ fileira: s.row, coluna: s.col })) }
      : { quantidade: input.quantity }
  const dto = await apiFetch<ReservaResponseDto>(`/eventos/${eventId}/reservas`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return mapReservaResponse(dto, eventId)
}

type IngressoResponseDto = {
  id: string
  eventoId: string
  fileira: number | null
  coluna: number | null
  preco: number
  status: 'RESERVADO' | 'VENDIDO' | 'CANCELADA' | 'EXPIRADA' | 'USADO'
  validoAte: string
}

const TICKET_STATUS_BY_STATUS_INGRESSO: Record<string, 'valid' | 'used'> = {
  VENDIDO: 'valid',
  USADO: 'used',
}

function mapIngressoResponse(dto: IngressoResponseDto, userId: string): Ticket {
  return {
    id: dto.id,
    code: dto.id,
    eventId: dto.eventoId,
    userId,
    seat: dto.fileira !== null && dto.coluna !== null ? { row: dto.fileira, col: dto.coluna } : undefined,
    status: TICKET_STATUS_BY_STATUS_INGRESSO[dto.status] ?? 'valid',
    purchasedAt: new Date().toISOString(),
  }
}

export async function confirmReservation(
  reservationId: string,
  paymentMethodId: string,
  userId: string
): Promise<Ticket[]> {
  const dtos = await apiFetch<IngressoResponseDto[]>(`/reservas/${reservationId}/confirmar`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethodId }),
  })
  return dtos.map((dto) => mapIngressoResponse(dto, userId))
}

export async function cancelReservation(reservationId: string): Promise<void> {
  await apiFetch<void>(`/reservas/${reservationId}/cancelar`, { method: 'POST' })
}

/** Ingressos comprados pelo usuário logado (vendidos ou já usados). Fonte de verdade para a
 * tela "Meus ingressos" — ao contrário do resultado de `confirmReservation`, que só existe
 * em memória, isto reflete o que o backend persistiu, então sobrevive a um refresh. */
export async function getMyTickets(userId: string): Promise<Ticket[]> {
  const dtos = await apiFetch<IngressoResponseDto[]>('/ingressos')
  return dtos.map((dto) => mapIngressoResponse(dto, userId))
}
