import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamChat } from 'stream-chat';

@Injectable()
export class ChatService {
  private client: StreamChat;

  constructor(
    private readonly configService: ConfigService,
  ) {

    this.client = StreamChat.getInstance(
      this.configService.getOrThrow('STREAM_API_KEY'),
      this.configService.getOrThrow('STREAM_API_SECRET'),
    );
  }


  generateStreamToken(userId: string) {
    const token = this.client.createToken(userId);
    return {
      token
    }
  }

  async syncUser(user: { id: string, name: string, image?: string }) {
    await this.client.upsertUser({
      id: user.id,
      name: user.name,
      image: user.image,
    });
  }



}
