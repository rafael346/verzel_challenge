import { EventCategory, TicketMode } from '@/lib/types'
import { NewEventInput } from '@/lib/stores/dataStore'

export type EventFormRawValues = {
  title: string
  category: EventCategory
  description: string
  date: string // value from <input type="datetime-local">
  location: string
  ticketMode: TicketMode
  rows: string
  cols: string
  seatPrice: string
  price: string
  totalCapacity: string
}

type ParsedEventInput = Omit<NewEventInput, 'organizerId'>

export type ValidateEventFormResult =
  | { valid: true; data: ParsedEventInput }
  | { valid: false; errors: Partial<Record<keyof EventFormRawValues, string>> }

function toPositiveNumber(value: string): number | null {
  const n = Number(value)
  if (!value || !Number.isFinite(n) || n <= 0) return null
  return n
}

function toPositiveInteger(value: string): number | null {
  const n = toPositiveNumber(value)
  if (n === null || !Number.isInteger(n)) return null
  return n
}

export function validateEventForm(values: EventFormRawValues, now: Date = new Date()): ValidateEventFormResult {
  const errors: Partial<Record<keyof EventFormRawValues, string>> = {}

  if (!values.title.trim()) errors.title = 'Título é obrigatório'
  if (!values.description.trim()) errors.description = 'Descrição é obrigatória'
  if (!values.location.trim()) errors.location = 'Local é obrigatório'

  const parsedDate = values.date ? new Date(values.date) : null
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    errors.date = 'Data inválida'
  } else if (parsedDate.getTime() <= now.getTime()) {
    errors.date = 'A data deve ser no futuro'
  }

  let rows: number | null = null
  let cols: number | null = null
  let seatPrice: number | null = null
  let price: number | null = null
  let totalCapacity: number | null = null

  if (values.ticketMode === 'seatmap') {
    rows = toPositiveInteger(values.rows)
    cols = toPositiveInteger(values.cols)
    seatPrice = toPositiveNumber(values.seatPrice)
    if (!rows) errors.rows = 'Informe um número de fileiras maior que zero'
    if (!cols) errors.cols = 'Informe um número de colunas maior que zero'
    if (!seatPrice) errors.seatPrice = 'Informe um preço por assento maior que zero'
  } else {
    price = toPositiveNumber(values.price)
    totalCapacity = toPositiveInteger(values.totalCapacity)
    if (!price) errors.price = 'Informe um preço maior que zero'
    if (!totalCapacity) errors.totalCapacity = 'Informe uma capacidade maior que zero'
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors }

  return {
    valid: true,
    data: {
      title: values.title.trim(),
      category: values.category,
      description: values.description.trim(),
      date: parsedDate!.toISOString(),
      location: values.location.trim(),
      ticketMode: values.ticketMode,
      ...(values.ticketMode === 'seatmap'
        ? { rows: rows!, cols: cols!, seatPrice: seatPrice! }
        : { price: price!, totalCapacity: totalCapacity! }),
    },
  }
}
