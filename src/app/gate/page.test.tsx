import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GatePage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import * as eventsApi from '@/lib/api/events'
import * as validationApi from '@/lib/api/validation'
import { ApiError } from '@/lib/api/client'
import { seedEvents, seedUsers } from '@/lib/seed'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))
vi.mock('@/components/GateScanner', () => ({
  GateScanner: () => <div data-testid="gate-scanner" />,
}))
vi.mock('@/lib/api/events')
vi.mock('@/lib/api/validation')

const movieEvent = seedEvents.find((e) => e.id === 'event-movie-1')!
const showEvent = seedEvents.find((e) => e.id === 'event-show-1')!

describe('GatePage', () => {
  beforeEach(() => {
    const { password, ...gate } = seedUsers.find((u) => u.role === 'gate')!
    useAuthStore.setState({ currentUser: gate, status: 'authenticated' })
    vi.mocked(eventsApi.listEvents).mockReset()
    vi.mocked(eventsApi.listEvents).mockResolvedValue([movieEvent, showEvent])
    vi.mocked(validationApi.validateTicket).mockReset()
  })

  it('validates a manually typed code and shows "Válido"', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'valid' })

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'ing-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(await screen.findByText('Válido')).toBeInTheDocument()
    expect(validationApi.validateTicket).toHaveBeenCalledWith('event-movie-1', 'ing-1')
  })

  it('shows "Já utilizado" on a second validation of the same code', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'already-used' })

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    const input = screen.getByPlaceholderText('Digite o código do ingresso')
    fireEvent.change(input, { target: { value: 'ing-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(await screen.findByText('Já utilizado')).toBeInTheDocument()
  })

  it('shows "Evento errado" when the ticket belongs to a different event', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'wrong-event' })

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'ing-2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(await screen.findByText('Evento errado')).toBeInTheDocument()
  })

  it('shows "Inválido" for an unknown code', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'invalid' })

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'nao-existe' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(await screen.findByText('Inválido')).toBeInTheDocument()
  })

  it('shows "Expirado" when the ticket is past its validity window', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'expired' })

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'ing-3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(await screen.findByText('Expirado')).toBeInTheDocument()
  })

  it('validates on Enter-key submission (scanner hardware behavior)', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'valid' })

    const { container } = render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'ing-1' } })
    fireEvent.submit(container.querySelector('form')!)

    expect(await screen.findByText('Válido')).toBeInTheDocument()
  })

  it('shows the localized label in the history list, not the raw enum value', async () => {
    vi.mocked(validationApi.validateTicket).mockResolvedValue({ result: 'already-used' })

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    const input = screen.getByPlaceholderText('Digite o código do ingresso')
    fireEvent.change(input, { target: { value: 'ing-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))
    await screen.findByText('Já utilizado')
    fireEvent.change(input, { target: { value: 'ing-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    await waitFor(() => expect(screen.getAllByText(/Já utilizado/).length).toBeGreaterThan(0))
    expect(screen.queryByText(/already-used/)).not.toBeInTheDocument()
  })

  it('shows an operational error banner without touching history on an unexpected failure', async () => {
    vi.mocked(validationApi.validateTicket).mockRejectedValue(new ApiError(500, 'Erro interno inesperado'))

    render(<GatePage />)
    await screen.findByLabelText('Evento')
    fireEvent.change(screen.getByLabelText('Evento'), { target: { value: 'event-movie-1' } })
    fireEvent.change(screen.getByPlaceholderText('Digite o código do ingresso'), { target: { value: 'ing-1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }))

    expect(await screen.findByText('Erro interno inesperado')).toBeInTheDocument()
    expect(screen.queryByText('Válido')).not.toBeInTheDocument()
  })
})
