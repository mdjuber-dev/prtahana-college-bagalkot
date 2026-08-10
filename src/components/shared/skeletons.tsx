import { cn } from '@/lib/utils';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl overflow-hidden bg-white shadow-soft', className)}>
      <div className="shimmer-bg aspect-video w-full" />
      <div className="p-5 space-y-3">
        <div className="shimmer-bg h-5 w-3/4 rounded" />
        <div className="shimmer-bg h-4 w-full rounded" />
        <div className="shimmer-bg h-4 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative h-screen min-h-[600px] w-full shimmer-bg" />
  );
}

export function SkeletonSection({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-4 py-16', className)}>
      <div className="text-center space-y-3 mb-8">
        <div className="shimmer-bg h-8 w-64 mx-auto rounded" />
        <div className="shimmer-bg h-4 w-96 max-w-full mx-auto rounded" />
      </div>
      <SkeletonGrid count={lines} />
    </div>
  );
}

export function SkeletonAdmissionForm() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="shimmer-bg w-12 h-12 rounded-full" />
            <div className="shimmer-bg h-3 w-20 rounded hidden sm:block" />
            {n < 3 && <div className="flex-1 h-1 mx-2 shimmer-bg rounded" />}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-soft space-y-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="shimmer-bg h-4 w-24 rounded" />
              <div className="shimmer-bg h-10 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <div className="shimmer-bg h-4 w-24 rounded" />
              <div className="shimmer-bg h-10 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonFeeTable() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
      <div className="shimmer-bg h-8 w-64 mx-auto rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5 shadow-soft flex gap-4">
          <div className="shimmer-bg w-12 h-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer-bg h-5 w-1/3 rounded" />
            <div className="shimmer-bg h-4 w-1/2 rounded" />
          </div>
          <div className="shimmer-bg h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
