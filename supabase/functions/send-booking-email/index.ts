import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY    = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL        = 'Homelines Cleaning <noreply@homelinescleaning.com>';
const ADMIN_TO_EMAIL    = 'serdar.atamoglanov@gmail.com';
const ADMIN_TO_EMAIL_2  = 'tsikhotskyi@icloud.com';
const ALL_ADMINS        = [ADMIN_TO_EMAIL, ADMIN_TO_EMAIL_2];

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
      service_city,
      sqft,
      bedrooms,
      bathrooms,
      half_baths,
      sofa_quantity,
      mattress_quantity,
      extras,
      included_extras,
      has_pets,
      notes,
      coupon_code,
      coupon_discount,
      message,
    } = await req.json();

    const sofaQty = Math.max(0, parseInt(String(sofa_quantity ?? '0')) || 0);
    const matQty  = Math.max(0, parseInt(String(mattress_quantity ?? '0')) || 0);
    const hasSofaMattress = sofaQty > 0 || matQty > 0;
    const sofaMattressLabel = hasSofaMattress
      ? `Sofas: ${sofaQty} · Mattresses: ${matQty}`
      : '';

    const safeNum = (v: unknown) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    let extrasArr: any[] = Array.isArray(extras) ? extras : [];
    if (typeof extras === 'string') {
      try { extrasArr = JSON.parse(extras); } catch (e) { extrasArr = []; }
    }

    let includedArr: any[] = Array.isArray(included_extras) ? included_extras : [];
    if (typeof included_extras === 'string') {
      try { includedArr = JSON.parse(included_extras); } catch (e) { includedArr = []; }
    }

    const formattedDate = booking_date
      ? new Date(booking_date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : booking_date;

    const homeSizeLabel = [
      sqft ? `${sqft} sqft` : '',
      bedrooms ? `${bedrooms} bed` : '',
      bathrooms ? `${bathrooms} bath` : '',
      half_baths && String(half_baths) !== '0' ? `${half_baths} half bath` : '',
    ].filter(Boolean).join(' · ');

    const extrasHtml = extrasArr && extrasArr.length
      ? extrasArr.map((e: any) => `${e?.name} (+$${safeNum(e?.price)})`).join('<br/>')
      : '';

    const includedHtml = includedArr && includedArr.length
      ? includedArr.map((n: any) => `✅ Included ${n}`).join('<br/>')
      : '';

    const couponLabel = coupon_code
      ? `${coupon_code}${safeNum(coupon_discount) > 0 ? ` (−$${safeNum(coupon_discount)})` : ''}`
      : '';

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
                ${hasSofaMattress ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;font-weight:500;">🛋️ Sofa/Mattress</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${sofaMattressLabel}</span>
                  </td>
                </tr>` : ''}
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
                ${service_city ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏙️ City</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${service_city}</span></td>
                </tr>` : ''}
                ${homeSizeLabel ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏠 Size</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${homeSizeLabel}</span></td>
                </tr>` : ''}
                ${includedHtml ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">✅ Included</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${includedHtml}</span></td>
                </tr>` : ''}
                ${extrasHtml ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">✨ Extras</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${extrasHtml}</span></td>
                </tr>` : ''}
                ${has_pets ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🐾 Pets</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#e97316;font-weight:700;">Pets at home</span></td>
                </tr>` : ''}
                ${couponLabel ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏷️ Coupon</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#14532d;font-weight:800;">${couponLabel}</span></td>
                </tr>` : ''}
                ${notes ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">� Notes</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-style:italic;">${notes}</span></td>
                </tr>` : ''}
                <tr>
                  <td style="padding:12px 0 0;">
                    <span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Total Price</span>
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
                ${hasSofaMattress ? `<tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">🛋️ Sofa/Mattress</span>
                  </td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${sofaMattressLabel}</span>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:13px;color:#6b7280;font-weight:500;">📍 Address</span>
                  </td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:600;">${fullAddress || '—'}</span>
                  </td>
                </tr>
                ${service_city ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">📍 Service City</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${service_city}</span></td></tr>` : ''}
                ${homeSizeLabel ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">🏠 Home Size</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${homeSizeLabel}</span></td></tr>` : ''}
                ${has_pets ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">🐾 Pets</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#e97316;font-weight:600;">Yes</span></td></tr>` : ''}
                ${includedHtml ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:13px;color:#6b7280;font-weight:500;">✅ Included</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${includedHtml}</span></td></tr>` : ''}
                ${extrasHtml ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:13px;color:#6b7280;font-weight:500;">✨ Extras</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${extrasHtml}</span></td></tr>` : ''}
                ${couponLabel ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">🏷️ Coupon</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#14532d;font-weight:800;">${couponLabel}</span></td></tr>` : ''}
                ${notes ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:13px;color:#6b7280;font-weight:500;">📝 Notes</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-style:italic;">${notes}</span></td></tr>` : ''}
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
                ${hasSofaMattress ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🛋️ Sofa/Mattress</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${sofaMattressLabel}</span></td>
                </tr>` : ''}
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
                ${service_city ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏙️ City</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${service_city}</span></td>
                </tr>` : ''}
                ${homeSizeLabel ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏠 Size</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${homeSizeLabel}</span></td>
                </tr>` : ''}
                ${includedHtml ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">✅ Included</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${includedHtml}</span></td>
                </tr>` : ''}
                ${extrasHtml ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">✨ Extras</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${extrasHtml}</span></td>
                </tr>` : ''}
                ${has_pets ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🐾 Pets</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#e97316;font-weight:700;">Pets at home</span></td>
                </tr>` : ''}
                ${couponLabel ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏷️ Coupon</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#14532d;font-weight:800;">${couponLabel}</span></td>
                </tr>` : ''}
                ${notes ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">📝 Notes</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-style:italic;">${notes}</span></td>
                </tr>` : ''}
                <tr>
                  <td style="padding:12px 0 0;"><span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Total Price</span></td>
                  <td style="padding:12px 0 0;text-align:right;"><span style="font-size:18px;color:#1e3a5c;font-weight:800;">$${price}</span></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Options -->
          <tr>
            <td style="padding:0 40px 28px;">
              <h2 style="margin:0 0 14px;font-size:17px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">💳 Payment Options</h2>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 10px;">
                    <table cellpadding="0" cellspacing="0" style="width:100%;">
                      <tr>
                        <td align="center" style="padding:6px;width:50%;">
                          <a href="https://homelinescleaning.com/pay.html?ref=${encodeURIComponent(ref_code || '')}" style="display:inline-block;background:#4db8e8;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:8px;">💳 Pay Now Online</a>
                        </td>
                        <td align="center" style="padding:6px;width:50%;">
                          <span style="display:inline-block;border:2px solid #d1d5db;color:#6b7280;font-size:15px;font-weight:800;padding:14px 28px;border-radius:8px;">🏠 Pay on Arrival</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 10px;text-align:center;">
                    <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">Pay online now for a faster check-in, or pay with cash, check, or card when our team arrives.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">📋 Cancellation Policy: Free cancellation 24+ hours before. Less than 24 hours: $50 fee. No-show: 50% of booking total.</p>
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

    const adminConfirmHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,92,0.12);">
          <tr>
            <td style="background:#1a2b4a;padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;justify-content:center;">
                <span style="font-size:28px;line-height:1;">🏠</span>
                <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Homelines<span style="color:#4db8e8;font-weight:800;"> Cleaning</span></span>
              </div>
              <div style="font-size:13px;color:#94a3b8;margin-top:8px;letter-spacing:0.3px;">Admin Notification</div>
            </td>
          </tr>
          <tr>
            <td style="background:#dcfce7;padding:24px 40px;text-align:center;border-bottom:1px solid #bbf7d0;">
              <div style="font-size:36px;">✅</div>
              <h1 style="margin:10px 0 4px;font-size:22px;font-weight:800;color:#14532d;">Booking Confirmed!</h1>
              <p style="margin:0;font-size:14px;color:#166534;">You confirmed a booking. The customer has been notified.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Booking Reference</p>
              <div style="display:inline-block;background:#1e3a5c;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:4px;padding:14px 36px;border-radius:10px;">${ref_code}</div>
            </td>
          </tr>
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
          <tr>
            <td style="padding:28px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">👤 Customer Information</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Name</span></td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:700;">${fullName}</span></td>
                </tr>
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Email</span></td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><a href="mailto:${email}" style="font-size:14px;color:#1e3a5c;font-weight:700;text-decoration:none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding:9px 0;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Phone</span></td>
                  <td style="padding:9px 0;text-align:right;"><a href="tel:${phone || ''}" style="font-size:14px;color:#1e3a5c;font-weight:700;text-decoration:none;">${phone || '—'}</a></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">📋 Booking Details</h2>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">🧹 Service</span></td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${service}</span></td>
                </tr>
                ${hasSofaMattress ? `<tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">🛋️ Sofa/Mattress</span></td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${sofaMattressLabel}</span></td>
                </tr>` : ''}
                <tr>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">📍 Address</span></td>
                  <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${fullAddress || '—'}</span></td>
                </tr>
                <tr>
                  <td style="padding:11px 0 0;"><span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Price</span></td>
                  <td style="padding:11px 0 0;text-align:right;"><span style="font-size:20px;color:#1e3a5c;font-weight:800;">$${price}</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px;text-align:center;">
              <a href="https://homelinescleaning.com/admin.html" style="display:inline-block;background:#166534;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;">🖥️ View in Dashboard →</a>
            </td>
          </tr>
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

    const underReviewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Under Review</title>
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

          <!-- Review Banner -->
          <tr>
            <td style="background:#fffbeb;padding:28px 40px;text-align:center;border-bottom:1px solid #fde68a;">
              <div style="font-size:40px;">⏳</div>
              <h1 style="margin:12px 0 6px;font-size:24px;font-weight:700;color:#92400e;">Your booking is under review!</h1>
              <p style="margin:0;font-size:15px;color:#b45309;">Hi ${first_name}, thank you for your booking request. Our team is currently reviewing your details and will confirm your booking shortly.</p>
            </td>
          </tr>

          <!-- Subtext -->
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">You'll receive a confirmation email once approved. This usually takes less than 1 hour.</p>
            </td>
          </tr>

          <!-- Ref Code -->
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
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
                ${service_city ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏙️ City</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${service_city}</span></td>
                </tr>` : ''}
                ${homeSizeLabel ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏠 Size</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:600;">${homeSizeLabel}</span></td>
                </tr>` : ''}
                ${includedHtml ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">✅ Included</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${includedHtml}</span></td>
                </tr>` : ''}
                ${extrasHtml ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">✨ Extras</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:500;">${extrasHtml}</span></td>
                </tr>` : ''}
                ${has_pets ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🐾 Pets</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#e97316;font-weight:700;">Pets at home</span></td>
                </tr>` : ''}
                ${couponLabel ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:14px;color:#6b7280;font-weight:500;">🏷️ Coupon</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#14532d;font-weight:800;">${couponLabel}</span></td>
                </tr>` : ''}
                ${notes ? `<tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;"><span style="font-size:14px;color:#6b7280;font-weight:500;">📝 Notes</span></td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-style:italic;">${notes}</span></td>
                </tr>` : ''}
                <tr>
                  <td style="padding:12px 0 0;"><span style="font-size:15px;color:#1e3a5c;font-weight:700;">💳 Total Price</span></td>
                  <td style="padding:12px 0 0;text-align:right;"><span style="font-size:18px;color:#1e3a5c;font-weight:800;">$${price}</span></td>
                </tr>
              </table>
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

    if (type === 'contact_message') {
      const contactFullName = [first_name, last_name].filter(Boolean).join(' ');
      const contactHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,92,0.12);">
        <tr><td style="background:#1a2b4a;padding:32px 40px;text-align:center;">
          <div style="display:inline-flex;align-items:center;gap:10px;justify-content:center;">
            <span style="font-size:28px;">🏠</span>
            <span style="font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Homelines<span style="color:#4db8e8;"> Cleaning</span></span>
          </div>
          <div style="font-size:13px;color:#94a3b8;margin-top:8px;">Admin Notification</div>
        </td></tr>
        <tr><td style="background:#fffbeb;padding:24px 40px;text-align:center;border-bottom:1px solid #fde68a;">
          <div style="font-size:36px;">📩</div>
          <h1 style="margin:10px 0 4px;font-size:22px;font-weight:800;color:#92400e;">New Contact Message!</h1>
          <p style="margin:0;font-size:14px;color:#b45309;">Reply directly to this email to respond to the customer.</p>
        </td></tr>
        <tr><td style="padding:28px 40px 0;">
          <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">👤 Customer Details</h2>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Name</span></td>
              <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:700;">${contactFullName || '—'}</span></td>
            </tr>
            <tr>
              <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Email</span></td>
              <td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><a href="mailto:${email}" style="font-size:14px;color:#1e3a5c;font-weight:700;text-decoration:none;">${email || '—'}</a></td>
            </tr>
            ${phone ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Phone</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><a href="tel:${phone}" style="font-size:14px;color:#1e3a5c;font-weight:700;text-decoration:none;">${phone}</a></td></tr>` : ''}
            ${service ? `<tr><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:500;">Service</span></td><td style="padding:9px 0;border-bottom:1px solid #f3f4f6;text-align:right;"><span style="font-size:14px;color:#111827;font-weight:700;">${service}</span></td></tr>` : ''}
          </table>
        </td></tr>
        <tr><td style="padding:24px 40px 0;">
          <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;color:#1e3a5c;border-bottom:2px solid #e5e7eb;padding-bottom:10px;">💬 Message</h2>
          <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap;">${message || '—'}</div>
        </td></tr>
        <tr><td style="padding:28px 40px;text-align:center;">
          <a href="mailto:${email}?subject=Re:%20Your%20message%20to%20Homelines%20Cleaning" style="display:inline-block;background:#1e3a5c;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;">✉️ Reply to Customer →</a>
        </td></tr>
        <tr><td style="padding:0 40px 20px;text-align:center;">
          <a href="https://homelinescleaning.com/admin.html" style="display:inline-block;background:#f1f5f9;color:#1e3a5c;font-size:14px;font-weight:700;text-decoration:none;padding:11px 28px;border-radius:10px;">🖥️ View in Admin Panel →</a>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 Homelines LLC. Automated admin notification.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const contactRes = await sendEmail({
        from: FROM_EMAIL,
        to: ['info@homelinescleaning.com', ADMIN_TO_EMAIL],
        reply_to: email,
        subject: `📩 New Contact Message — ${contactFullName || email}`,
        html: contactHtml,
      });
      const contactResult = await contactRes.json();
      if (!contactRes.ok) {
        console.error('Resend contact_message error:', contactResult);
        return new Response(JSON.stringify({ error: contactResult }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ success: true, id: contactResult.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (type === 'under_review') {
      const res = await sendEmail({
        from: FROM_EMAIL,
        to: [email],
        reply_to: ADMIN_TO_EMAIL,
        subject: `⏳ Booking Under Review – ${ref_code} | Homelines Cleaning`,
        html: underReviewHtml,
      });
      const result = await res.json();
      if (!res.ok) {
        console.error('Resend under_review error:', result);
        return new Response(JSON.stringify({ error: result }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ success: true, id: result.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (type === 'admin_notification') {
      const adminRes = await sendEmail({
        from: FROM_EMAIL,
        to: ALL_ADMINS,
        reply_to: email,
        subject: `🔔 New Booking – ${ref_code} | ${service}`,
        html: adminHtml,
      });
      const adminResult = await adminRes.json();
      if (!adminRes.ok) {
        console.error('Resend admin_notification error:', adminResult);
        return new Response(JSON.stringify({ error: adminResult }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ success: true, id: adminResult.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (type === 'confirmation') {
      const [customerRes, adminConfirmRes] = await Promise.all([
        sendEmail({
          from: FROM_EMAIL,
          to: [email],
          reply_to: ADMIN_TO_EMAIL,
          subject: `✅ Your Booking is Confirmed – ${ref_code} | Homelines Cleaning`,
          html: confirmationHtml,
        }),
        sendEmail({
          from: FROM_EMAIL,
          to: ALL_ADMINS,
          reply_to: email,
          subject: `✅ New Booking Confirmed – ${ref_code} | ${service}`,
          html: adminConfirmHtml,
        }),
      ]);
      const [customerResult, adminConfirmResult] = await Promise.all([
        customerRes.json(),
        adminConfirmRes.json(),
      ]);
      if (!customerRes.ok || !adminConfirmRes.ok) {
        const errors = { customer: customerRes.ok ? null : customerResult, admin: adminConfirmRes.ok ? null : adminConfirmResult };
        console.error('Resend confirmation errors:', errors);
        return new Response(JSON.stringify({ error: errors }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ success: true, customer: customerResult.id, admin: adminConfirmResult.id }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (type === 'payment_receipt') {
      const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#1e3a5c;padding:26px 28px;">
              <div style="font-size:18px;font-weight:800;color:#ffffff;">Homelines Cleaning</div>
              <div style="margin-top:6px;font-size:13px;color:rgba(255,255,255,0.85);">Payment Receipt</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 10px;">
              <div style="font-size:18px;font-weight:900;color:#1e3a5c;">✅ Payment successful!</div>
              <div style="margin-top:8px;font-size:14px;color:#374151;line-height:1.5;">Thank you — we’ve received your payment for booking <span style="font-weight:800;color:#1e3a5c;">${ref_code}</span>.</div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:14px;padding:14px 16px;">
                <tr>
                  <td style="padding:8px 0;"><span style="font-size:13px;color:#6b7280;font-weight:600;">Service</span></td>
                  <td style="padding:8px 0;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:700;">${service}</span></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;border-top:1px solid #f3f4f6;"><span style="font-size:13px;color:#6b7280;font-weight:600;">Appointment</span></td>
                  <td style="padding:8px 0;border-top:1px solid #f3f4f6;text-align:right;"><span style="font-size:13px;color:#111827;font-weight:700;">${booking_date} · ${booking_time}</span></td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-top:1px solid #f3f4f6;"><span style="font-size:14px;color:#1e3a5c;font-weight:800;">Total Paid</span></td>
                  <td style="padding:10px 0;border-top:1px solid #f3f4f6;text-align:right;"><span style="font-size:16px;color:#1e3a5c;font-weight:900;">$${price}</span></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:22px 28px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Questions? Contact us at</p>
              <a href="mailto:info@homelinescleaning.com" style="color:#1e3a5c;font-weight:700;font-size:14px;text-decoration:none;">info@homelinescleaning.com</a>
              <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">© 2026 Homelines LLC. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const res = await sendEmail({
        from: FROM_EMAIL,
        to: [email],
        reply_to: ADMIN_TO_EMAIL,
        subject: `🧾 Payment Receipt – ${ref_code} | Homelines Cleaning`,
        html: receiptHtml,
      });
      const result = await res.json();
      if (!res.ok) {
        console.error('Resend payment_receipt error:', result);
        return new Response(JSON.stringify({ error: result }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return new Response(JSON.stringify({ success: true, id: result.id }), {
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
        to: ALL_ADMINS,
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
