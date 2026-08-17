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
})
