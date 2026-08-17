'use client'

import { EventCategory, TicketMode } from '@/lib/types'
import { useState } from 'react'
import { EventFormRawValues, validateEventForm } from '@/lib/utils/eventFormValidation'
import { NewEventInput } from '@/lib/stores/dataStore'

type ParsedEventInput = Omit<NewEventInput, 'organizerId'>

const emptyValues: EventFormRawValues = {
  title: '',
  category: 'show',
  description: '',
  date: '',
  location: '',
  ticketMode: 'quantity',
  rows: '',
  cols: '',
  seatPrice: '',
  price: '',
  totalCapacity: '',
}

export function EventForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues?: Partial<EventFormRawValues>
  submitLabel: string
  onSubmit: (data: ParsedEventInput) => void
}) {
  const [values, setValues] = useState<EventFormRawValues>({ ...emptyValues, ...initialValues })
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormRawValues, string>>>({})

  function update<K extends keyof EventFormRawValues>(key: K, value: EventFormRawValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = validateEventForm(values)
    if (!result.valid) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    onSubmit(result.data)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1">
        Título
        <input className="border p-2 rounded" value={values.title} onChange={(e) => update('title', e.target.value)} />
        {errors.title && <span className="text-red-600 text-xs">{errors.title}</span>}
      </label>

      <label className="flex flex-col gap-1">
        Categoria
        <select
          className="border p-2 rounded"
          value={values.category}
          onChange={(e) => update('category', e.target.value as EventCategory)}
        >
          <option value="show">Show</option>
          <option value="movie">Filme</option>
          <option value="theater">Teatro</option>
        </select>
      </label>

      <label className="flex flex-col gap-1">
        Descrição
        <textarea
          className="border p-2 rounded"
          value={values.description}
          onChange={(e) => update('description', e.target.value)}
        />
        {errors.description && <span className="text-red-600 text-xs">{errors.description}</span>}
      </label>

      <label className="flex flex-col gap-1">
        Local
        <input className="border p-2 rounded" value={values.location} onChange={(e) => update('location', e.target.value)} />
        {errors.location && <span className="text-red-600 text-xs">{errors.location}</span>}
      </label>

      <label className="flex flex-col gap-1">
        Data e hora
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={values.date}
          onChange={(e) => update('date', e.target.value)}
        />
        {errors.date && <span className="text-red-600 text-xs">{errors.date}</span>}
      </label>

      <fieldset className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ticketMode"
            checked={values.ticketMode === 'quantity'}
            onChange={() => update('ticketMode', 'quantity' as TicketMode)}
          />
          Quantidade (pista)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="ticketMode"
            checked={values.ticketMode === 'seatmap'}
            onChange={() => update('ticketMode', 'seatmap' as TicketMode)}
          />
          Mapa de assentos
        </label>
      </fieldset>

      {values.ticketMode === 'quantity' ? (
        <>
          <label className="flex flex-col gap-1">
            Preço
            <input
              type="number"
              className="border p-2 rounded"
              value={values.price}
              onChange={(e) => update('price', e.target.value)}
            />
            {errors.price && <span className="text-red-600 text-xs">{errors.price}</span>}
          </label>
          <label className="flex flex-col gap-1">
            Capacidade total
            <input
              type="number"
              className="border p-2 rounded"
              value={values.totalCapacity}
              onChange={(e) => update('totalCapacity', e.target.value)}
            />
            {errors.totalCapacity && <span className="text-red-600 text-xs">{errors.totalCapacity}</span>}
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-1">
            Fileiras
            <input
              type="number"
              className="border p-2 rounded"
              value={values.rows}
              onChange={(e) => update('rows', e.target.value)}
            />
            {errors.rows && <span className="text-red-600 text-xs">{errors.rows}</span>}
          </label>
          <label className="flex flex-col gap-1">
            Colunas
            <input
              type="number"
              className="border p-2 rounded"
              value={values.cols}
              onChange={(e) => update('cols', e.target.value)}
            />
            {errors.cols && <span className="text-red-600 text-xs">{errors.cols}</span>}
          </label>
          <label className="flex flex-col gap-1">
            Preço por assento
            <input
              type="number"
              className="border p-2 rounded"
              value={values.seatPrice}
              onChange={(e) => update('seatPrice', e.target.value)}
            />
            {errors.seatPrice && <span className="text-red-600 text-xs">{errors.seatPrice}</span>}
          </label>
        </>
      )}

      <button type="submit" className="bg-slate-800 text-white p-2 rounded">
        {submitLabel}
      </button>
    </form>
  )
}
