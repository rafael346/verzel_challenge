import { Seat } from '@/lib/types'

export function SeatGrid({
  seats,
  rows,
  cols,
  selected,
  onToggle,
}: {
  seats: Seat[]
  rows: number
  cols: number
  selected: { row: number; col: number }[]
  onToggle: (row: number, col: number) => void
}) {
  function statusFor(row: number, col: number) {
    const seat = seats.find((s) => s.row === row && s.col === col)
    const isSelected = selected.some((pos) => pos.row === row && pos.col === col)
    if (isSelected) return 'selected'
    return seat?.status ?? 'available'
  }

  const colorFor: Record<string, string> = {
    available: 'bg-surface border-border-subtle text-text hover:border-gold',
    reserved: 'bg-border-subtle border-border-subtle text-text-faint opacity-50',
    sold: 'bg-border-subtle border-border-subtle text-text-faint opacity-50',
    selected: 'bg-gold border-gold text-bg font-semibold',
  }

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows }, (_, i) => i + 1).flatMap((row) =>
        Array.from({ length: cols }, (_, j) => j + 1).map((col) => {
          const status = statusFor(row, col)
          const disabled = status !== 'available' && status !== 'selected'
          const statusLabel =
            status === 'selected' ? ', selecionado' : status !== 'available' ? ', indisponível' : ''
          return (
            <button
              key={`${row}-${col}`}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(row, col)}
              aria-label={`Assento fileira ${row}, coluna ${col}${statusLabel}`}
              className={`border rounded-[2px] text-xs p-2 transition-colors ${colorFor[status]} disabled:cursor-not-allowed`}
            >
              {row}-{col}
            </button>
          )
        })
      )}
    </div>
  )
}
