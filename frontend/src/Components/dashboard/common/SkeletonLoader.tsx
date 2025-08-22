// src/components/dashboard/common/SkeletonLoader.tsx
interface SkeletonLoaderProps {
    type?: 'card' | 'table' | 'chart' | 'text' | 'custom';
    rows?: number;
    className?: string;
}

export function SkeletonLoader({ type = 'card', rows = 3, className = '' }: SkeletonLoaderProps) {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800 animate-pulse">
                        <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                        <div className="h-10 bg-primary w-24 rounded mb-2"></div>
                        <div className="h-4 bg-primary w-20 rounded"></div>
                    </div>
                );

            case 'table':
                return (
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <div className="h-10 bg-primary rounded mb-4 animate-pulse"></div>
                        <div className="space-y-2">
                            {Array.from({ length: rows }).map((_, i) => (
                                <div key={i} className="h-12 bg-primary rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                );

            case 'chart':
                return (
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <div className="h-6 bg-primary w-32 rounded mb-4 animate-pulse"></div>
                        <div className="h-64 bg-primary rounded animate-pulse"></div>
                    </div>
                );

            case 'text':
                return (
                    <div className="space-y-2">
                        {Array.from({ length: rows }).map((_, i) => (
                            <div key={i} className="h-4 bg-primary rounded animate-pulse"
                                 style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                        ))}
                    </div>
                );

            default:
                return <div className={`animate-pulse ${className}`}></div>;
        }
    };

    return renderSkeleton();
}