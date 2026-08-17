'use client'

import { EventCategory, TicketMode } from '@/lib/types'
import { useState } from 'react'
import { EventFormRawValues, ParsedEventInput, validateEventForm } from '@/lib/utils/eventFormValidation'

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
  // Merges initialValues in only at mount time. This form does not resync if `initialValues`
  // changes after mount — a caller that needs to reset the form for a different record (e.g.
  // the edit-event page) should force a remount via `key={event.id}`, the idiomatic React way
  // to reset state on identity change, rather than this component watching for prop changes.
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
        <input
          className="border p-2 rounded"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <span id="title-error" role="alert" className="text-red-600 text-xs">
            {errors.title}
          </span>
        )}
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
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <span id="description-error" role="alert" className="text-red-600 text-xs">
            {errors.description}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        Local
        <input
          className="border p-2 rounded"
          value={values.location}
          onChange={(e) => update('location', e.target.value)}
          aria-invalid={!!errors.location}
          aria-describedby={errors.location ? 'location-error' : undefined}
        />
        {errors.location && (
          <span id="location-error" role="alert" className="text-red-600 text-xs">
            {errors.location}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        Data e hora
        <input
          type="datetime-local"
          className="border p-2 rounded"
          value={values.date}
          onChange={(e) => update('date', e.target.value)}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {errors.date && (
          <span id="date-error" role="alert" className="text-red-600 text-xs">
            {errors.date}
          </span>
        )}
      </label>

      <fieldset className="flex gap-4">
        <legend>Forma de venda</legend>
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
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {errors.price && (
              <span id="price-error" role="alert" className="text-red-600 text-xs">
                {errors.price}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            Capacidade total
            <input
              type="number"
              className="border p-2 rounded"
              value={values.totalCapacity}
              onChange={(e) => update('totalCapacity', e.target.value)}
              aria-invalid={!!errors.totalCapacity}
              aria-describedby={errors.totalCapacity ? 'totalCapacity-error' : undefined}
            />
            {errors.totalCapacity && (
              <span id="totalCapacity-error" role="alert" className="text-red-600 text-xs">
                {errors.totalCapacity}
              </span>
            )}
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
              aria-invalid={!!errors.rows}
              aria-describedby={errors.rows ? 'rows-error' : undefined}
            />
            {errors.rows && (
              <span id="rows-error" role="alert" className="text-red-600 text-xs">
                {errors.rows}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            Colunas
            <input
              type="number"
              className="border p-2 rounded"
              value={values.cols}
              onChange={(e) => update('cols', e.target.value)}
              aria-invalid={!!errors.cols}
              aria-describedby={errors.cols ? 'cols-error' : undefined}
            />
            {errors.cols && (
              <span id="cols-error" role="alert" className="text-red-600 text-xs">
                {errors.cols}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1">
            Preço por assento
            <input
              type="number"
              className="border p-2 rounded"
              value={values.seatPrice}
              onChange={(e) => update('seatPrice', e.target.value)}
              aria-invalid={!!errors.seatPrice}
              aria-describedby={errors.seatPrice ? 'seatPrice-error' : undefined}
            />
            {errors.seatPrice && (
              <span id="seatPrice-error" role="alert" className="text-red-600 text-xs">
                {errors.seatPrice}
              </span>
            )}
          </label>
        </>
      )}

      <button type="submit" className="bg-slate-800 text-white p-2 rounded">
        {submitLabel}
      </button>
    </form>
  )
}
