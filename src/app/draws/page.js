'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { checkMatches } from '@/lib/drawEngine'

export default function DrawsPage() {
  const { user } = useAuth()
  const [draws, setDraws] = useState([])
  const [userScores, setUserScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchDraws()
    if (user) fetchUserScores()
  }, [user])

  async function fetchDraws() {
    setLoading(true)
    const res = await fetch('/api/draws/list')
    const data = await res.json()
    setDraws(Array.isArray(data) ? data : [])
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD'
    }).format(amount || 0)
  }

  function getMatchLabel(matched) {
    if (matched === 5) return { label: '🏆 Jackpot!', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' }
    if (matched === 4) return { label: '🥈 4 Matched!', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
    if (matched === 3) return { label: '🥉 3 Matched!', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
    if (matched === 0) return { label: 'No match', color: 'text-gray-500 bg-gray-800 border-gray-700' }
    return { label: `${matched} matched`, color: 'text-gray-400 bg-gray-800 border-gray-700' }
  }

  // Filter draws
  const filteredDraws = draws.filter(draw => {
    if (filter === 'won') {
      const matched = checkMatches(draw.draw_numbers, userScores)
      return matched >= 3
    }
    return true
  })

  const totalWins = draws.filter(d => checkMatches(d.draw_numbers, userScores) >= 3).length

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white transition">
            ←
          </a>
          <h1 className="text-xl font-bold">Draw Results</h1>
        </div>
        <a
          href="/scores"
          className="text-sm bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-lg transition"
        >
          Manage Scores
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* User Score Banner */}
        {user && userScores.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
              Your Current Numbers
            </p>
            <div className="flex gap-2 flex-wrap">
              {userScores.map((score, i) => (
                <div
                  key={i}
                  className="w-11 h-11 bg-green-500/20 border border-green-500/50 text-green-400 font-bold rounded-xl flex items-center justify-center text-lg"
                >
                  {score}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              These are matched against each draw's winning numbers
            </p>
          </div>
        )}

        {user && userScores.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-yellow-400 font-medium text-sm">No scores entered yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Add your golf scores to participate in draws
              </p>
            </div>
            <a
              href="/scores"
              className="ml-auto text-xs bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg whitespace-nowrap"
            >
              Add Scores
            </a>
          </div>
        )}

        {/* Stats Row */}
        {user && draws.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Draws', value: draws.length, color: 'text-white' },
              { label: 'You Won', value: totalWins, color: 'text-green-400' },
              { label: 'Win Rate', value: draws.length > 0 ? Math.round((totalWins / draws.length) * 100) + '%' : '0%', color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        {user && (
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All Draws' },
              { key: 'won', label: '🏆 My Wins' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filter === tab.key
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Draws List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading draws...</p>
          </div>
        ) : filteredDraws.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎰</p>
            <p className="text-gray-400 font-medium">
              {filter === 'won' ? 'No winning draws yet' : 'No draws published yet'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              {filter === 'won' ? 'Keep playing — your win is coming!' : 'Check back after the next monthly draw'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDraws.map(draw => {
              const matched = user ? checkMatches(draw.draw_numbers, userScores) : 0
              const isWinner = matched >= 3
              const matchInfo = getMatchLabel(matched)

              return (
                <div
                  key={draw.id}
                  className={`bg-gray-900 rounded-2xl border overflow-hidden ${
                    isWinner ? 'border-green-500/50' : 'border-gray-800'
                  }`}
                >
                  {/* Winner Banner */}
                  {isWinner && (
                    <div className="bg-green-500/10 border-b border-green-500/20 px-5 py-2 flex items-center gap-2">
                      <span className="text-green-400 text-sm font-bold">
                        🎉 You won this draw!
                      </span>
                    </div>
                  )}

                  <div className="p-5">

                    {/* Draw Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-white">
                          {formatDate(draw.draw_date)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize mt-0.5">
                          {draw.draw_type} draw
                        </p>
                      </div>
                      {user && (
                        <span className={`text-xs border px-3 py-1 rounded-full font-medium ${matchInfo.color}`}>
                          {matchInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Winning Numbers */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        Winning Numbers
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {draw.draw_numbers?.map((num, i) => {
                          const userHasThis = userScores.includes(num)
                          return (
                            <div
                              key={i}
                              className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg border-2 transition ${
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
                          {matched > 0
                            ? `✅ Green numbers are your matches`
                            : '❌ No matches this draw'}
                        </p>
                      )}
                    </div>

                    {/* Prize Pools */}
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
                      <div className="text-center">
                        <p className="text-yellow-400 font-bold text-sm">
                          {formatCurrency(draw.jackpot_pool)}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">Jackpot</p>
                      </div>
                      <div className="text-center">
                        <p className="text-blue-400 font-bold text-sm">
                          {formatCurrency(draw.pool_4match)}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">4 Match</p>
                      </div>
                      <div className="text-center">
                        <p className="text-purple-400 font-bold text-sm">
                          {formatCurrency(draw.pool_3match)}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">3 Match</p>
                      </div>
                    </div>

                    {/* Jackpot Rollover */}
                    {draw.jackpot_rollover > 0 && (
                      <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                        <p className="text-yellow-400 text-xs">
                          🔄 Includes {formatCurrency(draw.jackpot_rollover)} rolled over from previous draw
                        </p>
                      </div>
                    )}

                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}