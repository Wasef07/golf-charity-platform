'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        window.location.href = '/login'
        return
      }
      if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        window.location.href = '/dashboard'
        return
      }
      setChecking(false)
    }
  }, [user, loading])

  if (checking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}