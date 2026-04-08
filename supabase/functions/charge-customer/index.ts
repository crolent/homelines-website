import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Missing STRIPE_SECRET_KEY' }), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const { customer_id, amount, description } = await req.json();

    const customerId = String(customer_id ?? '').trim();
    const cleanDesc = String(description ?? '').trim();
    const cleanAmount = Number(amount);

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Missing customer_id' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    if (!Number.isFinite(cleanAmount) || cleanAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    if (!methods.data.length) {
      return new Response(JSON.stringify({ error: 'No saved card' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(cleanAmount * 100),
      currency: 'usd',
      customer: customerId,
      payment_method: methods.data[0].id,
      off_session: true,
      confirm: true,
      description: cleanDesc || undefined,
    });

    return new Response(JSON.stringify({
      success: true,
      paymentId: paymentIntent.id,
    }), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : String(err),
    }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
});
