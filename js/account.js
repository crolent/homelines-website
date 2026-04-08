(function initAccount() {
  const SUPABASE_URL = 'https://acfsvzbjfiynlcbjvtbq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_3tsuAIyp2yIn2MVadqgcRA_RKvkgf8g';

  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TJhzfDTexy6QjOdztK8iY1LmAgSefKM74moqmthJ0YpBGM3TeX6l44rEJrgF4zYStIHakLcOKG3KUjSVE2czkdO00Da6MUxrx';
  const SETUP_INTENT_FN = 'create-setup-intent';

  const loginView = document.getElementById('loginView');
  const dashView = document.getElementById('dashView');

  const helloEl = document.getElementById('accountHello');
  const emailEl = document.getElementById('accountEmail');
  const logoutBtn = document.getElementById('logoutBtn');

  const magicEmail = document.getElementById('magicEmail');
  const sendMagicBtn = document.getElementById('sendMagicBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const loginMsg = document.getElementById('loginMsg');

  const tabBtns = Array.from(document.querySelectorAll('.account-tab'));
  const tabBookings = document.getElementById('tabBookings');
  const tabProfile = document.getElementById('tabProfile');
  const tabPayment = document.getElementById('tabPayment');

  const bookingsState = document.getElementById('bookingsState');

  const profileForm = document.getElementById('profileForm');
  const pfFirst = document.getElementById('pfFirst');
  const pfLast = document.getElementById('pfLast');
  const pfEmail = document.getElementById('pfEmail');
  const pfPhone = document.getElementById('pfPhone');
  const pfAddress = document.getElementById('pfAddress');
  const pfCity = document.getElementById('pfCity');
  const pfZip = document.getElementById('pfZip');
  const profileMsg = document.getElementById('profileMsg');

  const savedCardText = document.getElementById('savedCardText');
  const paymentHistory = document.getElementById('paymentHistory');
  const paymentState = document.getElementById('paymentState');

  const updateCardBtn = document.getElementById('updateCardBtn');
  const updateCardPanel = document.getElementById('updateCardPanel');
  const acctStripeMount = document.getElementById('acctStripeMount');
  const acctStripeErr = document.getElementById('acctStripeErr');
  const saveCardBtn = document.getElementById('saveCardBtn');

  const navAccount = document.getElementById('navAccountLink');
  const navSignIn = document.getElementById('navSignInLink');
  const mNavAccount = document.getElementById('mNavAccountLink');
  const mNavSignIn = document.getElementById('mNavSignInLink');

  let stripeClient = null;
  let stripeElements = null;
  let stripeCard = null;
  let stripeClientSecret = '';
  let stripeCustomerId = '';

  function showMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.className = 'account-msg show ' + (kind || '');
  }

  function clearMsg(el) {
    if (!el) return;
    el.textContent = '';
    el.className = 'account-msg';
  }

  function escHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fmtDate(d) {
    if (!d) return '—';
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return String(d);
    }
  }

  function fmtDt(date, time) {
    return `${fmtDate(date)} · ${time || '—'}`;
  }

  function setAuthNav(isLoggedIn) {
    const show = (el, on) => { if (el) el.style.display = on ? '' : 'none'; };
    show(navAccount, !!isLoggedIn);
    show(mNavAccount, !!isLoggedIn);
    show(navSignIn, !isLoggedIn);
    show(mNavSignIn, !isLoggedIn);
  }

  function showLogin() {
    if (loginView) loginView.style.display = 'block';
    if (dashView) dashView.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (helloEl) helloEl.textContent = 'Welcome';
    if (emailEl) emailEl.textContent = 'Sign in to view your bookings';
    setAuthNav(false);
  }

  function showDash(user) {
    if (loginView) loginView.style.display = 'none';
    if (dashView) dashView.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = '';

    const display = user?.user_metadata?.full_name || user?.email || 'Welcome';
    if (helloEl) helloEl.textContent = `Hi, ${display}`;
    if (emailEl) emailEl.textContent = user?.email || '—';
    setAuthNav(true);
  }

  function getRedirectTo() {
    return 'https://homelinescleaning.com/account.html';
  }

  async function sendMagicLink() {
    clearMsg(loginMsg);
    const email = String(magicEmail?.value || '').trim();
    if (!email) {
      showMsg(loginMsg, 'Please enter your email.', 'error');
      return;
    }

    try {
      if (!window.supabase) throw new Error('Supabase not loaded');
      sendMagicBtn.disabled = true;
      sendMagicBtn.textContent = 'Sending…';

      const { error } = await window.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectTo(),
        },
      });

      if (error) throw error;
      showMsg(loginMsg, '✅ Magic link sent! Check your email inbox.', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showMsg(loginMsg, '❌ ' + msg, 'error');
    } finally {
      sendMagicBtn.disabled = false;
      sendMagicBtn.textContent = 'Send Magic Link';
    }
  }

  async function googleLogin() {
    clearMsg(loginMsg);
    try {
      if (!window.supabase) throw new Error('Supabase not loaded');
      await window.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: getRedirectTo() },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showMsg(loginMsg, '❌ ' + msg, 'error');
    }
  }

  async function logout() {
    try {
      if (!window.supabase) return;
      await window.supabase.auth.signOut();
    } catch (e) {
      console.warn('signOut:', e);
    }
    showLogin();
  }

  function switchTab(tab) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (tabBookings) tabBookings.style.display = tab === 'bookings' ? '' : 'none';
    if (tabProfile) tabProfile.style.display = tab === 'profile' ? '' : 'none';
    if (tabPayment) tabPayment.style.display = tab === 'payment' ? '' : 'none';
  }

  function renderBookings(bookings, userEmail) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const isUpcoming = (b) => {
      if (!b.booking_date) return false;
      return b.booking_date >= todayStr && String(b.status || '').toLowerCase() !== 'cancelled';
    };

    const upcoming = bookings.filter(isUpcoming);
    const past = bookings.filter(b => !isUpcoming(b));

    const renderList = (list) => {
      if (!list.length) {
        return '<div class="state-msg" style="padding: 18px 10px;">No bookings.</div>';
      }

      return `<div class="bk-grid">${list.map(b => {
        const status = String(b.status || 'pending').toLowerCase();
        const statusCls = status === 'confirmed' ? 'b-confirmed'
          : status === 'completed' ? 'b-completed'
          : status === 'cancelled' ? 'b-cancelled'
          : 'b-pending';

        const payStatus = String(b.payment_status || 'pending').toLowerCase();
        const payCls = payStatus === 'paid' ? 'p-paid' : 'p-pending';

        const showPayNow = payStatus === 'pending' && status === 'confirmed';

        return `
          <div class="bk-card">
            <div class="bk-top">
              <div class="bk-ref">${escHtml(b.ref_code || '—')}</div>
              <span class="badge ${statusCls}">${escHtml(status)}</span>
            </div>

            <div class="bk-line">
              <div>
                <div class="bk-label">Service</div>
                <div class="bk-val">${escHtml(b.service || '—')}</div>
              </div>
              <div style="text-align:right;">
                <div class="bk-label">Total</div>
                <div class="bk-val" style="color: var(--navy);">$${Number(b.price || 0).toLocaleString()}</div>
              </div>
            </div>

            <div class="bk-line">
              <div>
                <div class="bk-label">Date & Time</div>
                <div class="bk-val">${escHtml(fmtDt(b.booking_date, b.booking_time))}</div>
              </div>
            </div>

            <div class="bk-line">
              <div style="min-width: 0;">
                <div class="bk-label">Address</div>
                <div class="bk-val" style="word-break: break-word; overflow-wrap:anywhere;">${escHtml(b.address || '—')}</div>
              </div>
            </div>

            <div class="bk-line">
              <div>
                <div class="bk-label">Payment</div>
                <span class="badge ${payCls}">${escHtml(payStatus)}</span>
              </div>
              <div>
                <div class="bk-label">Email</div>
                <div class="bk-val">${escHtml(userEmail || '—')}</div>
              </div>
            </div>

            ${showPayNow ? `
              <div class="bk-pay">
                <a class="btn btn-primary btn-lg" href="pay.html?ref=${encodeURIComponent(b.ref_code || '')}">💳 Pay Now</a>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}</div>`;
    };

    const html = `
      <div class="bk-section-title">Upcoming</div>
      ${renderList(upcoming)}
      <div class="bk-section-title">Past Bookings</div>
      ${renderList(past)}
    `;

    tabBookings.innerHTML = html;
  }

  async function loadBookings(user) {
    if (!bookingsState) return;

    try {
      const userEmail = user?.email || '';

      const { data, error } = await window.supabase
        .from('bookings')
        .select('id, ref_code, service, booking_date, booking_time, address, status, price, payment_status')
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      renderBookings(data || [], userEmail);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      tabBookings.innerHTML = `<div class="state-msg" style="padding: 18px 10px;">⚠️ Failed to load bookings: ${escHtml(msg)}</div>`;
    }
  }

  async function prefillFromMostRecentBooking(user) {
    const userEmail = user?.email || '';
    try {
      const { data, error } = await window.supabase
        .from('bookings')
        .select('first_name, last_name, phone, address, city, zip')
        .or(`user_id.eq.${user.id},email.eq.${userEmail}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return data;
    } catch (e) {
      console.warn('prefill booking:', e);
      return null;
    }
  }

  async function loadProfile(user) {
    clearMsg(profileMsg);
    if (pfEmail) pfEmail.value = user?.email || '';

    try {
      const { data, error } = await window.supabase
        .from('customer_profiles')
        .select('first_name, last_name, phone, address, city, zip')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      const profile = data || null;
      if (profile) {
        if (pfFirst) pfFirst.value = profile.first_name || '';
        if (pfLast) pfLast.value = profile.last_name || '';
        if (pfPhone) pfPhone.value = profile.phone || '';
        if (pfAddress) pfAddress.value = profile.address || '';
        if (pfCity) pfCity.value = profile.city || '';
        if (pfZip) pfZip.value = profile.zip || '';
        return;
      }

      const fallback = await prefillFromMostRecentBooking(user);
      if (fallback) {
        if (pfFirst) pfFirst.value = fallback.first_name || '';
        if (pfLast) pfLast.value = fallback.last_name || '';
        if (pfPhone) pfPhone.value = fallback.phone || '';
        if (pfAddress) pfAddress.value = fallback.address || '';
        if (pfCity) pfCity.value = fallback.city || '';
        if (pfZip) pfZip.value = fallback.zip || '';
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showMsg(profileMsg, '❌ Failed to load profile: ' + msg, 'error');
    }
  }

  async function saveProfile(user) {
    clearMsg(profileMsg);

    const payload = {
      user_id: user.id,
      first_name: String(pfFirst?.value || '').trim() || null,
      last_name: String(pfLast?.value || '').trim() || null,
      phone: String(pfPhone?.value || '').trim() || null,
      address: String(pfAddress?.value || '').trim() || null,
      city: String(pfCity?.value || '').trim() || null,
      zip: String(pfZip?.value || '').trim() || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: existing, error: selErr } = await window.supabase
        .from('customer_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selErr) throw selErr;

      if (existing?.id) {
        const { error } = await window.supabase
          .from('customer_profiles')
          .update(payload)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await window.supabase
          .from('customer_profiles')
          .insert([payload]);
        if (error) throw error;
      }

      showMsg(profileMsg, '✅ Profile saved.', 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      showMsg(profileMsg, '❌ ' + msg, 'error');
    }
  }

  async function ensureStripeSetupIntent(email, name) {
    if (stripeClientSecret && stripeCustomerId) return;
    if (!window.supabase?.functions?.invoke) throw new Error('Supabase Functions client not available');

    const res = await window.supabase.functions.invoke(SETUP_INTENT_FN, {
      body: { email, name },
    });

    if (res?.error) throw res.error;
    stripeClientSecret = res?.data?.clientSecret || '';
    stripeCustomerId = res?.data?.customerId || '';

    if (!stripeClientSecret || !stripeCustomerId) {
      throw new Error('Stripe SetupIntent did not return clientSecret/customerId');
    }
  }

  function initStripeMount() {
    if (!acctStripeMount) return;
    if (!window.Stripe) {
      if (acctStripeErr) acctStripeErr.textContent = 'Stripe failed to load.';
      return;
    }

    stripeClient = stripeClient || window.Stripe(STRIPE_PUBLISHABLE_KEY);
    stripeElements = stripeElements || stripeClient.elements();

    if (!stripeCard) {
      stripeCard = stripeElements.create('card', {
        style: {
          base: {
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
            fontSize: '16px',
            color: '#1e293b',
            '::placeholder': { color: '#94a3b8' },
          },
        },
      });

      stripeCard.on('change', (evt) => {
        if (acctStripeErr) acctStripeErr.textContent = evt.error?.message || '';
      });

      stripeCard.mount(acctStripeMount);
    }
  }

  async function saveNewCard(user) {
    if (!stripeClient || !stripeCard) {
      initStripeMount();
    }

    if (!stripeClient || !stripeCard) return;

    if (acctStripeErr) acctStripeErr.textContent = '';
    saveCardBtn.disabled = true;
    saveCardBtn.textContent = 'Saving…';

    try {
      await ensureStripeSetupIntent(user.email || '', user.user_metadata?.full_name || '');

      const billing_details = {
        name: user.user_metadata?.full_name || undefined,
        email: user.email || undefined,
      };

      const res = await stripeClient.confirmCardSetup(
        stripeClientSecret,
        { payment_method: { card: stripeCard, billing_details } },
        { redirect: 'if_required' }
      );

      if (res?.error) throw new Error(res.error.message || 'Card setup failed');

      await loadPaymentTab(user);
      if (updateCardPanel) updateCardPanel.style.display = 'none';
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (acctStripeErr) acctStripeErr.textContent = msg;
    } finally {
      saveCardBtn.disabled = false;
      saveCardBtn.textContent = 'Save New Card';
    }
  }

  async function loadPaymentTab(user) {
    if (savedCardText) savedCardText.textContent = 'Loading…';
    if (paymentState) paymentState.style.display = '';
    if (paymentHistory) paymentHistory.innerHTML = '';

    try {
      const { data: sessionData, error: sessErr } = await window.supabase.auth.getSession();
      if (sessErr) throw sessErr;
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');

      const res = await fetch(`${SUPABASE_URL}/functions/v1/customer-payments`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

      const last4 = json?.card_last4;
      if (savedCardText) {
        savedCardText.textContent = last4 ? `Card ending in ${last4}` : 'No saved card on file.';
      }

      const payments = Array.isArray(json?.payments) ? json.payments : [];
      if (paymentState) paymentState.style.display = 'none';

      if (!payments.length) {
        if (paymentHistory) {
          paymentHistory.innerHTML = '<div class="state-msg" style="padding: 12px 10px;">No payments yet.</div>';
        }
        return;
      }

      if (paymentHistory) {
        paymentHistory.innerHTML = payments.map(p => {
          const amt = Number(p.amount || 0);
          const dt = p.created ? new Date(p.created * 1000).toLocaleString() : '—';
          const st = String(p.status || '').toLowerCase();
          const ref = p.ref_code || '';
          return `
            <div class="pay-item">
              <div class="pay-item-top">
                <div style="font-weight:1000;color:var(--navy);">$${amt.toLocaleString()}</div>
                <div style="font-weight:900;color:#64748b;">${escHtml(dt)}</div>
              </div>
              <div style="margin-top:6px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;">
                <div style="font-weight:900;color:#334155;">${ref ? escHtml(ref) : '—'}</div>
                <div style="font-weight:900;color:#475569;">${escHtml(st)}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (savedCardText) savedCardText.textContent = '⚠️ ' + msg;
      if (paymentState) paymentState.style.display = 'none';
    }
  }

  async function initSession() {
    if (!window.supabase) {
      showLogin();
      return;
    }

    const { data } = await window.supabase.auth.getSession();
    const session = data?.session;

    if (!session?.user) {
      showLogin();
    } else {
      showDash(session.user);
      switchTab('bookings');
      await loadBookings(session.user);
      await loadProfile(session.user);
      await loadPaymentTab(session.user);
    }

    window.supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        showLogin();
        return;
      }
      if (newSession?.user) {
        showDash(newSession.user);
        await loadBookings(newSession.user);
        await loadProfile(newSession.user);
        await loadPaymentTab(newSession.user);
      }
    });
  }

  function bindUi() {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    if (sendMagicBtn) sendMagicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sendMagicLink();
    });

    if (googleLoginBtn) googleLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      googleLogin();
    });

    if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });

    if (profileForm) profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const { data } = await window.supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;
      await saveProfile(user);
    });

    if (updateCardBtn) updateCardBtn.addEventListener('click', async () => {
      const { data } = await window.supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;

      if (updateCardPanel) {
        const open = updateCardPanel.style.display !== 'none';
        updateCardPanel.style.display = open ? 'none' : '';
        if (!open) {
          initStripeMount();
          try {
            await ensureStripeSetupIntent(user.email || '', user.user_metadata?.full_name || '');
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            if (acctStripeErr) acctStripeErr.textContent = msg;
          }
        }
      }
    });

    if (saveCardBtn) saveCardBtn.addEventListener('click', async () => {
      const { data } = await window.supabase.auth.getSession();
      const user = data?.session?.user;
      if (!user) return;
      await saveNewCard(user);
    });
  }

  bindUi();
  initSession();
})();
