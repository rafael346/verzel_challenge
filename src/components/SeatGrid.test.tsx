import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SeatGrid } from './SeatGrid'
import { Seat } from '@/lib/types'

const seats: Seat[] = [
  { row: 1, col: 1, status: 'available' },
  { row: 1, col: 2, status: 'sold' },
  { row: 1, col: 3, status: 'reserved' },
]

describe('SeatGrid', () => {
  it('renders one button per seat, labeled by row-col', () => {
    render(<SeatGrid seats={seats} rows={1} cols={3} selected={[]} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Assento fileira 1, coluna 1' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Assento fileira 1, coluna 2, indisponível' })
    ).toBeInTheDocument()
  })

  it('disables seats that are not available', () => {
    render(<SeatGrid seats={seats} rows={1} cols={3} selected={[]} onToggle={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Assento fileira 1, coluna 2, indisponível' })
    ).toBeDisabled()
  })

  it('disables reserved seats', () => {
    render(<SeatGrid seats={seats} rows={1} cols={3} selected={[]} onToggle={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: 'Assento fileira 1, coluna 3, indisponível' })
    ).toBeDisabled()
  })

  it('calls onToggle with the seat position when an available seat is clicked', () => {
    const onToggle = vi.fn()
    render(<SeatGrid seats={seats} rows={1} cols={3} selected={[]} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button', { name: 'Assento fileira 1, coluna 1' }))
    expect(onToggle).toHaveBeenCalledWith(1, 1)
  })

  it('applies selected styling to a selected seat', () => {
    render(
      <SeatGrid seats={seats} rows={1} cols={3} selected={[{ row: 1, col: 1 }]} onToggle={vi.fn()} />
    )
    expect(
      screen.getByRole('button', { name: 'Assento fileira 1, coluna 1, selecionado' })
    ).toHaveClass('bg-gold')
  })

  it('calls onToggle when clicking an already-selected seat (deselect)', () => {
    const onToggle = vi.fn()
    render(
      <SeatGrid seats={seats} rows={1} cols={3} selected={[{ row: 1, col: 1 }]} onToggle={onToggle} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Assento fileira 1, coluna 1, selecionado' }))
    expect(onToggle).toHaveBeenCalledWith(1, 1)
  })
})
