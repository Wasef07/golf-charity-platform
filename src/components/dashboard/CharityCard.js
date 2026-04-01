export default function CharityCard({ profile }) {
  const charity = profile?.charities
  const percent = profile?.charity_contribution_percent || 10
  const monthlyAmount = ((7.99 * percent) / 100).toFixed(2)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">My Charity</h2>
        <a
          href="/charities"
          className="text-green-400 hover:text-green-300 text-sm transition"
        >
          Change →
        </a>
      </div>

      {!charity ? (
        <div className="text-center py-6">
          <p className="text-3xl mb-2">🎗️</p>
          <p className="text-gray-500 text-sm mb-3">No charity selected</p>
          <a
            href="/charities"
            className="text-green-400 hover:text-green-300 text-sm"
          >
            Choose a charity →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {charity.image_url && (
              <img
                src={charity.image_url}
                alt={charity.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            )}
            <div>
              <p className="font-medium text-white">{charity.name}</p>
              <p className="text-xs text-gray-500">{charity.category}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Your contribution</span>
              <span className="text-green-400 font-bold">{percent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(percent / 50) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ${monthlyAmount} per month goes to {charity.name}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}