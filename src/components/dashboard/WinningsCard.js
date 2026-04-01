export default function WinningsCard({ winners }) {
  const totalWon = winners.reduce((sum, w) => sum + (w.prize_amount || 0), 0)
  const pendingCount = winners.filter(w => w.payout_status === 'unpaid').length

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD'
    }).format(amount)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function getMatchBadge(matchType) {
    if (matchType === '5-match') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    if (matchType === '4-match') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">My Winnings</h2>
        {pendingCount > 0 && (
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-1 rounded-full">
            {pendingCount} pending payout
          </span>
        )}
      </div>

      {/* Total Won */}
      <div className="bg-gray-800 rounded-xl p-4 mb-4 text-center">
        <p className="text-3xl font-bold text-green-400">
          {formatCurrency(totalWon)}
        </p>
        <p className="text-xs text-gray-500 mt-1">Total winnings</p>
      </div>

      {winners.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">No winnings yet — keep playing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {winners.slice(0, 3).map(winner => (
            <div
              key={winner.id}
              className="flex items-center justify-between bg-gray-800 rounded-xl p-3"
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs border px-2 py-0.5 rounded-full ${getMatchBadge(winner.match_type)}`}>
                  {winner.match_type}
                </span>
                <span className="text-xs text-gray-500">
                  {winner.draws?.draw_date
                    ? formatDate(winner.draws.draw_date)
                    : 'N/A'}
                </span>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">
                  {formatCurrency(winner.prize_amount)}
                </p>
                <p className={`text-xs ${
                  winner.payout_status === 'paid'
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}>
                  {winner.payout_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}