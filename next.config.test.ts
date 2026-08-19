import { describe, it, expect } from 'vitest'
import nextConfig from './next.config'

describe('next.config', () => {
  it('allows remote images from image.tmdb.org', () => {
    const patterns = nextConfig.images?.remotePatterns ?? []
    expect(patterns.some((p) => p.toString() === 'https://image.tmdb.org/**')).toBe(true)
  })
})
