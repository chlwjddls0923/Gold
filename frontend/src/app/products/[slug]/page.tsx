import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getSiteSettings } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BASE_URL = API_URL.replace('/api', '')

export const dynamic = 'force-dynamic'

type DetailBlock =
  | { type: 'image'; url: string }
  | { type: 'text'; content: string }

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProduct(+slug), getSiteSettings()])

  if (!product) notFound()

  const inquiryUrl = product.inquiryUrl || null
  const isExternal = inquiryUrl?.startsWith('http') ?? false
  const inquiryLabel = product.inquiryLabel || '구매 문의'

  const detailBlocks: DetailBlock[] = product.detailImages
    ? (JSON.parse(product.detailImages) as (string | DetailBlock)[]).map((item) =>
        typeof item === 'string' ? { type: 'image', url: item } : item,
      )
    : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-4 text-xs text-gray-400">
        홈 / <Link href="/products" className="hover:underline">Products</Link> / {product.name}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 대표 이미지 */}
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.imageUrl && (
            <Image
              src={`${BASE_URL}${product.imageUrl}`}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* 기본 정보 */}
        <div className="flex flex-col justify-center">
          {product.category && (
            <p className="text-sm text-gray-400 mb-2">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          {product.price != null && Number(product.price) > 0 && (
            <p className="text-2xl font-bold text-blue-600 mb-6">
              {Number(product.price).toLocaleString()}원
            </p>
          )}
          {product.description && (
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">상품 설명</p>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-all text-sm">
                {product.description}
              </p>
            </div>
          )}
          {inquiryUrl && (
            <div className="mt-8">
              <Link
                href={inquiryUrl}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                {inquiryLabel}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 상세 콘텐츠 (이미지 + 텍스트 블록) */}
      {detailBlocks.length > 0 && (
        <div className="mt-16 border-t border-gray-100 pt-12 max-w-2xl mx-auto">
          {detailBlocks.map((block, i) =>
            block.type === 'image' ? (
              <Image
                key={i}
                src={`${BASE_URL}${block.url}`}
                alt={`${product.name} 상세 ${i + 1}`}
                width={800}
                height={600}
                unoptimized
                className="w-full h-auto"
              />
            ) : (
              <div key={i} className="px-4 py-8 text-gray-700 leading-8 whitespace-pre-wrap text-sm">
                {block.content}
              </div>
            ),
          )}
        </div>
      )}

      <div className="mt-12 text-center">
        <Link href="/products" className="text-sm text-gray-500 hover:text-gray-900 underline">
          ← 전체 제품으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
