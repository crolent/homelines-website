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
    const { customer_id, amount, description } = await req.json();

    const customerId = String(customer_id ?? '').trim();
    const cleanDesc = String(description ?? '').trim();
    const cleanAmount = Number(amount);

    if (!customerId) return json({ error: 'Missing customer_id' }, 400);
    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) return json({ error: 'Invalid amount' }, 400);

    const pmList = await stripeRequest(`/payment_methods?customer=${encodeURIComponent(customerId)}&type=card`, {
      method: 'GET',
    });

    const paymentMethodId: string | null = (pmList as any)?.data?.[0]?.id ?? null;
    if (!paymentMethodId) return json({ error: 'No saved card' }, 400);

    const piBody = new URLSearchParams();
    piBody.set('amount', String(Math.round(cleanAmount * 100)));
    piBody.set('currency', 'usd');
    piBody.set('customer', customerId);
    piBody.set('payment_method', paymentMethodId);
    piBody.set('off_session', 'true');
    piBody.set('confirm', 'true');
    if (cleanDesc) piBody.set('description', cleanDesc);

    const pi = await stripeRequest('/payment_intents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: piBody,
    });

    const paymentId: string | null = (pi as any)?.id ?? null;
    if (!paymentId) throw new Error('Stripe did not return payment id');

    return json({ success: true, paymentId });
  } catch (err) {
    console.error('Error:', err);
    return json({
      error: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});
