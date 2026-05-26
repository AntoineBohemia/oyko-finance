export default function PatrimoineLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-2">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-3 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                        <div className="h-8 w-36 animate-pulse rounded bg-gray-200" />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-5 shadow-xs">
                        <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 animate-pulse rounded-full bg-gray-100" />
                                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                </div>
                                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
