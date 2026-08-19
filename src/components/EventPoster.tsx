import Image from 'next/image'
import { Event, EventCategory } from '@/lib/types'

type Size = 'sm' | 'lg'

const DIMENSIONS: Record<Size, { width: number; height: number; sizeClass: string; emojiClass: string }> = {
  sm: { width: 80, height: 112, sizeClass: 'w-20 h-28', emojiClass: 'text-2xl' },
  lg: { width: 240, height: 360, sizeClass: 'w-60 h-[360px]', emojiClass: 'text-6xl' },
}

const CATEGORY_PLACEHOLDER: Record<EventCategory, { emoji: string; className: string }> = {
  movie: { emoji: '🎬', className: 'bg-indigo-100 text-indigo-700' },
  show: { emoji: '🎤', className: 'bg-amber-100 text-amber-700' },
  theater: { emoji: '🎭', className: 'bg-rose-100 text-rose-700' },
}

export function EventPoster({ event, size }: { event: Event; size: Size }) {
  const { width, height, sizeClass, emojiClass } = DIMENSIONS[size]

  if (event.posterUrl) {
    return (
      <Image
        src={event.posterUrl}
        alt={event.title}
        width={width}
        height={height}
        className={`${sizeClass} rounded shrink-0 object-cover`}
      />
    )
  }

  const placeholder = CATEGORY_PLACEHOLDER[event.category]
  return (
    <div
      role="img"
      aria-label={`Sem poster disponível para ${event.title}`}
      className={`${sizeClass} ${placeholder.className} ${emojiClass} rounded shrink-0 flex items-center justify-center`}
    >
      {placeholder.emoji}
    </div>
  )
}
