export type Role = 'customer' | 'organizer' | 'gate'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  password: string
}

export type EventCategory = 'show' | 'movie' | 'theater'
export type TicketMode = 'seatmap' | 'quantity'
export type SeatStatus = 'available' | 'reserved' | 'sold'

export type Seat = {
  row: number
  col: number
  status: SeatStatus
}

export type Event = {
  id: string
  title: string
  category: EventCategory
  description: string
  date: string
  location: string
  organizerId: string
  ticketMode: TicketMode
  rows?: number
  cols?: number
  seatPrice?: number
  seats?: Seat[]
  price?: number
  totalCapacity?: number
  sold?: number
  reservedQuantity?: number
}

export type TicketStatus = 'valid' | 'used'

export type Ticket = {
  id: string
  code: string
  eventId: string
  userId: string
  seat?: { row: number; col: number }
  quantity?: number
  status: TicketStatus
  purchasedAt: string
}

export type AuthUser = Omit<User, 'password'>
