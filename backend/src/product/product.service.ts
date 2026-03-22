import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from './product.entity'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'

export type DetailBlock =
  | { type: 'image'; url: string }
  | { type: 'text'; content: string }

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  findAll(categoryId?: number) {
    const where: Record<string, unknown> = { isActive: true }
    if (categoryId) where.category = { id: categoryId }
    return this.productRepo.find({
      where,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    })
  }

  findOne(id: number) {
    return this.productRepo.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    })
  }

  findAllAdmin() {
    return this.productRepo.find({
      relations: ['category'],
      order: { createdAt: 'DESC' },
    })
  }

  async create(dto: CreateProductDto, imageUrl?: string) {
    const product = this.productRepo.create({
      name: dto.name,
      price: dto.price,
      description: dto.description,
      isActive: dto.isActive ?? true,
      imageUrl,
      ...(dto.categoryId && { category: { id: dto.categoryId } }),
    })
    return this.productRepo.save(product)
  }

  async update(id: number, dto: UpdateProductDto, imageUrl?: string) {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    Object.assign(product, {
      ...dto,
      ...(imageUrl && { imageUrl }),
      ...(dto.categoryId && { category: { id: dto.categoryId } }),
    })
    return this.productRepo.save(product)
  }

  async remove(id: number) {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    return this.productRepo.remove(product)
  }

  // ── 상세 블록 공통 ──────────────────────────────
  private parseBlocks(raw: string | null): DetailBlock[] {
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // 구버전 string[] 호환
    return parsed.map((item: string | DetailBlock) =>
      typeof item === 'string' ? { type: 'image', url: item } : item,
    )
  }

  private async saveBlocks(id: number, blocks: DetailBlock[]): Promise<DetailBlock[]> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException('상품을 찾을 수 없습니다.')
    product.detailImages = JSON.stringify(blocks)
    await this.productRepo.save(product)
    return blocks
  }

  async addDetailImage(id: number, imageUrl: string, insertAfter?: number): Promise<DetailBlock[]> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException()
    const blocks = this.parseBlocks(product.detailImages)
    const newBlock: DetailBlock = { type: 'image', url: imageUrl }
    if (insertAfter !== undefined && insertAfter >= 0 && insertAfter < blocks.length) {
      blocks.splice(insertAfter + 1, 0, newBlock)
    } else {
      blocks.push(newBlock)
    }
    return this.saveBlocks(id, blocks)
  }

  async addDetailText(id: number, content: string, insertAfter?: number): Promise<DetailBlock[]> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException()
    const blocks = this.parseBlocks(product.detailImages)
    const newBlock: DetailBlock = { type: 'text', content }
    if (insertAfter !== undefined && insertAfter >= 0 && insertAfter < blocks.length) {
      blocks.splice(insertAfter + 1, 0, newBlock)
    } else {
      blocks.push(newBlock)
    }
    return this.saveBlocks(id, blocks)
  }

  async updateDetailText(id: number, index: number, content: string): Promise<DetailBlock[]> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException()
    const blocks = this.parseBlocks(product.detailImages)
    if (blocks[index]?.type === 'text') {
      (blocks[index] as { type: 'text'; content: string }).content = content
    }
    return this.saveBlocks(id, blocks)
  }

  async removeDetailBlock(id: number, index: number): Promise<DetailBlock[]> {
    const product = await this.productRepo.findOne({ where: { id } })
    if (!product) throw new NotFoundException()
    const blocks = this.parseBlocks(product.detailImages)
    blocks.splice(index, 1)
    return this.saveBlocks(id, blocks)
  }
}
