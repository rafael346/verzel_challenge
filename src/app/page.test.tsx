import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HomePage from './page'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents } from '@/lib/seed'

describe('HomePage', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
  })

  it('lists all seeded events by default', () => {
    render(<HomePage />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('filters events by search text', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByPlaceholderText('Buscar por título...'), { target: { value: 'Duna' } })
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.queryByText('Festival Verão Sonoro')).not.toBeInTheDocument()
  })

  it('shows an empty state when no event matches', () => {
    render(<HomePage />)
    fireEvent.change(screen.getByPlaceholderText('Buscar por título...'), { target: { value: 'não existe' } })
    expect(screen.getByText('Nenhum evento encontrado.')).toBeInTheDocument()
  })

  it('filters events by date range', () => {
    render(<HomePage />)
    // event-movie-1 is 2026-09-01, event-show-1 is 2026-10-15 (see seed.ts)
    fireEvent.change(screen.getByLabelText('Data inicial'), { target: { value: '2026-10-01' } })
    expect(screen.queryByText('Duna: Parte Três')).not.toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })
})
