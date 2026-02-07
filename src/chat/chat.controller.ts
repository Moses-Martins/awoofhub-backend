import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
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
  @UseGuards(AuthGuard)
  async getOrCreateConversation(
    @Body() dto: StartConversationDto,
    @CurrentUser() user: User,
  ) {
    return this.chatService.getOrCreateConversation(user.id, dto.participantId);
  }

}
