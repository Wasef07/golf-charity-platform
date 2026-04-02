import { supabase } from './supabase'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

// CHECK IF USER IS ADMIN
export async function isAdmin(user) {
  return user?.email === ADMIN_EMAIL
}

// GET ALL USERS
export async function getAllUsers() {
  const response = await fetch('/api/admin/users')
  const data = await response.json()
  return data
}

// GET ALL WINNERS
export async function getAllWinners() {
  const response = await fetch('/api/admin/winners')
  const data = await response.json()
  return data
}

// GET ANALYTICS
export async function getAnalytics() {
  const response = await fetch('/api/admin/analytics')
  const data = await response.json()
  return data
}

// UPDATE WINNER STATUS
export async function updateWinnerStatus(winnerId, status, payoutStatus) {
  const response = await fetch('/api/admin/winners/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ winnerId, status, payoutStatus })
  })
  return response.json()
}

// UPDATE USER SUBSCRIPTION
export async function updateUserSubscription(userId, status) {
  const response = await fetch('/api/admin/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, status })
  })
  return response.json()
}