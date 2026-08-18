import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const renderMock = vi.fn()
const clearMock = vi.fn().mockResolvedValue(undefined)
vi.mock('html5-qrcode', () => ({
  Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
    render: renderMock,
    clear: clearMock,
  })),
}))

import { GateScanner } from './GateScanner'
import { Html5QrcodeScanner } from 'html5-qrcode'

describe('GateScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes an Html5QrcodeScanner targeting the qr-reader element on mount', () => {
    render(<GateScanner onScan={vi.fn()} />)
    expect(Html5QrcodeScanner).toHaveBeenCalledWith('qr-reader', { fps: 10, qrbox: 250 }, false)
    expect(renderMock).toHaveBeenCalled()
  })

  it('calls onScan with the decoded text when the scanner reports success', () => {
    const onScan = vi.fn()
    render(<GateScanner onScan={onScan} />)
    const successCallback = renderMock.mock.calls[0][0]
    successCallback('some-ticket-code')
    expect(onScan).toHaveBeenCalledWith('some-ticket-code')
  })
})
