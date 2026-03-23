'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BASE_URL = API_URL.replace('/api', '')

export type HeroImage = { url: string; link: string }

interface HeroSliderProps {
  images: HeroImage[]
  interval?: number
  buttonLabel?: string
  mode?: 'timer' | 'arrow'
}

export default function HeroSlider({ images, interval = 3, buttonLabel = '제품보기', mode = 'timer' }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)
  const [showEdit, setShowEdit] = useState(false)
  const { isAdmin, token } = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (images.length <= 1 || mode !== 'timer') return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, interval * 1000)
    return () => clearInterval(timer)
  }, [images.length, interval, mode])

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  const currentLink = images[current]?.link ?? ''

  return (
    <>
      <section className="relative w-full h-[45vh] max-h-[480px] overflow-hidden bg-black">
        {images.length > 0 ? (
          images.map(({ url }, i) => (
            <div
              key={url}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image src={url} alt="" fill unoptimized className="object-cover blur-xl scale-110 opacity-40" aria-hidden />
              <Image src={url} alt={`히어로 배너 ${i + 1}`} fill unoptimized className="object-contain" priority={i === 0} />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400" />
        )}

        {/* 화살표 */}
        {mode === 'arrow' && images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              aria-label="이전 배너"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              aria-label="다음 배너"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* 버튼 + 점 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
          {currentLink && (
            <Link
              href={currentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 hover:bg-white text-gray-900 text-sm font-medium px-6 py-2 rounded-full shadow transition-colors"
            >
              {buttonLabel}
            </Link>
          )}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`}
                  aria-label={`${i + 1}번 이미지로 이동`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 관리자 편집 버튼 */}
        {isAdmin && (
          <button
            onClick={() => setShowEdit(true)}
            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            배너 편집
          </button>
        )}
      </section>

      {showEdit && (
        <HeroBannerEditModal
          images={images}
          interval={interval}
          buttonLabel={buttonLabel}
          mode={mode}
          token={token}
          onClose={() => setShowEdit(false)}
          onSaved={() => { router.refresh() }}
        />
      )}
    </>
  )
}

function HeroBannerEditModal({
  images: initialImages,
  interval: initialInterval,
  buttonLabel: initialButtonLabel,
  mode: initialMode,
  token,
  onClose,
  onSaved,
}: {
  images: HeroImage[]
  interval: number
  buttonLabel: string
  mode: 'timer' | 'arrow'
  token: string | null
  onClose: () => void
  onSaved: () => void
}) {
  const [localImages, setLocalImages] = useState<HeroImage[]>(
    initialImages.map(({ url, link }) => {
      try { return { url: new URL(url).pathname, link } } catch { return { url, link } }
    })
  )
  const [currentInterval, setCurrentInterval] = useState(initialInterval)
  const [btnLabel, setBtnLabel] = useState(initialButtonLabel)
  const [currentMode, setCurrentMode] = useState<'timer' | 'arrow'>(initialMode)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [newLink, setNewLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingLinkIdx, setSavingLinkIdx] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const showMsg = (t: string) => { setMsg(t); setTimeout(() => setMsg(''), 3000) }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const addImage = async () => {
    if (!file) return
    setSaving(true)
    const formData = new FormData()
    formData.append('image', file)
    formData.append('link', newLink)
    const res = await fetch(`${API_URL}/site-settings/hero-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (res.ok) {
      const data = await res.json()
      setLocalImages(data.images)
      setFile(null)
      setPreview('')
      setNewLink('')
      if (fileRef.current) fileRef.current.value = ''
      showMsg('이미지가 추가되었습니다.')
      onSaved()
    } else {
      showMsg('업로드에 실패했습니다.')
    }
    setSaving(false)
  }

  const updateLink = async (index: number, link: string) => {
    setSavingLinkIdx(index)
    const res = await fetch(`${API_URL}/site-settings/hero-image/${index}/link`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ link }),
    })
    if (res.ok) {
      const data = await res.json()
      setLocalImages(data.images)
      showMsg('링크가 저장되었습니다.')
      onSaved()
    }
    setSavingLinkIdx(null)
  }

  const deleteImage = async (index: number) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return
    const res = await fetch(`${API_URL}/site-settings/hero-image/${index}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setLocalImages(data.images)
      showMsg('삭제되었습니다.')
      onSaved()
    }
  }

  const saveInterval = async (sec: number) => {
    setCurrentInterval(sec)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hero_interval: String(sec) }),
    })
    showMsg('전환 속도가 저장되었습니다.')
    onSaved()
  }

  const saveMode = async (mode: 'timer' | 'arrow') => {
    setCurrentMode(mode)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hero_mode: mode }),
    })
    showMsg('슬라이드 방식이 저장되었습니다.')
    onSaved()
  }

  const saveButtonLabel = async () => {
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ hero_button_label: btnLabel }),
    })
    showMsg('버튼 텍스트가 저장되었습니다.')
    onSaved()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">배너 편집</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-6">
          {msg && (
            <div className="px-4 py-2 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">{msg}</div>
          )}

          {/* 슬라이드 방식 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">슬라이드 방식</p>
            <div className="flex gap-2">
              <button
                onClick={() => saveMode('timer')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  currentMode === 'timer'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:border-gray-900'
                }`}
              >
                ⏱ 타이머 자동 전환
              </button>
              <button
                onClick={() => saveMode('arrow')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  currentMode === 'arrow'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:border-gray-900'
                }`}
              >
                ← 화살표 수동 전환
              </button>
            </div>
          </div>

          {/* 전환 속도 (타이머 모드일 때만) */}
          {currentMode === 'timer' && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-sm font-medium text-gray-700 mb-3">전환 속도</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => saveInterval(sec)}
                    className={`w-11 h-10 rounded-lg text-sm font-medium border transition-colors ${
                      currentInterval === sec
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'border-gray-300 text-gray-600 hover:border-gray-900'
                    }`}
                  >
                    {sec}초
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 등록된 이미지 */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-3">등록된 이미지 ({localImages.length}장)</p>
            {localImages.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-lg">등록된 이미지 없음</p>
            ) : (
              <div className="space-y-3">
                {localImages.map(({ url, link }, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex gap-3 items-start">
                      <div className="relative w-20 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <Image src={`${BASE_URL}${url}`} alt={`배너 ${i + 1}`} fill unoptimized className="object-cover" />
                        <span className="absolute top-1 left-1.5 bg-black/50 text-white text-xs px-1 rounded">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <LinkEditor
                          index={i}
                          initialLink={link}
                          saving={savingLinkIdx === i}
                          onSave={(lnk) => updateLink(i, lnk)}
                        />
                      </div>
                      <button
                        onClick={() => deleteImage(i)}
                        className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50 shrink-0"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 이미지 추가 */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-3">이미지 추가</p>
            {preview && (
              <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                <Image src={preview} alt="미리보기" fill unoptimized className="object-cover" />
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
                  파일 선택
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                {file && <span className="text-xs text-gray-500 truncate max-w-[120px]">{file.name}</span>}
              </div>
              <input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="이동할 링크 (예: /products 또는 https://...)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
              />
              <button
                onClick={addImage}
                disabled={!file || saving}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-40"
              >
                {saving ? '추가 중...' : '+ 추가'}
              </button>
            </div>
          </div>

          {/* 버튼 텍스트 */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-3">버튼 텍스트</p>
            <div className="flex gap-2">
              <input
                value={btnLabel}
                onChange={(e) => setBtnLabel(e.target.value)}
                placeholder="예: 제품보기"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
              />
              <button
                onClick={saveButtonLabel}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function LinkEditor({
  index,
  initialLink,
  saving,
  onSave,
}: {
  index: number
  initialLink: string
  saving: boolean
  onSave: (link: string) => void
}) {
  const [link, setLink] = useState(initialLink)
  return (
    <div className="flex gap-1.5 items-center">
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="링크 없음"
        className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-gray-900 min-w-0"
      />
      <button
        onClick={() => onSave(link)}
        disabled={saving}
        className="text-xs bg-gray-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 shrink-0"
      >
        {saving ? '...' : '저장'}
      </button>
    </div>
  )
}
