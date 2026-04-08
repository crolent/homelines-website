import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

    if (!STRIPE_SECRET_KEY) return json({ error: 'Missing STRIPE_SECRET_KEY' }, 500);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer', '').trim();
    if (!token) return json({ error: 'Missing Authorization token' }, 401);

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr) return json({ error: userErr.message }, 401);

    const user = userData?.user;
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const email = String(user.email || '').trim();
    if (!email) return json({ error: 'Missing user email' }, 400);

    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];

    let card_last4: string | null = null;
    let customer_id: string | null = null;
    const payments: Array<{ created: number; amount: number; status: string; ref_code?: string | null }> = [];

    if (customer) {
      customer_id = customer.id;

      const methods = await stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card',
      });

      const pm = methods.data?.[0];
      if (pm?.card?.last4) card_last4 = pm.card.last4;

      const intents = await stripe.paymentIntents.list({
        customer: customer.id,
        limit: 20,
      });

      for (const pi of intents.data || []) {
        const desc = String(pi.description || '');
        const m = desc.match(/HL-[A-Z0-9]+/);
        payments.push({
          created: pi.created,
          amount: (pi.amount_received ?? pi.amount) / 100,
          status: String(pi.status || ''),
          ref_code: m ? m[0] : null,
        });
      }
    }

    return json({
      success: true,
      customer_id,
      card_last4,
      payments,
    });
  } catch (err) {
    return json({
      error: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});
