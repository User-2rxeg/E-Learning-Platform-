// src/lib/hooks/useRealtime.ts
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseRealtimeOptions {
    url?: string;
    namespace?: string;
    autoConnect?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
    const {
        url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3334',
        namespace = '/ws',
        autoConnect = true
    } = options;

    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!autoConnect) return;

        const token = localStorage.getItem('token');
        if (!token) {
            setError(new Error('No authentication token found'));
            return;
        }

        try {
            socketRef.current = io(`${url}${namespace}`, {
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            socketRef.current.on('connect', () => {
                setConnected(true);
                setError(null);
            });

            socketRef.current.on('disconnect', () => {
                setConnected(false);
            });

            socketRef.current.on('error', (err) => {
                setError(err);
                setConnected(false);
            });

        } catch (err) {
            setError(err as Error);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [url, namespace, autoConnect]);

    const emit = (event: string, data?: any) => {
        if (socketRef.current && connected) {
            socketRef.current.emit(event, data);
        }
    };

    const on = (event: string, handler: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.on(event, handler);
        }
    };

    const off = (event: string, handler?: (...args: any[]) => void) => {
        if (socketRef.current) {
            socketRef.current.off(event, handler);
        }
    };

    return {
        socket: socketRef.current,
        connected,
        error,
        emit,
        on,
        off
    };
}