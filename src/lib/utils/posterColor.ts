// Deterministic hue per event id, used to tint the fallback poster texture in
// EventPoster. Not tied to category — category is already communicated via the
// category tag text, so the poster tint just needs to vary across events.
export const POSTER_HUES = ['#4a1f1a', '#3a2a4a', '#1f3a4a', '#4a3a1f'] as const

export function getPosterHue(id: string): (typeof POSTER_HUES)[number] {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  }
  return POSTER_HUES[hash % POSTER_HUES.length]
}
