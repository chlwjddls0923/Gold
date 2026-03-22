import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SiteSetting } from './site-settings.entity'

export type HeroImage = { url: string; link: string }

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly repo: Repository<SiteSetting>,
  ) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.repo.find()
    return Object.fromEntries(rows.map((r) => [r.key, r.value]))
  }

  async setBulk(data: Record<string, string>): Promise<void> {
    const entities = Object.entries(data).map(([key, value]) => {
      const s = new SiteSetting()
      s.key = key
      s.value = value
      return s
    })
    await this.repo.save(entities)
  }

  private async getHeroImages(): Promise<HeroImage[]> {
    const existing = await this.repo.findOne({ where: { key: 'hero_images' } })
    if (!existing) return []
    const parsed = JSON.parse(existing.value)
    // 구버전 호환: string[]이면 {url, link} 변환
    return parsed.map((item: string | HeroImage) =>
      typeof item === 'string' ? { url: item, link: '' } : item,
    )
  }

  async addHeroImage(imageUrl: string, link: string): Promise<HeroImage[]> {
    const images = await this.getHeroImages()
    images.push({ url: imageUrl, link: link ?? '' })
    await this.setBulk({ hero_images: JSON.stringify(images) })
    return images
  }

  async updateHeroImageLink(index: number, link: string): Promise<HeroImage[]> {
    const images = await this.getHeroImages()
    if (images[index]) images[index].link = link
    await this.setBulk({ hero_images: JSON.stringify(images) })
    return images
  }

  async removeHeroImage(index: number): Promise<HeroImage[]> {
    const images = await this.getHeroImages()
    images.splice(index, 1)
    await this.setBulk({ hero_images: JSON.stringify(images) })
    return images
  }
}
