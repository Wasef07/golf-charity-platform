import { supabase } from './supabase'

// GET ALL CHARITIES
export async function getAllCharities(search = '', category = '') {
  let query = supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  return { data, error }
}

// GET FEATURED CHARITIES
export async function getFeaturedCharities() {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
  return { data, error }
}

// GET SINGLE CHARITY
export async function getCharity(id) {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

// UPDATE USER CHARITY SELECTION
export async function updateUserCharity(userId, charityId, contributionPercent) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      charity_id: charityId,
      charity_contribution_percent: contributionPercent
    })
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}