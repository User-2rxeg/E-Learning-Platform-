import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true, namespace: '/ws/chat' })
export class ChatGateway implements OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor(private readonly jwt: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            const token =
                (client.handshake.auth as any)?.token ||
                (client.handshake.headers.authorization
                    ? (client.handshake.headers.authorization as string).split(' ')[1]
                    : undefined);

            if (!token) return client.disconnect();

            const payload = this.jwt.verify(token);
            const userId = payload?.sub;
            if (!userId) return client.disconnect();

            client.join(`user:${userId}`);
            (client as any).userId = userId;

            client.on('chat:join', (chatId: string) => {
                if (typeof chatId === 'string' && chatId) {
                    client.join(`chat:${chatId}`);
                }
            });

            client.on('chat:leave', (chatId: string) => {
                if (typeof chatId === 'string' && chatId) {
                    client.leave(`chat:${chatId}`);
                }
            });
        } catch {
            client.disconnect();
        }
    }

    emitToUser(userId: string, event: string, data: any) {
        this.server.to(`user:${userId}`).emit(event, data);
    }

    emitToChat(chatId: string, event: string, data: any) {
        this.server.to(`chat:${chatId}`).emit(event, data);
    }
}