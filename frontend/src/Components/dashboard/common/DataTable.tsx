
// src/components/dashboard/common/DataTable.tsx
import { useState, ReactNode } from 'react';

interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
                                                                 data,
                                                                 columns,
                                                                 loading,
                                                                 onRowClick,
                                                                 emptyMessage = 'No data available'
                                                             }: DataTableProps<T>) {
    const [sortBy, setSortBy] = useState<keyof T | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    const handleSort = (key: keyof T) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        return columns.some(column => {
            const value = item[column.key];
            return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortBy) return 0;
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
    });

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-10 bg-primary rounded mb-4 animate-pulse"></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-primary rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg
            text-white placeholder-text-secondary focus:outline-none focus:ring-2
            focus:ring-accent focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-700">
                        {columns.map((column) => (
                            <th
                                key={String(column.key)}
                                className="text-left py-3 px-4 text-text-secondary text-sm font-medium"
                            >
                                {column.sortable ? (
                                    <button
                                        onClick={() => handleSort(column.key)}
                                        className="flex items-center space-x-1 hover:text-white transition-colors"
                                    >
                                        <span>{column.label}</span>
                                        {sortBy === column.key && (
                                            <span className="text-accent">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                                        )}
                                    </button>
                                ) : (
                                    column.label
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-8 text-center text-text-secondary">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map((item) => (
                            <tr
                                key={item.id}
                                onClick={() => onRowClick?.(item)}
                                className={`border-b border-gray-800 hover:bg-primary/50 transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((column) => (
                                    <td key={String(column.key)} className="py-3 px-4">
                                        {column.render
                                            ? column.render(item[column.key], item)
                                            : (
                                                <span className="text-white text-sm">
                            {String(item[column.key])}
                          </span>
                                            )}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination (simple implementation) */}
            {sortedData.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-text-secondary text-sm">
                        Showing {sortedData.length} of {data.length} results
                    </p>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-primary rounded text-text-secondary hover:text-white
              transition-colors text-sm">
                            Previous
                        </button>
                        <button className="px-3 py-1 bg-primary rounded text-text-secondary hover:text-white
              transition-colors text-sm">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}