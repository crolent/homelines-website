import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function stripeRequest(path: string, init: RequestInit) {
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
  if (!stripeKey) throw new Error('Missing STRIPE_SECRET_KEY');

  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${stripeKey}`,
      ...(init.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as any)?.error?.message || `Stripe API error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();
    const cleanEmail = String(email ?? '').trim();
    const cleanName = String(name ?? '').trim();

    if (!cleanEmail) return json({ error: 'Missing email' }, 400);

    const search = await stripeRequest(`/customers/search?query=${encodeURIComponent(`email:'${cleanEmail}'`)}`, {
      method: 'GET',
    });

    let customerId: string | null = (search as any)?.data?.[0]?.id ?? null;

    if (!customerId) {
      const body = new URLSearchParams();
      body.set('email', cleanEmail);
      if (cleanName) body.set('name', cleanName);

      const created = await stripeRequest('/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      customerId = (created as any)?.id ?? null;
    }

    if (!customerId) throw new Error('Failed to resolve Stripe customer');

    const siBody = new URLSearchParams();
    siBody.set('customer', customerId);
    siBody.set('payment_method_types[0]', 'card');

    const setupIntent = await stripeRequest('/setup_intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: siBody,
    });

    const clientSecret: string | null = (setupIntent as any)?.client_secret ?? null;
    if (!clientSecret) throw new Error('Failed to create SetupIntent');

    return json({ clientSecret, customerId });
  } catch (error) {
    console.error('Error:', error);
    return json({
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
});
