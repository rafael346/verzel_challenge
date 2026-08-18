import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { TicketQRCode } from './TicketQRCode'

describe('TicketQRCode', () => {
  it('renders a QR code svg and the ticket code as text', () => {
    const { container, getByText } = render(<TicketQRCode code="abc-123" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(getByText('abc-123')).toBeInTheDocument()
  })
})
