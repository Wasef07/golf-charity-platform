export default function SubscriptionCard({ profile }) {
  const isActive = profile?.subscription_status === 'active'

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className={`rounded-2xl p-6 border ${
      isActive
        ? 'bg-green-500/10 border-green-500/30'
        : 'bg-gray-900 border-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Subscription</h2>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          isActive
            ? 'bg-green-500 text-black'
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isActive ? '● ACTIVE' : '● INACTIVE'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Plan</span>
          <span className="text-white text-sm capitalize font-medium">
            {profile?.subscription_plan || 'None'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">
            {isActive ? 'Renews' : 'Expired'}
          </span>
          <span className="text-white text-sm">
            {formatDate(profile?.subscription_end_date)}
          </span>
        </div>
      </div>

      {!isActive && (
        <a
          href="/subscribe"
          className="block w-full mt-4 bg-green-500 hover:bg-green-400 text-black font-bold py-2 rounded-lg text-center text-sm transition"
        >
          Subscribe Now
        </a>
      )}
    </div>
  )
}