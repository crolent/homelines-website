/* account.js – fully rewritten: 3s auth timeout, all data via direct fetch() */
(function initAccount() {
  const SUPABASE_URL     = 'https://acfsvzbjfiynlcbjvtbq.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_3tsuAIyp2yIn2MVadqgcRA_RKvkgf8g';
  const STRIPE_KEY       = 'pk_test_51TJhzfDTexy6QjOdztK8iY1LmAgSefKM74moqmthJ0YpBGM3TeX6l44rEJrgF4zYStIHakLcOKG3KUjSVE2czkdO00Da6MUxrx';
  const SETUP_INTENT_FN  = 'create-setup-intent';

  /* ── Global session state ─────────────────────────────────── */
  let currentUser  = null;
  let currentToken = null; // user JWT — used for RLS-protected queries

  /* ── Stripe ───────────────────────────────────────────────── */
  let stripeClient = null, stripeElements = null, stripeCard = null;
  let stripeClientSecret = '', stripeCustomerId = '';

  /* ── DOM refs ─────────────────────────────────────────────── */
  const loginView  = document.getElementById('loginView');
  const dashView   = document.getElementById('dashView');
  const helloEl    = document.getElementById('accountHello');
  const emailEl    = document.getElementById('accountEmail');
  const logoutBtn  = document.getElementById('logoutBtn');

  const magicEmail     = document.getElementById('magicEmail');
  const sendMagicBtn   = document.getElementById('sendMagicBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const loginMsg       = document.getElementById('loginMsg');

  const tabBtns    = Array.from(document.querySelectorAll('.account-tab'));
  const tabBookings = document.getElementById('tabBookings');
  const tabProfile  = document.getElementById('tabProfile');
  const tabPayment  = document.getElementById('tabPayment');

  const profileForm = document.getElementById('profileForm');
  const pfFirst  = document.getElementById('pfFirst');
  const pfLast   = document.getElementById('pfLast');
  const pfEmail  = document.getElementById('pfEmail');
  const pfPhone  = document.getElementById('pfPhone');
  const pfAddress = document.getElementById('pfAddress');
  const pfCity   = document.getElementById('pfCity');
  const pfZip    = document.getElementById('pfZip');
  const profileMsg = document.getElementById('profileMsg');

  const savedCardText  = document.getElementById('savedCardText');
  const paymentHistory = document.getElementById('paymentHistory');
  const paymentState   = document.getElementById('paymentState');
  const updateCardBtn  = document.getElementById('updateCardBtn');
  const updateCardPanel = document.getElementById('updateCardPanel');
  const acctStripeMount = document.getElementById('acctStripeMount');
  const acctStripeErr  = document.getElementById('acctStripeErr');
  const saveCardBtn    = document.getElementById('saveCardBtn');

  const navAccount  = document.getElementById('navAccountLink');
  const navSignIn   = document.getElementById('navSignInLink');
  const mNavAccount = document.getElementById('mNavAccountLink');
  const mNavSignIn  = document.getElementById('mNavSignInLink');

  /* ── Helpers ──────────────────────────────────────────────── */
  function authHeaders(withJson) {
    const h = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + (currentToken || SUPABASE_ANON_KEY),
    };
    if (withJson) h['Content-Type'] = 'application/json';
    return h;
  }

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
  function esc(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function fmtDate(d) {
    if (!d) return '—';
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); }
    catch { return String(d); }
  }
  function fmtDt(date, time) { return fmtDate(date) + ' · ' + (time || '—'); }

  /* ── Nav visibility ───────────────────────────────────────── */
  function setAuthNav(on) {
    const s = (el, v) => { if (el) el.style.display = v ? '' : 'none'; };
    s(navAccount, on);  s(mNavAccount, on);
    s(navSignIn, !on);  s(mNavSignIn, !on);
  }

  /* ── View switching ───────────────────────────────────────── */
  function showLogin() {
    if (loginView) loginView.style.display = 'block';
    if (dashView)  dashView.style.display  = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (helloEl)   helloEl.textContent = 'Sign In to Your Account';
    if (emailEl)   emailEl.textContent = '';
    setAuthNav(false);
  }

  function showDash(user) {
    if (loginView) loginView.style.display = 'none';
    if (dashView)  dashView.style.display  = 'block';
    if (logoutBtn) logoutBtn.style.display = '';
    const name = user?.user_metadata?.full_name || '';
    if (helloEl) helloEl.textContent = name ? 'Hi, ' + name : 'My Account';
    if (emailEl) emailEl.textContent = user?.email || '—';
    setAuthNav(true);
  }

  /* ── Tab switching ────────────────────────────────────────── */
  function switchTab(tab) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    if (tabBookings) tabBookings.style.display = tab === 'bookings' ? '' : 'none';
    if (tabProfile)  tabProfile.style.display  = tab === 'profile'  ? '' : 'none';
    if (tabPayment)  tabPayment.style.display  = tab === 'payment'  ? '' : 'none';
    if (tab === 'payment') loadPaymentTab();
  }

  /* ── Auth actions ─────────────────────────────────────────── */
  async function sendMagicLink() {
    clearMsg(loginMsg);
    const email = String(magicEmail?.value || '').trim();
    if (!email) { showMsg(loginMsg, 'Please enter your email.', 'error'); return; }

    sendMagicBtn.disabled = true;
    sendMagicBtn.textContent = 'Sending…';
    try {
      if (!window.supabase) throw new Error('Supabase not loaded');
      const timeout = new Promise((_, r) => setTimeout(() => r(new Error('Request timed out')), 10000));
      const res = await Promise.race([
        window.supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'https://homelinescleaning.com/account.html' } }),
        timeout
      ]);
      if (res?.error) throw res.error;
      showMsg(loginMsg, '✅ Magic link sent! Check your inbox.', 'success');
    } catch (e) {
      showMsg(loginMsg, '❌ ' + (e instanceof Error ? e.message : String(e)), 'error');
    } finally {
      sendMagicBtn.disabled = false;
      sendMagicBtn.textContent = 'Send Magic Link';
    }
  }

  function googleLogin() {
    clearMsg(loginMsg);
    if (!window.supabase) { showMsg(loginMsg, '❌ Auth not available.', 'error'); return; }
    window.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://homelinescleaning.com/account.html' }
    });
  }

  async function logout() {
    try { if (window.supabase) await window.supabase.auth.signOut(); } catch (e) {}
    currentUser = null; currentToken = null;
    showLogin();
  }

  /* ── Savings progress bar ─────────────────────────────────── */
  async function savingsProgressHtml() {
    const email = currentUser?.email || '';
    if (!email) return '';
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/savings_claims?email=eq.' + encodeURIComponent(email) +
        '&select=promo_code,times_used',
        { headers: authHeaders() }
      );
      const data = await res.json();
      const claim = Array.isArray(data) ? data[0] : null;
      const timesUsed = claim?.times_used || 0;

      const steps = [
        { n:1, label:'1st', disc:true },
        { n:2, label:'2nd', disc:false },
        { n:3, label:'3rd', disc:true },
        { n:4, label:'4th', disc:false },
        { n:5, label:'5th', disc:true },
      ];

      const stepsHtml = steps.map(s => {
        const done = timesUsed >= s.n;
        const icon = done ? '✅' : '⬜';
        const lbl  = s.label + (s.disc ? ' −$25' : '');
        return '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:52px;">' +
          '<div style="font-size:1.1rem;">' + icon + '</div>' +
          '<div style="font-size:0.7rem;font-weight:800;color:' + (done?'#166534':'#64748b') + ';">' + esc(lbl) + '</div>' +
          '</div>';
      }).join('');

      const savedAmount = (timesUsed >= 1 ? 25 : 0) + (timesUsed >= 3 ? 25 : 0) + (timesUsed >= 5 ? 25 : 0);
      const savedLine   = savedAmount > 0
        ? '<div style="margin-top:10px;font-size:0.85rem;font-weight:800;color:#166534;">💰 You\'ve saved $' + savedAmount + ' so far!</div>'
        : '';
      const codeHint = claim?.promo_code
        ? '<div style="font-size:0.75rem;color:#64748b;margin-top:6px;">Your code: <strong>' + esc(claim.promo_code) + '</strong></div>'
        : '';

      const inner = claim
        ? '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">' +
            '<div style="font-size:0.88rem;font-weight:800;color:#1e3a5c;">🎉 $75 Savings Program</div>' +
            '<div style="font-size:0.8rem;color:#64748b;font-weight:700;">' + timesUsed + ' of 5 used</div>' +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;margin-top:10px;gap:2px;">' + stepsHtml + '</div>' +
          savedLine + codeHint
        : '<div style="font-size:0.85rem;font-weight:700;color:#64748b;">💡 ' +
            '<a href="index.html" style="color:#4db8e8;font-weight:800;">Claim your $75 Savings Program</a> on the homepage!' +
          '</div>';

      return '<div style="background:#f0f9ff;border:1.5px solid #bae6fd;border-radius:14px;padding:14px 16px;margin-bottom:16px;">' + inner + '</div>';
    } catch (e) {
      return '';
    }
  }

  /* ── Bookings rendering ───────────────────────────────────── */
  function buildBookingsHtml(bookings, userEmail) {
    if (!bookings.length) {
      return '<div style="text-align:center;padding:32px 16px;">' +
        '<div style="font-size:2.4rem;margin-bottom:10px;">📋</div>' +
        '<div style="font-weight:900;color:#1e3a5c;font-size:1.1rem;margin-bottom:12px;">No bookings yet</div>' +
        '<a href="booking.html" class="btn btn-primary">Book a Cleaning →</a>' +
        '</div>';
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const isUpcoming = b => b.booking_date >= todayStr && String(b.status||'').toLowerCase() !== 'cancelled';
    const upcoming = bookings.filter(isUpcoming);
    const past     = bookings.filter(b => !isUpcoming(b));

    const cardHtml = (b) => {
      const status   = String(b.status || 'pending').toLowerCase();
      const sCls     = status === 'confirmed' ? 'b-confirmed' : status === 'completed' ? 'b-completed' : status === 'cancelled' ? 'b-cancelled' : 'b-pending';
      const pay      = String(b.payment_status || 'pending').toLowerCase();
      const pCls     = pay === 'paid' ? 'p-paid' : 'p-pending';
      const showPay  = pay !== 'paid' && status === 'confirmed';
      return '<div class="bk-card">' +
        '<div class="bk-top"><div class="bk-ref">' + esc(b.ref_code||'—') + '</div><span class="badge ' + sCls + '">' + esc(status) + '</span></div>' +
        '<div class="bk-line"><div><div class="bk-label">Service</div><div class="bk-val">' + esc(b.service||'—') + '</div></div>' +
          '<div style="text-align:right;"><div class="bk-label">Total</div><div class="bk-val" style="color:var(--navy);">$' + Number(b.price||0).toLocaleString() + '</div></div></div>' +
        '<div class="bk-line"><div><div class="bk-label">Date & Time</div><div class="bk-val">' + esc(fmtDt(b.booking_date,b.booking_time)) + '</div></div></div>' +
        '<div class="bk-line"><div style="min-width:0;"><div class="bk-label">Address</div><div class="bk-val" style="word-break:break-word;">' + esc(b.address||'—') + '</div></div></div>' +
        '<div class="bk-line"><div><div class="bk-label">Payment</div><span class="badge ' + pCls + '">' + esc(pay) + '</span></div></div>' +
        (showPay ? '<div class="bk-pay"><a class="btn btn-primary btn-lg" href="pay.html?ref=' + encodeURIComponent(b.ref_code||'') + '">💳 Pay Now</a></div>' : '') +
        '</div>';
    };

    const section = (title, list) =>
      '<div class="bk-section-title">' + title + '</div>' +
      (list.length ? '<div class="bk-grid">' + list.map(cardHtml).join('') + '</div>' : '<div style="color:#64748b;font-size:0.9rem;padding:10px 2px;">None.</div>');

    return section('Upcoming', upcoming) + section('Past Bookings', past);
  }

  async function loadBookings() {
    if (!tabBookings) return;
    tabBookings.innerHTML = '<div class="state-msg" style="padding:26px 10px;"><div class="spinner"></div>Loading bookings…</div>';
    const email = currentUser?.email || '';
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/bookings?email=eq.' + encodeURIComponent(email) +
        '&order=created_at.desc&select=id,ref_code,service,booking_date,booking_time,address,status,price,payment_status',
        { headers: authHeaders() }
      );
      const data = await res.json();
      if (!res.ok) throw new Error((data?.message) || 'HTTP ' + res.status);
      const bookings = Array.isArray(data) ? data : [];
      const confirmedCount = bookings.filter(b => {
        const s = String(b.status || '').toLowerCase();
        return s === 'confirmed' || s === 'completed';
      }).length;
      const savHtml  = await savingsProgressHtml();
      tabBookings.innerHTML = savHtml + buildBookingsHtml(bookings, email);
    } catch (e) {
      tabBookings.innerHTML = '<div class="state-msg" style="padding:18px 10px;">⚠️ Failed to load bookings: ' + esc(e instanceof Error ? e.message : String(e)) + '</div>';
    }
  }

  /* ── Profile ──────────────────────────────────────────────── */
  async function prefillFromBooking() {
    const email = currentUser?.email || '';
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/bookings?email=eq.' + encodeURIComponent(email) +
        '&order=created_at.desc&limit=1&select=first_name,last_name,phone,address,city,zip',
        { headers: authHeaders() }
      );
      const data = await res.json();
      return (res.ok && Array.isArray(data) && data.length) ? data[0] : null;
    } catch (e) { return null; }
  }

  async function loadProfile() {
    clearMsg(profileMsg);
    if (pfEmail) pfEmail.value = currentUser?.email || '';
    const uid = currentUser?.id || '';
    try {
      const res = await fetch(
        SUPABASE_URL + '/rest/v1/customer_profiles?user_id=eq.' + encodeURIComponent(uid) +
        '&select=first_name,last_name,phone,address,city,zip&limit=1',
        { headers: authHeaders() }
      );
      const data = await res.json();
      let p = (res.ok && Array.isArray(data) && data.length) ? data[0] : null;
      if (!p) p = await prefillFromBooking();
      if (p) {
        if (pfFirst)   pfFirst.value   = p.first_name || '';
        if (pfLast)    pfLast.value    = p.last_name  || '';
        if (pfPhone)   pfPhone.value   = p.phone      || '';
        if (pfAddress) pfAddress.value = p.address    || '';
        if (pfCity)    pfCity.value    = p.city       || '';
        if (pfZip)     pfZip.value     = p.zip        || '';
      }
    } catch (e) {
      showMsg(profileMsg, '❌ Failed to load profile: ' + (e instanceof Error ? e.message : String(e)), 'error');
    }
  }

  async function saveProfile() {
    clearMsg(profileMsg);
    const uid = currentUser?.id || '';
    const payload = {
      user_id:    uid,
      first_name: String(pfFirst?.value  || '').trim() || null,
      last_name:  String(pfLast?.value   || '').trim() || null,
      phone:      String(pfPhone?.value  || '').trim() || null,
      address:    String(pfAddress?.value|| '').trim() || null,
      city:       String(pfCity?.value   || '').trim() || null,
      zip:        String(pfZip?.value    || '').trim() || null,
      updated_at: new Date().toISOString(),
    };
    const btn = document.getElementById('saveProfileBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
    try {
      const patchRes = await fetch(
        SUPABASE_URL + '/rest/v1/customer_profiles?user_id=eq.' + encodeURIComponent(uid),
        { method: 'PATCH', headers: { ...authHeaders(true), 'Prefer': 'return=representation' }, body: JSON.stringify(payload) }
      );
      const patchData = await patchRes.json().catch(() => []);
      if (!patchRes.ok) throw new Error('Update failed: ' + patchRes.status);
      if (Array.isArray(patchData) && patchData.length === 0) {
        const postRes = await fetch(
          SUPABASE_URL + '/rest/v1/customer_profiles',
          { method: 'POST', headers: { ...authHeaders(true), 'Prefer': 'return=representation' }, body: JSON.stringify(payload) }
        );
        if (!postRes.ok) { const b = await postRes.json().catch(()=>({})); throw new Error(b.message || 'Insert failed: ' + postRes.status); }
      }
      showMsg(profileMsg, '✅ Profile saved.', 'success');
    } catch (e) {
      showMsg(profileMsg, '❌ ' + (e instanceof Error ? e.message : String(e)), 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }
    }
  }

  /* ── Payment tab ──────────────────────────────────────────── */
  async function loadPaymentTab() {
    if (savedCardText) savedCardText.textContent = 'Loading…';
    if (paymentState)  paymentState.style.display = '';
    if (paymentHistory) paymentHistory.innerHTML = '';
    try {
      const res  = await fetch(SUPABASE_URL + '/functions/v1/customer-payments', {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + (currentToken || SUPABASE_ANON_KEY), 'apikey': SUPABASE_ANON_KEY },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'HTTP ' + res.status);

      if (savedCardText) savedCardText.textContent = json?.card_last4 ? 'Card ending in ' + json.card_last4 : 'No saved card on file.';
      const payments = Array.isArray(json?.payments) ? json.payments : [];
      if (paymentState) paymentState.style.display = 'none';

      if (!payments.length) {
        if (paymentHistory) paymentHistory.innerHTML = '<div class="state-msg" style="padding:12px 10px;">No payments yet.</div>';
        return;
      }
      if (paymentHistory) {
        paymentHistory.innerHTML = payments.map(p => {
          const amt = Number(p.amount || 0);
          const dt  = p.created ? new Date(p.created * 1000).toLocaleString() : '—';
          return '<div class="pay-item">' +
            '<div class="pay-item-top"><div style="font-weight:1000;color:var(--navy);">$' + amt.toLocaleString() + '</div><div style="font-weight:900;color:#64748b;">' + esc(dt) + '</div></div>' +
            '<div style="margin-top:6px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;"><div style="font-weight:900;color:#334155;">' + esc(p.ref_code||'—') + '</div><div style="font-weight:900;color:#475569;">' + esc(String(p.status||'')) + '</div></div>' +
            '</div>';
        }).join('');
      }
    } catch (e) {
      if (savedCardText) savedCardText.textContent = '⚠️ ' + (e instanceof Error ? e.message : String(e));
      if (paymentState)  paymentState.style.display = 'none';
    }
  }

  /* ── Stripe card update ───────────────────────────────────── */
  async function ensureStripeSetupIntent() {
    if (stripeClientSecret && stripeCustomerId) return;
    if (!window.supabase?.functions?.invoke) throw new Error('Supabase Functions not available');
    const res = await window.supabase.functions.invoke(SETUP_INTENT_FN, {
      body: { email: currentUser?.email || '', name: currentUser?.user_metadata?.full_name || '' }
    });
    if (res?.error) throw res.error;
    stripeClientSecret = res?.data?.clientSecret || '';
    stripeCustomerId   = res?.data?.customerId   || '';
    if (!stripeClientSecret) throw new Error('Stripe SetupIntent missing clientSecret');
  }

  function initStripeMount() {
    if (!acctStripeMount || !window.Stripe) {
      if (acctStripeErr) acctStripeErr.textContent = 'Stripe failed to load.';
      return;
    }
    stripeClient   = stripeClient   || window.Stripe(STRIPE_KEY);
    stripeElements = stripeElements || stripeClient.elements();
    if (!stripeCard) {
      stripeCard = stripeElements.create('card', {
        style: { base: { fontFamily: 'Inter,system-ui,sans-serif', fontSize: '16px', color: '#1e293b', '::placeholder': { color: '#94a3b8' } } }
      });
      stripeCard.on('change', evt => { if (acctStripeErr) acctStripeErr.textContent = evt.error?.message || ''; });
      stripeCard.mount(acctStripeMount);
    }
  }

  async function saveNewCard() {
    if (!stripeClient || !stripeCard) initStripeMount();
    if (!stripeClient || !stripeCard) return;
    if (acctStripeErr) acctStripeErr.textContent = '';
    if (saveCardBtn) { saveCardBtn.disabled = true; saveCardBtn.textContent = 'Saving…'; }
    try {
      await ensureStripeSetupIntent();
      const res = await stripeClient.confirmCardSetup(
        stripeClientSecret,
        { payment_method: { card: stripeCard, billing_details: { name: currentUser?.user_metadata?.full_name, email: currentUser?.email } } },
        { redirect: 'if_required' }
      );
      if (res?.error) throw new Error(res.error.message || 'Card setup failed');
      await loadPaymentTab();
      if (updateCardPanel) updateCardPanel.style.display = 'none';
    } catch (e) {
      if (acctStripeErr) acctStripeErr.textContent = e instanceof Error ? e.message : String(e);
    } finally {
      if (saveCardBtn) { saveCardBtn.disabled = false; saveCardBtn.textContent = 'Save New Card'; }
    }
  }

  /* ── Session init ─────────────────────────────────────────── */
  let dashInitialized = false;

  async function initDash(user, token) {
    if (dashInitialized) return;
    dashInitialized = true;
    currentUser  = user;
    currentToken = token;
    showDash(user);
    switchTab('bookings');
    loadBookings();
    loadProfile();
  }

  async function initSession() {
    if (!window.supabase) { showLogin(); return; }

    const isMagicLink = window.location.hash.includes('access_token');
    if (isMagicLink) {
      console.log('[Account] Magic link callback detected');
    }

    // Register FIRST — must not miss SIGNED_IN fired by hash processing
    try {
      window.supabase.auth.onAuthStateChange((event, newSession) => {
        console.log('[Account] Auth event:', event, newSession?.user?.email || '');
        if (event === 'SIGNED_OUT') {
          dashInitialized = false;
          currentUser = null; currentToken = null;
          showLogin();
        } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
          initDash(newSession.user, newSession.access_token);
        }
      });
    } catch (e) {
      console.warn('[Account] onAuthStateChange error:', e);
    }

    let session = null;
    try {
      const waitMs = isMagicLink ? 8000 : 3000;
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), waitMs));
      const result  = await Promise.race([window.supabase.auth.getSession(), timeout]);
      session = result?.data?.session || null;
    } catch (e) {
      console.warn('[Account] getSession timed out');
      if (!isMagicLink) showLogin();
      return;
    }

    if (session?.user) {
      await initDash(session.user, session.access_token);
    } else if (!isMagicLink) {
      showLogin();
    }
    // If magic link and no session yet: onAuthStateChange SIGNED_IN will handle it
  }

  /* ── UI bindings ──────────────────────────────────────────── */
  function bindUi() {
    tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

    if (sendMagicBtn)   sendMagicBtn.addEventListener('click',   e => { e.preventDefault(); sendMagicLink(); });
    if (googleLoginBtn) googleLoginBtn.addEventListener('click', e => { e.preventDefault(); googleLogin(); });
    if (logoutBtn)      logoutBtn.addEventListener('click',      e => { e.preventDefault(); logout(); });

    if (profileForm) profileForm.addEventListener('submit', e => { e.preventDefault(); saveProfile(); });

    if (updateCardBtn) updateCardBtn.addEventListener('click', async () => {
      if (!updateCardPanel) return;
      const open = updateCardPanel.style.display !== 'none';
      updateCardPanel.style.display = open ? 'none' : '';
      if (!open) {
        initStripeMount();
        try { await ensureStripeSetupIntent(); }
        catch (e) { if (acctStripeErr) acctStripeErr.textContent = e instanceof Error ? e.message : String(e); }
      }
    });

    if (saveCardBtn) saveCardBtn.addEventListener('click', () => saveNewCard());
  }

  bindUi();
  initSession();
})();
