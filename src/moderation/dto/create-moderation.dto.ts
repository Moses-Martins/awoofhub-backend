import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { ModerationActionType, TargetType } from "src/common/types/enums";

export class CreateModerationDto {
    @IsNotEmpty()
    @IsEnum(TargetType)
    targetType: TargetType;

    @IsNotEmpty()
    @IsUUID()
    targetId: string;

    @IsNotEmpty()
    @IsEnum(ModerationActionType)
    actionType: ModerationActionType;

    @IsOptional()
    @IsString()
    reason?: string;

    @IsOptional()
    endsAt?: Date;

    @IsOptional()
    reportId?: string;
}
