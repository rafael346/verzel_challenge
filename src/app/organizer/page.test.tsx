import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrganizerDashboardPage from './page'
import { useAuthStore } from '@/lib/stores/authStore'
import { useDataStore } from '@/lib/stores/dataStore'
import { seedEvents, seedUsers } from '@/lib/seed'

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }))

describe('OrganizerDashboardPage', () => {
  beforeEach(() => {
    useDataStore.setState({ events: JSON.parse(JSON.stringify(seedEvents)), tickets: [], pendingReservations: [] })
    const { password: _password, ...organizer } = seedUsers.find((u) => u.role === 'organizer')!
    useAuthStore.setState({ currentUser: organizer })
  })

  it("lists only the logged-in organizer's events", () => {
    render(<OrganizerDashboardPage />)
    expect(screen.getByText('Duna: Parte Três')).toBeInTheDocument()
    expect(screen.getByText('Festival Verão Sonoro')).toBeInTheDocument()
  })

  it('shows an empty state when the organizer has no events', () => {
    useDataStore.setState({ events: [], tickets: [], pendingReservations: [] })
    render(<OrganizerDashboardPage />)
    expect(screen.getByText('Nenhum evento cadastrado.')).toBeInTheDocument()
  })
})
