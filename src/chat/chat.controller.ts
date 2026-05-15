import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';

import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('token')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Generate Stream chat token',
    description:
      'Generates a Stream Chat authentication token for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat token generated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getStreamToken(@CurrentUser() user: User) {
    return this.chatService.generateStreamToken(user.id);
  }

  @Get('stats')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Get unread chat statistics',
    description:
      'Returns unread chat count and messaging statistics for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Chat statistics fetched successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getStats(@CurrentUser() user: User) {
    return this.chatService.getUnreadCount(user.id);
  }
}