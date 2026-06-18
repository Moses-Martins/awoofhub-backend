import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class CheckUsernameDto {

    @ApiProperty({
        example: 'john_doe',
        description: 'New username (3–20 chars, lowercase letters, numbers, underscores)',
    })
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, {
        message:
            'Username can only contain lowercase letters, numbers, and single underscores between words',
    })
    username: string;

}