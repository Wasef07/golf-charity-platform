import { supabase } from './supabase'

// GET ALL DASHBOARD DATA IN ONE CALL
export async function getDashboardData(userId) {
  // Run all queries in parallel for speed
  const [scoresRes, winnersRes, drawsRes, profileRes] = await Promise.all([
    // Latest 5 scores
    supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(5),

    // User's winnings
    supabase
      .from('winners')
      .select('*, draws(draw_date, draw_numbers)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    // Latest published draws
    supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(3),

    // Full profile with charity
    supabase
      .from('profiles')
      .select('*, charities(name, category, image_url)')
      .eq('id', userId)
      .single()
  ])

  return {
    scores: scoresRes.data || [],
    winners: winnersRes.data || [],
    draws: drawsRes.data || [],
    profile: profileRes.data || null,
  }
}