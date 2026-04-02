'use client'
import { useState, useEffect } from 'react'
import { getAllUsers, getAllWinners, getAnalytics, updateWinnerStatus, updateUserSubscription } from '@/lib/admin'

const TABS = ['Overview', 'Users', 'Draw Engine', 'Charities', 'Winners']

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [users, setUsers] = useState([])
  const [winners, setWinners] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)

  // Draw engine state
  const [drawType, setDrawType] = useState('random')
  const [jackpotRollover, setJackpotRollover] = useState(0)
  const [drawResult, setDrawResult] = useState(null)
  const [drawLoading, setDrawLoading] = useState(false)
  const [savedDrawId, setSavedDrawId] = useState(null)

  // Charity form state
  const [charityForm, setCharityForm] = useState({
    name: '', description: '', category: 'Health',
    image_url: '', website_url: '', is_featured: false
  })
  const [charityLoading, setCharityLoading] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    const [u, w, a, c] = await Promise.all([
      getAllUsers(),
      getAllWinners(),
      getAnalytics(),
      fetch('/api/admin/charities').then(r => r.json())
    ])
    setUsers(Array.isArray(u) ? u : [])
    setWinners(Array.isArray(w) ? w : [])
    setAnalytics(a)
    setCharities(Array.isArray(c) ? c : [])
    setLoading(false)
  }

  // ── DRAW ENGINE ──────────────────────────────
  async function handleSimulate() {
    setDrawLoading(true)
    setDrawResult(null)
    setSavedDrawId(null)
    const res = await fetch('/api/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawType, simulateOnly: true, jackpotRollover })
    })
    const data = await res.json()
    setDrawResult(data)
    setDrawLoading(false)
  }

  async function handleRunDraw() {
    setDrawLoading(true)
    const res = await fetch('/api/draws/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawType, simulateOnly: false, jackpotRollover })
    })
    const data = await res.json()
    setDrawResult(data)
    setSavedDrawId(data.drawId)
    setDrawLoading(false)
  }

  async function handlePublishDraw() {
    if (!savedDrawId) return
    await fetch('/api/draws/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId: savedDrawId })
    })
    alert('Draw published successfully!')
    setSavedDrawId(null)
    setDrawResult(null)
    fetchAll()
  }

  // ── WINNERS ──────────────────────────────────
  async function handleVerifyWinner(winnerId, approve) {
    await updateWinnerStatus(
      winnerId,
      approve ? 'verified' : 'rejected',
      approve ? 'unpaid' : 'unpaid'
    )
    fetchAll()
  }

  async function handleMarkPaid(winnerId) {
    await updateWinnerStatus(winnerId, 'verified', 'paid')
    fetchAll()
  }

  // ── USERS ────────────────────────────────────
  async function handleToggleSubscription(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await updateUserSubscription(userId, newStatus)
    fetchAll()
  }

  // ── CHARITIES ────────────────────────────────
  async function handleAddCharity(e) {
    e.preventDefault()
    setCharityLoading(true)
    await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(charityForm)
    })
    setCharityForm({
      name: '', description: '', category: 'Health',
      image_url: '', website_url: '', is_featured: false
    })
    setCharityLoading(false)
    fetchAll()
  }

  async function handleDeleteCharity(id) {
    if (!confirm('Delete this charity?')) return
    await fetch('/api/admin/charities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    fetchAll()
  }

  async function handleToggleFeatured(charity) {
    await fetch('/api/admin/charities', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: charity.id, is_featured: !charity.is_featured })
    })
    fetchAll()
  }

  function formatCurrency(n) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0)
  }

  function formatDate(d) {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Top Bar */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl"></span>
          <h1 className="font-bold text-lg">Admin Panel</h1>
        </div>
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm">
          View Site →
        </a>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800 px-6">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === tab
                  ? 'border-green-500 text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'Overview' && analytics && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: analytics.totalUsers, color: 'text-white' },
                { label: 'Active Subscribers', value: analytics.activeUsers, color: 'text-green-400' },
                { label: 'Monthly Plan', value: analytics.monthlyUsers, color: 'text-blue-400' },
                { label: 'Yearly Plan', value: analytics.yearlyUsers, color: 'text-purple-400' },
                { label: 'Total Prize Pool', value: formatCurrency(analytics.totalPrizePool), color: 'text-yellow-400' },
                { label: 'Total Paid Out', value: formatCurrency(analytics.totalPaidOut), color: 'text-green-400' },
                { label: 'Pending Payouts', value: formatCurrency(analytics.totalPending), color: 'text-red-400' },
                { label: 'Charity Contributions', value: formatCurrency(analytics.totalCharityContribution), color: 'text-pink-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-center">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Draw Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold mb-4">Draw Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Draws', value: analytics.totalDraws },
                  { label: 'Total Winners', value: analytics.totalWinners },
                  { label: '5-Match Winners', value: analytics.match5Winners },
                  { label: '4-Match Winners', value: analytics.match4Winners },
                ].map(s => (
                  <div key={s.label} className="bg-gray-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Charity Breakdown */}
            {analytics.charityBreakdown?.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold mb-4">Charity Support Breakdown</h3>
                <div className="space-y-3">
                  {analytics.charityBreakdown.map(c => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-sm text-gray-300 w-48 truncate">{c.name}</span>
                      <div className="flex-1 bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(c.count / analytics.activeUsers) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'Users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Users ({users.length})</h2>
              <span className="text-sm text-gray-400">
                {users.filter(u => u.subscription_status === 'active').length} active
              </span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Name', 'Email', 'Plan', 'Status', 'Joined', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 text-sm text-white">
                          {user.full_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs capitalize text-gray-300">
                            {user.subscription_plan || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            user.subscription_status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.subscription_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleSubscription(user.id, user.subscription_status)}
                            className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-3 py-1 rounded-lg transition"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── DRAW ENGINE TAB ── */}
        {activeTab === 'Draw Engine' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold">Draw Engine</h2>

            {/* Configuration */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h3 className="font-bold">Draw Configuration</h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Draw Type</label>
                <div className="flex gap-3">
                  {['random', 'algorithmic'].map(type => (
                    <button
                      key={type}
                      onClick={() => setDrawType(type)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition border ${
                        drawType === type
                          ? 'bg-green-500 text-black border-green-500'
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {drawType === 'random'
                    ? 'Pure lottery — all numbers equally likely'
                    : 'Weighted by most frequent user scores'}
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Jackpot Rollover Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={jackpotRollover}
                  onChange={e => setJackpotRollover(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Enter amount rolled over from previous draw (0 if none)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSimulate}
                  disabled={drawLoading}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {drawLoading ? 'Running...' : '🔍 Simulate Draw'}
                </button>
                <button
                  onClick={handleRunDraw}
                  disabled={drawLoading}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                  {drawLoading ? 'Running...' : '▶ Run Draw'}
                </button>
              </div>
            </div>

            {/* Draw Results */}
            {drawResult && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">
                    {savedDrawId ? 'Draw Results' : 'Simulation Preview'}
                  </h3>
                  {savedDrawId && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded-full">
                      Not Published
                    </span>
                  )}
                </div>

                {/* Drawn Numbers */}
                <div>
                  <p className="text-xs text-gray-400 mb-2">Drawn Numbers</p>
                  <div className="flex gap-2">
                    {drawResult.drawNumbers?.map((num, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 bg-green-500 text-black rounded-xl flex items-center justify-center font-bold text-lg"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pool Breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-yellow-400 font-bold">
                      {formatCurrency(drawResult.pools?.jackpot)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Jackpot</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-blue-400 font-bold">
                      {formatCurrency(drawResult.pools?.pool4match)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">4-Match</p>
                  </div>
                  <div className="bg-gray-800 rounded-xl p-3 text-center">
                    <p className="text-purple-400 font-bold">
                      {formatCurrency(drawResult.pools?.pool3match)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">3-Match</p>
                  </div>
                </div>

                {/* Winner Count */}
                <div className="space-y-2">
                  {[
                    { label: '5-Match Winners', count: drawResult.simulation?.match5Count, color: 'text-yellow-400' },
                    { label: '4-Match Winners', count: drawResult.simulation?.match4Count, color: 'text-blue-400' },
                    { label: '3-Match Winners', count: drawResult.simulation?.match3Count, color: 'text-purple-400' },
                    { label: 'No Match', count: drawResult.simulation?.noMatchCount, color: 'text-gray-400' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2">
                      <span className="text-sm text-gray-300">{row.label}</span>
                      <span className={`font-bold ${row.color}`}>{row.count}</span>
                    </div>
                  ))}
                </div>

                {drawResult.simulation?.jackpotRollover && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm">
                      🔄 No 5-match winner — Jackpot of {formatCurrency(drawResult.pools?.jackpot)} rolls over to next draw
                    </p>
                  </div>
                )}

                {savedDrawId && (
                  <button
                    onClick={handlePublishDraw}
                    className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-3 rounded-xl transition"
                  >
                    🚀 Publish Draw Results
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CHARITIES TAB ── */}
        {activeTab === 'Charities' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Charities ({charities.length})</h2>

            {/* Add Charity Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="font-bold mb-5">Add New Charity</h3>
              <form onSubmit={handleAddCharity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={charityForm.name}
                      onChange={e => setCharityForm({ ...charityForm, name: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                      placeholder="Charity name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Category</label>
                    <select
                      value={charityForm.category}
                      onChange={e => setCharityForm({ ...charityForm, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                    >
                      {['Health', 'Mental Health', 'Elderly Care', 'Children', 'Other'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={charityForm.image_url}
                      onChange={e => setCharityForm({ ...charityForm, image_url: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Website URL</label>
                    <input
                      type="url"
                      value={charityForm.website_url}
                      onChange={e => setCharityForm({ ...charityForm, website_url: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Description</label>
                  <textarea
                    value={charityForm.description}
                    onChange={e => setCharityForm({ ...charityForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500"
                    placeholder="Brief description..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={charityForm.is_featured}
                    onChange={e => setCharityForm({ ...charityForm, is_featured: e.target.checked })}
                    className="accent-green-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-300">
                    Feature on homepage
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={charityLoading}
                  className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-lg transition text-sm"
                >
                  {charityLoading ? 'Adding...' : 'Add Charity'}
                </button>
              </form>
            </div>

            {/* Charities List */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['Name', 'Category', 'Featured', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {charities.map(charity => (
                      <tr key={charity.id} className="hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3 text-sm text-white">{charity.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{charity.category}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleFeatured(charity)}
                            className={`text-xs px-2 py-1 rounded-full transition ${
                              charity.is_featured
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-800 text-gray-500'
                            }`}
                          >
                            {charity.is_featured ? '★ Featured' : '☆ Not Featured'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteCharity(charity.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── WINNERS TAB ── */}
        {activeTab === 'Winners' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Winners ({winners.length})</h2>
              <span className="text-sm text-gray-400">
                {winners.filter(w => w.payout_status === 'unpaid').length} pending payout
              </span>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      {['User', 'Match', 'Prize', 'Draw Date', 'Status', 'Payout', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {winners.map(winner => (
                      <tr key={winner.id} className="hover:bg-gray-800/50 transition">
                        <td className="px-4 py-3">
                          <p className="text-sm text-white">{winner.profiles?.full_name || '—'}</p>
                          <p className="text-xs text-gray-500">{winner.profiles?.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            winner.match_type === '5-match'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : winner.match_type === '4-match'
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          }`}>
                            {winner.match_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-green-400">
                          {formatCurrency(winner.prize_amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDate(winner.draws?.draw_date)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            winner.status === 'verified'
                              ? 'bg-green-500/20 text-green-400'
                              : winner.status === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {winner.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            winner.payout_status === 'paid'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {winner.payout_status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {winner.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleVerifyWinner(winner.id, true)}
                                  className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 px-2 py-1 rounded-lg transition"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => handleVerifyWinner(winner.id, false)}
                                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded-lg transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {winner.status === 'verified' && winner.payout_status === 'unpaid' && (
                              <button
                                onClick={() => handleMarkPaid(winner.id)}
                                className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded-lg transition"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {winners.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                          No winners yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}