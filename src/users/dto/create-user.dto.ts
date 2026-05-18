import {
  IsEmail,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({
    example: 'Farouk Musa',
    description: 'Full name of the user',
  })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({
    example: 'StrongP@ssword1',
    description:
      'Password containing uppercase, lowercase, number and special character',
  })
  @IsString()
  @Length(8, 20)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'password should contain at least one lowercase letter, one uppercase letter, one number, and one symbol',
    },
  )
  password: string;

  @ApiProperty({
    example: 'farouk@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;
}