import {ReactNode} from "react";

interface EmptyStateProps {
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            {icon || (
                <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                </div>
            )}

            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-text-secondary text-center max-w-md mb-6">{description}</p>

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium
            rounded-lg transition-colors duration-200"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
