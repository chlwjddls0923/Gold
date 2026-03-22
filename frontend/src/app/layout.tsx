import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AdminProvider } from '@/context/AdminContext'

const geist = Geist({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'GOLDSANGSA | Korean Bath Care Manufacturer',
  description: '1994년부터 이어온 대한민국 목욕용품 전문 제조업체 골드상사입니다.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={geist.className}>
      <body className="min-h-screen flex flex-col">
        <AdminProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AdminProvider>
      </body>
    </html>
  )
}
