'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'
import ProductForm from '@/components/ProductForm'
import type { Product, Category } from '@/lib/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BASE_URL = API_URL.replace('/api', '')

interface Props {
  products: Product[]
  categories: Category[]
  categoryId?: string
}

type SortKey = 'newest' | 'name' | 'price_asc' | 'price_desc'

function sortProducts(list: Product[], sort: SortKey): Product[] {
  return [...list].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0)
    if (sort === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0)
    // newest: createdAt 내림차순
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export default function ProductGrid({ products, categories, categoryId }: Props) {
  const { isAdmin, token } = useAdmin()
  const router = useRouter()

  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [sort, setSort] = useState<SortKey>('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const sortRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`"${name}"을(를) 삭제하시겠습니까?`)) return
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    router.refresh()
  }

  const handleSuccess = () => {
    setShowAdd(false)
    setEditProduct(null)
    router.refresh()
  }

  const sortedProducts = sortProducts(products, sort)
  const sortLabels: Record<SortKey, string> = {
    newest: '신상품순', name: '상품명', price_asc: '낮은가격', price_desc: '높은가격',
  }

  return (
    <>
      {/* 카테고리 필터 + 추가 버튼 */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/products"
            className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
              !categoryId ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-900'
            }`}
          >
            전체
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                categoryId === String(cat.id) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-900'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {/* 정렬 드롭다운 */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 border border-gray-300 text-gray-600 text-sm px-3 py-1.5 rounded-full hover:border-gray-900 transition-colors"
            >
              {sortLabels[sort]}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {sortOpen && (
              <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
                {(Object.entries(sortLabels) as [SortKey, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSort(key); setSortOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${sort === key ? 'text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {sort === key && <span className="mr-1">✓</span>}{label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              + 상품 등록
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-6">TOTAL {products.length}</p>

      {sortedProducts.length === 0 ? (
        <p className="text-gray-400 text-center py-24">등록된 제품이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sortedProducts.map((product) => (
            <div key={product.id} className="group relative">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
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
                {product.category && <p className="text-xs text-gray-400 mb-0.5">{product.category.name}</p>}
                <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                {product.price != null && (
                  <p className="text-sm text-blue-600 font-bold mt-0.5">{Number(product.price).toLocaleString()}원</p>
                )}
              </Link>

              {/* 관리자 편집/삭제 버튼 */}
              {isAdmin && (
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setEditProduct(product)}
                    className="flex-1 text-xs border border-gray-300 text-gray-600 py-1 rounded-lg hover:border-gray-900 hover:text-gray-900 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="flex-1 text-xs border border-red-200 text-red-500 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 상품 등록 모달 */}
      {showAdd && (
        <ProductModal title="상품 등록" onClose={() => setShowAdd(false)}>
          <ProductForm onSuccess={handleSuccess} />
        </ProductModal>
      )}

      {/* 상품 수정 모달 */}
      {editProduct && (
        <ProductModal title="상품 수정" onClose={() => setEditProduct(null)}>
          <ProductForm
            productId={editProduct.id}
            initialData={{
              name: editProduct.name,
              price: editProduct.price,
              description: editProduct.description ?? '',
              categoryId: editProduct.category?.id ?? null,
              isActive: editProduct.isActive,
              imageUrl: editProduct.imageUrl ?? '',
              detailImages: editProduct.detailImages ?? null,
            }}
            onSuccess={handleSuccess}
          />
        </ProductModal>
      )}
    </>
  )
}

function ProductModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
