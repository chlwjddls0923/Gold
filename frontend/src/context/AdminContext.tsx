'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

interface AdminContextType {
  isAdmin: boolean
  token: string | null
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  token: null,
  login: async () => false,
  logout: () => {},
})

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('adminToken')
    if (stored) { setToken(stored); setIsAdmin(true) }
  }, [])

  const login = async (password: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return false
    const { accessToken } = await res.json()
    localStorage.setItem('adminToken', accessToken)
    setToken(accessToken)
    setIsAdmin(true)
    return true
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setIsAdmin(false)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, token, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => useContext(AdminContext)
