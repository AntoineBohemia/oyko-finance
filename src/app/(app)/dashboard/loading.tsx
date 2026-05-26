export default function DashboardLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            {/* Header skeleton */}
            <div className="flex flex-col gap-2">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
                        <div className="h-2 w-full animate-pulse rounded-full bg-gray-100" />
                    </div>
                ))}
            </div>

            {/* Content area */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="col-span-3 flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                    <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                                <div className="flex flex-col gap-1">
                                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                                </div>
                            </div>
                            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
                <div className="col-span-2 flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                    <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                            </div>
                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
