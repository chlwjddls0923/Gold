import { getSiteSettings } from '@/lib/api'

export default async function Footer() {
  const settings = await getSiteSettings()

  const phone    = settings.contact_phone ?? '010-9500-8111'
  const email    = settings.contact_email ?? 'hssel0819@gmail.com'
  const bizName  = settings.biz_name      ?? 'Goldsangsa'
  const bizAddr  = settings.biz_address   ?? '충청북도 충주시 가림르116번길 107 (대동)'
  const bizRegNo = settings.biz_reg_no    ?? '752-87-03206'

  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-white font-bold text-base mb-3">GOLDSANGSA</p>
          <p className="leading-relaxed">Korean Bath Care Manufacturer Since 1994</p>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">고객센터 정보</p>
          <p>상담/주문전화: {phone}</p>
          <p className="mt-1">이메일: {email}</p>
        </div>

        <div>
          <p className="text-white font-semibold mb-3">쇼핑몰 기본정보</p>
          <p>상호명: {bizName}</p>
          <p className="mt-1">주소: {bizAddr}</p>
          <p className="mt-1">사업자 등록번호: {bizRegNo}</p>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs text-gray-600">
        Copyright © Goldsangsa. All Rights Reserved.
      </div>
    </footer>
  )
}
