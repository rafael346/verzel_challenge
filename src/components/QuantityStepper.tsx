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
        className="border rounded w-8 h-8 disabled:opacity-40"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        -
      </button>
      <span className="w-6 text-center">{value}</span>
      <button
        type="button"
        className="border rounded w-8 h-8 disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  )
}
