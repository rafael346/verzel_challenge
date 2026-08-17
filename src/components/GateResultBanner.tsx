import { ValidationResult } from '@/lib/stores/dataStore'

export const GATE_RESULT_CONFIG: Record<ValidationResult['result'], { label: string; className: string }> = {
  valid: { label: '✅ Válido', className: 'bg-green-100 text-green-800 border-green-400' },
  invalid: { label: '❌ Inválido', className: 'bg-red-100 text-red-800 border-red-400' },
  'already-used': { label: '⚠️ Já utilizado', className: 'bg-orange-100 text-orange-800 border-orange-400' },
  'wrong-event': { label: '🔀 Evento errado', className: 'bg-blue-100 text-blue-800 border-blue-400' },
}

export function GateResultBanner({ result }: { result: ValidationResult['result'] }) {
  const config = GATE_RESULT_CONFIG[result]
  return (
    <div
      role="status"
      aria-live="polite"
      className={`border rounded p-4 font-semibold ${config.className}`}
    >
      {config.label}
    </div>
  )
}
