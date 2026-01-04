// src/lib/service/websocket-service.ts
import { io, Socket } from 'socket.io-client';

class WebsocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3654', {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });
    }

    joinCourse(courseId: string) {
        this.socket?.emit('join:course', courseId);
    }

    sendMessage(message: any) {
        this.socket?.emit('message:send', message);
    }
}

export const socketService = new WebsocketService();