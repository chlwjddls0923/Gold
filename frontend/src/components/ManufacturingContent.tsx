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

type Step = { step: string; title: string; desc: string }

const defaultSteps: Step[] = [
  { step: '01', title: '원자재 선별', desc: '친환경 소재를 엄선하여 원자재를 선별합니다. 피부에 자극이 없고 내구성이 뛰어난 소재만을 사용합니다.' },
  { step: '02', title: '직조 및 가공', desc: '1994년부터 축적된 노하우로 최적의 밀도와 조직감을 가진 타올을 직조합니다.' },
  { step: '03', title: '품질 검사', desc: '완성된 제품은 엄격한 품질 기준에 따라 검사를 거칩니다. 규격, 내구성, 안전성을 모두 확인합니다.' },
  { step: '04', title: '포장 및 출고', desc: '검사를 통과한 제품만 포장하여 출고됩니다. 위생적인 포장으로 최상의 상태를 유지합니다.' },
]

interface Props {
  settings: Record<string, string>
}

export default function ManufacturingContent({ settings }: Props) {
  const { isAdmin, token } = useAdmin()
  const router = useRouter()

  const aboutTitle1 = settings.about_title1 ?? '오랜 시간,'
  const aboutTitle2 = settings.about_title2 ?? '꾸준하게 만들어온 기준'
  const aboutDesc   = settings.about_desc   ?? '골드상사는 단순히 제품을 판매하는 브랜드가 아니라, 오랜 시간 축적된 제조 경험을 바탕으로 일상 속에서 자주 보이는 목욕용품을 친환경적으로 생산해온 제조 브랜드입니다.'

  const initSteps: Step[] = settings.manufacturing_steps
    ? JSON.parse(settings.manufacturing_steps)
    : defaultSteps

  const [editing, setEditing] = useState(false)
  const [steps, setSteps] = useState<Step[]>(initSteps)
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setSteps(initSteps)
    setEditing(true)
  }

  const cancel = () => {
    setSteps(initSteps)
    setEditing(false)
  }

  const save = async () => {
    setSaving(true)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        manufacturing_steps: JSON.stringify(steps),
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const updateStep = (i: number, field: keyof Step, val: string) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))

  const editableText = 'bg-amber-50 border border-amber-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-amber-500 focus:bg-amber-100 w-full resize-none transition-colors'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-2 text-xs text-gray-400">홈 / Manufacturing</div>

      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Manufacturing</h1>
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

      {/* 소개 섹션 — About 페이지와 공유 */}
      <div className="mb-12">
        <p className="text-xs text-gray-400 mb-2">About</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{aboutTitle1}</h2>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{aboutTitle2}</h2>
        <p className="text-gray-600 leading-8 text-sm max-w-2xl whitespace-pre-line">{aboutDesc}</p>
      </div>

      {/* 제조 단계 — 구조 그대로 유지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(editing ? steps : initSteps).map((s, i) => (
          <div key={s.step} className="bg-gray-50 rounded-xl p-8">
            <p className="text-4xl font-bold text-gray-200 mb-3">{s.step}</p>
            {editing ? (
              <>
                <input
                  value={s.title}
                  onChange={(e) => updateStep(i, 'title', e.target.value)}
                  className={`${editableText} text-lg font-bold text-gray-900 mb-3 block`}
                />
                <AutoTextarea
                  value={s.desc}
                  onChange={(v) => updateStep(i, 'desc', v)}
                  className={`${editableText} text-sm text-gray-600 leading-7 mt-2 block`}
                />
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 leading-7 whitespace-pre-wrap px-2 border border-transparent">{s.desc}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
