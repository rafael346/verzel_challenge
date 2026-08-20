import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HomePage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import * as eventsApi from '@/lib/api/events'
import { seedEvents } from '@/lib/seed'

vi.mock('@/lib/api/events')
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(eventsApi.listEvents).mockReset()
    vi.mocked(eventsApi.listEvents).mockResolvedValue(seedEvents)
    useAuthStore.setState({ currentUser: null, status: 'unauthenticated' })
  })

  it('lists all seeded events by default', async () => {
    render(<HomePage />)
    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('filters events by search text', async () => {
    render(<HomePage />)
    await screen.findByText('Duna: Parte Três')
    fireEvent.change(screen.getByPlaceholderText('Buscar por título...'), { target: { value: 'Duna' } })
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.queryByText('Festival Verão Sonoro')).not.toBeInTheDocument()
  })

  it('clears all filters and their visible input values when "Limpar filtros" is clicked', async () => {
    render(<HomePage />)
    await screen.findByText('Duna: Parte Três')

    const searchInput = screen.getByPlaceholderText('Buscar por título...') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'Duna' } })
    expect(searchInput.value).toBe('Duna')
    expect(screen.queryByText('Festival Verão Sonoro')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Limpar filtros'))

    expect(searchInput.value).toBe('')
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('shows an empty state when no event matches', async () => {
    render(<HomePage />)
    await screen.findByText('Duna: Parte Três')
    fireEvent.change(screen.getByPlaceholderText('Buscar por título...'), { target: { value: 'não existe' } })
    expect(screen.getByText('Nenhum evento encontrado.')).toBeInTheDocument()
  })

  it('filters events by date range', async () => {
    render(<HomePage />)
    await screen.findByText('Duna: Parte Três')
    // event-movie-1 is 2026-09-01, event-show-1 is 2026-10-15 (see seed.ts)
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-01' } })
    expect(screen.queryByText('Duna: Parte Três')).not.toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('treats a max price of 0 as a real filter, not a cleared one', async () => {
    render(<HomePage />)
    await screen.findByText('Duna: Parte Três')
    fireEvent.change(screen.getByLabelText('Preço máximo'), { target: { value: '0' } })
    expect(screen.queryByText('Duna: Parte Três')).not.toBeInTheDocument()
    expect(screen.queryByText('Festival Verão Sonoro')).not.toBeInTheDocument()
    expect(screen.getByText('Nenhum evento encontrado.')).toBeInTheDocument()
  })

  it('shows an error message with a retry option when the fetch fails', async () => {
    vi.mocked(eventsApi.listEvents).mockReset()
    vi.mocked(eventsApi.listEvents)
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(seedEvents)

    render(<HomePage />)
    expect(await screen.findByText('Erro inesperado. Tente novamente.')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tentar novamente'))
    expect(await screen.findByText('Duna: Parte Três')).toBeInTheDocument()
  })

  it('does not list events for a portaria user', () => {
    useAuthStore.setState({
      currentUser: { id: '3', name: 'Portaria', email: 'portaria@verzel.com', role: 'gate' },
      status: 'authenticated',
    })
    render(<HomePage />)
    expect(screen.queryByText('Duna: Parte Três')).not.toBeInTheDocument()
  })

  it('shows loading placeholders while events are being fetched', () => {
    render(<HomePage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
