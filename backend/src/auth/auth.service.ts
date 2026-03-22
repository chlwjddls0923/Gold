import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  login(password: string) {
    const adminPassword = this.config.get('ADMIN_PASSWORD')
    if (password !== adminPassword) {
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.')
    }
    const token = this.jwtService.sign({ role: 'admin' })
    return { accessToken: token }
  }
}
