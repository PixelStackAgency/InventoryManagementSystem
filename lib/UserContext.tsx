'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: number
  username: string
  role: string
  permissions: Array<{
    permission: {
      id: number
      name: string
    }
    granted: boolean
  }>
}

interface UserContextType {
  user: User | null
  loading: boolean
  hasPermission: (permission: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          // Normalize permissions to expected shape: { permission: { id?, name }, granted }
          const normalized = {
            ...data,
            permissions: Array.isArray(data.permissions)
              ? data.permissions.map((p: any) => ({
                  permission: {
                    id: p.permission?.id ?? p.permissionId ?? null,
                    name: p.permission?.name ?? p.permissionName ?? p.name ?? null
                  },
                  granted: !!p.granted
                }))
              : []
          }
          setUser(normalized)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    if (user.role === 'SUPER_ADMIN') return true // Super admin has all permissions
    try {
      return user.permissions.some((p: any) => {
        const name = p?.permission?.name ?? p?.permissionName ?? p?.name
        return name === permission && !!p.granted
      })
    } catch (e) {
      return false
    }
  }

  return (
    <UserContext.Provider value={{ user, loading, hasPermission }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
