import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAsync } from './useAsync'
import { ApiError } from '@/lib/api/client'

describe('useAsync', () => {
  it('starts in a loading state and resolves with data', async () => {
    const fn = vi.fn().mockResolvedValue({ foo: 'bar' })
    const { result } = renderHook(() => useAsync(fn, []))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ foo: 'bar' })
    expect(result.current.error).toBeNull()
  })

  it('exposes the ApiError message on failure', async () => {
    const fn = vi.fn().mockRejectedValue(new ApiError(404, 'Evento não encontrado'))
    const { result } = renderHook(() => useAsync(fn, []))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Evento não encontrado')
    expect(result.current.data).toBeNull()
  })

  it('falls back to a generic message for a non-ApiError failure', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useAsync(fn, []))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Erro inesperado. Tente novamente.')
  })

  it('re-runs the async function when refetch is called', async () => {
    const fn = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second')
    const { result } = renderHook(() => useAsync(fn, []))

    await waitFor(() => expect(result.current.data).toBe('first'))

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => expect(result.current.data).toBe('second'))
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('re-runs the async function when a dependency changes', async () => {
    const fn = vi.fn().mockResolvedValueOnce('for-1').mockResolvedValueOnce('for-2')
    const { result, rerender } = renderHook(({ id }) => useAsync(fn, [id]), { initialProps: { id: 1 } })

    await waitFor(() => expect(result.current.data).toBe('for-1'))

    rerender({ id: 2 })

    await waitFor(() => expect(result.current.data).toBe('for-2'))
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
