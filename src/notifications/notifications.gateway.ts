import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { Server, Socket } from 'socket.io';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from "./notifications.service";



@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5500',
        credentials: true,
    }
})
export class NotificationsGateway implements OnGatewayConnection {

    @WebSocketServer() server: Server;

    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly configService: ConfigService,
        private jwtService: JwtService,
    ) { }

    handleConnection(client: Socket) {
        const rawCookie = client.handshake.headers.cookie;
        if (!rawCookie) return client.disconnect();

        const parsed = cookie.parse(rawCookie);
        const signedToken = parsed['access_token'];

        if (!signedToken || !signedToken.startsWith('s:')) {
            return client.disconnect();
        }

        const token = signature.unsign(
            signedToken.slice(2),
            this.configService.get('COOKIE_SECRET')
        );


        if (!token) return client.disconnect();

        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET')
            });

            client.data.user = {
                id: payload.sub,
                email: payload.email,
            };

            client.join(payload.sub.toString());


        } catch {
            client.disconnect();
        }
    }

    @SubscribeMessage('get_all_notification')
    async handleGetNotification(client: Socket) {
        const user = client.data.user;

        return await this.notificationsService.findForUser(user.id);
    }

    @OnEvent('notification.created')
    handleNotification(payload: Notification) {
        this.server
            .to(payload.user.id.toString())
            .emit('new_notification', payload);
    } 
}