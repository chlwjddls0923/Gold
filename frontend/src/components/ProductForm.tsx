'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BASE_URL = API_URL.replace('/api', '')

interface Category { id: number; name: string }

type DetailBlock =
  | { type: 'image'; url: string }
  | { type: 'text'; content: string }

// 신규 상품용 미업로드 블록
type PendingBlock =
  | { type: 'image'; file: File; previewUrl: string }
  | { type: 'text'; content: string }

interface ProductFormProps {
  productId?: number
  initialData?: {
    name: string
    price: number | null
    description: string
    categoryId: number | null
    isActive: boolean
    imageUrl: string
    detailImages: string | null
    inquiryUrl: string | null
  }
  onSuccess?: () => void
}

export default function ProductForm({ productId, initialData, onSuccess }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!productId

  const [name, setName] = useState(initialData?.name ?? '')
  const [price, setPrice] = useState(initialData?.price != null ? String(initialData.price) : '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [categoryId, setCategoryId] = useState<number | ''>(initialData?.categoryId ?? '')
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [inquiryUrl, setInquiryUrl] = useState(initialData?.inquiryUrl ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState(
    initialData?.imageUrl ? `${BASE_URL}${initialData.imageUrl}` : ''
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 편집 모드: 서버에서 받은 블록
  const [blocks, setBlocks] = useState<DetailBlock[]>(() => {
    if (!initialData?.detailImages) return []
    const parsed = JSON.parse(initialData.detailImages)
    return parsed.map((item: string | DetailBlock) =>
      typeof item === 'string' ? { type: 'image', url: item } : item
    )
  })

  // 신규 모드: 로컬 대기 블록
  const [pendingBlocks, setPendingBlocks] = useState<PendingBlock[]>([])
  const [busy, setBusy] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data : []))
  }, [])

  const token = () => localStorage.getItem('adminToken')

  // ── 대표 이미지 ──────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // ── 편집 모드: 이미지 블록 추가 (insertAfter = 직전 블록 인덱스) ──
  const handleAddImage = async (files: File[], insertAfter?: number) => {
    if (isEdit) {
      setBusy(true)
      let updated = [...blocks]
      let currentInsertAfter = insertAfter
      for (const file of files) {
        const fd = new FormData()
        fd.append('image', file)
        if (currentInsertAfter !== undefined) {
          fd.append('insertAfter', String(currentInsertAfter))
        }
        const res = await fetch(`${API_URL}/products/${productId}/detail-images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token()}` },
          body: fd,
        })
        if (res.ok) {
          const data = await res.json()
          updated = data.blocks
          // 다음 파일은 방금 추가된 블록 뒤에 삽입
          if (currentInsertAfter !== undefined) currentInsertAfter += 1
        }
      }
      setBlocks(updated)
      setBusy(false)
    } else {
      const newBlocks: PendingBlock[] = files.map((file) => ({
        type: 'image',
        file,
        previewUrl: URL.createObjectURL(file),
      }))
      if (insertAfter !== undefined) {
        setPendingBlocks((prev) => {
          const next = [...prev]
          next.splice(insertAfter + 1, 0, ...newBlocks)
          return next
        })
      } else {
        setPendingBlocks((prev) => [...prev, ...newBlocks])
      }
    }
  }

  // ── 편집 모드: 텍스트 블록 추가 ──
  const handleAddText = async (insertAfter?: number) => {
    if (isEdit) {
      setBusy(true)
      const res = await fetch(`${API_URL}/products/${productId}/detail-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ content: '', insertAfter }),
      })
      if (res.ok) {
        const data = await res.json()
        setBlocks(data.blocks)
      }
      setBusy(false)
    } else {
      const newBlock: PendingBlock = { type: 'text', content: '' }
      if (insertAfter !== undefined) {
        setPendingBlocks((prev) => {
          const next = [...prev]
          next.splice(insertAfter + 1, 0, newBlock)
          return next
        })
      } else {
        setPendingBlocks((prev) => [...prev, newBlock])
      }
    }
  }

  // ── 편집 모드: 텍스트 블록 내용 저장 ──
  const handleSaveText = async (index: number, content: string) => {
    if (!isEdit) return
    const res = await fetch(`${API_URL}/products/${productId}/detail-blocks/${index}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      const data = await res.json()
      setBlocks(data.blocks)
    }
  }

  // ── 편집 모드: 블록 삭제 ──
  const handleDeleteBlock = async (index: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    if (isEdit) {
      const res = await fetch(`${API_URL}/products/${productId}/detail-images/${index}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBlocks(data.blocks)
      }
    } else {
      setPendingBlocks((prev) => prev.filter((_, i) => i !== index))
    }
  }

  // ── 신규 모드: 텍스트 블록 내용 수정 ──
  const updatePendingText = (index: number, content: string) => {
    setPendingBlocks((prev) =>
      prev.map((b, i) => (i === index && b.type === 'text' ? { ...b, content } : b))
    )
  }

  // ── 폼 제출 ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('name', name)
    if (price) formData.append('price', price)
    formData.append('description', description)
    formData.append('isActive', String(isActive))
    if (categoryId) formData.append('categoryId', String(categoryId))
    if (imageFile) formData.append('image', imageFile)
    if (inquiryUrl) formData.append('inquiryUrl', inquiryUrl)

    const url = isEdit ? `${API_URL}/products/${productId}` : `${API_URL}/products`
    const res = await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body: formData,
    })

    if (res.ok) {
      const saved = await res.json()
      // 신규 상품: 대기 블록 순서대로 업로드
      if (!isEdit && pendingBlocks.length > 0) {
        const pid = saved.id
        for (const block of pendingBlocks) {
          if (block.type === 'image') {
            const fd = new FormData()
            fd.append('image', block.file)
            await fetch(`${API_URL}/products/${pid}/detail-images`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token()}` },
              body: fd,
            })
          } else {
            await fetch(`${API_URL}/products/${pid}/detail-text`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
              body: JSON.stringify({ content: block.content }),
            })
          }
        }
      }
      if (onSuccess) onSuccess()
      else router.push('/admin/products')
    } else {
      setError('저장에 실패했습니다.')
    }
    setLoading(false)
  }

  const displayBlocks = isEdit ? blocks : pendingBlocks

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {/* 대표 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">대표 이미지</label>
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center">
            {previewUrl ? (
              <Image src={previewUrl} alt="미리보기" fill className="object-cover" unoptimized />
            ) : (
              <span className="text-gray-400 text-xs text-center">이미지 없음</span>
            )}
          </div>
          <label className="cursor-pointer text-sm text-blue-600 hover:underline">
            파일 선택
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* 상품명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          placeholder="예) 골드타올"
        />
      </div>

      {/* 가격 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">가격 (원)</label>
        <input
          type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          placeholder="미입력 시 가격 미표시"
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
        <select
          value={categoryId} onChange={(e) => setCategoryId(e.target.value ? +e.target.value : '')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900 bg-white"
        >
          <option value="">카테고리 없음</option>
          {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>

      {/* 간단 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">간단 설명</label>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900 resize-none"
          placeholder="상품 상단에 표시될 짧은 설명"
        />
      </div>

      {/* 구매 문의 링크 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">구매 문의 링크</label>
        <input
          type="text" value={inquiryUrl} onChange={(e) => setInquiryUrl(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900"
          placeholder="예) https://smartstore.naver.com/..."
        />
      </div>

      {/* 공개 여부 */}
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-gray-900" />
        <label htmlFor="isActive" className="text-sm text-gray-700">공개</label>
      </div>

      {/* 상세 콘텐츠 */}
      <div className="border-t border-gray-100 pt-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">상세 콘텐츠</label>
        <p className="text-xs text-gray-400 mb-4">이미지와 텍스트를 원하는 순서로 추가하세요.</p>

        {/* 블록 목록 */}
        <div className="mb-3">
          {displayBlocks.map((block, i) => (
            <div key={i}>
              {/* 블록 본체 */}
              <div className="relative group border border-gray-200 rounded-xl overflow-hidden">
                <span className="absolute top-2 left-2 z-10 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">{i + 1}</span>

                {block.type === 'image' ? (
                  <>
                    {'file' in block ? (
                      <Image src={block.previewUrl} alt="" width={600} height={400} unoptimized className="w-full h-auto" />
                    ) : (
                      <Image src={`${BASE_URL}${block.url}`} alt="" width={600} height={400} unoptimized className="w-full h-auto" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                    <button
                      type="button" onClick={() => handleDeleteBlock(i)}
                      className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >삭제</button>
                  </>
                ) : (
                  <div className="p-3">
                    <TextBlockEditor
                      content={block.content}
                      onDelete={() => handleDeleteBlock(i)}
                      onSave={isEdit ? (c) => handleSaveText(i, c) : undefined}
                      onChange={!isEdit ? (c) => updatePendingText(i, c) : undefined}
                    />
                  </div>
                )}
              </div>

              {/* 블록 아래 삽입 바 — 블록 밖에 렌더링 */}
              <InsertBar
                onAddImage={(files) => handleAddImage(files, i)}
                onAddText={() => handleAddText(i)}
                disabled={busy}
              />
            </div>
          ))}
        </div>

        {/* 맨 아래 추가 버튼 (블록이 없을 때도 표시) */}
        {displayBlocks.length === 0 && (
          <InsertBar
            onAddImage={(files) => handleAddImage(files)}
            onAddText={() => handleAddText()}
            disabled={busy}
            label="콘텐츠 추가"
          />
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="submit" disabled={loading}
          className="w-full sm:w-auto bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {loading ? '저장 중...' : isEdit ? '수정 완료' : '상품 등록'}
        </button>
        <button
          type="button" onClick={() => router.back()}
          className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  )
}

// ── 텍스트 블록 에디터 ──────────────────────────────
function TextBlockEditor({
  content, onDelete, onSave, onChange,
}: {
  content: string
  onDelete: () => void
  onSave?: (c: string) => void
  onChange?: (c: string) => void
}) {
  const [value, setValue] = useState(content)
  const [saved, setSaved] = useState(true)

  const handleChange = (v: string) => {
    setValue(v)
    setSaved(false)
    onChange?.(v)
  }

  const handleSave = () => {
    onSave?.(value)
    setSaved(true)
  }

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
        placeholder="텍스트를 입력하세요..."
        className="w-full text-sm text-gray-700 leading-7 resize-none focus:outline-none bg-transparent"
      />
      <div className="flex justify-end gap-2 mt-1">
        {onSave && !saved && (
          <button type="button" onClick={handleSave} className="text-xs bg-gray-900 text-white px-3 py-1 rounded-lg hover:bg-gray-700">
            저장
          </button>
        )}
        <button type="button" onClick={onDelete} className="text-xs text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50">
          삭제
        </button>
      </div>
    </div>
  )
}

// ── 블록 사이 삽입 바 ────────────────────────────────
function InsertBar({
  onAddImage, onAddText, disabled, label,
}: {
  onAddImage: (files: File[]) => void
  onAddText: () => void
  disabled?: boolean
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-t border-gray-100">
      {label && <span className="text-xs text-gray-400 mr-1">{label}</span>}
      <label className={`cursor-pointer flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-900 transition-colors ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        이미지
        <input
          ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length) { onAddImage(files); e.target.value = '' }
          }}
        />
      </label>
      <button
        type="button" onClick={onAddText} disabled={disabled}
        className="flex items-center gap-1 text-xs text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-lg hover:border-gray-900 transition-colors disabled:opacity-50"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        텍스트
      </button>
    </div>
  )
}
