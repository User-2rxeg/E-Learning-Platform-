// src/lib/utils/chartConfig.ts
export const chartColors = {
    primary: '#3E64FF',
    secondary: '#764ba2',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    purple: '#8B5CF6',
    pink: '#EC4899',
    teal: '#14B8A6',
    gray: '#6B7280'
};

export const chartTheme = {
    axis: {
        style: {
            tickLabels: {
                fill: '#A0A0A0',
                fontSize: 11,
            },
            grid: {
                stroke: '#2A2A2A',
                strokeDasharray: '3 3',
            },
            axis: {
                stroke: '#2A2A2A',
            },
        },
    },
    tooltip: {
        container: {
            background: '#1A1A1A',
            border: '1px solid #2A2A2A',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
        text: {
            fill: '#FFFFFF',
            fontSize: 12,
        },
    },
    legend: {
        text: {
            fill: '#A0A0A0',
            fontSize: 12,
        },
    },
};

export const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            labels: {
                color: '#A0A0A0',
                font: {
                    size: 12,
                },
                padding: 15,
            },
        },
        tooltip: {
            enabled: true,
            backgroundColor: '#1A1A1A',
            titleColor: '#FFFFFF',
            bodyColor: '#A0A0A0',
            borderColor: '#2A2A2A',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
        },
    },
    scales: {
        x: {
            grid: {
                color: '#2A2A2A',
                drawBorder: false,
            },
            ticks: {
                color: '#A0A0A0',
                font: {
                    size: 11,
                },
            },
        },
        y: {
            grid: {
                color: '#2A2A2A',
                drawBorder: false,
            },
            ticks: {
                color: '#A0A0A0',
                font: {
                    size: 11,
                },
            },
        },
    },
};
