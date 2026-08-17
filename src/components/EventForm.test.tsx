import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EventForm } from './EventForm'

describe('EventForm', () => {
  it('shows validation errors instead of calling onSubmit when the form is invalid', () => {
    const onSubmit = vi.fn()
    render(<EventForm submitLabel="Criar evento" onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Criar evento' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Título é obrigatório')).toBeInTheDocument()
  })

  it('calls onSubmit with parsed data when the quantity-mode form is valid', () => {
    const onSubmit = vi.fn()
    render(<EventForm submitLabel="Criar evento" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Show Teste' } })
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição' } })
    fireEvent.change(screen.getByLabelText('Local'), { target: { value: 'São Paulo, SP' } })
    fireEvent.change(screen.getByLabelText('Data e hora'), { target: { value: '2099-01-01T20:00' } })
    fireEvent.change(screen.getByLabelText('Preço'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Capacidade total'), { target: { value: '50' } })

    fireEvent.click(screen.getByRole('button', { name: 'Criar evento' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Show Teste', ticketMode: 'quantity', price: 100, totalCapacity: 50 })
    )
  })

  it('prefills fields from initialValues', () => {
    render(
      <EventForm
        submitLabel="Salvar"
        initialValues={{
          title: 'Evento Existente',
          description: 'Desc',
          location: 'Rio',
          date: '2099-01-01T20:00',
          price: '80',
          totalCapacity: '20',
        }}
        onSubmit={vi.fn()}
      />
    )

    expect(screen.getByLabelText('Título')).toHaveValue('Evento Existente')
    expect(screen.getByLabelText('Local')).toHaveValue('Rio')
  })

  it('switches to seatmap fields when "Mapa de assentos" is selected', () => {
    render(<EventForm submitLabel="Criar evento" onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByLabelText('Mapa de assentos'))
    expect(screen.getByLabelText('Fileiras')).toBeInTheDocument()
    expect(screen.getByLabelText('Colunas')).toBeInTheDocument()
    expect(screen.queryByLabelText('Capacidade total')).not.toBeInTheDocument()
  })
})
