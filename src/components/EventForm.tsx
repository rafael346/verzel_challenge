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
  submitting = false,
  serverError,
  serverFieldErrors = {},
}: {
  initialValues?: Partial<EventFormRawValues>
  submitLabel: string
  onSubmit: (data: ParsedEventInput) => void
  submitting?: boolean
  serverError?: string
  serverFieldErrors?: Record<string, string>
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

  function fieldError(key: keyof EventFormRawValues): string | undefined {
    return errors[key] ?? serverFieldErrors[key]
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <label className="flex flex-col gap-1">
        Título
        <input
          className="border p-2 rounded"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={!!fieldError('title')}
          aria-describedby={fieldError('title') ? 'title-error' : undefined}
        />
        {fieldError('title') && (
          <span id="title-error" role="alert" className="text-red-600 text-xs">
            {fieldError('title')}
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
          aria-invalid={!!fieldError('description')}
          aria-describedby={fieldError('description') ? 'description-error' : undefined}
        />
        {fieldError('description') && (
          <span id="description-error" role="alert" className="text-red-600 text-xs">
            {fieldError('description')}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        Local
        <input
          className="border p-2 rounded"
          value={values.location}
          onChange={(e) => update('location', e.target.value)}
          aria-invalid={!!fieldError('location')}
          aria-describedby={fieldError('location') ? 'location-error' : undefined}
        />
        {fieldError('location') && (
          <span id="location-error" role="alert" className="text-red-600 text-xs">
            {fieldError('location')}
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
          aria-invalid={!!fieldError('date')}
          aria-describedby={fieldError('date') ? 'date-error' : undefined}
        />
        {fieldError('date') && (
          <span id="date-error" role="alert" className="text-red-600 text-xs">
            {fieldError('date')}
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
              aria-invalid={!!fieldError('price')}
              aria-describedby={fieldError('price') ? 'price-error' : undefined}
            />
            {fieldError('price') && (
              <span id="price-error" role="alert" className="text-red-600 text-xs">
                {fieldError('price')}
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
              aria-invalid={!!fieldError('totalCapacity')}
              aria-describedby={fieldError('totalCapacity') ? 'totalCapacity-error' : undefined}
            />
            {fieldError('totalCapacity') && (
              <span id="totalCapacity-error" role="alert" className="text-red-600 text-xs">
                {fieldError('totalCapacity')}
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
              aria-invalid={!!fieldError('rows')}
              aria-describedby={fieldError('rows') ? 'rows-error' : undefined}
            />
            {fieldError('rows') && (
              <span id="rows-error" role="alert" className="text-red-600 text-xs">
                {fieldError('rows')}
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
              aria-invalid={!!fieldError('cols')}
              aria-describedby={fieldError('cols') ? 'cols-error' : undefined}
            />
            {fieldError('cols') && (
              <span id="cols-error" role="alert" className="text-red-600 text-xs">
                {fieldError('cols')}
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
              aria-invalid={!!fieldError('seatPrice')}
              aria-describedby={fieldError('seatPrice') ? 'seatPrice-error' : undefined}
            />
            {fieldError('seatPrice') && (
              <span id="seatPrice-error" role="alert" className="text-red-600 text-xs">
                {fieldError('seatPrice')}
              </span>
            )}
          </label>
        </>
      )}

      <button type="submit" disabled={submitting} className="bg-slate-800 text-white p-2 rounded disabled:opacity-50">
        {submitting ? 'Salvando...' : submitLabel}
      </button>
      {serverError && (
        <p role="alert" className="text-red-600 text-sm">
          {serverError}
        </p>
      )}
    </form>
  )
}
