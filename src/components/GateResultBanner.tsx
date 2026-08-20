import { ValidationResult } from '@/lib/api/validation'
import { StateBox } from '@/components/StateBox'

type Variant = 'error' | 'success' | 'neutral'

export const GATE_RESULT_CONFIG: Record<ValidationResult['result'], { label: string; variant: Variant }> = {
  valid: { label: 'Válido', variant: 'success' },
  invalid: { label: 'Inválido', variant: 'error' },
  'already-used': { label: 'Já utilizado', variant: 'neutral' },
  'wrong-event': { label: 'Evento errado', variant: 'error' },
  expired: { label: 'Expirado', variant: 'error' },
}

export function GateResultBanner({ result }: { result: ValidationResult['result'] }) {
  const config = GATE_RESULT_CONFIG[result]
  return (
    <div role="status" aria-live="polite">
      <StateBox variant={config.variant} title={config.label} />
    </div>
  )
}
