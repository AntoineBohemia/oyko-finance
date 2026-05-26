export default function ParametresLoading() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
            <div className="flex flex-col gap-2">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
            </div>

            <div className="flex flex-col gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4 rounded-xl border border-[#E5E2DC] bg-white p-6 shadow-xs">
                        <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
                        <div className="flex flex-col gap-3">
                            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
