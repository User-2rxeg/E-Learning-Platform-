// src/components/dashboard/common/ChartCard.tsx
'use client';

import { ReactNode } from 'react';

interface ChartCardProps {
    title: string;
    subtitle?: string;
    children: ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
    loading?: boolean;
}

export function ChartCard({ title, subtitle, children, action, loading }: ChartCardProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-32 rounded mb-2"></div>
                <div className="h-4 bg-primary w-48 rounded mb-4"></div>
                <div className="h-64 bg-primary rounded animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    {subtitle && <p className="text-text-secondary text-sm mt-1">{subtitle}</p>}
                </div>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-3 py-1 text-accent hover:text-accent-hover text-sm transition-colors"
                    >
                        {action.label}
                    </button>
                )}
            </div>
            <div className="chart-content">
                {children}
            </div>
        </div>
    );
}
