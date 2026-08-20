type Variant = 'error' | 'success' | 'neutral'

// Same border color drives both the box outline and the action button outline, so a
// success/neutral StateBox used elsewhere (e.g. a future retry-able success state)
// doesn't accidentally inherit the wine (error) border.
const VARIANT_BORDER: Record<Variant, string> = {
  error: 'border-wine',
  success: 'border-success',
  neutral: 'border-neutral',
}

const VARIANT_BG: Record<Variant, string> = {
  error: 'bg-wine/[0.12]',
  success: 'bg-success/[0.12]',
  neutral: 'bg-neutral/[0.12]',
}

export function StateBox({
  variant,
  title,
  description,
  action,
}: {
  variant: Variant
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-[3px] border p-4 ${VARIANT_BORDER[variant]} ${VARIANT_BG[variant]}`}
    >
      <div className="text-sm leading-relaxed">
        <p className="font-display text-base font-semibold text-text mb-1">{title}</p>
        {description && <p className="text-text-muted">{description}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={`shrink-0 rounded-[3px] border px-3 py-2 text-sm text-text ${VARIANT_BORDER[variant]}`}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
