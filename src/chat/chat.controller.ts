import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartConversationDto } from './dto/start-conversation.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('conversation/:id/messages')
  async getMessages(@Param('id') conversationId: string) {
    return this.chatService.getMessages(conversationId);
  }

  @Post('conversation')
  async getOrCreateConversation(
    @Body() dto: StartConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(dto.initiatorId, dto.participantId);
  }

}
