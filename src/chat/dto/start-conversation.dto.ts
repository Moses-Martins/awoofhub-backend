import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartConversationDto {

  @ApiProperty({
    example: '64f8c2d9a12b3c0012345678',
    description: 'ID of the participant to start a conversation with',
  })
  @IsNotEmpty()
  @IsString()
  participantId: string;
}