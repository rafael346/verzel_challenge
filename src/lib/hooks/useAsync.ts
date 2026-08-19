'use client'

import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/lib/api/client'

export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [version, setVersion] = useState(0)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fn()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Erro inesperado. Tente novamente.')
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // `fn` is intentionally omitted: callers pass a fresh inline closure each render, and
    // `deps` is the caller-declared list of values that should actually trigger a re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  return { data, loading, error, refetch }
}
