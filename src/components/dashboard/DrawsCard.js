import { checkMatches } from '@/lib/drawEngine'

export default function DrawsCard({ draws, userScores }) {
  const scoreValues = userScores.map(s => s.score)

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Recent Draws</h2>
        <a
          href="/draws"
          className="text-green-400 hover:text-green-300 text-sm transition"
        >
          View All →
        </a>
      </div>

      {draws.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎰</p>
          <p className="text-gray-500 text-sm">No draws yet. Stay tuned!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => {
            const matched = checkMatches(draw.draw_numbers, scoreValues)
            const isWinner = matched >= 3

            return (
              <div
                key={draw.id}
                className={`rounded-xl p-4 border ${
                  isWinner
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium">
                    {formatDate(draw.draw_date)}
                  </p>
                  {isWinner ? (
                    <span className="text-xs bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">
                      🏆 Winner!
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {matched} matched
                    </span>
                  )}
                </div>

                {/* Draw Numbers */}
                <div className="flex gap-1.5 flex-wrap">
                  {draw.draw_numbers.map((num, i) => {
                    const userHas = scoreValues.includes(num)
                    return (
                      <div
                        key={i}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                          userHas
                            ? 'bg-green-500 text-black'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {num}
                      </div>
                    )
                  })}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Jackpot: {formatCurrency(draw.jackpot_pool)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}