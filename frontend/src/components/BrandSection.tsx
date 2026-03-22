'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/context/AdminContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface Props {
  settings: Record<string, string>
}

export default function BrandSection({ settings }: Props) {
  const { isAdmin, token } = useAdmin()
  const router = useRouter()

  const initTitle  = settings.brand_title  ?? 'Korean Bath Care Manufacturer'
  const initSince  = settings.brand_since  ?? 'Since 1994'
  const initDesc   = settings.about_desc   ?? '골드상사는 단순히 제품을 판매하는 브랜드가 아니라, 오랜 시간 축적된 제조 경험을 바탕으로 일상 속에서 자주 보이는 목욕용품을 친환경적으로 생산해온 제조 브랜드입니다.'
  const initStats: { label: string; value: string }[] = settings.brand_stats
    ? JSON.parse(settings.brand_stats)
    : [
        { label: '설립', value: '1994년' },
        { label: '주력 제품', value: '때밀이 타올' },
        { label: '생산 방식', value: '친환경 제조' },
        { label: '판매 방식', value: '직접 판매' },
      ]

  const [editing, setEditing] = useState(false)
  const [title, setTitle]   = useState(initTitle)
  const [since, setSince]   = useState(initSince)
  const [desc, setDesc]     = useState(initDesc)
  const [stats, setStats]   = useState(initStats)
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setTitle(initTitle); setSince(initSince); setDesc(initDesc); setStats(initStats)
    setEditing(true)
  }
  const cancel = () => {
    setTitle(initTitle); setSince(initSince); setDesc(initDesc); setStats(initStats)
    setEditing(false)
  }
  const save = async () => {
    setSaving(true)
    await fetch(`${API_URL}/site-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        brand_title: title,
        brand_since: since,
        about_desc: desc,
        brand_stats: JSON.stringify(stats),
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const updateStat = (i: number, field: 'label' | 'value', val: string) =>
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)))

  const ed = 'bg-amber-50 border border-amber-300 rounded-md px-2 py-0.5 focus:outline-none focus:border-amber-400 focus:bg-amber-100 w-full transition-colors'

  return (
    <section className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start gap-3 mb-2">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${ed} text-2xl font-bold text-gray-900`}
            />
          ) : (
            <h2 className="text-2xl font-bold">{initTitle}</h2>
          )}
          {isAdmin && (
            editing ? (
              <div className="flex gap-2 shrink-0">
                <button onClick={save} disabled={saving} className="text-xs bg-white text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button onClick={cancel} className="text-xs border border-gray-500 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-800">
                  취소
                </button>
              </div>
            ) : (
              <button onClick={startEdit} className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg shrink-0">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                편집
              </button>
            )
          )}
        </div>

        {editing ? (
          <input value={since} onChange={(e) => setSince(e.target.value)} className={`${ed} text-blue-400 font-semibold mb-6 block`} />
        ) : (
          <p className="text-blue-400 font-semibold mb-6">{initSince}</p>
        )}

        {editing ? (
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className={`${ed} text-gray-900 max-w-2xl leading-relaxed block resize-none mb-10`}
          />
        ) : (
          <p className="text-gray-300 max-w-2xl leading-relaxed mb-10 whitespace-pre-line">{initDesc}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(editing ? stats : initStats).map((s, i) => (
            <div key={i}>
              {editing ? (
                <>
                  <input
                    value={s.label}
                    onChange={(e) => updateStat(i, 'label', e.target.value)}
                    className={`${ed} text-gray-900 text-xs mb-1 block`}
                  />
                  <input
                    value={s.value}
                    onChange={(e) => updateStat(i, 'value', e.target.value)}
                    className={`${ed} text-gray-900 font-semibold block`}
                  />
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                  <p className="text-white font-semibold">{s.value}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
