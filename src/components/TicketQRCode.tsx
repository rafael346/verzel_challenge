'use client'

import { QRCodeSVG } from 'qrcode.react'

export function TicketQRCode({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeSVG value={code} size={180} />
      <p className="font-mono text-xs text-slate-500">{code}</p>
    </div>
  )
}
