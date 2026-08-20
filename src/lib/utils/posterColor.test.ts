import { describe, it, expect } from 'vitest'
import { getPosterHue, POSTER_HUES } from './posterColor'

describe('getPosterHue', () => {
  it('returns the same hue for the same id every time', () => {
    expect(getPosterHue('event-movie-1')).toBe(getPosterHue('event-movie-1'))
  })

  it('returns one of the defined poster hues', () => {
    expect(POSTER_HUES).toContain(getPosterHue('event-movie-1'))
  })
})
