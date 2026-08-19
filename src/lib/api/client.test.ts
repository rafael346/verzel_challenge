import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch, ApiError, getToken, setToken, clearToken, setUnauthorizedHandler } from './client'

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

describe('client token storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns null when no token is stored', () => {
    expect(getToken()).toBeNull()
  })

  it('persists and reads back a token', () => {
    setToken('tok-123')
    expect(getToken()).toBe('tok-123')
  })

  it('removes the token on clearToken', () => {
    setToken('tok-123')
    clearToken()
    expect(getToken()).toBeNull()
  })
})

describe('apiFetch', () => {
  beforeEach(() => {
    localStorage.clear()
    setUnauthorizedHandler(null)
    vi.stubGlobal('fetch', vi.fn())
  })

  it('calls the API base URL and returns the parsed JSON body', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { foo: 'bar' }))

    const result = await apiFetch<{ foo: string }>('/foo')

    expect(result).toEqual({ foo: 'bar' })
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/foo', expect.objectContaining({}))
  })

  it('includes an Authorization header when a token is stored', async () => {
    setToken('tok-123')
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, {}))

    await apiFetch('/foo')

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = options?.headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer tok-123')
  })

  it('omits the Authorization header when no token is stored', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, {}))

    await apiFetch('/foo')

    const [, options] = vi.mocked(fetch).mock.calls[0]
    const headers = options?.headers as Headers
    expect(headers.get('Authorization')).toBeNull()
  })

  it('throws an ApiError with the message and field errors from a 400 response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, { message: 'Dados inválidos', errors: { email: 'deve ser um email válido' } })
    )

    await expect(apiFetch('/foo')).rejects.toMatchObject({
      status: 400,
      message: 'Dados inválidos',
      fieldErrors: { email: 'deve ser um email válido' },
    })
  })

  it('invokes the registered unauthorized handler on a 401 response', async () => {
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.mocked(fetch).mockResolvedValue(jsonResponse(401, { message: 'Token inválido ou expirado' }))

    await expect(apiFetch('/foo')).rejects.toBeInstanceOf(ApiError)
    expect(handler).toHaveBeenCalledOnce()
  })

  it('throws a status-0 ApiError when the network request fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiFetch('/foo')).rejects.toMatchObject({
      status: 0,
      message: 'Não foi possível conectar ao servidor',
    })
  })

  it('returns undefined for a 204 No Content response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new Error('no body')
      },
    } as Response)

    const result = await apiFetch('/foo')

    expect(result).toBeUndefined()
  })
})
