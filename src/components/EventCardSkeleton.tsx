import { Skeleton } from '@/components/Skeleton'

export function EventCardSkeleton() {
  return (
    <div className="flex gap-3 border border-border rounded-[3px] p-3">
      <Skeleton className="w-20 h-28 shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-2 justify-center">
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}
