import { Seat } from './types'

export function buildSeats(rows: number, cols: number): Seat[] {
  const seats: Seat[] = []
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      seats.push({ row, col, status: 'available' })
    }
  }
  return seats
}
