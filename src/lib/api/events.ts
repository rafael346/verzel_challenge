import { apiFetch, ApiError } from './client'
import { Event, EventCategory, TicketMode } from '@/lib/types'
import { EventFormRawValues, ParsedEventInput } from '@/lib/utils/eventFormValidation'

type CategoriaEvento = 'FILME' | 'SHOW' | 'TEATRO'
type FormaVenda = 'PISTA' | 'ASSENTOS'

type EventoResponseDto = {
  id: string
  titulo: string
  categoria: CategoriaEvento
  descricao: string
  local: string
  dataHora: string
  formaVenda: FormaVenda
  fileiras: number | null
  colunas: number | null
  quantidadeTotalIngressos: number | null
  preco: number
  organizerId: string
  createdAt: string
}

type EventoRequestDto = {
  titulo: string
  categoria: CategoriaEvento
  descricao: string
  local: string
  dataHora: string
  formaVenda: FormaVenda
  fileiras?: number
  colunas?: number
  quantidadeTotalIngressos?: number
  preco: number
}

const CATEGORY_BY_CATEGORIA: Record<CategoriaEvento, EventCategory> = {
  FILME: 'movie',
  SHOW: 'show',
  TEATRO: 'theater',
}

const CATEGORIA_BY_CATEGORY: Record<EventCategory, CategoriaEvento> = {
  movie: 'FILME',
  show: 'SHOW',
  theater: 'TEATRO',
}

const TICKET_MODE_BY_FORMA_VENDA: Record<FormaVenda, TicketMode> = {
  ASSENTOS: 'seatmap',
  PISTA: 'quantity',
}

const FORMA_VENDA_BY_TICKET_MODE: Record<TicketMode, FormaVenda> = {
  seatmap: 'ASSENTOS',
  quantity: 'PISTA',
}

const FIELD_KEY_BY_BACKEND_KEY: Record<string, keyof EventFormRawValues | undefined> = {
  titulo: 'title',
  categoria: 'category',
  descricao: 'description',
  local: 'location',
  dataHora: 'date',
  fileiras: 'rows',
  colunas: 'cols',
  quantidadeTotalIngressos: 'totalCapacity',
}

function mapFieldErrors(fieldErrors?: Record<string, string>): Record<string, string> {
  if (!fieldErrors) return {}
  const mapped: Record<string, string> = {}
  for (const [backendKey, message] of Object.entries(fieldErrors)) {
    if (backendKey === 'preco') {
      mapped.price = message
      mapped.seatPrice = message
      continue
    }
    const key = FIELD_KEY_BY_BACKEND_KEY[backendKey]
    if (key) mapped[key] = message
  }
  return mapped
}

function mapEventoResponse(dto: EventoResponseDto): Event {
  const ticketMode = TICKET_MODE_BY_FORMA_VENDA[dto.formaVenda]
  const base = {
    id: dto.id,
    title: dto.titulo,
    category: CATEGORY_BY_CATEGORIA[dto.categoria],
    description: dto.descricao,
    date: dto.dataHora,
    location: dto.local,
    organizerId: dto.organizerId,
    ticketMode,
  }
  if (ticketMode === 'seatmap') {
    return { ...base, rows: dto.fileiras ?? undefined, cols: dto.colunas ?? undefined, seatPrice: dto.preco }
  }
  return { ...base, price: dto.preco, totalCapacity: dto.quantidadeTotalIngressos ?? undefined }
}

function toEventoRequest(data: ParsedEventInput): EventoRequestDto {
  return {
    titulo: data.title,
    categoria: CATEGORIA_BY_CATEGORY[data.category],
    descricao: data.description,
    local: data.location,
    dataHora: data.date,
    formaVenda: FORMA_VENDA_BY_TICKET_MODE[data.ticketMode],
    fileiras: data.ticketMode === 'seatmap' ? data.rows : undefined,
    colunas: data.ticketMode === 'seatmap' ? data.cols : undefined,
    quantidadeTotalIngressos: data.ticketMode === 'quantity' ? data.totalCapacity : undefined,
    preco: data.ticketMode === 'seatmap' ? data.seatPrice! : data.price!,
  }
}

async function withMappedFieldErrors<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof ApiError) {
      throw new ApiError(err.status, err.message, mapFieldErrors(err.fieldErrors))
    }
    throw err
  }
}

export async function listEvents(): Promise<Event[]> {
  const response = await apiFetch<EventoResponseDto[]>('/eventos')
  return response.map(mapEventoResponse)
}

export async function getEvent(id: string): Promise<Event> {
  const response = await apiFetch<EventoResponseDto>(`/eventos/${id}`)
  return mapEventoResponse(response)
}

export async function createEvent(data: ParsedEventInput): Promise<Event> {
  return withMappedFieldErrors(async () => {
    const response = await apiFetch<EventoResponseDto>('/eventos', {
      method: 'POST',
      body: JSON.stringify(toEventoRequest(data)),
    })
    return mapEventoResponse(response)
  })
}

export async function updateEvent(id: string, data: ParsedEventInput): Promise<Event> {
  return withMappedFieldErrors(async () => {
    const response = await apiFetch<EventoResponseDto>(`/eventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toEventoRequest(data)),
    })
    return mapEventoResponse(response)
  })
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch<void>(`/eventos/${id}`, { method: 'DELETE' })
}
