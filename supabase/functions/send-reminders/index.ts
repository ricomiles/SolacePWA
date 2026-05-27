import webPush from 'npm:web-push@3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NUDGES = [
  'How did today feel?',
  'A few quiet minutes.',
  'Your journal is waiting.',
  'Take a moment for yourself.',
  "What's on your mind today?",
  'Reflection time.',
  'A thought worth keeping?',
  'How are you, really?',
  'A breath, a thought, a line.',
  'The page is yours.',
]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidPublicKey  = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidSubject    = Deno.env.get('VAPID_SUBJECT')
    const supabaseUrl     = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!vapidPrivateKey || !vapidPublicKey || !vapidSubject || !supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing required environment variables.')
    }

    webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    // Determine the current UTC hour as "HH:00" to match reminder_time values.
    const now = new Date()
    const currentHour = now.getUTCHours().toString().padStart(2, '0') + ':00'

    // Fetch subscriptions whose reminder_time matches the current UTC hour.
    const res = await fetch(
      `${supabaseUrl}/rest/v1/push_subscriptions?reminder_time=eq.${encodeURIComponent(currentHour)}&select=user_id,subscription`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      },
    )

    if (!res.ok) {
      throw new Error(`Supabase query failed: ${res.status} ${await res.text()}`)
    }

    const rows: Array<{ user_id: string; subscription: PushSubscriptionJSON }> = await res.json()

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: 'No subscriptions due at this hour.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Pick a nudge that rotates through the list based on the current day.
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) / 86_400_000,
    )
    const nudgeBody = NUDGES[dayOfYear % NUDGES.length]

    const payload = JSON.stringify({ title: 'Solace', body: nudgeBody, url: '/' })

    const results = await Promise.allSettled(
      rows.map(({ subscription }) =>
        webPush.sendNotification(subscription as webPush.PushSubscription, payload),
      ),
    )

    const sent    = results.filter(r => r.status === 'fulfilled').length
    const failed  = results.filter(r => r.status === 'rejected').length

    return new Response(
      JSON.stringify({ sent, failed, hour: currentHour }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
