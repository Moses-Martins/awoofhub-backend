import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {

  @ApiProperty({
    example: 'This is a great offer!',
    description: 'Comment content',
  })
  @IsNotEmpty()
  @IsString()
  comment: string;
}