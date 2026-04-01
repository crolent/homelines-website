import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY    = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL        = 'Homelines Cleaning <noreply@homelinescleaning.com>';
const ADMIN_TO_EMAIL    = 'serdar.atamoglanov@gmail.com';

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
      type = 'new_booking',
      email,
      first_name,
      last_name,
      phone,
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

    const fullName   = [first_name, last_name].filter(Boolean).join(' ');
    const fullAddress = [address, city].filter(Boolean).join(', ');

    const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking Received</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,92,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:#1a2b4a;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;justify-content:center;">
                <span style="font-size:28px;line-height:1;">🏠</span>
                <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Homelines<span style="color:#4db8e8;font-weight:800;"> Cleaning</span></span>
              </div>
              <div style="font-size:13px;color:#94a3b8;margin-top:8px;letter-spacing:0.3px;">Admin Notification</div>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:#fff7ed;padding:24px 40px;text-align:center;border-bottom:1px solid #fed7aa;">
              <div style="font-size:36px;">🔔</div>
              <h1 style="margin:10px 0 4px;font-size:22px;font-weight:800;color:#9a3412;">New Booking Received!</h1>
              <p style="margin:0;font-size:14px;color:#c2410c;">A customer just completed a booking. Review the details below.</p>
            </td>
          </tr>

          <!-- Ref Code -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</p>
              <div style="display:inline-block;background:#1e3a5c;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:4px;padding:14px 36px;border-radius:10px;">${ref_code}</div>
            </td>
          </tr>

          <!-- Date & Time Highlight -->
          <tr>
            <td style="padding:20px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:2px solid #bfdbfe;border-radius:12px;">
                <tr>
                  <td style="padding:18px 24px;text-align:center;">
                    <div style="font-size:13px;color:#1d4ed8;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;">📅 Scheduled Appointment</div>
                    <div style="font-size:22px;font-weight:800;color:#1e3a5c;">${formattedDate}</div>
                    <div style="font-size:18px;font-weight:700;color:#4db6e8;margin-top:4px;">🕐 ${booking_time}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Customer Info -->
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">👤 Customer Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">Name</span>
                  </td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:700;">${fullName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">Email</span>
                  </td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <a href="mailto:${email}" style="font-size:14px;color:#1e3a5c;font-weight:700;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 0;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">Phone</span>
                  </td>
                  <td style="padding:9px 0;text-align:right;">
                    <a href="tel:${phone || ''}" style="font-size:14px;color:#1e3a5c;font-weight:700;text-decoration:none;">${phone || '—'}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">📋 Booking Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">🧹 Service</span>
                  </td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${service}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">📍 Address</span>
                  </td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${fullAddress || '—'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:11px 0 0;">
                    <span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Price</span>
                  </td>
                  <td style="padding:11px 0 0;text-align:right;">
                    <span style="font-size:20px;color:#1e3a5c;font-weight:800;">$${price}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dashboard Button -->
          <tr>
            <td style="padding:28px 40px;text-align:center;">
              <a href="https://homelinescleaning.com/admin.html"
                 style="display:inline-block;background:#1e3a5c;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">
                🖥️ View in Dashboard →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Homelines LLC. This is an automated admin notification.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const sendEmail = (payload: object) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

    const confirmationHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Booking is Confirmed</title>
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

          <!-- Confirmed Banner -->
          <tr>
            <td style="background:#dcfce7;padding:28px 40px;text-align:center;border-bottom:1px solid #bbf7d0;">
              <div style="font-size:40px;">✅</div>
              <h1 style="margin:12px 0 6px;font-size:24px;font-weight:700;color:#14532d;">Your booking is confirmed!</h1>
              <p style="margin:0;font-size:15px;color:#166534;">Great news, ${first_name}! We have reviewed and confirmed your booking.<br>Our team will arrive at the scheduled time.</p>
            </td>
          </tr>

          <!-- Ref Code -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</p>
              <div style="display:inline-block;background:#1e3a5c;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:3px;padding:12px 32px;border-radius:10px;">${ref_code}</div>
              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Keep this for your records</p>
            </td>
          </tr>

          <!-- Booking Details -->
          <tr>
            <td style="padding:28px 40px;">
              <h2 style="margin:0 0 18px;font-size:17px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">📋 Booking Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🧹 Service</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${service}</span></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">📅 Date</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${formattedDate}</span></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🕐 Time</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${booking_time}</span></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">📍 Address</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${address}${city ? ', ' + city : ''}</span></td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;"><span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Estimated Price</span></td>
                  <td style="padding:12px 0 0;text-align:right;"><span style="font-size:18px;color:#1e3a5c;font-weight:800;">$${price}</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding:0 40px 28px;">
              <div style="background:#f0f7ff;border-left:4px solid #4db6e8;border-radius:8px;padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1e3a5c;">📌 What happens next?</p>
                <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">Our team will arrive at your address on the scheduled date and time. Please ensure someone is available to let us in. We'll bring all necessary cleaning supplies.</p>
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

    if (type === 'confirmation') {
      const customerRes = await sendEmail({
        from: FROM_EMAIL,
        to: [email],
        reply_to: ADMIN_TO_EMAIL,
        subject: `✅ Your Booking is Confirmed – ${ref_code} | Homelines Cleaning`,
        html: confirmationHtml,
      });
      const customerResult = await customerRes.json();
      if (!customerRes.ok) {
        console.error('Resend confirmation error:', customerResult);
        return new Response(JSON.stringify({ error: customerResult }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ success: true, id: customerResult.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const [customerRes, adminRes] = await Promise.all([
      sendEmail({
        from: FROM_EMAIL,
        to: [email],
        reply_to: ADMIN_TO_EMAIL,
        subject: `✅ Booking Confirmed – ${ref_code} | Homelines Cleaning`,
        html,
      }),
      sendEmail({
        from: FROM_EMAIL,
        to: [ADMIN_TO_EMAIL],
        reply_to: email,
        subject: `🔔 New Booking – ${ref_code} | ${service}`,
        html: adminHtml,
      }),
    ]);

    const [customerResult, adminResult] = await Promise.all([
      customerRes.json(),
      adminRes.json(),
    ]);

    if (!customerRes.ok || !adminRes.ok) {
      const errors = { customer: customerRes.ok ? null : customerResult, admin: adminRes.ok ? null : adminResult };
      console.error('Resend errors:', errors);
      return new Response(JSON.stringify({ error: errors }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ success: true, customer: customerResult.id, admin: adminResult.id }), {
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
