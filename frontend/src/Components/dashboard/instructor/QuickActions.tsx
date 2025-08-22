// src/components/dashboard/instructor/QuickActions.tsx
interface QuickActionsProps {
    onCreateCourse?: () => void;
    onSendAnnouncement?: () => void;
    onViewAnalytics?: () => void;
    onManageStudents?: () => void;
}

export function QuickActions({
                                 onCreateCourse,
                                 onSendAnnouncement,
                                 onViewAnalytics,
                                 onManageStudents
                             }: QuickActionsProps) {
    const actions = [
        {
            icon: '📚',
            label: 'Create Course',
            description: 'Start a new course',
            onClick: onCreateCourse,
            color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
        },
        {
            icon: '📢',
            label: 'Announcement',
            description: 'Send to students',
            onClick: onSendAnnouncement,
            color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400'
        },
        {
            icon: '📊',
            label: 'View Analytics',
            description: 'Course insights',
            onClick: onViewAnalytics,
            color: 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
        },
        {
            icon: '👥',
            label: 'Manage Students',
            description: 'Student roster',
            onClick: onManageStudents,
            color: 'bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={action.onClick}
                    className={`p-4 rounded-xl border border-gray-800 ${action.color} 
            transition-all duration-200 group`}
                >
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                        {action.icon}
                    </div>
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs opacity-80 mt-1">{action.description}</p>
                </button>
            ))}
        </div>
    );
}