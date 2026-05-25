import {
  PartialType,
  ApiPropertyOptional,
} from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

import { CreateCommentDto } from './create-comment.dto';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {

  @ApiPropertyOptional({
    example: 'Updated comment content',
    description: 'Updated comment text',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}