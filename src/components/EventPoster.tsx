import Image from 'next/image'
import { Event } from '@/lib/types'
import { getPosterHue } from '@/lib/utils/posterColor'

type Size = 'sm' | 'lg'

const DIMENSIONS: Record<Size, { width: number; height: number; sizeClass: string; initialClass: string }> = {
  sm: { width: 80, height: 112, sizeClass: 'w-20 h-28', initialClass: 'text-2xl' },
  lg: { width: 240, height: 360, sizeClass: 'w-60 h-[360px]', initialClass: 'text-6xl' },
}

export function EventPoster({ event, size }: { event: Event; size: Size }) {
  const { width, height, sizeClass, initialClass } = DIMENSIONS[size]

  if (event.posterUrl) {
    return (
      <Image
        src={event.posterUrl}
        alt={event.title}
        width={width}
        height={height}
        className={`${sizeClass} rounded-[2px] shrink-0 object-cover`}
      />
    )
  }

  const initial = event.title.trim().charAt(0).toUpperCase()
  const hue = getPosterHue(event.id)

  return (
    <div
      role="img"
      aria-label={`Sem poster disponível para ${event.title}`}
      className={`${sizeClass} rounded-[2px] shrink-0 relative overflow-hidden bg-bg`}
      style={{ '--poster-hue': hue } as React.CSSProperties}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'repeating-linear-gradient(115deg, var(--poster-hue) 0px, var(--poster-hue) 3px, var(--color-bg) 3px, var(--color-bg) 7px)',
        }}
      />
      <span
        className={`relative z-10 flex items-center justify-center h-full font-display text-text/55 ${initialClass}`}
      >
        {initial}
      </span>
    </div>
  )
}
