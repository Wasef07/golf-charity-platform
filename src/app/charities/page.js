'use client'
import { useState, useEffect } from 'react'
import { getAllCharities } from '@/lib/charities'
import Link from 'next/link'

const CATEGORIES = ['All', 'Health', 'Mental Health', 'Elderly Care', 'Children']

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    fetchCharities()
  }, [search, category])

  async function fetchCharities() {
    setLoading(true)
    const { data } = await getAllCharities(
      search,
      category === 'All' ? '' : category
    )
    setCharities(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Charities</h1>
        <a href="/dashboard" className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-3">
            Your game. Their future.
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Every subscription contributes to a charity you believe in.
            Choose the cause closest to your heart.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 transition"
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  category === cat
                    ? 'bg-green-500 text-black'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Charities Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            Loading charities...
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400">No charities found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map(charity => (
              <Link
                key={charity.id}
                href={`/charities/${charity.id}`}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-green-500/50 transition group"
              >
                {/* Image */}
                <div className="h-40 overflow-hidden">
                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <span className="text-4xl">🎗️</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white group-hover:text-green-400 transition">
                      {charity.name}
                    </h3>
                    {charity.is_featured && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full ml-2 shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                    {charity.category}
                  </span>
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2">
                    {charity.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}