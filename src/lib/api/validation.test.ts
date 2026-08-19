import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateTicket } from './validation'
import { apiFetch, ApiError } from './client'

vi.mock('./client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./client')>()
  return { ...actual, apiFetch: vi.fn() }
})

describe('validateTicket', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset()
  })

  it.each([
    ['VALIDO', 'valid'],
    ['INVALIDO', 'invalid'],
    ['JA_UTILIZADO', 'already-used'],
    ['EVENTO_ERRADO', 'wrong-event'],
    ['EXPIRADO', 'expired'],
  ] as const)('maps %s to %s', async (resultado, expected) => {
    vi.mocked(apiFetch).mockResolvedValue({
      resultado,
      ingressoId: 'ing-1',
      fileira: null,
      coluna: null,
      validadoEm: null,
      validadoPorId: null,
    })

    const result = await validateTicket('evt-1', 'ing-1')

    expect(apiFetch).toHaveBeenCalledWith('/eventos/evt-1/ingressos/ing-1/validar', { method: 'POST' })
    expect(result).toEqual({ result: expected })
  })

  it('maps a 404 (unknown ticket) to invalid', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new ApiError(404, 'Ingresso não encontrado'))
    const result = await validateTicket('evt-1', 'does-not-exist')
    expect(result).toEqual({ result: 'invalid' })
  })

  it('maps a 400 (malformed id) to invalid', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new ApiError(400, 'Bad Request'))
    const result = await validateTicket('evt-1', 'not-a-uuid')
    expect(result).toEqual({ result: 'invalid' })
  })

  it('rethrows unexpected errors', async () => {
    vi.mocked(apiFetch).mockRejectedValue(new ApiError(500, 'Erro interno'))
    await expect(validateTicket('evt-1', 'ing-1')).rejects.toMatchObject({ status: 500 })
  })
})
