(function initPayPage() {
  const PAY_STATE_EL = document.getElementById('payState');

  const SUPABASE_URL = 'https://acfsvzbjfiynlcbjvtbq.supabase.co';
  const CHARGE_URL = `${SUPABASE_URL}/functions/v1/charge-customer`;
  const CONFIRM_URL = `${SUPABASE_URL}/functions/v1/confirm-payment`;
  const EMAIL_URL = `${SUPABASE_URL}/functions/v1/send-booking-email`;
  const SUPABASE_ANON_KEY = 'sb_publishable_3tsuAIyp2yIn2MVadqgcRA_RKvkgf8g';

  function escHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function safeNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }

  function parseRefFromUrl() {
    const p = new URLSearchParams(window.location.search);
    const ref = (p.get('ref') || '').trim();
    return ref;
  }

  function setStateHtml(html) {
    if (!PAY_STATE_EL) return;
    PAY_STATE_EL.innerHTML = html;
  }

  function renderError(title, msg) {
    setStateHtml(`
      <div style="text-align:center; padding: 18px 10px;">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">⚠️</div>
        <div style="font-weight: 900; color: var(--navy); font-size: 1.15rem;">${escHtml(title)}</div>
        <div style="color: var(--gray-dark); margin-top: 6px;">${escHtml(msg)}</div>
        <div style="margin-top: 16px; display:flex; justify-content:center; gap: 10px; flex-wrap: wrap;">
          <a class="btn btn-navy btn-sm" href="booking.html">Book Again</a>
          <a class="btn btn-primary btn-sm" href="contact.html">Contact Us</a>
        </div>
      </div>
    `);
  }

  function renderAlreadyPaid() {
    setStateHtml(`
      <div style="text-align:center; padding: 18px 10px;">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">✅</div>
        <div style="font-weight: 900; color: var(--navy); font-size: 1.15rem;">This booking has already been paid</div>
        <div style="color: var(--gray-dark); margin-top: 6px;">Thank you — no further action is needed.</div>
      </div>
    `);
  }

  function renderSuccess() {
    setStateHtml(`
      <div style="text-align:center; padding: 18px 10px;">
        <div style="font-size: 2.2rem; margin-bottom: 10px;">✅</div>
        <div style="font-weight: 900; color: var(--navy); font-size: 1.15rem;">Payment successful! Thank you.</div>
        <div style="color: var(--gray-dark); margin-top: 6px;">We’ve received your payment and will see you soon.</div>
      </div>
    `);
  }

  function renderBooking(booking) {
    const date = booking.booking_date
      ? new Date(booking.booking_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '—';
    const time = booking.booking_time || '—';
    const total = safeNum(booking.price);

    const service = booking.service || '—';
    const address = booking.address || '—';

    const payDisabledReason = !booking.stripe_customer_id
      ? 'Missing payment details'
      : total <= 0
        ? 'Invalid total'
        : '';

    setStateHtml(`
      <div style="display:grid; grid-template-columns: 1fr; gap: 14px; padding: 6px 0;">

        <div style="background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 14px; padding: 18px 18px; box-shadow: var(--shadow-sm);">
          <div style="display:flex; align-items:center; justify-content:space-between; gap: 10px; flex-wrap: wrap;">
            <div style="font-weight: 900; color: var(--navy); font-size: 1.1rem;">Booking Summary</div>
            <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-weight: 800; font-size: 0.85rem; color: var(--navy); background: #eff6ff; padding: 4px 10px; border-radius: 999px;">${escHtml(booking.ref_code || '')}</div>
          </div>

          <div style="margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="border: 1px solid rgba(226,232,240,0.9); border-radius: 12px; padding: 12px 12px;">
              <div style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; color: #64748b; text-transform: uppercase;">Service</div>
              <div style="margin-top: 4px; font-weight: 700; color: #1e293b;">${escHtml(service)}</div>
            </div>
            <div style="border: 1px solid rgba(226,232,240,0.9); border-radius: 12px; padding: 12px 12px;">
              <div style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; color: #64748b; text-transform: uppercase;">Date & Time</div>
              <div style="margin-top: 4px; font-weight: 700; color: #1e293b;">${escHtml(date)} · ${escHtml(time)}</div>
            </div>
            <div style="grid-column: 1 / -1; border: 1px solid rgba(226,232,240,0.9); border-radius: 12px; padding: 12px 12px;">
              <div style="font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; color: #64748b; text-transform: uppercase;">Address</div>
              <div style="margin-top: 4px; font-weight: 700; color: #1e293b;">${escHtml(address)}</div>
            </div>
          </div>

          <div style="margin-top: 14px; display:flex; align-items:baseline; justify-content:space-between; gap: 12px; flex-wrap: wrap;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #475569;">Total</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--navy);">$${total.toLocaleString()}</div>
          </div>

          <div style="margin-top: 14px;">
            <button id="payBtn" class="btn btn-primary btn-lg" style="width: 100%; justify-content: center;" ${payDisabledReason ? 'disabled' : ''}>
              Pay $${total.toLocaleString()}
            </button>
            ${payDisabledReason ? `<div style="margin-top:10px;color:#b91c1c;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.25);padding:10px 12px;border-radius:12px;font-weight:700;font-size:0.9rem;">${escHtml(payDisabledReason)}</div>` : ''}
          </div>

          <div style="margin-top: 14px; color: #64748b; font-size: 0.85rem; line-height: 1.45;">
            <div style="font-weight:800;color:#475569;margin-bottom:4px;">Cancellation Policy</div>
            <div>Free cancellation up to 24 hours before your appointment. Cancellations within 24 hours may be charged $50. No-shows may be charged 50% of the service total.</div>
          </div>
        </div>

        <div style="text-align:center; color:#64748b; font-size:0.8rem;">
          Having trouble? <a href="contact.html" style="color: var(--navy); font-weight: 800; text-decoration: none;">Contact support</a>
        </div>

      </div>
    `);

    const btn = document.getElementById('payBtn');
    if (btn) {
      btn.addEventListener('click', async () => {
        await handlePayClick(booking);
      });
    }
  }

  async function handlePayClick(booking) {
    const btn = document.getElementById('payBtn');
    if (!btn) return;

    const total = safeNum(booking.price);
    if (!booking.stripe_customer_id || total <= 0) return;

    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Processing…';

    try {
      const chargeRes = await fetch(CHARGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: booking.stripe_customer_id,
          amount: total,
          description: `Homelines booking ${booking.ref_code}`,
        }),
      });

      const chargeJson = await chargeRes.json().catch(() => ({}));
      if (!chargeRes.ok || !chargeJson?.success) {
        throw new Error(chargeJson?.error || `Charge failed (HTTP ${chargeRes.status})`);
      }

      const paymentId = String(chargeJson?.paymentId || '').trim();
      if (!paymentId) throw new Error('Missing payment confirmation ID');

      const confirmRes = await fetch(CONFIRM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref_code: booking.ref_code,
          payment_id: paymentId,
        }),
      });

      const confirmJson = await confirmRes.json().catch(() => ({}));
      if (!confirmRes.ok || !confirmJson?.success) {
        throw new Error(confirmJson?.error || `Confirmation failed (HTTP ${confirmRes.status})`);
      }

      const email = String(booking.email || '').trim();
      if (email) {
        const emailRes = await fetch(EMAIL_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            type: 'payment_receipt',
            email,
            ref_code: booking.ref_code,
            service: booking.service,
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            price: booking.price,
          }),
        });

        if (!emailRes.ok) {
          console.warn('Receipt email failed:', emailRes.status);
        }
      }

      renderSuccess();
    } catch (e) {
      console.error('Payment error:', e);
      btn.disabled = false;
      btn.textContent = original;
      const msg = e instanceof Error ? e.message : String(e);
      const errElId = 'payErrBox';
      const old = document.getElementById(errElId);
      if (old) old.remove();
      const box = document.createElement('div');
      box.id = errElId;
      box.style.cssText = 'margin-top:10px;color:#b91c1c;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.25);padding:10px 12px;border-radius:12px;font-weight:700;font-size:0.9rem;';
      box.textContent = '❌ ' + msg;
      btn.parentElement?.appendChild(box);
    }
  }

  async function loadBooking() {
    const ref = parseRefFromUrl();

    console.log('[pay] ref:', ref);

    if (!ref) {
      renderError('Booking not found', 'Missing booking reference in the link.');
      return;
    }

    if (!window.supabase) {
      renderError('Booking not found', 'Payment page is not configured correctly.');
      return;
    }

    try {
      console.log('[pay] loading booking by ref_code...');

      const { data, error } = await window.supabase
        .from('bookings')
        .select('id, ref_code, service, booking_date, booking_time, address, price, stripe_customer_id, payment_status, email')
        .eq('ref_code', ref)
        .single();

      if (error) throw error;
      if (!data) {
        renderError('Booking not found', 'Please double-check your link and try again.');
        return;
      }

      console.log('[pay] booking loaded:', data);

      const ps = String(data.payment_status || '').toLowerCase();
      if (ps === 'paid') {
        renderAlreadyPaid();
        return;
      }

      renderBooking(data);
    } catch (e) {
      console.error('Load booking error:', e);
      renderError('Booking not found', 'Unable to load booking. Please try again later.');
    }
  }

  let loadOnce = null;
  function ensureLoadedOnce() {
    if (!loadOnce) loadOnce = loadBooking();
    return loadOnce;
  }

  ensureLoadedOnce();
})();
