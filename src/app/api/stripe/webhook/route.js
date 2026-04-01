import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

// Use service role for webhook — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata.supabase_user_id
        const subscriptionId = session.subscription

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
          ? 'monthly' : 'yearly'

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_plan: plan,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customer = await stripe.customers.retrieve(subscription.customer)

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'inactive' })
            .eq('id', profile.id)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object

        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: subscription.status === 'active' ? 'active' : 'inactive',
              subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', profile.id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}