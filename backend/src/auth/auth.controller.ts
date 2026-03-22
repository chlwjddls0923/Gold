import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'
import { Throttle, SkipThrottle } from '@nestjs/throttler'
import { AuthService } from './auth.service'

class LoginDto {
  @IsString()
  @IsNotEmpty()
  password: string
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.password)
  }
}
