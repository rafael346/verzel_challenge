import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StateBox } from './StateBox'

describe('StateBox', () => {
  it('renders the title and description', () => {
    render(<StateBox variant="error" title="Falhou" description="Tente de novo" />)
    expect(screen.getByText('Falhou')).toBeInTheDocument()
    expect(screen.getByText('Tente de novo')).toBeInTheDocument()
  })

  it('renders without a description', () => {
    render(<StateBox variant="success" title="Pagamento aprovado" />)
    expect(screen.getByText('Pagamento aprovado')).toBeInTheDocument()
  })

  it('calls the action handler when the action button is clicked', () => {
    const onClick = vi.fn()
    render(
      <StateBox
        variant="error"
        title="Falhou"
        action={{ label: 'Tentar novamente', onClick }}
      />
    )
    fireEvent.click(screen.getByText('Tentar novamente'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not render a button when no action is given', () => {
    render(<StateBox variant="neutral" title="Já utilizado" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
