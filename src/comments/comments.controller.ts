import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('offer/:offerId')
  @ApiOperation({
    summary: 'Get all comments for an offer',
  })
  @ApiParam({
    name: 'offerId',
    type: String,
    description: 'Offer ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments fetched successfully',
  })
  findAll(@Param('offerId') offerId: string) {
    return this.commentsService.findAll(offerId);
  }

  @Post('offer/:offerId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create comment for an offer',
  })
  @ApiParam({
    name: 'offerId',
    type: String,
    description: 'Offer ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  create(
    @CurrentUser() user,
    @Param('offerId') offerId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      user.id,
      offerId,
      createCommentDto,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get comment by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Comment ID',
    example: '64f8c2d9a12b3c0012345678',
  })
  @ApiResponse({
    status: 200,
    description: 'Comment fetched successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment not found',
  })
  findById(@Param('id') id: string) {
    return this.commentsService.findById(id);
  }
}