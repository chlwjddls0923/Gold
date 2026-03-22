'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string
  isActive: boolean
  category: { name: string } | null
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin'); return }

    const res = await fetch(`${API_URL}/products/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401) { router.push('/admin'); return }
    setProducts(await res.json())
    setLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const token = localStorage.getItem('adminToken')
    await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchProducts()
  }

  useEffect(() => { fetchProducts() }, [])

  if (loading) return <p className="text-gray-400 text-center py-12">불러오는 중...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">상품 관리</h1>
        <Link
          href="/admin/products/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          + 상품 등록
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-400 text-center py-16">등록된 상품이 없습니다.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">이미지</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">상품명</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">카테고리</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">가격</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">공개</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      {product.imageUrl && (
                        <Image
                          src={`${API_URL.replace('/api', '')}${product.imageUrl}`}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.category?.name ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-900">{Number(product.price).toLocaleString()}원</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? '공개' : '비공개'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
