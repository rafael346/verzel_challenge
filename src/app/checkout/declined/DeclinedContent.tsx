// src/app/checkout/declined/DeclinedContent.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDataStore } from '@/lib/stores/dataStore'

function parseSeats(raw: string | null): { row: number; col: number }[] | undefined {
  if (!raw) return undefined
  return raw.split(',').map((pair) => {
    const [row, col] = pair.split('-').map(Number)
    return { row, col }
  })
}

export function DeclinedContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId') ?? ''
  const seats = parseSeats(searchParams.get('seats'))
  const quantityParam = searchParams.get('quantity')
  const quantity = quantityParam ? Number(quantityParam) : undefined

  const reserveSeats = useDataStore((s) => s.reserveSeats)
  const reserveQuantity = useDataStore((s) => s.reserveQuantity)
  const router = useRouter()

  function handleRetry() {
    const result = seats ? reserveSeats(eventId, seats) : reserveQuantity(eventId, quantity ?? 0)
    if ('error' in result) {
      router.push(`/events/${eventId}/book`)
      return
    }
    router.push(`/checkout?reservationId=${result.reservationId}`)
  }

  function handleChooseOthers() {
    router.push(`/events/${eventId}/book`)
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-red-700 mb-2">Pagamento recusado</h1>
      <p className="text-slate-600 mb-4">Não foi possível confirmar o pagamento simulado.</p>
      <div className="flex gap-3">
        <button onClick={handleRetry} className="bg-slate-800 text-white px-4 py-2 rounded">
          Tentar novamente
        </button>
        <button onClick={handleChooseOthers} className="border px-4 py-2 rounded">
          Escolher outros assentos
        </button>
      </div>
    </div>
  )
}
