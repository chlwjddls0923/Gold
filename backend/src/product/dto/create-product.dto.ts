import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type, Transform } from 'class-transformer'

export class CreateProductDto {
  @ApiProperty({ example: '골드타올' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ example: 8900 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  price?: number

  @ApiPropertyOptional({ example: '때밀이용 최고급 타올입니다.' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  categoryId?: number

  // FormData로 전송 시 "true"/"false" 문자열을 boolean으로 변환
  @ApiPropertyOptional({ example: true })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
