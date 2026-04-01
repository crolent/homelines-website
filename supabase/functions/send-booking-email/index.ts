import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = 'Homelines Cleaning <info@homelinescleaning.com>';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const {
      email,
      first_name,
      ref_code,
      service,
      booking_date,
      booking_time,
      price,
      address,
      city,
    } = await req.json();

    const formattedDate = booking_date
      ? new Date(booking_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : booking_date;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f7fb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,92,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:#1a2b4a;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;justify-content:center;">
                <span style="font-size:28px;line-height:1;">🏠</span>
                <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Homelines<span style="color:#4db8e8;font-weight:800;"> Cleaning</span></span>
              </div>
              <div style="font-size:13px;color:#94a3b8;margin-top:8px;letter-spacing:0.3px;">Professional Cleaning Services</div>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="background:#ecfdf5;padding:28px 40px;text-align:center;border-bottom:1px solid #d1fae5;">
              <div style="font-size:40px;">✅</div>
              <h1 style="margin:12px 0 6px;font-size:24px;font-weight:700;color:#065f46;">Your booking is confirmed!</h1>
              <p style="margin:0;font-size:15px;color:#047857;">Hi ${first_name}, we're looking forward to cleaning your home.</p>
            </td>
          </tr>

          <!-- Ref Code -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</p>
              <div style="display:inline-block;background:#1e3a5c;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:3px;padding:12px 32px;border-radius:10px;">${ref_code}</div>
              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Save this number for your records</p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding:28px 40px;">
              <h2 style="margin:0 0 18px;font-size:17px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">📋 Booking Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;font-weight:500;">🧹 Service</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${service}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;font-weight:500;">📅 Date</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;font-weight:500;">🕐 Time</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${booking_time}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;font-weight:500;">📍 Address</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${address}${city ? ', ' + city : ''}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;">
                    <span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Estimated Price</span>
                  </td>
                  <td style="padding:12px 0 0;text-align:right;">
                    <span style="font-size:18px;color:#1e3a5c;font-weight:800;">$${price}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#f0f7ff;border-left:4px solid #4db6e8;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1e3a5c;">📌 What happens next?</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">Our team will arrive at your address on the scheduled date. Please ensure someone is available to let us in. We'll bring all necessary cleaning supplies.</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Questions? Contact us at</p>
              <a href="mailto:info@homelinescleaning.com" style="color:#1e3a5c;font-weight:600;font-size:14px;text-decoration:none;">info@homelinescleaning.com</a>
              <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">© 2026 Homelines LLC. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `✅ Booking Confirmed – ${ref_code} | Homelines Cleaning`,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Resend error:', result);
      return new Response(JSON.stringify({ error: result }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
