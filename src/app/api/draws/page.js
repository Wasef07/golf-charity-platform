'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { checkMatches } from '@/lib/drawEngine'

export default function DrawsPage() {
  const { user } = useAuth()
  const [draws, setDraws] = useState([])
  const [userScores, setUserScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDraws()
    if (user) fetchUserScores()
  }, [user])

  async function fetchDraws() {
    const { data } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  async function fetchUserScores() {
    const { data } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', user.id)
    setUserScores(data?.map(s => s.score) || [])
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency', currency: 'GBP'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Draw Results</h1>
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* User's current scores */}
        {user && userScores.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-sm text-gray-400 mb-3">Your Current Scores</h2>
            <div className="flex gap-3 flex-wrap">
              {userScores.map((score, i) => (
                <span
                  key={i}
                  className="bg-gray-800 border border-gray-700 text-white font-bold text-xl w-12 h-12 rounded-xl flex items-center justify-center"
                >
                  {score}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading draws...</div>
        ) : draws.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎰</p>
            <p className="text-gray-400">No draws published yet. Check back soon!</p>
          </div>
        ) : (
          draws.map(draw => {
            const userMatched = user ? checkMatches(draw.draw_numbers, userScores) : 0
            const isWinner = userMatched >= 3

            return (
              <div
                key={draw.id}
                className={`bg-gray-900 border rounded-2xl p-6 ${isWinner ? 'border-green-500' : 'border-gray-800'}`}
              >
                {/* Draw Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-bold text-lg">{formatDate(draw.draw_date)}</h2>
                    <p className="text-xs text-gray-500 capitalize">{draw.draw_type} draw</p>
                  </div>
                  {isWinner && (
                    <span className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                      🏆 YOU WON!
                    </span>
                  )}
                </div>

                {/* Winning Numbers */}
                <div className="mb-5">
                  <p className="text-xs text-gray-400 mb-2">Winning Numbers</p>
                  <div className="flex gap-2 flex-wrap">
                    {draw.draw_numbers.map((num, i) => {
                      const userHasThis = userScores.includes(num)
                      return (
                        <div
                          key={i}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${
                            userHasThis
                              ? 'bg-green-500 border-green-400 text-black'
                              : 'bg-gray-800 border-gray-700 text-white'
                          }`}
                        >
                          {num}
                        </div>
                      )
                    })}
                  </div>
                  {user && (
                    <p className="text-xs text-gray-500 mt-2">
                      {userMatched > 0
                        ? `✅ You matched ${userMatched} number${userMatched > 1 ? 's' : ''}`
                        : '❌ No matches this draw'}
                    </p>
                  )}
                </div>

                {/* Prize Pools */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-yellow-400 font-bold text-sm">
                      {formatCurrency(draw.jackpot_pool)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Jackpot (5 match)</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-blue-400 font-bold text-sm">
                      {formatCurrency(draw.pool_4match)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">4 Match</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-purple-400 font-bold text-sm">
                      {formatCurrency(draw.pool_3match)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">3 Match</p>
                  </div>
                </div>

                {/* Rollover Notice */}
                {draw.jackpot_rollover > 0 && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
                    <p className="text-yellow-400 text-xs">
                      🔄 Jackpot rolled over from previous draw: {formatCurrency(draw.jackpot_rollover)}
                    </p>
                  </div>
                )}

              </div>
            )
          })
        )}
      </div>
    </div>
  )
}