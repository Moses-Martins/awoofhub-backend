import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('token')
  @UseGuards(AuthGuard)
  getStreamToken(@CurrentUser() user: User) {
    return this.chatService.generateStreamToken(user.id);
  }

}
