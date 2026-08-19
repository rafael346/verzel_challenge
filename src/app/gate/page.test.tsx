import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GatePage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'
import { Ticket } from '@/lib/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))
vi.mock('@/components/GateScanner', () => ({
  GateScanner: () => <div data-testid="gate-scanner" />,
}))

function buySeatTicket(): Ticket {
  const ticket: Ticket = {
    id: crypto.randomUUID(),
    code: crypto.randomUUID(),
    eventId: 'event-movie-1',
    userId: 'user-customer',
    seat: { row: 1, col: 1 },
    status: 'valid',
    purchasedAt: new Date().toISOString(),
  }
  useDataStore.getState().addTickets([ticket])
  return ticket
}

describe('GatePage', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [] })
    const { password, ...gate } = seedUsers.find((u) => u.role === 'gate')!
    useAuthStore.setState({ currentUser: gate, status: 'authenticated' })
  })

  it('validates a manually typed code and shows "Válido"', () => {
    const ticket = buySeatTicket()

    render(<GatePage />)
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: ticket.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(screen.getByText('✅ Válido')).toBeInTheDocument()
  })

  it('shows "Já utilizado" on a second validation of the same code', () => {
    const ticket = buySeatTicket()

    render(<GatePage />)
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    const input = screen.getByPlaceholderText('Digite o código do ingresso')
    fireEvent.change(input, { target: { value: ticket.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))
    fireEvent.change(input, { target: { value: ticket.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(screen.getByText('⚠️ Já utilizado')).toBeInTheDocument()
  })

  it('shows "Evento errado" when the ticket belongs to a different event', () => {
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      code: crypto.randomUUID(),
      eventId: 'event-show-1',
      userId: 'user-customer',
      status: 'valid',
      purchasedAt: new Date().toISOString(),
    }
    useDataStore.getState().addTickets([ticket])

    render(<GatePage />)
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: ticket.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(screen.getByText('🔀 Evento errado')).toBeInTheDocument()
  })

  it('shows "Inválido" for an unknown code', () => {
    render(<GatePage />)
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'nao-existe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(screen.getByText('❌ Inválido')).toBeInTheDocument()
  })

  it('validates on Enter-key submission (scanner hardware behavior)', () => {
    const ticket = buySeatTicket()

    const { container } = render(<GatePage />)
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: ticket.code } })
    fireEvent.submit(container.querySelector('form')!)

    expect(screen.getByText('✅ Válido')).toBeInTheDocument()
  })

  it('shows the localized label in the history list, not the raw enum value', () => {
    const ticket = buySeatTicket()

    render(<GatePage />)
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    const input = screen.getByPlaceholderText('Digite o código do ingresso')
    fireEvent.change(input, { target: { value: ticket.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))
    fireEvent.change(input, { target: { value: ticket.code } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(screen.getAllByText(/Já utilizado/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/already-used/)).not.toBeInTheDocument()
  })
})
