export default function BudgetLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-2">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Tabs skeleton */}
            <div className="flex gap-2 border-b border-[#E5E2DC] pb-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
                ))}
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                            <div className="flex flex-col gap-1">
                                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                                <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                            </div>
                        </div>
                        <div className="h-2 w-full animate-pulse rounded-full bg-gray-100" />
                    </div>
                ))}
            </div>
        </div>
    );
}
