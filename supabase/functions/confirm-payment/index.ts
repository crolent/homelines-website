import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    if (!STRIPE_SECRET_KEY) {
      return json({ error: 'Missing STRIPE_SECRET_KEY' }, 500);
    }

    const { ref_code, payment_id } = await req.json();

    const ref = String(ref_code ?? '').trim();
    const paymentId = String(payment_id ?? '').trim();

    if (!ref) return json({ error: 'Missing ref_code' }, 400);
    if (!paymentId) return json({ error: 'Missing payment_id' }, 400);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: booking, error: bookingErr } = await supabase
      .from('bookings')
      .select('id, ref_code, price, stripe_customer_id, payment_status')
      .eq('ref_code', ref)
      .maybeSingle();

    if (bookingErr) return json({ error: bookingErr.message }, 500);
    if (!booking) return json({ error: 'Booking not found' }, 404);

    const current = String(booking.payment_status || '').toLowerCase();
    if (current === 'paid') {
      return json({ success: true, already_paid: true });
    }

    if (!booking.stripe_customer_id) {
      return json({ error: 'Missing stripe_customer_id for booking' }, 400);
    }

    const intent = await stripe.paymentIntents.retrieve(paymentId);

    if (!intent || intent.status !== 'succeeded') {
      return json({ error: 'Payment not successful' }, 400);
    }

    if (String(intent.customer || '') !== String(booking.stripe_customer_id)) {
      return json({ error: 'Payment customer mismatch' }, 400);
    }

    const expectedAmount = Math.round(Number(booking.price || 0) * 100);
    const received = typeof intent.amount_received === 'number' ? intent.amount_received : intent.amount;

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return json({ error: 'Invalid booking amount' }, 400);
    }

    if (received !== expectedAmount) {
      return json({ error: 'Payment amount mismatch' }, 400);
    }

    const { error: updErr } = await supabase
      .from('bookings')
      .update({ payment_status: 'paid' })
      .eq('id', booking.id);

    if (updErr) return json({ error: updErr.message }, 500);

    return json({ success: true });
  } catch (err) {
    return json({
      error: err instanceof Error ? err.message : String(err),
    }, 500);
  }
});
