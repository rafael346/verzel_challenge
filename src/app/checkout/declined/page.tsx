// src/app/checkout/declined/page.tsx
import { Suspense } from 'react'
import { RoleGuard } from '@/components/RoleGuard'
import { DeclinedContent } from './DeclinedContent'

export default function CheckoutDeclinedPage() {
  return (
    <RoleGuard role="customer">
      <Suspense fallback={null}>
        <DeclinedContent />
      </Suspense>
    </RoleGuard>
  )
}
