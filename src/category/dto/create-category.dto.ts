import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {

  @ApiProperty({
    example: 'Electronics',
    description: 'Name of the category',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}