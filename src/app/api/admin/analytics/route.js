import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const [usersRes, winnersRes, drawsRes, charitiesRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, subscription_status, subscription_plan, charity_contribution_percent, created_at'),
      supabaseAdmin.from('winners').select('prize_amount, payout_status, match_type'),
      supabaseAdmin.from('draws').select('id, total_pool, jackpot_pool, status, draw_date'),
      supabaseAdmin.from('profiles').select('charity_id, charity_contribution_percent, charities(name)'),
    ])

    const users = usersRes.data || []
    const winners = winnersRes.data || []
    const draws = drawsRes.data || []

    const totalUsers = users.length
    const activeUsers = users.filter(u => u.subscription_status === 'active').length
    const monthlyUsers = users.filter(u => u.subscription_plan === 'monthly').length
    const yearlyUsers = users.filter(u => u.subscription_plan === 'yearly').length

    const totalPrizePool = draws.reduce((s, d) => s + (d.total_pool || 0), 0)
    const totalPaidOut = winners
      .filter(w => w.payout_status === 'paid')
      .reduce((s, w) => s + (w.prize_amount || 0), 0)
    const totalPending = winners
      .filter(w => w.payout_status === 'unpaid')
      .reduce((s, w) => s + (w.prize_amount || 0), 0)

    const totalCharityContribution = users
      .filter(u => u.subscription_status === 'active')
      .reduce((s, u) => {
        const fee = u.subscription_plan === 'yearly' ? 99.99 / 12 : 9.99
        return s + (fee * (u.charity_contribution_percent || 10) / 100)
      }, 0)

    // Charity breakdown
    const charityMap = {}
    charitiesRes.data?.forEach(p => {
      if (p.charity_id && p.charities) {
        const name = p.charities.name
        charityMap[name] = (charityMap[name] || 0) + 1
      }
    })

    return NextResponse.json({
      totalUsers,
      activeUsers,
      monthlyUsers,
      yearlyUsers,
      totalPrizePool,
      totalPaidOut,
      totalPending,
      totalCharityContribution,
      totalDraws: draws.length,
      totalWinners: winners.length,
      charityBreakdown: Object.entries(charityMap).map(([name, count]) => ({ name, count })),
      match5Winners: winners.filter(w => w.match_type === '5-match').length,
      match4Winners: winners.filter(w => w.match_type === '4-match').length,
      match3Winners: winners.filter(w => w.match_type === '3-match').length,
    })

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}