import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditEventContent } from './EditEventContent'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push }) }))

describe('EditEventContent', () => {
  beforeEach(() => {
    push.mockClear()
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer })
  })

  it('pre-fills the form with the existing event and saves changes', () => {
    render(<EditEventContent id="event-show-1" />)

    expect(screen.getByLabelText('Título')).toHaveValue('Festival Verão Sonoro')

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Festival Atualizado' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(useDataStore.getState().events.find((e) => e.id === 'event-show-1')?.title).toBe('Festival Atualizado')
    expect(push).toHaveBeenCalledWith('/organizer')
  })

  it('shows a not-found message for an unknown event id', () => {
    render(<EditEventContent id="does-not-exist" />)
    expect(screen.getByText('Evento não encontrado.')).toBeInTheDocument()
  })

  it('pre-fills a seatmap event and saves changes', () => {
    render(<EditEventContent id="event-movie-1" />)

    expect(screen.getByLabelText('Título')).toHaveValue('Duna: Parte Três')
    expect(screen.getByLabelText('Fileiras')).toHaveValue(5)
    expect(screen.getByLabelText('Colunas')).toHaveValue(8)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Duna: Parte Quatro' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(useDataStore.getState().events.find((e) => e.id === 'event-movie-1')?.title).toBe('Duna: Parte Quatro')
    expect(push).toHaveBeenCalledWith('/organizer')
  })

  it('shows an alert and does not navigate when shrinking below sold seats', () => {
    useDataStore.setState((state) => ({
      events: state.events.map((e) =>
        e.id === 'event-movie-1'
          ? { ...e, seats: e.seats?.map((s, i) => (i < 5 ? { ...s, status: 'sold' as const } : s)) }
          : e
      ),
    }))
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<EditEventContent id="event-movie-1" />)
    fireEvent.change(screen.getByLabelText('Fileiras'), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText('Colunas'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))

    expect(alertSpy).toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })
})
