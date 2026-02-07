import { IsNotEmpty, IsString } from "class-validator";

export class StartConversationDto {

  @IsNotEmpty()
  @IsString()
  participantId: string;

}