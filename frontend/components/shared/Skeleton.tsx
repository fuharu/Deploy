export function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    )
}

export function CompanyCardSkeleton() {
    return (
        <div className="border dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    )
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        </div>
    )
}

