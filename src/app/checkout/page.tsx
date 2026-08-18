import { Suspense } from 'react'
import { RoleGuard } from '@/components/RoleGuard'
import { CheckoutContent } from './CheckoutContent'

export default function CheckoutPage() {
  return (
    <RoleGuard role="customer">
      <Suspense fallback={null}>
        <CheckoutContent />
      </Suspense>
    </RoleGuard>
  )
}
