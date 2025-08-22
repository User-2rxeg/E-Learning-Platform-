// src/lib/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../services/dashboardApi';

interface UseDashboardDataOptions {
    refreshInterval?: number;
    autoFetch?: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
    const { refreshInterval = 0, autoFetch = true } = options;
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchDashboardData = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            let dashboardData;

            switch (user.role) {
                case 'student':
                    dashboardData = await dashboardService.getStudentDashboard(user.id);
                    break;
                case 'instructor':
                    dashboardData = await dashboardService.getInstructorDashboard(user.id);
                    break;
                case 'admin':
                    dashboardData = await dashboardService.getAdminStats();
                    break;
                default:
                    throw new Error('Invalid user role');
            }

            setData(dashboardData);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (autoFetch && user) {
            fetchDashboardData();
        }
    }, [user, autoFetch]);

    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(fetchDashboardData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);

    return {
        data,
        loading,
        error,
        refresh: fetchDashboardData
    };
}