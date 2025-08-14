import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true, namespace: '/ws' })
export class NotificationGateway implements OnGatewayConnection {
    @WebSocketServer() server!: Server;

    constructor(private readonly jwt: JwtService) {}

    async handleConnection(client: Socket) {
        try {
            // Accept token via auth or Authorization header
            const token =
                (client.handshake.auth && (client.handshake.auth as any).token) ||
                (client.handshake.headers.authorization
                    ? (client.handshake.headers.authorization as string).split(' ')[1]
                    : undefined);

            if (!token) return client.disconnect();

            const payload = this.jwt.verify(token);
            const userId = payload?.sub;
            if (!userId) return client.disconnect();

            client.join('user:${userId}');
            (client as any).userId = userId;
        } catch {
            client.disconnect();
        }
    }

    emitToUser(userId: string, event: string, data: any) {
        this.server.to('user:${userId}).emit(event, data');
    }
}