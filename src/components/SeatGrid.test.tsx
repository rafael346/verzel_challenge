import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SeatGrid } from './SeatGrid'
import { Seat } from '@/lib/types'

const seats: Seat[] = [
  { row: 1, col: 1, status: 'available' },
  { row: 1, col: 2, status: 'sold' },
]

describe('SeatGrid', () => {
  it('renders one button per seat, labeled by row-col', () => {
    render(<SeatGrid seats={seats} rows={1} cols={2} selected={[]} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: '1-1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1-2' })).toBeInTheDocument()
  })

  it('disables seats that are not available', () => {
    render(<SeatGrid seats={seats} rows={1} cols={2} selected={[]} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: '1-2' })).toBeDisabled()
  })

  it('calls onToggle with the seat position when an available seat is clicked', () => {
    const onToggle = vi.fn()
    render(<SeatGrid seats={seats} rows={1} cols={2} selected={[]} onToggle={onToggle} />)
    fireEvent.click(screen.getByRole('button', { name: '1-1' }))
    expect(onToggle).toHaveBeenCalledWith(1, 1)
  })
})
