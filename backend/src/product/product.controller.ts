import {
  Controller, Get, Post, Patch, Put, Delete,
  Param, Body, Query, UseGuards,
  UseInterceptors, UploadedFile,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { ProductService } from './product.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

const imageStorage = diskStorage({
  destination: './uploads',
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + extname(file.originalname))
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
@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findAllAdmin() {
    return this.productService.findAllAdmin()
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.productService.findAll(categoryId ? +categoryId : undefined)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  create(@Body() dto: CreateProductDto, @UploadedFile() file?: Express.Multer.File) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined
    return this.productService.create(dto, imageUrl)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/${file.filename}` : undefined
    return this.productService.update(+id, dto, imageUrl)
  }

  // ── 상세 블록 ─────────────────────────────────────

  @Post(':id/detail-images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async addDetailImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('insertAfter') insertAfter?: string,
  ) {
    const imageUrl = `/uploads/${file.filename}`
    const after = insertAfter !== undefined ? +insertAfter : undefined
    const blocks = await this.productService.addDetailImage(+id, imageUrl, after)
    return { imageUrl, blocks }
  }

  @Post(':id/detail-text')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addDetailText(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('insertAfter') insertAfter?: string,
  ) {
    const blocks = await this.productService.addDetailText(
      +id,
      content ?? '',
      insertAfter !== undefined ? +insertAfter : undefined,
    )
    return { blocks }
  }

  @Put(':id/detail-blocks/:index')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async updateDetailText(
    @Param('id') id: string,
    @Param('index') index: string,
    @Body('content') content: string,
  ) {
    const blocks = await this.productService.updateDetailText(+id, +index, content ?? '')
    return { blocks }
  }

  @Delete(':id/detail-images/:index')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removeDetailBlock(@Param('id') id: string, @Param('index') index: string) {
    const blocks = await this.productService.removeDetailBlock(+id, +index)
    return { blocks }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.productService.remove(+id)
  }
}
