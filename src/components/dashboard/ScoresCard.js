export default function ScoresCard({ scores }) {
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short'
    })
  }

  function getScoreColor(score) {
    if (score >= 36) return 'text-green-400'
    if (score >= 25) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">My Scores</h2>
        <a
          href="/scores"
          className="text-green-400 hover:text-green-300 text-sm transition"
        >
          Manage →
        </a>
      </div>

      {scores.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🏌️</p>
          <p className="text-gray-500 text-sm mb-3">No scores yet</p>
          <a
            href="/scores"
            className="text-green-400 hover:text-green-300 text-sm"
          >
            Add your first score →
          </a>
        </div>
      ) : (
        <>
          {/* Score Balls */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {scores.map((s, i) => (
              <div key={s.id} className="text-center">
                <div className={`w-12 h-12 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-lg ${getScoreColor(s.score)}`}>
                  {s.score}
                </div>
                <p className="text-xs text-gray-600 mt-1">{formatDate(s.played_at)}</p>
              </div>
            ))}
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-800">
            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)}
              </p>
              <p className="text-xs text-gray-500">Avg</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-400">
                {Math.max(...scores.map(s => s.score))}
              </p>
              <p className="text-xs text-gray-500">Best</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-400">
                {scores.length}/5
              </p>
              <p className="text-xs text-gray-500">Slots</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}