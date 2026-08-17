import { Event, Seat, User } from './types'

export const seedUsers: User[] = [
  { id: 'user-customer', name: 'Cliente Teste', email: 'cliente@teste.com', role: 'customer', password: '123456' },
  { id: 'user-organizer', name: 'Organizador Teste', email: 'organizador@teste.com', role: 'organizer', password: '123456' },
  { id: 'user-gate', name: 'Portaria Teste', email: 'portaria@teste.com', role: 'gate', password: '123456' },
]

function buildSeats(rows: number, cols: number): Seat[] {
  const seats: Seat[] = []
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      seats.push({ row, col, status: 'available' })
    }
  }
  return seats
}

export const seedEvents: Event[] = [
  {
    id: 'event-movie-1',
    title: 'Duna: Parte Três',
    category: 'movie',
    description: 'Sessão de cinema com poltronas numeradas.',
    date: '2026-09-01T19:00:00.000Z',
    location: 'São Paulo, SP',
    organizerId: 'user-organizer',
    ticketMode: 'seatmap',
    rows: 5,
    cols: 8,
    seatPrice: 32,
    seats: buildSeats(5, 8),
  },
  {
    id: 'event-show-1',
    title: 'Festival Verão Sonoro',
    category: 'show',
    description: 'Show de música ao ar livre, ingresso de pista.',
    date: '2026-10-15T20:00:00.000Z',
    location: 'Rio de Janeiro, RJ',
    organizerId: 'user-organizer',
    ticketMode: 'quantity',
    price: 150,
    totalCapacity: 200,
    sold: 0,
    reservedQuantity: 0,
  },
]
