'use client'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function SubscribePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')

  async function handleSubscribe(planType) {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    setLoading(planType)
    setError('')

    const priceId = planType === 'monthly'
      ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setLoading(null)
        return
      }

      // Redirect to Stripe checkout
      window.location.href = data.url

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">
            Play golf. Win prizes. Support a charity you love.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Monthly Plan */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-green-500/50 transition">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Monthly</h2>
              <p className="text-gray-400 text-sm">Flexible, cancel anytime</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-bold">$7.99</span>
              <span className="text-gray-400 ml-2">/ month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Enter monthly prize draws',
                'Track your golf scores',
                'Support your chosen charity',
                'Win cash prizes',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={loading !== null}
              className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 text-white font-bold py-3 rounded-lg transition"
            >
              {loading === 'monthly' ? 'Redirecting...' : 'Get Started'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gray-900 border border-green-500 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Yearly</h2>
              <p className="text-gray-400 text-sm">Save 73%</p>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-bold">$25.99</span>
              <span className="text-gray-400 ml-2">/ year</span>
              <p className="text-green-400 text-sm mt-1">Save $69.89 per year</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Everything in Monthly',
                'Priority draw entries',
                'Exclusive yearly badge',
                'Early access to features',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-gray-300">
                  <span className="text-green-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={loading !== null}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition"
            >
              {loading === 'yearly' ? 'Redirecting...' : 'Get Started'}
            </button>
          </div>

        </div>

        {/* Trust line */}
        <p className="text-center text-gray-600 mt-8 text-sm">
          Secure payments via Stripe · Cancel anytime · 10% goes to your charity
        </p>

      </div>
    </div>
  )
}