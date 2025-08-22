// src/components/dashboard/common/StatsCard.tsx
'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon?: ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    loading?: boolean;
}

export function StatsCard({
                              title,
                              value,
                              change,
                              icon,
                              color = 'blue',
                              loading = false
                          }: StatsCardProps) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        yellow: 'from-yellow-500 to-yellow-600',
        red: 'from-red-500 to-red-600',
        purple: 'from-purple-500 to-purple-600'
    };

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-primary w-24 rounded mb-4"></div>
                <div className="h-8 bg-primary w-32 rounded mb-2"></div>
                <div className="h-3 bg-primary w-20 rounded"></div>
            </div>
        );
    }

    return (
        <div className="group relative bg-primary-light rounded-xl p-6
      hover:shadow-xl hover:shadow-accent/10 transition-all duration-300
      border border-gray-800 hover:border-gray-700">

            {/* Background gradient on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} 
        opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`} />

            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-text-secondary text-sm font-medium">{title}</p>
                    {icon && (
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]} 
              bg-opacity-10 text-white`}>
                            {icon}
                        </div>
                    )}
                </div>

                <p className="text-3xl font-bold text-white mb-2">{value}</p>

                {change !== undefined && (
                    <p className={`text-sm flex items-center space-x-1 
            ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <span>{change >= 0 ? '↑' : '↓'}</span>
                        <span>{Math.abs(change)}%</span>
                        <span className="text-text-secondary">from last month</span>
                    </p>
                )}
            </div>
        </div>
    );
}