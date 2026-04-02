'use client'
import { useEffect, useState } from 'react'

export default function DrawsPage() {
  const [draws, setDraws] = useState([])

  useEffect(() => {
    fetchDraws()
  }, [])

  async function fetchDraws() {
    const res = await fetch('/api/draws')
    const data = await res.json()
    setDraws(data || [])
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">All Draws</h1>

      {draws.length === 0 ? (
        <p className="text-gray-400">No draws available</p>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => (
            <div
              key={draw.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <p className="text-sm text-gray-400">
                {new Date(draw.draw_date).toDateString()}
              </p>

              <div className="flex gap-2 mt-2">
                {draw.draw_numbers?.map((num, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-green-500 text-black flex items-center justify-center rounded-lg font-bold"
                  >
                    {num}
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Status: {draw.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}