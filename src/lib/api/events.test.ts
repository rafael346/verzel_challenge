import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listEvents, getEvent, createEvent, updateEvent, deleteEvent } from './events'
import { apiFetch, ApiError } from './client'
import { ParsedEventInput } from '@/lib/utils/eventFormValidation'

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>()
  return { ...actual, apiFetch: vi.fn() }
})

const seatmapDto = {
  id: 'evt-1',
  titulo: 'Peça Teste',
  categoria: 'TEATRO',
  descricao: 'desc',
  local: 'Curitiba, PR',
  dataHora: '2026-11-01T20:00:00Z',
  formaVenda: 'ASSENTOS',
  fileiras: 5,
  colunas: 8,
  quantidadeTotalIngressos: 40,
  preco: 60,
  organizerId: 'org-1',
  createdAt: '2026-01-01T00:00:00Z',
}

const quantityDto = {
  id: 'evt-2',
  titulo: 'Show Teste',
  categoria: 'SHOW',
  descricao: 'desc',
  local: 'São Paulo, SP',
  dataHora: '2026-12-01T20:00:00Z',
  formaVenda: 'PISTA',
  fileiras: null,
  colunas: null,
  quantidadeTotalIngressos: 100,
  preco: 90,
  organizerId: 'org-1',
  createdAt: '2026-01-01T00:00:00Z',
}

describe('listEvents / getEvent', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('maps a list of EventoResponse into Event[], both ticket modes', async () => {
    vi.mocked(apiFetch).mockResolvedValue([seatmapDto, quantityDto])

    const events = await listEvents()

    expect(apiFetch).toHaveBeenCalledWith('/eventos')
    expect(events).toEqual([
      {
        id: 'evt-1',
        title: 'Peça Teste',
        category: 'theater',
        description: 'desc',
        date: '2026-11-01T20:00:00Z',
        location: 'Curitiba, PR',
        organizerId: 'org-1',
        ticketMode: 'seatmap',
        rows: 5,
        cols: 8,
        seatPrice: 60,
      },
      {
        id: 'evt-2',
        title: 'Show Teste',
        category: 'show',
        description: 'desc',
        date: '2026-12-01T20:00:00Z',
        location: 'São Paulo, SP',
        organizerId: 'org-1',
        ticketMode: 'quantity',
        price: 90,
        totalCapacity: 100,
      },
    ])
  })

  it('fetches a single event by id', async () => {
    vi.mocked(apiFetch).mockResolvedValue(seatmapDto)

    const event = await getEvent('evt-1')

    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-1')
    expect(event.title).toBe('Peça Teste')
  })
})

describe('createEvent / updateEvent', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  const seatmapInput: ParsedEventInput = {
    title: 'Peça Nova',
    category: 'theater',
    description: 'desc',
    date: '2026-11-01T20:00:00.000Z',
    location: 'Curitiba, PR',
    ticketMode: 'seatmap',
    rows: 5,
    cols: 8,
    seatPrice: 60,
  }

  const quantityInput: ParsedEventInput = {
    title: 'Show Novo',
    category: 'show',
    description: 'desc',
    date: '2026-12-01T20:00:00.000Z',
    location: 'São Paulo, SP',
    ticketMode: 'quantity',
    price: 90,
    totalCapacity: 100,
  }

  it('sends a seatmap EventoRequest without quantidadeTotalIngressos', async () => {
    vi.mocked(apiFetch).mockResolvedValue(seatmapDto)

    await createEvent(seatmapInput)

    expect(apiFetch).toHaveBeenCalledWith('/eventos', {
      method: 'POST',
      body: JSON.stringify({
        titulo: 'Peça Nova',
        categoria: 'TEATRO',
        descricao: 'desc',
        local: 'Curitiba, PR',
        dataHora: '2026-11-01T20:00:00.000Z',
        formaVenda: 'ASSENTOS',
        fileiras: 5,
        colunas: 8,
        preco: 60,
      }),
    })
  })

  it('sends a quantity EventoRequest without fileiras/colunas', async () => {
    vi.mocked(apiFetch).mockResolvedValue(quantityDto)

    await updateEvent('evt-2', quantityInput)

    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-2', {
      method: 'PUT',
      body: JSON.stringify({
        titulo: 'Show Novo',
        categoria: 'SHOW',
        descricao: 'desc',
        local: 'São Paulo, SP',
        dataHora: '2026-12-01T20:00:00.000Z',
        formaVenda: 'PISTA',
        quantidadeTotalIngressos: 100,
        preco: 90,
      }),
    })
  })

  it('remaps backend field-error keys to EventFormRawValues keys on failure', async () => {
    vi.mocked(apiFetch).mockRejectedValue(
      new ApiError(400, 'Dados inválidos', { titulo: 'título é obrigatório', preco: 'deve ser maior que zero' })
    )

    await expect(createEvent(seatmapInput)).rejects.toMatchObject({
      status: 400,
      fieldErrors: {
        title: 'título é obrigatório',
        price: 'deve ser maior que zero',
        seatPrice: 'deve ser maior que zero',
      },
    })
  })
})

describe('deleteEvent', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it('sends a DELETE request', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    await deleteEvent('evt-1')
    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-1', { method: 'DELETE' })
  })
})
