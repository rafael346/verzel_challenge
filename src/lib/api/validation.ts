import { apiFetch, ApiError } from './client'

export type ValidationResult = {
  result: 'valid' | 'invalid' | 'already-used' | 'wrong-event' | 'expired'
}

type ResultadoValidacao = 'VALIDO' | 'INVALIDO' | 'JA_UTILIZADO' | 'EVENTO_ERRADO' | 'EXPIRADO'

type ValidacaoResponseDto = {
  resultado: ResultadoValidacao
  ingressoId: string
  fileira: number | null
  coluna: number | null
  validadoEm: string | null
  validadoPorId: string | null
}

const RESULT_BY_RESULTADO: Record<ResultadoValidacao, ValidationResult['result']> = {
  VALIDO: 'valid',
  INVALIDO: 'invalid',
  JA_UTILIZADO: 'already-used',
  EVENTO_ERRADO: 'wrong-event',
  EXPIRADO: 'expired',
}

export async function validateTicket(eventId: string, ticketId: string): Promise<ValidationResult> {
  try {
    const dto = await apiFetch<ValidacaoResponseDto>(`/eventos/${eventId}/ingressos/${ticketId}/validar`, {
      method: 'POST',
    })
    return { result: RESULT_BY_RESULTADO[dto.resultado] }
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return { result: 'invalid' }
    }
    throw err
  }
}
