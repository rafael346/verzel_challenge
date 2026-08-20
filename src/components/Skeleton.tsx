export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-shimmer rounded-[2px] ${className}`} />
}
