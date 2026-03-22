'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BASE_URL = API_URL.replace('/api', '')

type Step = { step: string; title: string; desc: string }

const defaultSteps: Step[] = [
  { step: '01', title: '원자재 선별', desc: '친환경 소재를 엄선하여 원자재를 선별합니다.' },
  { step: '02', title: '직조 및 가공', desc: '1994년부터 축적된 노하우로 최적의 밀도와 조직감을 가진 타올을 직조합니다.' },
  { step: '03', title: '품질 검사', desc: '완성된 제품은 엄격한 품질 기준에 따라 검사를 거칩니다.' },
  { step: '04', title: '포장 및 출고', desc: '검사를 통과한 제품만 포장하여 출고됩니다.' },
]

export default function AdminSettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'hero' | 'manufacturing' | 'contact'>('hero')

  // 히어로 (다중 이미지)
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [heroInterval, setHeroInterval] = useState(3)
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [heroPreview, setHeroPreview] = useState('')

  // 제조 과정
  const [mfIntro, setMfIntro] = useState('')
  const [mfSteps, setMfSteps] = useState<Step[]>(defaultSteps)

  // 연락처
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [bizName, setBizName] = useState('')
  const [bizOwner, setBizOwner] = useState('')
  const [bizAddress, setBizAddress] = useState('')
  const [bizPhone, setBizPhone] = useState('')
  const [bizRegNo, setBizRegNo] = useState('')
  const [bizTradeNo, setBizTradeNo] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) { router.push('/admin'); return }

    fetch(`${API_URL}/site-settings`)
      .then((r) => r.json())
      .then((s: Record<string, string>) => {
        setHeroImages(s.hero_images ? JSON.parse(s.hero_images) : [])
        setHeroInterval(s.hero_interval ? Number(s.hero_interval) : 3)
        setMfIntro(s.manufacturing_intro ?? '골드상사는 단순히 제품을 판매하는 브랜드가 아니라, 오랜 시간 축적된 제조 경험을 바탕으로 일상 속에서 자주 보이는 목욕용품을 친환경적으로 생산해온 제조 브랜드입니다.')
        setMfSteps(s.manufacturing_steps ? JSON.parse(s.manufacturing_steps) : defaultSteps)
        setPhone(s.contact_phone ?? '010-9500-8111')
        setEmail(s.contact_email ?? 'hssel0819@gmail.com')
        setAddress(s.contact_address ?? '충청북도 충주시 가림르116번길 107')
        setBizName(s.biz_name ?? 'Goldsangsa')
        setBizOwner(s.biz_owner ?? '이도균봉 주식회사')
        setBizAddress(s.biz_address ?? '충청북도 충주시 가림르116번길 107 (대동)')
        setBizPhone(s.biz_phone ?? '010-9500-8111')
        setBizRegNo(s.biz_reg_no ?? '752-87-03206')
        setBizTradeNo(s.biz_trade_no ?? '신고번호 충청북도 충주시 가림')
        setLoading(false)
      })
  }, [router])

  const getToken = () => localStorage.getItem('adminToken') ?? ''

  const showMsg = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setHeroFile(file)
    setHeroPreview(URL.createObjectURL(file))
  }

  const saveHeroInterval = async (value: number) => {
    setHeroInterval(value)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ hero_interval: String(value) }),
    })
    showMsg('전환 속도가 저장되었습니다.')
  }

  const addHeroImage = async () => {
    if (!heroFile) return
    setSaving(true)
    const formData = new FormData()
    formData.append('image', heroFile)
    const res = await fetch(`${API_URL}/site-settings/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    })
    if (res.ok) {
      const data = await res.json()
      setHeroImages(data.images)
      setHeroFile(null)
      setHeroPreview('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      showMsg('이미지가 추가되었습니다.')
    } else {
      showMsg('저장에 실패했습니다.')
    }
    setSaving(false)
  }

  const deleteHeroImage = async (index: number) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return
    const res = await fetch(`${API_URL}/site-settings/hero-image/${index}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.ok) {
      const data = await res.json()
      setHeroImages(data.images)
      showMsg('삭제되었습니다.')
    }
  }

  const saveManufacturing = async () => {
    setSaving(true)
    const res = await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        manufacturing_intro: mfIntro,
        manufacturing_steps: JSON.stringify(mfSteps),
      }),
    })
    showMsg(res.ok ? '저장되었습니다.' : '저장에 실패했습니다.')
    setSaving(false)
  }

  const saveContact = async () => {
    setSaving(true)
    const res = await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({
        contact_phone: phone, contact_email: email, contact_address: address,
        biz_name: bizName, biz_owner: bizOwner, biz_address: bizAddress,
        biz_phone: bizPhone, biz_reg_no: bizRegNo, biz_trade_no: bizTradeNo,
      }),
    })
    showMsg(res.ok ? '저장되었습니다.' : '저장에 실패했습니다.')
    setSaving(false)
  }

  const updateStep = (i: number, field: keyof Step, val: string) => {
    setMfSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  if (loading) return <p className="text-gray-400 text-center py-12">불러오는 중...</p>

  const tabClass = (t: string) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">사이트 설정</h1>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-6">
        <button className={tabClass('hero')} onClick={() => setActiveTab('hero')}>히어로 배너</button>
        <button className={tabClass('manufacturing')} onClick={() => setActiveTab('manufacturing')}>제조 과정</button>
        <button className={tabClass('contact')} onClick={() => setActiveTab('contact')}>연락처</button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
          {msg}
        </div>
      )}

      {/* 히어로 배너 탭 */}
      {activeTab === 'hero' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <p className={labelClass}>등록된 배너 이미지 ({heroImages.length}장)</p>
            <p className="text-xs text-gray-400 mb-4">이미지가 순서대로 1.5초마다 자동 전환됩니다.</p>

            {heroImages.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                등록된 이미지가 없습니다.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {heroImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={`${BASE_URL}${url}`}
                        alt={`배너 ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <div className="absolute top-1.5 left-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                      {i + 1}
                    </div>
                    <button
                      onClick={() => deleteHeroImage(i)}
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 전환 속도 설정 */}
          <div className="border-t border-gray-100 pt-5">
            <p className={labelClass}>전환 속도</p>
            <p className="text-xs text-gray-400 mb-3">이미지가 몇 초마다 바뀔지 설정합니다.</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((sec) => (
                <button
                  key={sec}
                  onClick={() => saveHeroInterval(sec)}
                  className={`w-12 h-10 rounded-lg text-sm font-medium border transition-colors ${
                    heroInterval === sec
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-300 text-gray-600 hover:border-gray-900'
                  }`}
                >
                  {sec}초
                </button>
              ))}
            </div>
          </div>

          {/* 새 이미지 추가 */}
          <div className="border-t border-gray-100 pt-5">
            <p className={labelClass}>이미지 추가</p>
            {heroPreview && (
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3 max-w-sm">
                <Image src={heroPreview} alt="미리보기" fill unoptimized className="object-cover" />
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <label className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                파일 선택
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleHeroFileChange} className="hidden" />
              </label>
              {heroFile && <span className="text-xs text-gray-500">{heroFile.name}</span>}
              <button
                onClick={addHeroImage}
                disabled={!heroFile || saving}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                {saving ? '추가 중...' : '+ 추가'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 제조 과정 탭 */}
      {activeTab === 'manufacturing' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <label className={labelClass}>소개 문구</label>
            <textarea
              value={mfIntro}
              onChange={(e) => setMfIntro(e.target.value)}
              rows={4}
              className={inputClass + ' resize-none'}
            />
          </div>
          <div className="space-y-4">
            <p className={labelClass}>제조 단계 (4단계)</p>
            {mfSteps.map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400">단계 {s.step}</p>
                <input
                  value={s.title}
                  onChange={(e) => updateStep(i, 'title', e.target.value)}
                  className={inputClass}
                  placeholder="단계 제목"
                />
                <textarea
                  value={s.desc}
                  onChange={(e) => updateStep(i, 'desc', e.target.value)}
                  rows={2}
                  className={inputClass + ' resize-none'}
                  placeholder="단계 설명"
                />
              </div>
            ))}
          </div>
          <button
            onClick={saveManufacturing}
            disabled={saving}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}

      {/* 연락처 탭 */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <p className="text-sm font-semibold text-gray-700">연락처 정보</p>
          {[
            { label: '전화번호', value: phone, set: setPhone },
            { label: '이메일', value: email, set: setEmail },
            { label: '주소', value: address, set: setAddress },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input value={value} onChange={(e) => set(e.target.value)} className={inputClass} />
            </div>
          ))}

          <p className="text-sm font-semibold text-gray-700 pt-2">사업자 정보</p>
          {[
            { label: '상호명', value: bizName, set: setBizName },
            { label: '대표자', value: bizOwner, set: setBizOwner },
            { label: '사업장 주소', value: bizAddress, set: setBizAddress },
            { label: '대표 전화', value: bizPhone, set: setBizPhone },
            { label: '사업자 등록번호', value: bizRegNo, set: setBizRegNo },
            { label: '통신판매업 신고번호', value: bizTradeNo, set: setBizTradeNo },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className={labelClass}>{label}</label>
              <input value={value} onChange={(e) => set(e.target.value)} className={inputClass} />
            </div>
          ))}

          <button
            onClick={saveContact}
            disabled={saving}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      )}
    </div>
  )
}
