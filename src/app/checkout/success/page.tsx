// src/app/checkout/success/page.tsx
import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'

export default function CheckoutSuccessPage() {
  return (
    <RoleGuard role="customer">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-green-700 mb-2">Pagamento aprovado!</h1>
        <p className="text-slate-600 mb-4">Seu ingresso já está disponível na área &quot;Meus ingressos&quot;.</p>
        <Link href="/my-tickets" className="bg-slate-800 text-white px-4 py-2 rounded inline-block">
          Ver meus ingressos
        </Link>
      </div>
    </RoleGuard>
  )
}
