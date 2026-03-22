'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

function AutoTextarea({ value, onChange, className }: { value: string; onChange: (v: string) => void; className: string }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) { ref.current.style.height = 'auto'; ref.current.style.height = ref.current.scrollHeight + 'px' }
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      className={className}
      style={{ resize: 'none', overflow: 'hidden' }}
    />
  )
}

interface Props {
  settings: Record<string, string>
}

export default function AboutContent({ settings }: Props) {
  const { isAdmin, token } = useAdmin()
  const router = useRouter()

  const initTitle1   = settings.about_title1   ?? '오랜 시간,'
  const initTitle2   = settings.about_title2   ?? '꾸준하게 만들어온 기준'
  const initDesc     = settings.about_desc     ?? '골드상사는 단순히 제품을 판매하는 브랜드가 아니라, 오랜 시간 축적된 제조 경험을 바탕으로 일상 속에서 자주 보이는 목욕용품을 친환경적으로 생산해온 제조 브랜드입니다.'
  const initDesc2    = settings.about_desc2    ?? '한국식 바디 케어 문화의 핵심을 담아오면서도, 누구나 편하게 사용할 수 있는 제품을 만들어왔습니다. 사용감은 편안하게, 품질은 꾸준하게, 디자인은 군더더기 없어 정리됩니다.'
  const initDesc3    = settings.about_desc3    ?? '기본에 충실한 제품으로 오래 사랑받는다는 믿음으로, 골드상사는 신뢰할 수 있는 생활용품을 꾸준히 제공합니다.'
  const initYear         = settings.about_year          ?? '1994년'
  const initProduct      = settings.about_product       ?? '때밀이 타올, 목욕용품'
  const initMethod       = settings.about_method        ?? '친환경 국내 제조'
  const initMaterial     = settings.about_material      ?? '천연 소재 기반'
  const initLabelYear    = settings.about_label_year    ?? '설립연도'
  const initLabelProduct = settings.about_label_product ?? '주력 제품'
  const initLabelMethod  = settings.about_label_method  ?? '생산 방식'
  const initLabelMat     = settings.about_label_mat     ?? '소재'

  const [editing, setEditing] = useState(false)
  const [title1,       setTitle1]       = useState(initTitle1)
  const [title2,       setTitle2]       = useState(initTitle2)
  const [desc,         setDesc]         = useState(initDesc)
  const [desc2,        setDesc2]        = useState(initDesc2)
  const [desc3,        setDesc3]        = useState(initDesc3)
  const [year,         setYear]         = useState(initYear)
  const [product,      setProduct]      = useState(initProduct)
  const [method,       setMethod]       = useState(initMethod)
  const [material,     setMaterial]     = useState(initMaterial)
  const [labelYear,    setLabelYear]    = useState(initLabelYear)
  const [labelProduct, setLabelProduct] = useState(initLabelProduct)
  const [labelMethod,  setLabelMethod]  = useState(initLabelMethod)
  const [labelMat,     setLabelMat]     = useState(initLabelMat)
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setTitle1(initTitle1); setTitle2(initTitle2)
    setDesc(initDesc); setDesc2(initDesc2); setDesc3(initDesc3)
    setYear(initYear); setProduct(initProduct); setMethod(initMethod); setMaterial(initMaterial)
    setLabelYear(initLabelYear); setLabelProduct(initLabelProduct)
    setLabelMethod(initLabelMethod); setLabelMat(initLabelMat)
    setEditing(true)
  }

  const cancel = () => {
    setTitle1(initTitle1); setTitle2(initTitle2)
    setDesc(initDesc); setDesc2(initDesc2); setDesc3(initDesc3)
    setYear(initYear); setProduct(initProduct); setMethod(initMethod); setMaterial(initMaterial)
    setLabelYear(initLabelYear); setLabelProduct(initLabelProduct)
    setLabelMethod(initLabelMethod); setLabelMat(initLabelMat)
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        about_title1: title1, about_title2: title2,
        about_desc: desc, about_desc2: desc2, about_desc3: desc3,
        about_year: year, about_product: product, about_method: method, about_material: material,
        about_label_year: labelYear, about_label_product: labelProduct,
        about_label_method: labelMethod, about_label_mat: labelMat,
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const ed = 'bg-amber-50 border border-amber-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-amber-500 focus:bg-amber-100 w-full transition-colors'
  // 회사 정보 카드는 배경이 gray-50이라 amber-50이 잘 안 보여서 흰색 배경 + 진한 테두리 사용
  const edCard = 'bg-white border border-amber-400 rounded-md px-2 py-1 focus:outline-none focus:border-amber-600 flex-1 min-w-0 transition-colors text-right font-medium'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-xs text-gray-400">홈 / About</div>
      <div className="flex items-center gap-3 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">About</h1>
        {isAdmin && (
          editing ? (
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50">
                {saving ? '저장 중...' : '저장'}
              </button>
              <button onClick={cancel} className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                취소
              </button>
            </div>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-1 text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              편집
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
        {/* 왼쪽: 소개 텍스트 */}
        <div>
          <p className="text-xs text-gray-400 mb-2">About</p>
          {editing ? (
            <>
              <input value={title1} onChange={(e) => setTitle1(e.target.value)} className={`${ed} text-2xl font-bold text-gray-900 mb-1 block`} />
              <input value={title2} onChange={(e) => setTitle2(e.target.value)} className={`${ed} text-2xl font-bold text-gray-900 mb-6 block mt-1`} />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{initTitle1}</h2>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{initTitle2}</h2>
            </>
          )}
          {editing ? (
            <>
              <AutoTextarea value={desc}  onChange={setDesc}  className={`${ed} text-gray-600 leading-8 text-sm block`} />
              <AutoTextarea value={desc2} onChange={setDesc2} className={`${ed} text-gray-600 leading-8 text-sm block mt-4`} />
              <AutoTextarea value={desc3} onChange={setDesc3} className={`${ed} text-gray-600 leading-8 text-sm block mt-4`} />
            </>
          ) : (
            <>
              <p className="text-gray-600 leading-8 text-sm whitespace-pre-wrap px-2 border border-transparent">{initDesc}</p>
              <p className="text-gray-600 leading-8 text-sm mt-4 whitespace-pre-wrap px-2 border border-transparent">{initDesc2}</p>
              <p className="text-gray-600 leading-8 text-sm mt-4 whitespace-pre-wrap px-2 border border-transparent">{initDesc3}</p>
            </>
          )}
        </div>

        {/* 오른쪽: 회사 정보 카드 */}
        <div className={`rounded-xl p-8 transition-colors ${editing ? 'bg-white border-2 border-amber-300' : 'bg-gray-50'}`}>
          <p className="text-sm font-bold text-gray-900 mb-6">Korean Bath Care Manufacturer Since 1994</p>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex justify-between items-center gap-3 pb-3 border-b border-gray-100">
              {editing
                ? <input value={labelYear} onChange={(e) => setLabelYear(e.target.value)} className="bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 text-gray-400 text-xs w-24 shrink-0 focus:outline-none" />
                : <span className="text-gray-400 shrink-0">{labelYear}</span>}
              {editing
                ? <input value={year} onChange={(e) => setYear(e.target.value)} className={edCard} />
                : <span className="font-medium">{year}</span>}
            </div>
            <div className="flex justify-between items-center gap-3 pb-3 border-b border-gray-100">
              {editing
                ? <input value={labelProduct} onChange={(e) => setLabelProduct(e.target.value)} className="bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 text-gray-400 text-xs w-24 shrink-0 focus:outline-none" />
                : <span className="text-gray-400 shrink-0">{labelProduct}</span>}
              {editing
                ? <input value={product} onChange={(e) => setProduct(e.target.value)} className={edCard} />
                : <span className="font-medium">{product}</span>}
            </div>
            <div className="flex justify-between items-center gap-3 pb-3 border-b border-gray-100">
              {editing
                ? <input value={labelMethod} onChange={(e) => setLabelMethod(e.target.value)} className="bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 text-gray-400 text-xs w-24 shrink-0 focus:outline-none" />
                : <span className="text-gray-400 shrink-0">{labelMethod}</span>}
              {editing
                ? <input value={method} onChange={(e) => setMethod(e.target.value)} className={edCard} />
                : <span className="font-medium">{method}</span>}
            </div>
            <div className="flex justify-between items-center gap-3">
              {editing
                ? <input value={labelMat} onChange={(e) => setLabelMat(e.target.value)} className="bg-amber-50 border border-amber-300 rounded px-1.5 py-0.5 text-gray-400 text-xs w-24 shrink-0 focus:outline-none" />
                : <span className="text-gray-400 shrink-0">{labelMat}</span>}
              {editing
                ? <input value={material} onChange={(e) => setMaterial(e.target.value)} className={edCard} />
                : <span className="font-medium">{material}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
