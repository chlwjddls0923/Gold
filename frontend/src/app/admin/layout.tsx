'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navClass = (href: string) =>
    `text-sm px-3 py-1.5 rounded-lg transition-colors ${
      pathname.startsWith(href)
        ? 'bg-gray-900 text-white'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-gray-900">GOLDSANGSA</span>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">관리자</span>
          <nav className="flex gap-1 ml-2">
            <Link href="/admin/products" className={navClass('/admin/products')}>상품 관리</Link>
            <Link href="/admin/settings" className={navClass('/admin/settings')}>사이트 설정</Link>
          </nav>
        </div>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900 shrink-0">
          사이트 보기 →
        </a>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
