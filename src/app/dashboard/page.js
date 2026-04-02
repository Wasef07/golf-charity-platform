'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getDashboardData } from '@/lib/dashboard'
import { signOut } from '@/lib/auth'
import SubscriptionCard from '@/components/dashboard/SubscriptionCard'
import ScoresCard from '@/components/dashboard/ScoresCard'
import CharityCard from '@/components/dashboard/CharityCard'
import WinningsCard from '@/components/dashboard/WinningsCard'
import DrawsCard from '@/components/dashboard/DrawsCard'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    // Check if coming from successful subscription
    const params = new URLSearchParams(window.location.search)
    if (params.get('subscribed') === 'true') {
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 5000)
    }
  }, [])

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    const result = await getDashboardData(user.id)
    setData(result)
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Golf Charity</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/draws" className="text-gray-400 hover:text-white text-sm transition">
              Draws
            </a>
            <a href="/scores" className="text-gray-400 hover:text-white text-sm transition">
              Scores
            </a>
            <a href="/charities" className="text-gray-400 hover:text-white text-sm transition">
              Charities
            </a>
            <button
              onClick={handleSignOut}
              className="text-gray-500 hover:text-red-400 text-sm transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Success Banner */}
        {subscribed && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-4 rounded-2xl mb-6 flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-bold">Welcome aboard!</p>
              <p className="text-sm opacity-80">
                Your subscription is active. Start adding your golf scores!
              </p>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Welcome back, {data?.profile?.full_name?.split(' ')[0] || 'Golfer'} 👋
          </h2>
          <p className="text-gray-400 mt-1">
            Here's your platform overview
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Scores Entered',
              value: data?.scores?.length || 0,
              suffix: '/5',
              color: 'text-white'
            },
            {
              label: 'Draws Entered',
              value: data?.draws?.length || 0,
              color: 'text-blue-400'
            },
            {
              label: 'Total Winnings',
              value: '$' + (data?.winners?.reduce((s, w) => s + w.prize_amount, 0) || 0).toFixed(2),
              color: 'text-green-400'
            },
            {
              label: 'Charity %',
              value: (data?.profile?.charity_contribution_percent || 0) + '%',
              color: 'text-purple-400'
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center"
            >
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}{stat.suffix || ''}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SubscriptionCard profile={data?.profile} />
          <ScoresCard scores={data?.scores || []} />
          <CharityCard profile={data?.profile} />
          <WinningsCard winners={data?.winners || []} />
        </div>

        {/* Draws — Full Width */}
        <div className="mt-6">
          <DrawsCard
            draws={data?.draws || []}
            userScores={data?.scores || []}
          />
        </div>

      </div>
    </div>
  )
}