import { IsNotEmpty, IsString } from "class-validator";

export class StartConversationDto {
  @IsNotEmpty()
  @IsString()
  initiatorId: string;

  @IsNotEmpty()
  @IsString()
  participantId: string;
  
}