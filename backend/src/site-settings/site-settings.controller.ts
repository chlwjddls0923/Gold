import {
  Controller, Get, Put, Post, Delete,
  Body, Param, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { SiteSettingsService } from './site-settings.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

const imageStorage = diskStorage({
  destination: './uploads',
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, 'hero-' + unique + extname(file.originalname))
  },
})

const imageUploadOptions = {
  storage: imageStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_: any, file: Express.Multer.File, cb: (e: Error | null, ok: boolean) => void) => {
    if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true)
    else cb(new Error('이미지 파일만 업로드 가능합니다. (jpg, png, webp, gif)'), false)
  },
}

@SkipThrottle()
@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly service: SiteSettingsService) {}

  @Get()
  getAll() {
    return this.service.getAll()
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Body() data: Record<string, string>) {
    return this.service.setBulk(data)
  }

  @Post('hero-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async uploadHeroImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('link') link: string,
  ) {
    const imageUrl = `/uploads/${file.filename}`
    const images = await this.service.addHeroImage(imageUrl, link ?? '')
    return { imageUrl, images }
  }

  @Put('hero-image/:index/link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateHeroImageLink(
    @Param('index') index: string,
    @Body('link') link: string,
  ) {
    const images = await this.service.updateHeroImageLink(Number(index), link ?? '')
    return { images }
  }

  @Delete('hero-image/:index')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async deleteHeroImage(@Param('index') index: string) {
    const images = await this.service.removeHeroImage(Number(index))
    return { images }
  }
}
