import { notFound } from 'next/navigation'
import ProductForm from '@/components/ProductForm'

const SERVER_API_URL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const res = await fetch(`${SERVER_API_URL}/products/${id}`, { cache: 'no-store' })
  if (!res.ok) notFound()

  const product = await res.json()

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">상품 수정</h1>
      <ProductForm
        productId={product.id}
        initialData={{
          name: product.name,
          price: product.price,
          description: product.description ?? '',
          categoryId: product.category?.id ?? null,
          isActive: product.isActive,
          imageUrl: product.imageUrl ?? '',
          detailImages: product.detailImages ?? null,
        }}
      />
    </div>
  )
}
