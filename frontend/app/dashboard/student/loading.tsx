export default function StudentDashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Welcome Header Skeleton */}
            <div className="bg-primary-light rounded-xl p-8">
                <div className="h-8 bg-primary w-64 rounded mb-2"></div>
                <div className="h-4 bg-primary w-48 rounded"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <div className="h-4 bg-primary w-24 rounded mb-4"></div>
                        <div className="h-8 bg-primary w-32 rounded mb-2"></div>
                        <div className="h-3 bg-primary w-20 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* courses progress-tracking Skeleton */}
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="p-4 bg-primary rounded-lg">
                                    <div className="h-5 bg-primary-light w-3/4 rounded mb-3"></div>
                                    <div className="h-2 bg-primary-light rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* progress-tracking Ring Skeleton */}
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                        <div className="flex justify-center">
                            <div className="w-32 h-32 bg-primary rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

