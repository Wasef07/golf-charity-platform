import { supabase } from './supabase'

// SIGN UP
export async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  })
  return { data, error }
}

// SIGN IN
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// SIGN OUT
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// GET CURRENT USER
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET USER PROFILE
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}