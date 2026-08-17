'use client'

import { useState } from 'react'
import { RoleGuard } from '@/components/RoleGuard'
import { GateResultBanner, GATE_RESULT_CONFIG } from '@/components/GateResultBanner'
import { GateScanner } from '@/components/GateScanner'
import { useDataStore, ValidationResult } from '@/lib/stores/dataStore'

type HistoryEntry = { code: string; result: ValidationResult['result']; at: string }

function GateContent() {
  const events = useDataStore((s) => s.events)
  const validateTicket = useDataStore((s) => s.validateTicket)
  const [eventId, setEventId] = useState(events[0]?.id ?? '')
  const [code, setCode] = useState('')
  const [lastResult, setLastResult] = useState<ValidationResult['result'] | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  function handleValidate(rawCode: string) {
    if (!rawCode || !eventId) return
    const result = validateTicket(rawCode, eventId)
    setLastResult(result.result)
    setHistory((prev) =>
      [{ code: rawCode, result: result.result, at: new Date().toLocaleTimeString('pt-BR') }, ...prev].slice(0, 5)
    )
    setCode('')
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Portaria</h1>

      <label className="flex flex-col gap-1 mb-4">
        Evento
        <select className="border p-2 rounded" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((event) => (
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
        />
        <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded">
          Validar
        </button>
      </form>

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
