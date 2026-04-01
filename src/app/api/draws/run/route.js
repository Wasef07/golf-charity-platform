import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  generateRandomDraw,
  generateAlgorithmicDraw,
  checkMatches,
  calculatePrizePools,
  calculatePrizePerWinner,
  simulateDraw
} from '@/lib/drawEngine'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { drawType, simulateOnly, jackpotRollover, subscriptionFee } = await req.json()

    // 1. Get all active subscribers
    const { data: activeUsers } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('subscription_status', 'active')

    if (!activeUsers || activeUsers.length === 0) {
      return NextResponse.json({ error: 'No active subscribers found' }, { status: 400 })
    }

    // 2. Get all user scores
    const userIds = activeUsers.map(u => u.id)
    const { data: allScores } = await supabaseAdmin
      .from('scores')
      .select('user_id, score')
      .in('user_id', userIds)

    // 3. Build entries — map scores to users
    const entriesMap = {}
    activeUsers.forEach(user => {
      entriesMap[user.id] = {
        userId: user.id,
        name: user.full_name,
        scores: []
      }
    })

    allScores?.forEach(s => {
      if (entriesMap[s.user_id]) {
        entriesMap[s.user_id].scores.push(s.score)
      }
    })

    const entries = Object.values(entriesMap)

    // 4. Generate draw numbers
    let drawNumbers
    if (drawType === 'algorithmic') {
      const allScoreValues = allScores?.map(s => s.score) || []
      drawNumbers = generateAlgorithmicDraw(allScoreValues)
    } else {
      drawNumbers = generateRandomDraw()
    }

    // 5. Calculate prize pools
    const fee = subscriptionFee || 9.99
    const totalPool = parseFloat((activeUsers.length * fee * 0.60).toFixed(2))
    const pools = calculatePrizePools(totalPool, jackpotRollover || 0)

    // 6. Run simulation
    const simulation = simulateDraw(drawNumbers, entries)

    // 7. Calculate prizes per winner
    const prizes = {
      match5: calculatePrizePerWinner(pools.jackpot, simulation.match5.length),
      match4: calculatePrizePerWinner(pools.pool4match, simulation.match4.length),
      match3: calculatePrizePerWinner(pools.pool3match, simulation.match3.length),
    }

    // If simulate only — return preview without saving
    if (simulateOnly) {
      return NextResponse.json({
        drawNumbers,
        totalSubscribers: activeUsers.length,
        totalPool,
        pools,
        prizes,
        simulation: {
          match5Count: simulation.match5.length,
          match4Count: simulation.match4.length,
          match3Count: simulation.match3.length,
          noMatchCount: simulation.noMatch.length,
          jackpotRollover: simulation.match5.length === 0,
        }
      })
    }

    // 8. Save draw to database
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .insert({
        draw_date: new Date().toISOString().split('T')[0],
        draw_numbers: drawNumbers,
        status: 'pending',
        draw_type: drawType,
        total_pool: totalPool,
        jackpot_pool: pools.jackpot,
        pool_4match: pools.pool4match,
        pool_3match: pools.pool3match,
        jackpot_rollover: jackpotRollover || 0,
      })
      .select()
      .single()

    if (drawError) throw drawError

    // 9. Save draw entries
    const drawEntries = entries.map(entry => ({
      draw_id: draw.id,
      user_id: entry.userId,
      user_scores: entry.scores,
      numbers_matched: checkMatches(drawNumbers, entry.scores),
      prize_amount: 0,
    }))

    await supabaseAdmin.from('draw_entries').insert(drawEntries)

    // 10. Save winners
    const winnersToInsert = []

    simulation.match5.forEach(entry => {
      winnersToInsert.push({
        draw_id: draw.id,
        user_id: entry.userId,
        match_type: '5-match',
        prize_amount: prizes.match5,
        status: 'pending',
        payout_status: 'unpaid'
      })
    })

    simulation.match4.forEach(entry => {
      winnersToInsert.push({
        draw_id: draw.id,
        user_id: entry.userId,
        match_type: '4-match',
        prize_amount: prizes.match4,
        status: 'pending',
        payout_status: 'unpaid'
      })
    })

    simulation.match3.forEach(entry => {
      winnersToInsert.push({
        draw_id: draw.id,
        user_id: entry.userId,
        match_type: '3-match',
        prize_amount: prizes.match3,
        status: 'pending',
        payout_status: 'unpaid'
      })
    })

    if (winnersToInsert.length > 0) {
      await supabaseAdmin.from('winners').insert(winnersToInsert)
    }

    // 11. Handle jackpot rollover
    const newRollover = simulation.match5.length === 0 ? pools.jackpot : 0

    return NextResponse.json({
      success: true,
      drawId: draw.id,
      drawNumbers,
      totalSubscribers: activeUsers.length,
      totalPool,
      pools,
      prizes,
      simulation: {
        match5Count: simulation.match5.length,
        match4Count: simulation.match4.length,
        match3Count: simulation.match3.length,
        noMatchCount: simulation.noMatch.length,
        jackpotRollover: simulation.match5.length === 0,
        newRolloverAmount: newRollover,
      }
    })

  } catch (error) {
    console.error('Draw error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
