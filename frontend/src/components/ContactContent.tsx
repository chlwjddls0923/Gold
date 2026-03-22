'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Props {
  settings: Record<string, string>
}

export default function ContactContent({ settings }: Props) {
  const { isAdmin, token } = useAdmin()
  const router = useRouter()

  const aboutTitle1 = settings.about_title1 ?? '오랜 시간,'
  const aboutTitle2 = settings.about_title2 ?? '꾸준하게 만들어온 기준'
  const aboutDesc   = settings.about_desc   ?? '골드상사는 단순히 제품을 판매하는 브랜드가 아니라, 오랜 시간 축적된 제조 경험을 바탕으로 일상 속에서 자주 보이는 목욕용품을 친환경적으로 생산해온 제조 브랜드입니다.'

  const initPhone = settings.contact_phone ?? '010-9500-8111'
  const initEmail = settings.contact_email ?? 'hssel0819@gmail.com'
  const initAddress = settings.contact_address ?? '충청북도 충주시 가림르116번길 107'
  const initBizName = settings.biz_name ?? 'Goldsangsa'
  const initBizOwner = settings.biz_owner ?? '이도균봉 주식회사'
  const initBizAddress = settings.biz_address ?? '충청북도 충주시 가림르116번길 107 (대동)'
  const initBizPhone = settings.biz_phone ?? '010-9500-8111'
  const initBizRegNo = settings.biz_reg_no ?? '752-87-03206'
  const initBizTradeNo = settings.biz_trade_no ?? '신고번호 충청북도 충주시 가림'
  const initInquiryUrl = settings.inquiry_url ?? ''

  const [editing, setEditing] = useState(false)
  const [phone, setPhone] = useState(initPhone)
  const [email, setEmail] = useState(initEmail)
  const [address, setAddress] = useState(initAddress)
  const [bizName, setBizName] = useState(initBizName)
  const [bizOwner, setBizOwner] = useState(initBizOwner)
  const [bizAddress, setBizAddress] = useState(initBizAddress)
  const [bizPhone, setBizPhone] = useState(initBizPhone)
  const [bizRegNo, setBizRegNo] = useState(initBizRegNo)
  const [bizTradeNo, setBizTradeNo] = useState(initBizTradeNo)
  const [inquiryUrl, setInquiryUrl] = useState(initInquiryUrl)
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setPhone(initPhone); setEmail(initEmail); setAddress(initAddress)
    setBizName(initBizName); setBizOwner(initBizOwner); setBizAddress(initBizAddress)
    setBizPhone(initBizPhone); setBizRegNo(initBizRegNo); setBizTradeNo(initBizTradeNo)
    setInquiryUrl(initInquiryUrl)
    setEditing(true)
  }

  const cancel = () => {
    setPhone(initPhone); setEmail(initEmail); setAddress(initAddress)
    setBizName(initBizName); setBizOwner(initBizOwner); setBizAddress(initBizAddress)
    setBizPhone(initBizPhone); setBizRegNo(initBizRegNo); setBizTradeNo(initBizTradeNo)
    setInquiryUrl(initInquiryUrl)
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        contact_phone: phone, contact_email: email, contact_address: address,
        biz_name: bizName, biz_owner: bizOwner, biz_address: bizAddress,
        biz_phone: bizPhone, biz_reg_no: bizRegNo, biz_trade_no: bizTradeNo,
        inquiry_url: inquiryUrl,
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const inlineInput = 'bg-amber-50 border border-amber-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-amber-500 focus:bg-amber-100 w-full transition-colors'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-xs text-gray-400">홈 / Contact</div>
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
        {isAdmin && (
          editing ? (
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={cancel}
                className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={startEdit}
              className="flex items-center gap-1 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              편집
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* 왼쪽: About + 연락처 */}
        <div>
          <p className="text-xs text-gray-400 mb-2">About</p>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{aboutTitle1}</h2>
          <h2 className="text-xl font-bold text-gray-900 mb-6">{aboutTitle2}</h2>
          <p className="text-gray-600 text-sm leading-8 mb-8 whitespace-pre-line">{aboutDesc}</p>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">고객센터 전화</p>
              {editing ? (
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inlineInput} font-semibold text-gray-900`} />
              ) : (
                <p className="font-semibold text-gray-900">{initPhone}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">이메일</p>
              {editing ? (
                <input value={email} onChange={(e) => setEmail(e.target.value)} className={`${inlineInput} font-semibold text-gray-900`} />
              ) : (
                <p className="font-semibold text-gray-900">{initEmail}</p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">주소</p>
              {editing ? (
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={`${inlineInput} font-semibold text-gray-900`} />
              ) : (
                <p className="font-semibold text-gray-900">{initAddress}</p>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: 구매문의 URL + 사업자 정보 */}
        <div className="space-y-6">
          {/* 구매 문의 버튼 URL */}
          <div className="bg-blue-50 rounded-xl p-6 text-sm">
            <p className="font-bold text-gray-900 mb-1">구매 문의 버튼 링크</p>
            <p className="text-xs text-gray-400 mb-3">상품 상세 페이지의 "구매 문의" 버튼이 이동할 주소</p>
            {editing ? (
              <input
                value={inquiryUrl}
                onChange={(e) => setInquiryUrl(e.target.value)}
                placeholder="예) https://open.kakao.com/... 또는 /contact"
                className={`${inlineInput} text-gray-700`}
              />
            ) : (
              <p className="font-semibold text-gray-700 break-all">{initInquiryUrl || '미설정 (기본: /contact)'}</p>
            )}
          </div>

        <div className="bg-gray-50 rounded-xl p-8 text-sm text-gray-600">
          <p className="font-bold text-gray-900 mb-6">쇼핑몰 기본정보</p>
          <div className="space-y-3">
            {([
              { label: '상호명', value: bizName, setter: setBizName },
              { label: '대표자', value: bizOwner, setter: setBizOwner },
              { label: '사업장주소', value: bizAddress, setter: setBizAddress },
              { label: '대표 전화', value: bizPhone, setter: setBizPhone },
              { label: '사업자 등록번호', value: bizRegNo, setter: setBizRegNo },
              { label: '통신판매업', value: bizTradeNo, setter: setBizTradeNo },
            ] as { label: string; value: string; setter: (v: string) => void }[]).map(({ label, value, setter }) => (
              <div key={label} className="flex gap-4">
                <span className="text-gray-400 w-20 sm:w-28 shrink-0">{label}</span>
                {editing ? (
                  <input value={value} onChange={(e) => setter(e.target.value)} className={`${inlineInput} text-gray-600`} />
                ) : (
                  <span>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
