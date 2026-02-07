import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException
} from '@nestjs/websockets';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5500',
        credentials: true,
    }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(
        private readonly chatService: ChatService,
        private readonly configService: ConfigService,
        private jwtService: JwtService,
    ) { }


    handleConnection(client: Socket) {
        const rawCookie = client.handshake.headers.cookie;
        if (!rawCookie) return client.disconnect();

        const parsed = cookie.parse(rawCookie);
        const signedToken = parsed['access_token'];

        // Handle missing token or incorrect prefix safely
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

            // Attach user to client for subsequent messages
            client.data.user = {
                id: payload.sub,
                email: payload.email,
            };
        } catch (err) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_conversation')
    async joinRoom(client: Socket, conversationId: string) {
        const user = client.data.user;

        const conversation = await this.chatService.findConversationById(conversationId);

        if (!conversation) {
            throw new WsException('Conversation not found');
        }

        const isParticipant = conversation.initiator.id === user.id || conversation.participant.id === user.id;

        if (!isParticipant) {
            throw new WsException('Not allowed');
        }

        client.join(conversationId.toString());
    }

    @SubscribeMessage('get_all_messages')
    async handleGetMessages(client: Socket, conversationId: string) {
        const user = client.data.user;

        const conversation = await this.chatService.findConversationById(conversationId);

        if (!conversation) {
            throw new WsException('Conversation not found');
        }

        const isParticipant = conversation.initiator.id === user.id || conversation.participant.id === user.id;

        if (!isParticipant) {
            throw new WsException('Not allowed');
        }

        const messages = await this.chatService.getMessages(conversationId);

        return messages;
    }

    @SubscribeMessage('send_message')
    async handleMessage(client: Socket, payload: { conversationId: string; content: string }) {
        const user = client.data.user;

        const conversation = await this.chatService.findConversationById(payload.conversationId);

        if (!conversation) {
            throw new WsException('Conversation not found');
        }

        const isParticipant = conversation.initiator.id === user.id || conversation.participant.id === user.id;

        if (!isParticipant) {
            throw new WsException('Not allowed');
        }

        const message = await this.chatService.sendMessage(
            conversation.id,
            user.id,
            payload.content,
        );
        

        this.server.to(payload.conversationId.toString()).emit('new_message', message);
    }
}