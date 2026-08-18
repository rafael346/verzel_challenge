import { describe, it, expect } from 'vitest'
import { validateEventForm, EventFormRawValues } from './eventFormValidation'

const futureDate = '2099-01-01T20:00'

function baseValues(overrides: Partial<EventFormRawValues> = {}): EventFormRawValues {
  return {
    title: 'Show Teste',
    category: 'show',
    description: 'Descrição',
    date: futureDate,
    location: 'São Paulo, SP',
    ticketMode: 'quantity',
    rows: '',
    cols: '',
    seatPrice: '',
    price: '100',
    totalCapacity: '50',
    ...overrides,
  }
}

describe('validateEventForm', () => {
  it('accepts a valid quantity-mode event', () => {
    const result = validateEventForm(baseValues())
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.data.price).toBe(100)
      expect(result.data.totalCapacity).toBe(50)
    }
  })

  it('accepts a valid seatmap-mode event', () => {
    const result = validateEventForm(
      baseValues({ ticketMode: 'seatmap', rows: '5', cols: '8', seatPrice: '32', price: '', totalCapacity: '' })
    )
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.data.rows).toBe(5)
      expect(result.data.cols).toBe(8)
    }
  })

  it('rejects an empty title', () => {
    const result = validateEventForm(baseValues({ title: '' }))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.title).toBeDefined()
  })

  it('rejects a date in the past', () => {
    const result = validateEventForm(baseValues({ date: '2000-01-01T20:00' }))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.date).toBeDefined()
  })

  it('rejects non-positive price/capacity in quantity mode', () => {
    const result = validateEventForm(baseValues({ price: '0', totalCapacity: '-5' }))
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.price).toBeDefined()
      expect(result.errors.totalCapacity).toBeDefined()
    }
  })

  it('rejects non-positive rows/cols/seatPrice in seatmap mode', () => {
    const result = validateEventForm(
      baseValues({ ticketMode: 'seatmap', rows: '0', cols: '', seatPrice: '', price: '', totalCapacity: '' })
    )
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.rows).toBeDefined()
      expect(result.errors.cols).toBeDefined()
      expect(result.errors.seatPrice).toBeDefined()
    }
  })

  it('rejects a fractional rows value in seatmap mode', () => {
    const result = validateEventForm(
      baseValues({ ticketMode: 'seatmap', rows: '2.5', cols: '8', seatPrice: '32', price: '', totalCapacity: '' })
    )
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.rows).toBeDefined()
  })

  it('rejects a fractional totalCapacity value in quantity mode', () => {
    const result = validateEventForm(baseValues({ totalCapacity: '50.5' }))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.totalCapacity).toBeDefined()
  })

  it('rejects a non-finite price value in quantity mode', () => {
    const result = validateEventForm(baseValues({ price: 'Infinity' }))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.errors.price).toBeDefined()
  })
})
