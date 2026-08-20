'use client'

import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export function GateScanner({ onScan }: { onScan: (code: string) => void }) {
  const onScanRef = useRef(onScan)

  useEffect(() => {
    onScanRef.current = onScan
  })

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
    scanner.render(
      (decodedText) => onScanRef.current(decodedText),
      () => {
        // Ignora falhas de leitura de frames sem QR — o callback dispara continuamente.
      }
    )
    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  return (
    <div>
      <div id="qr-reader" className="border border-border rounded-[3px] overflow-hidden" />
      <p className="text-xs text-text-muted mt-1">
        Aponte a câmera para o QR code do ingresso, ou use a digitação manual abaixo.
      </p>
    </div>
  )
}
