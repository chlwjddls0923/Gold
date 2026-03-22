import { IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty({ example: '타올' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'towel' })
  @IsString()
  @IsNotEmpty()
  slug: string
}
