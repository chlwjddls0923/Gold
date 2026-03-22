import { getProducts, getCategories, getSiteSettings } from '@/lib/api'
import ProductGrid from '@/components/ProductGrid'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>
}) {
  const { categoryId } = await searchParams
  const [products, categories, settings] = await Promise.all([
    getProducts(categoryId ? +categoryId : undefined),
    getCategories(),
    getSiteSettings(),
  ])

  const subtitle = [
    settings.about_title1 ?? '오랜 시간,',
    settings.about_title2 ?? '꾸준하게 만들어온 기준',
  ].join(' ')

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-xs text-gray-400">홈 / Products</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
      <p className="text-sm text-gray-500 mb-8">{subtitle}</p>
      <ProductGrid products={products} categories={categories} categoryId={categoryId} />
    </div>
  )
}
