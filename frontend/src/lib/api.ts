// 서버사이드(SSR): Docker 내부 서비스명 사용
// 클라이언트사이드(브라우저): localhost 사용
const SERVER_API_URL = process.env.API_INTERNAL_URL || 'http://localhost:4000/api'

export interface Category {
  id: number
  name: string
  slug: string
}

export interface Product {
  id: number
  name: string
  price: number | null
  description: string
  imageUrl: string
  isActive: boolean
  detailImages: string | null  // JSON string[]
  inquiryUrl: string | null
  category: Category | null
  createdAt: string
}

export async function getProducts(categoryId?: number): Promise<Product[]> {
  const url = categoryId
    ? `${SERVER_API_URL}/products?categoryId=${categoryId}`
    : `${SERVER_API_URL}/products`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function getProduct(id: number): Promise<Product | null> {
  const res = await fetch(`${SERVER_API_URL}/products/${id}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${SERVER_API_URL}/categories`, { cache: 'no-store' })
  if (!res.ok) return []
  return res.json()
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts()
  return products.slice(0, 3)
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  const res = await fetch(`${SERVER_API_URL}/site-settings`, { cache: 'no-store' })
  if (!res.ok) return {}
  return res.json()
}
