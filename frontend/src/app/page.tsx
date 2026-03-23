import Image from 'next/image'
import Link from 'next/link'
import { getFeaturedProducts, getSiteSettings } from '@/lib/api'
import HeroSlider from '@/components/HeroSlider'
import BrandSection from '@/components/BrandSection'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BASE_URL = API_URL.replace('/api', '')

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeaturedProducts(), getSiteSettings()])

  type HeroImage = { url: string; link: string }
  const heroImages: HeroImage[] = settings.hero_images
    ? JSON.parse(settings.hero_images).map((item: string | HeroImage) => {
        if (typeof item === 'string') return { url: `${BASE_URL}${item}`, link: '' }
        return { url: `${BASE_URL}${item.url}`, link: item.link ?? '' }
      })
    : []
  const heroInterval = settings.hero_interval ? Number(settings.hero_interval) : 3
  const heroButtonLabel = settings.hero_button_label ?? '제품보기'
  const heroMode = (settings.hero_mode as 'timer' | 'arrow') ?? 'timer'

  return (
    <div>
      <HeroSlider images={heroImages} interval={heroInterval} buttonLabel={heroButtonLabel} mode={heroMode} />

      {/* 브랜드 소개 한 줄 */}
      <section className="bg-gray-50 py-6 text-center text-sm text-gray-500">
        <p>피부 본연의 강화 — 1994년부터 이어온 대한민국 목욕용품 전문 제조업체</p>
      </section>

      {/* 인기 제품 */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">주요 제품</h2>
        {featured.length === 0 ? (
          <p className="text-gray-400 text-center py-12">등록된 제품이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-gray-100">
                  {product.imageUrl && (
                    <Image
                      src={`${BASE_URL}${product.imageUrl}`}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4">
                  {product.category && (
                    <p className="text-xs text-gray-400 mb-1">{product.category.name}</p>
                  )}
                  <p className="font-semibold text-gray-900">{product.name}</p>
                  {product.price != null && Number(product.price) > 0 && (
                    <p className="text-blue-600 font-bold mt-1">
                      {Number(product.price).toLocaleString()}원
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-block border border-gray-900 text-gray-900 px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors"
          >
            전체 제품 보기
          </Link>
        </div>
      </section>

      <BrandSection settings={settings} />
    </div>
  )
}
