'use client'

import { QRCodeSVG } from 'qrcode.react'

export function TicketQRCode({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-surface border border-border rounded-[3px] p-4 inline-flex">
        <QRCodeSVG value={code} size={180} role="img" aria-label={`QR code do ingresso: ${code}`} />
      </div>
      <p className="font-mono text-xs text-text-muted">{code}</p>
    </div>
  )
}
