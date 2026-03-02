import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Get('offer/:offerId')
  findAll(@Param('offerId') offerId: string) {
    return this.commentsService.findAll(offerId);
  }

  @Post(':offerId')
  @UseGuards(AuthGuard)
  create(@CurrentUser() user, @Param('offerId') offerId: string, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(user.id, offerId, createCommentDto);
  }

}


