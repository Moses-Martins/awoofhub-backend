import { Body, Controller, Delete, Patch, Get, Param, Post, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';


@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

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
    return this.commentsService.findByOffer(offerId);
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
    return this.commentsService.create(user.id, offerId, createCommentDto);
  }


  @Patch(':commentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'commentId', type: String, description: 'Comment ID', example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  update(@CurrentUser() user, @Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(user.id, commentId, updateCommentDto);
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'commentId', type: String, description: 'Comment ID', example: '64f8c2d9a12b3c0012345678' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@CurrentUser() user, @Param('commentId') commentId: string) {
    return this.commentsService.remove(user.id, commentId);
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

  @Get()
  @ApiOperation({
    summary: 'Get all comments',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'createdFrom',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'createdTo',
    required: false,
    type: String,
  })
  findAllGlobal(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search?: string,
    @Query('createdFrom') createdFrom?: string,
    @Query('createdTo') createdTo?: string,
  ) {
    return this.commentsService.findAllGlobal(
      search,
      createdFrom,
      createdTo,
      page,
      limit,
    );
  }
}