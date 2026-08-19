import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import NewEventPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import * as eventsApi from '@/lib/api/events'
import { ApiError } from '@/lib/api/client'
import { seedUsers } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))
vi.mock('@/lib/api/events')

describe('NewEventPage', () => {
  beforeEach(() => {
    push.mockClear()
    vi.mocked(eventsApi.createEvent).mockReset()
    const { password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer, status: 'authenticated' })
  })

  it('creates an event and redirects to the dashboard', async () => {
    vi.mocked(eventsApi.createEvent).mockResolvedValue({
      id: 'new-event-1',
      title: 'Novo Show',
      category: 'show',
      description: 'Descrição',
      date: '2099-01-01T20:00:00.000Z',
      location: 'São Paulo, SP',
      organizerId: 'user-organizer',
      ticketMode: 'quantity',
      price: 80,
      totalCapacity: 30,
    })

    render(<NewEventPage />)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Novo Show' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição' } })
    fireEvent.change(screen.getByLabelText('Local'), { target: { value: 'São Paulo, SP' } })
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2099-01-01T20:00' } })
    fireEvent.change(screen.getByLabelText('Preço'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Capacidade total'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar evento' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/organizer'))
    expect(eventsApi.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Novo Show', ticketMode: 'quantity', price: 80, totalCapacity: 30 })
    )
  })

  it('creates a seatmap event', async () => {
    vi.mocked(eventsApi.createEvent).mockResolvedValue({
      id: 'new-event-2',
      title: 'Peça Nova',
      category: 'theater',
      description: 'Descrição',
      date: '2099-01-01T20:00:00.000Z',
      location: 'Curitiba, PR',
      organizerId: 'user-organizer',
      ticketMode: 'seatmap',
      rows: 3,
      cols: 4,
      seatPrice: 25,
    })

    render(<NewEventPage />)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Peça Nova' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição' } })
    fireEvent.change(screen.getByLabelText('Local'), { target: { value: 'Curitiba, PR' } })
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2099-01-01T20:00' } })
    fireEvent.click(screen.getByLabelText('Mapa de assentos'))
    fireEvent.change(screen.getByLabelText('Fileiras'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Colunas'), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText('Preço por assento'), { target: { value: '25' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar evento' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/organizer'))
    expect(eventsApi.createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Peça Nova', ticketMode: 'seatmap', rows: 3, cols: 4, seatPrice: 25 })
    )
  })

  it('shows a server error and does not navigate when creation is rejected', async () => {
    vi.mocked(eventsApi.createEvent).mockRejectedValue(new ApiError(400, 'Dados inválidos'))

    render(<NewEventPage />)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Novo Show' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição' } })
    fireEvent.change(screen.getByLabelText('Local'), { target: { value: 'São Paulo, SP' } })
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2099-01-01T20:00' } })
    fireEvent.change(screen.getByLabelText('Preço'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Capacidade total'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Criar evento' }))

    expect(await screen.findByText('Dados inválidos')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })
})
