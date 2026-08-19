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
  const [error, setError] = useState<string | null>(null)
  // `loading` is derived from comparing these two rather than set directly inside the
  // effect (calling setState synchronously at the top of an effect body is flagged by
  // react-hooks/set-state-in-effect): a fetch is in flight exactly when the version the
  // effect is currently resolving hasn't caught up to the latest requested version yet.
  const [version, setVersion] = useState(0)
  const [resolvedVersion, setResolvedVersion] = useState(-1)

  const refetch = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let cancelled = false

    fn()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
        setResolvedVersion(version)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Erro inesperado. Tente novamente.')
        setResolvedVersion(version)
      })

    return () => {
      cancelled = true
    }
    // `fn` is intentionally omitted: callers pass a fresh inline closure each render, and
    // `deps` is the caller-declared list of values that should actually trigger a re-fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  return { data, loading: resolvedVersion !== version, error, refetch }
}
