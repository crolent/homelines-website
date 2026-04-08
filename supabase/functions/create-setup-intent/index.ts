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

    const { email, name } = await req.json();
    const cleanEmail = String(email ?? '').trim();
    const cleanName = String(name ?? '').trim();

    if (!cleanEmail) {
      return new Response(JSON.stringify({ error: 'Missing email' }), {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const customers = await stripe.customers.list({ email: cleanEmail, limit: 1 });
    let customer = customers.data[0];
    if (!customer) {
      customer = await stripe.customers.create({ email: cleanEmail, name: cleanName || undefined });
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_types: ['card'],
    });

    return new Response(
      JSON.stringify({
        clientSecret: setupIntent.client_secret,
        customerId: customer.id,
      }),
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      },
    );
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
