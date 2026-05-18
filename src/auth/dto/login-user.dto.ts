import { PickType } from '@nestjs/mapped-types';
import { IsJWT, IsString, IsStrongPassword, Length, } from 'class-validator';
import { ApiProperty, } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class LoginUserDto extends PickType(CreateUserDto, [
  'email',
  'password',
] as const) {}

export class EmailDto extends PickType(CreateUserDto, [
  'email',
] as const) {}

export class ResetPasswordDto {

  @ApiProperty({
    example: 'jwt-reset-token',
    description: 'Password reset token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'StrongP@ssword1',
    description:
      'New password containing uppercase, lowercase, number and symbol',
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
}

export class VerifyEmailDto {

  @ApiProperty({
    example: 'jwt-verification-token',
    description: 'Email verification token',
  })
  @IsJWT()
  token: string;
}