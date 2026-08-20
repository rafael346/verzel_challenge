import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GateResultBanner } from './GateResultBanner'

describe('GateResultBanner', () => {
  it.each([
    ['valid', 'Válido'],
    ['invalid', 'Inválido'],
    ['already-used', 'Já utilizado'],
    ['wrong-event', 'Evento errado'],
    ['expired', 'Expirado'],
  ] as const)('renders the right label for "%s"', (result, label) => {
    render(<GateResultBanner result={result} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
