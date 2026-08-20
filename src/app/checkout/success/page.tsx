// src/app/checkout/success/page.tsx
import Link from 'next/link'
import { RoleGuard } from '@/components/RoleGuard'
import { StateBox } from '@/components/StateBox'

export default function CheckoutSuccessPage() {
  return (
    <RoleGuard role="customer">
      <div className="max-w-md">
        <StateBox
          variant="success"
          title="Pagamento aprovado!"
          description='Seu ingresso já está disponível na área "Meus ingressos".'
        />
        <Link href="/my-tickets" className="bg-wine text-text rounded-[3px] px-4 py-2 text-sm inline-block mt-4">
          Ver meus ingressos
        </Link>
      </div>
    </RoleGuard>
  )
}
