import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { QuantityStepper } from './QuantityStepper'

describe('QuantityStepper', () => {
  it('shows the current value', () => {
    render(<QuantityStepper value={2} min={1} max={5} onChange={vi.fn()} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('calls onChange with value + 1 when "+" is clicked', () => {
    const onChange = vi.fn()
    render(<QuantityStepper value={2} min={1} max={5} onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disables "+" at the max and "-" at the min', () => {
    render(<QuantityStepper value={5} min={1} max={5} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '+' })).toBeDisabled()
    cleanup()

    render(<QuantityStepper value={1} min={1} max={5} onChange={vi.fn()} />)
    expect(screen.getAllByRole('button', { name: '-' })[0]).toBeDisabled()
  })
})
