'use client'

import { useState } from 'react'
import { RoleGuard } from '@/components/RoleGuard'
import { GateResultBanner, GATE_RESULT_CONFIG } from '@/components/GateResultBanner'
import { GateScanner } from '@/components/GateScanner'
import { listEvents } from '@/lib/api/events'
import { validateTicket, ValidationResult } from '@/lib/api/validation'
import { useAsync } from '@/lib/hooks/useAsync'
import { ApiError } from '@/lib/api/client'

type HistoryEntry = { code: string; result: ValidationResult['result']; at: string }

function GateContent() {
  const { data: events, loading: loadingEvents, error: eventsError } = useAsync(() => listEvents(), [])
  const [eventId, setEventId] = useState('')
  const [code, setCode] = useState('')
  const [lastResult, setLastResult] = useState<ValidationResult['result'] | null>(null)
  const [operationalError, setOperationalError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const selectedEventId = eventId || events?.[0]?.id || ''

  async function handleValidate(rawCode: string) {
    if (!rawCode || !selectedEventId || submitting) return
    setSubmitting(true)
    setOperationalError('')
    try {
      const result = await validateTicket(selectedEventId, rawCode)
      setLastResult(result.result)
      setHistory((prev) =>
        [{ code: rawCode, result: result.result, at: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 5)
      )
      setCode('')
    } catch (err) {
      setOperationalError(err instanceof ApiError ? err.message : 'Erro ao validar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingEvents) return <p className="text-slate-500">Carregando eventos...</p>
  if (eventsError) return <p className="text-slate-500">{eventsError}</p>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Portaria</h1>

      <label className="flex flex-col gap-1 mb-4">
        Evento
        <select className="border p-2 rounded" value={selectedEventId} onChange={(e) => setEventId(e.target.value)}>
          {(events ?? []).map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </label>

      <GateScanner onScan={handleValidate} />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleValidate(code)
        }}
        className="flex gap-2"
      >
        <input
          placeholder="Digite o código do ingresso"
          className="border p-2 rounded flex-1"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={submitting}
        />
        <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded" disabled={submitting}>
          Validar
        </button>
      </form>

      {operationalError && <p className="text-red-600 text-sm mt-2">{operationalError}</p>}

      {lastResult && (
        <div className="mt-4">
          <GateResultBanner result={lastResult} />
        </div>
      )}

      {history.length > 0 && (
        <ul className="mt-6 text-sm text-slate-600">
          {history.map((entry, i) => (
            <li key={i}>
              {entry.at} — {entry.code} — {GATE_RESULT_CONFIG[entry.result].label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function GatePage() {
  return (
    <RoleGuard role="gate">
      <GateContent />
    </RoleGuard>
  )
}
