export function QuantityStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="border border-border rounded-[3px] w-8 h-8 text-text hover:border-gold disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        -
      </button>
      <span className="w-6 text-center text-text">{value}</span>
      <button
        type="button"
        className="border border-border rounded-[3px] w-8 h-8 text-text hover:border-gold disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
