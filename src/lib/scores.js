import { supabase } from './supabase'

// GET USER'S SCORES (latest 5, newest first)
export async function getUserScores(userId) {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(5)
  return { data, error }
}

// ADD NEW SCORE (with rolling 5-score logic)
export async function addScore(userId, score, playedAt) {
  // First get current scores
  const { data: existingScores } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })

  // If already 5 scores, delete the oldest one
  if (existingScores && existingScores.length >= 5) {
    const oldest = existingScores[existingScores.length - 1]
    await supabase
      .from('scores')
      .delete()
      .eq('id', oldest.id)
  }

  // Insert new score
  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: userId,
      score: parseInt(score),
      played_at: playedAt
    })
    .select()
    .single()

  return { data, error }
}

// UPDATE EXISTING SCORE
export async function updateScore(scoreId, score, playedAt) {
  const { data, error } = await supabase
    .from('scores')
    .update({
      score: parseInt(score),
      played_at: playedAt
    })
    .eq('id', scoreId)
    .select()

  if (error) {
    console.error('Update score error:', error)
  }

  return { data, error }
}

// DELETE SCORE
export async function deleteScore(scoreId) {
  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', scoreId)
  return { error }
}