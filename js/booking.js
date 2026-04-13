/* ===== BOOKING MULTI-STEP FLOW ===== */
(function () {
  const state = {
    step: 1,
    totalSteps: 6,
    user: null,
    isGuest: true,
    services: [],
    date: null,
    time: null,
    calendar: { month: new Date().getMonth(), year: new Date().getFullYear() },
    /* new fields */
    serviceCity: '',
    sqft: '',
    bedrooms: '',
    bathrooms: '',
    halfBathrooms: '0',
    sofaQuantity: 0,
    mattressQuantity: 0,
    extras: [],      /* array of { name, price } */
    hasPets: false,
    notes: '',
    promoCode: '',
    promoDiscount: 0,
    promoTimesUsed: -1
  };

  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51TJhzfDTexy6QjOdztK8iY1LmAgSefKM74moqmthJ0YpBGM3TeX6l44rEJrgF4zYStIHakLcOKG3KUjSVE2czkdO00Da6MUxrx';
  const SETUP_INTENT_FN = 'create-setup-intent';
  const SUPABASE_URL = 'https://acfsvzbjfiynlcbjvtbq.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3tsuAIyp2yIn2MVadqgcRA_RKvkgf8g';

  let stripeClient = null;
  let stripeElements = null;
  let stripeCard = null;
  let stripeClientSecret = '';
  let stripeCustomerId = '';
  let stripeCardComplete = false;
  let stripeMountAttempted = false;

  const EXTRAS_LIST = [
    { name: 'Wash dishes',                           price: 15,  icon: 'images/extras/wash-dishes.svg' },
    { name: 'Inside kitchen cabinets (empty)',        price: 35,  icon: 'images/extras/cabinets-empty.svg' },
    { name: 'Inside kitchen cabinets (full)',         price: 55,  icon: 'images/extras/cabinets-full.svg' },
    { name: 'Interior windows up to 1250 sqft',      price: 45,  icon: 'images/extras/windows-int-sm.svg' },
    { name: 'Interior windows up to 2500 sqft',      price: 75,  icon: 'images/extras/windows-int-lg.svg' },
    { name: 'Exterior windows up to 1250 sqft',      price: 55,  icon: 'images/extras/windows-ext-sm.svg' },
    { name: 'Exterior windows up to 2500 sqft',      price: 85,  icon: 'images/extras/windows-ext-lg.svg' },
    { name: 'BBQ grill',                             price: 35,  icon: 'images/extras/bbq-grill.svg' },
    { name: 'Laundry',                               price: 25,  icon: 'images/extras/laundry.svg' },
    { name: 'One hour of organizing',                price: 45,  icon: 'images/extras/organizing.svg' },
    { name: 'Heavy Duty cleaning',                   price: 65,  icon: 'images/extras/heavy-duty.svg' },
    { name: 'Sweep inside garage',                   price: 35,  icon: 'images/extras/garage-sweep.svg' },
    { name: 'Patio furniture dust/wipe',             price: 25,  icon: 'images/extras/patio-furniture.svg' },
    { name: 'Detail baseboards',                     price: 35,  icon: 'images/extras/baseboards.svg' },
    { name: 'Pets at home',                          price: 20,  icon: 'images/extras/pets.svg' },
    { name: 'Detail window blinds',                  price: 35,  icon: 'images/extras/window-blinds.svg' },
    { name: 'Inside fridge',                         price: 35,  icon: 'images/extras/inside-fridge.svg' },
    { name: 'Inside oven',                           price: 35,  icon: 'images/extras/inside-oven.svg' },
    { name: 'Inside microwave',                      price: 25,  icon: 'images/extras/inside-microwave.svg' },
    { name: 'Eco friendly green products',           price: 25,  icon: 'images/extras/eco-products.svg' },
    { name: 'Extra garage',                          price: 45,  icon: 'images/extras/extra-garage.svg' },
    { name: 'Parking fee',                           price: 15,  icon: 'images/extras/parking-fee.svg' }
  ];

  const INCLUDED_EXTRAS_BY_SERVICE = {
    deep: new Set([
      'Inside kitchen cabinets (empty)',
      'Detail baseboards',
      'Interior windows up to 1250 sqft'
    ]),
    move: new Set([
      'Inside kitchen cabinets (empty)',
      'Detail baseboards',
      'Interior windows up to 1250 sqft'
    ]),
    postconstruction: new Set([
      'Inside kitchen cabinets (empty)',
      'Detail baseboards',
      'Interior windows up to 1250 sqft'
    ]),
    standard: new Set([]),
    hotel: new Set([])
  };

  const PETS_EXTRA = EXTRAS_LIST.find(e => e.name === 'Pets at home');

  function getIncludedExtrasList() {
    const svcId = getMainServiceId();
    const set = INCLUDED_EXTRAS_BY_SERVICE[svcId] || new Set([]);
    return Array.from(set);
  }

  /* ---- Pricing tables ---- */
  // Index: 0=Studio, 1=1bed, 2=2bed, 3=3bed, 4=4bed, 5=5+
  const BASE_PRICES = {
    standard:        [109, 109, 149, 189, 239, 289],
    deep:            [149, 149, 199, 259, 319, 399],
    move:            [199, 199, 279, 359, 449, 549],
    hotel:           [109, 109, 149, 199, 259, 329],
    postconstruction:[249, 249, 349, 449, 559, 679],
    sofa:            [119, 119, 119, 119, 119, 119]
  };
  const SQFT_AVG   = { studio:750, 1:1000, 2:1350, 3:1750, 4:2250, 5:2850 };

  const T = (k) => (window.i18nT && window.i18nT(k)) || k;
  const langLocale = () => ({ en:'en-US', ru:'ru-RU', tr:'tr-TR', es:'es-ES' })[localStorage.getItem('hl_lang') || 'en'] || 'en-US';

  const services = [
    { id: 'standard', icon: '🏠', nameKey: 'svc1_name', descKey: 'bsvc1_desc', price: '$109', duration: 'from 1.5 hours' },
    { id: 'deep',     icon: '✨', nameKey: 'svc2_name', descKey: 'bsvc2_desc', price: '$149', duration: 'from 2.5 hours' },
    { id: 'move',     icon: '📦', nameKey: 'svc3_name', descKey: 'bsvc3_desc', price: '$199', duration: 'from 3 hours' },
    { id: 'hotel',    icon: '🏡', nameKey: 'svc4_name', descKey: 'bsvc4_desc', price: '$109', duration: 'from 2 hours' },
    { id: 'postconstruction', icon: '🔨', nameKey: 'svc5_name', descKey: 'bsvc5_desc', price: '$249', duration: 'from 4 hours' },
    { id: 'sofa',     icon: '🛋️', nameKey: 'svc6_name', descKey: 'bsvc6_desc', price: 'From $89', duration: 'from 1 hour', isAddon: true }
  ];

  const ITEM_H    = 44;
  const hourItems = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minItems  = ['00', '15', '30', '45'];
  let pickerHourIdx = 8;
  let pickerMinIdx  = 0;
  let pickerAmPm    = 'PM';

  const stepEl = (n) => document.getElementById(`step${n}`);

  /* ---- Validation helpers ---- */
  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validatePhone(v) { return /^[\+\d\s\-\(\)]{7,15}$/.test(v.trim()); }
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (el.previousElementSibling) el.previousElementSibling.classList.add('error');
  }
  function clearErrors(form) {
    form.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  }

  /* ---- Price helpers ---- */
  function getBedIdx() {
    const b = state.bedrooms;
    if (!b || b === 'Studio') return 0;
    const n = parseInt(b);
    if (isNaN(n) || n <= 1) return 1;
    if (n >= 5) return 5;
    return n;
  }
  function isNightBooking() {
    if (!state.time) return false;
    const h12 = parseInt(hourItems[pickerHourIdx]);
    const h24 = pickerAmPm === 'AM'
      ? (h12 === 12 ? 0 : h12)
      : (h12 === 12 ? 12 : h12 + 12);
    return h24 >= 20 || h24 < 6;
  }

  function hasSofaSelected() {
    return state.services.some(s => s.id === 'sofa');
  }
  function hasMainServiceSelected() {
    return state.services.some(s => s.id !== 'sofa');
  }
  function getMainServiceId() {
    const main = state.services.find(s => s.id !== 'sofa');
    return main ? main.id : null;
  }
  function calcBasePrice() {
    if (!state.services.length) return 0;
    const raw = state.services.reduce((sum, s) => {
      if (s.id === 'sofa') return sum;
      const row = BASE_PRICES[s.id];
      return sum + (row ? row[getBedIdx()] : 0);
    }, 0);
    return isNightBooking() ? raw * 2 : raw;
  }
  function calcSofaMattressTotal() {
    const sofaQty = Math.max(0, parseInt(state.sofaQuantity) || 0);
    const matQty  = Math.max(0, parseInt(state.mattressQuantity) || 0);
    return (sofaQty * 119) + (matQty * 89);
  }
  function calcBathSurcharge() {
    if (!state.bedrooms || !state.bathrooms) return 0;
    const bedN  = state.bedrooms === 'Studio' ? 0 : (parseInt(state.bedrooms) || 0);
    const bathN = parseInt(state.bathrooms) || 0;
    const extra = bathN - Math.max(bedN, 1);
    return extra > 0 ? extra * 25 : 0;
  }
  function calcHalfBathSurcharge() {
    const halfN = parseInt(state.halfBathrooms) || 0;
    if (!halfN) return 0;
    const bedN  = !state.bedrooms || state.bedrooms === 'Studio' ? 0 : (parseInt(state.bedrooms) || 0);
    const bathN = parseInt(state.bathrooms) || 0;
    const slotsAvailable = Math.max(bedN, 1) - bathN;
    if (slotsAvailable > 0) return 0;
    return halfN * 15;
  }
  function calcSqftSurcharge() {
    if (!state.bedrooms || !state.sqft) return 0;
    const key = state.bedrooms === 'Studio' ? 'studio' : Math.min(parseInt(state.bedrooms) || 0, 5);
    const avg = SQFT_AVG[key] || 0;
    const midMap = { 'Under 500':400,'500-999':750,'1000-1499':1250,'1500-1999':1750,
                     '2000-2499':2250,'2500-2999':2750,'3000-3499':3250,'3500-3999':3750,'4000+':4200 };
    const actual = midMap[state.sqft] || 0;
    if (!actual || actual <= avg) return 0;
    const over = actual - avg;
    if (over <= 300)  return 20;
    if (over <= 600)  return 45;
    if (over <= 900)  return 75;
    if (over <= 1200) return 110;
    return 150;
  }
  function calcExtrasTotal() {
    return state.extras.reduce((sum, e) => sum + e.price, 0);
  }
  function calcTotal() {
    const base = calcBasePrice();
    const sofaMattress = calcSofaMattressTotal();
    const sub = Math.max(0, base + sofaMattress + calcBathSurcharge() + calcHalfBathSurcharge() + calcSqftSurcharge() + calcExtrasTotal());
    return Math.max(0, sub - (state.promoDiscount || 0));
  }

  function syncSofaQtyUI() {
    const section  = document.getElementById('sofaQtySection');
    const sofaVal  = document.getElementById('sofaQtyVal');
    const matVal   = document.getElementById('mattressQtyVal');
    const subEl    = document.getElementById('sofaQtySubtotal');

    const show = hasSofaSelected();
    if (section) section.style.display = show ? '' : 'none';

    if (!show) {
      if (sofaVal) sofaVal.textContent = '0';
      if (matVal)  matVal.textContent  = '0';
      if (subEl)   subEl.textContent   = 'Sofa/Mattress: $0';
      return;
    }

    const sofaQty = Math.max(0, Math.min(10, parseInt(state.sofaQuantity) || 0));
    const matQty  = Math.max(0, Math.min(10, parseInt(state.mattressQuantity) || 0));
    state.sofaQuantity = sofaQty;
    state.mattressQuantity = matQty;
    if (sofaVal) sofaVal.textContent = String(sofaQty);
    if (matVal)  matVal.textContent  = String(matQty);
    if (subEl)   subEl.textContent   = `Sofa/Mattress: $${calcSofaMattressTotal()}`;
  }

  /* ---- Live price summary ---- */
  function updatePriceSummary() {
    const box = document.getElementById('priceSummary');
    if (!box) return;
    const base     = calcBasePrice();
    const sofaQty  = Math.max(0, parseInt(state.sofaQuantity) || 0);
    const matQty   = Math.max(0, parseInt(state.mattressQuantity) || 0);
    const sofaLine = sofaQty > 0 ? (sofaQty * 119) : 0;
    const matLine  = matQty > 0 ? (matQty * 89) : 0;
    const bath     = calcBathSurcharge();
    const halfBath = calcHalfBathSurcharge();
    const sq       = calcSqftSurcharge();
    const extras   = calcExtrasTotal();
    const total    = calcTotal();
    const hasData  = state.services.length > 0;

    const svcName = state.services.map(s => T(s.nameKey) || s.nameKey).join(' + ') || '—';
    let rows = '';
    rows += `<div class="ps-row"><span class="ps-label">Service</span><span class="ps-val">${svcName}</span></div>`;
    if (state.bedrooms) {
      const halfPart = parseInt(state.halfBathrooms) > 0 ? ` · ${state.halfBathrooms} half bath` : '';
      rows += `<div class="ps-row"><span class="ps-label">Size</span><span class="ps-val">${state.bedrooms} bed · ${state.bathrooms || '?'} full bath${halfPart}</span></div>`;
    }
    if (state.sqft) {
      rows += `<div class="ps-row"><span class="ps-label">Sq. Ft.</span><span class="ps-val">${state.sqft}</span></div>`;
    }
    if (matLine) {
      rows += `<div class="ps-row ps-add"><span class="ps-label">🛏️ Mattresses (×${matQty})</span><span class="ps-val">$${matLine}</span></div>`;
    }
    if (sofaLine) {
      rows += `<div class="ps-row ps-add"><span class="ps-label">🛋️ Sofas (×${sofaQty})</span><span class="ps-val">$${sofaLine}</span></div>`;
    }
    if (base) {
      if (isNightBooking()) {
        rows += `<div class="ps-row ps-base"><span class="ps-label">🌙 Night service (2×)</span><span class="ps-val">$${base}</span></div>`;
        rows += `<div class="ps-row"><span class="ps-label" style="font-size:0.75rem;color:#f59e0b;font-style:italic;">Night rate applies 8 PM – 6 AM</span></div>`;
      } else {
        rows += `<div class="ps-row ps-base"><span class="ps-label">Base price</span><span class="ps-val">$${base}</span></div>`;
      }
    }
    if (bath) {
      rows += `<div class="ps-row ps-add"><span class="ps-label">Bathroom surcharge</span><span class="ps-val">+$${bath}</span></div>`;
    }
    if (halfBath) {
      rows += `<div class="ps-row ps-add"><span class="ps-label">Half bath surcharge</span><span class="ps-val">+$${halfBath}</span></div>`;
    }
    if (sq) {
      rows += `<div class="ps-row ps-add"><span class="ps-label">Sqft surcharge</span><span class="ps-val">+$${sq}</span></div>`;
    }
    state.extras.forEach(e => {
      rows += `<div class="ps-row ps-add"><span class="ps-label">${e.name}</span><span class="ps-val">+$${e.price}</span></div>`;
    });
    if (state.promoDiscount > 0) {
      rows += `<div class="ps-row ps-disc"><span class="ps-label">🎁 Promo Code (${state.promoCode})</span><span class="ps-val" style="color:#16a34a">−$${state.promoDiscount}</span></div>`;
    }
    if (!rows) {
      rows = '<div class="ps-empty">Select a service to see pricing.</div>';
    }
    const totalDisplay = hasData ? '$' + total : '—';

    // Update panel content (shared desktop + mobile drawer)
    const rowsEl = document.getElementById('psRowsInner');
    if (rowsEl) rowsEl.innerHTML = rows;
    const barAmt = document.getElementById('psBarAmt');
    if (barAmt) barAmt.textContent = totalDisplay;
    const totEl = document.getElementById('psTotalNumEl');
    if (totEl) totEl.textContent = totalDisplay;

    const kbHidden = box.dataset.kbHidden === '1';
    box.style.display = hasData && !kbHidden ? '' : 'none';

    // First-time swipe hint on mobile
    if (hasData) box._firstHint?.();

    syncSofaQtyUI();
  }

  /* ---- Price summary drawer (mobile) ---- */
  function initPriceSummaryDrawer() {
    const box      = document.getElementById('priceSummary');
    const bar      = document.getElementById('psBar');
    const chevron  = document.getElementById('psChevronBtn');
    const overlay  = document.getElementById('psOverlay');
    const panel    = document.getElementById('psPanel');
    const closeBtn = document.getElementById('psPanelClose');
    if (!box || !bar || !panel) return;

    let isOpen      = false;
    let hintDone    = false;
    let touchStartY = 0;
    let dragStartPx = 0;
    let hiddenByKeyboard = false;

    function isMobile() { return window.innerWidth <= 1100; }
    function closedPx() { return (panel.offsetHeight || Math.round(window.innerHeight * 0.65)) + 10; }

    function slide(toPx, withAnim) {
      panel.style.transition = withAnim ? 'transform 0.3s ease-out' : 'none';
      panel.style.transform  = `translateY(${toPx}px)`;
    }

    function openDrawer(animate) {
      isOpen = true;
      slide(0, animate !== false);
      overlay?.classList.add('ps-active');
      box.classList.add('ps-expanded');
      if (isMobile()) document.body.style.overflow = 'hidden';
    }

    function closeDrawer(animate) {
      isOpen = false;
      slide(closedPx(), animate !== false);
      overlay?.classList.remove('ps-active');
      box.classList.remove('ps-expanded');
      document.body.style.overflow = '';
    }

    function hideForKeyboard() {
      if (!isMobile()) return;
      if (hiddenByKeyboard) return;
      hiddenByKeyboard = true;
      box.dataset.kbHidden = '1';
      box.style.display = 'none';
      overlay?.classList.remove('ps-active');
      document.body.style.overflow = '';
    }

    function showAfterKeyboard() {
      if (!isMobile()) return;
      if (!hiddenByKeyboard) return;
      hiddenByKeyboard = false;
      box.dataset.kbHidden = '';
      box.style.display = '';
      if (isOpen) {
        openDrawer(false);
      } else {
        closeDrawer(false);
      }
    }

    function toggleDrawer() {
      if (!isMobile()) return;
      if (hiddenByKeyboard) return;
      isOpen ? closeDrawer() : openDrawer();
    }

    function onTouchStart(e) {
      if (!isMobile()) return;
      touchStartY = e.touches[0].clientY;
      dragStartPx = isOpen ? 0 : closedPx();
      panel.style.transition = 'none';
    }

    function onTouchMove(e) {
      if (!isMobile()) return;
      const deltaY = e.touches[0].clientY - touchStartY;
      const newPx  = Math.max(0, Math.min(closedPx(), dragStartPx + deltaY));
      panel.style.transform = `translateY(${newPx}px)`;
      if (Math.abs(deltaY) > 5) e.preventDefault();
    }

    function onTouchEnd(e) {
      if (!isMobile()) return;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      panel.style.transition = 'transform 0.3s ease-out';
      if      (deltaY < -40) openDrawer();
      else if (deltaY >  40) closeDrawer();
      else                   isOpen ? openDrawer(false) : closeDrawer(false);
    }

    const dragHandle = document.getElementById('psDragHandle');
    [bar, dragHandle].forEach(el => {
      if (!el) return;
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchmove',  onTouchMove,  { passive: false });
      el.addEventListener('touchend',   onTouchEnd,   { passive: true });
    });

    function preventBackgroundTouchMove(e) {
      if (!isMobile() || !isOpen) return;
      if (panel.contains(e.target)) return;
      e.preventDefault();
    }

    // Prevent background scrolling when drawer is expanded
    panel.addEventListener('touchmove', (e) => {
      if (!isMobile() || !isOpen) return;
      e.stopPropagation();
    }, { passive: false });

    document.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });

    closeBtn?.addEventListener('click',  () => closeDrawer());
    overlay?.addEventListener('click',   () => closeDrawer());

    chevron?.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDrawer();
    });

    bar.addEventListener('click', (e) => {
      if (!isMobile()) return;
      if (e.target === chevron) return;
      toggleDrawer();
    });

    // Hide drawer while any input is focused (mobile keyboard overlap fix)
    document.querySelectorAll('input, textarea, select').forEach((el) => {
      el.addEventListener('focus', () => hideForKeyboard());
      el.addEventListener('blur', () => setTimeout(showAfterKeyboard, 80));
    });

    // If viewport changes (keyboard opens/closes), keep drawer hidden if an input is focused
    window.addEventListener('resize', () => {
      const active = document.activeElement;
      const isField = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT');
      if (isField) hideForKeyboard();
    });

    // First-time hint: slide halfway up, show label 2s, slide back down
    box._firstHint = function() {
      if (hintDone || !isMobile()) return;
      hintDone = true;
      const hint = document.getElementById('psHintMsg');
      setTimeout(() => {
        const halfPx = Math.round(closedPx() * 0.45);
        slide(halfPx, true);
        if (hint) { hint.style.transition = 'opacity 0.3s ease'; hint.style.opacity = '1'; }
        setTimeout(() => {
          closeDrawer(true);
          if (hint) hint.style.opacity = '0';
        }, 2000);
      }, 150);
    };
  }

  /* ---- Progress bar ---- */
  function updateProgress() {
    for (let i = 1; i <= state.totalSteps; i++) {
      const circle = document.getElementById(`progressStep${i}`);
      const line   = document.getElementById(`progressLine${i}`);
      if (!circle) continue;
      circle.classList.remove('active', 'done');
      if (i < state.step)      circle.classList.add('done');
      else if (i === state.step) circle.classList.add('active');
      if (line) line.classList.toggle('done', i < state.step);
    }
  }

  /* ---- Step navigation ---- */
  function goToStep(n) {
    const current = stepEl(state.step);
    const next    = stepEl(n);
    if (current) current.style.display = 'none';
    if (next) {
      next.style.display = 'block';
      next.style.animation = 'fade-in-up 0.45s ease both';
    }
    state.step = n;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (n === 5) {
      // Mount Stripe card field when entering details step
      setTimeout(() => {
        initStripeCardMount();
      }, 0);
    }
  }

  async function ensureStripeSetupIntent(email, name) {
    if (stripeClientSecret && stripeCustomerId) return;
    const url = 'https://acfsvzbjfiynlcbjvtbq.supabase.co/functions/v1/create-setup-intent';

    console.log('ensureStripeSetupIntent: fetch create-setup-intent (start)', {
      url,
      hasEmail: !!String(email || '').trim(),
      hasName: !!String(name || '').trim(),
    });

    const response = await withTimeout(15000, fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    }), 'create-setup-intent');

    console.log('ensureStripeSetupIntent: fetch create-setup-intent (response)', {
      ok: response?.ok,
      status: response?.status,
    });

    const data = await response.json().catch(() => ({}));

    console.log('ensureStripeSetupIntent: fetch create-setup-intent (json)', data);

    if (!response.ok) {
      throw new Error(data?.error || `create-setup-intent failed (HTTP ${response.status})`);
    }

    stripeClientSecret = data?.clientSecret || '';
    stripeCustomerId = data?.customerId || '';

    if (!stripeClientSecret || !stripeCustomerId) {
      throw new Error('Stripe SetupIntent did not return clientSecret/customerId');
    }
  }

  function withTimeout(ms, promise, label) {
    let t;
    const timeout = new Promise((_, reject) => {
      t = setTimeout(() => reject(new Error((label ? label + ' ' : '') + `timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
  }

  function initStripeCardMount() {
    if (stripeMountAttempted) return;
    stripeMountAttempted = true;

    const mount = document.getElementById('stripeCardMount');
    if (!mount) return;

    if (!window.Stripe) {
      const errEl = document.getElementById('stripeCardError');
      if (errEl) errEl.textContent = 'Stripe failed to load. Please refresh and try again.';
      return;
    }

    stripeClient = window.Stripe(STRIPE_PUBLISHABLE_KEY);
    stripeElements = stripeClient.elements();
    stripeCard = stripeElements.create('card', {
      style: {
        base: {
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          fontSize: '16px',
          color: '#1e3a5c',
          '::placeholder': { color: '#9ca3af' },
        },
        invalid: { color: '#dc2626' },
      },
    });

    stripeCard.on('change', (evt) => {
      stripeCardComplete = !!evt.complete;
      const errEl = document.getElementById('stripeCardError');
      if (errEl) errEl.textContent = evt.error?.message || '';
    });

    stripeCard.mount(mount);
  }

  /* ---- Promo code apply ---- */
  async function applyPromoCode() {
    const code = (document.getElementById('promoCodeInput')?.value || '').trim().toUpperCase();
    console.log('[Promo] Apply clicked, code:', code);
    const msgEl = document.getElementById('promoMessage');
    const removeEl = document.getElementById('promoRemoveBtn');
    if (!code) {
      if (msgEl) { msgEl.textContent = ''; msgEl.style.color = ''; }
      return;
    }
    const applyBtn = document.getElementById('promoApplyBtn');
    if (applyBtn) { applyBtn.disabled = true; applyBtn.textContent = 'Checking…'; }
    try {
      const url = SUPABASE_URL + '/rest/v1/savings_claims?promo_code=eq.' + encodeURIComponent(code) + '&select=*';
      console.log('[Promo] Fetching:', url);
      const res = await fetch(url,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }
      );
      const data = await res.json();
      console.log('[Promo] Fetch result:', data);
      const claim = Array.isArray(data) ? data[0] : null;
      console.log('[Promo] claim found:', claim, '| times_used:', claim?.times_used);
      if (!claim) {
        state.promoCode = ''; state.promoDiscount = 0; window.promoDiscount = 0; state.promoTimesUsed = -1;
        if (msgEl) { msgEl.textContent = '❌ Invalid promo code'; msgEl.style.color = '#dc2626'; }
        if (removeEl) removeEl.style.display = 'none';
      } else {
        const used = claim.times_used || 0;
        state.promoTimesUsed = used;
        state.promoCode = code;
        window.promoCodeValue = code;
        window.promoClaimId = claim.id;
        window.promoTimesUsed = used;
        if (used === 0) {
          state.promoDiscount = 25; window.promoDiscount = 25;
          if (msgEl) { msgEl.textContent = '🎉 $25 off applied! (1st booking discount)'; msgEl.style.color = '#16a34a'; }
        } else if (used === 1) {
          state.promoDiscount = 0; window.promoDiscount = 0;
          if (msgEl) { msgEl.textContent = '💪 Keep going! $25 off your 3rd booking!'; msgEl.style.color = '#1d4ed8'; }
        } else if (used === 2) {
          state.promoDiscount = 25; window.promoDiscount = 25;
          if (msgEl) { msgEl.textContent = '🎉 $25 off applied! (3rd booking discount)'; msgEl.style.color = '#16a34a'; }
        } else if (used === 3) {
          state.promoDiscount = 0; window.promoDiscount = 0;
          if (msgEl) { msgEl.textContent = '🎉 One more! $25 off your 5th booking!'; msgEl.style.color = '#1d4ed8'; }
        } else if (used === 4) {
          state.promoDiscount = 25; window.promoDiscount = 25;
          if (msgEl) { msgEl.textContent = '🎉 $25 off applied! (5th booking discount)'; msgEl.style.color = '#16a34a'; }
        } else {
          state.promoDiscount = 0; window.promoDiscount = 0;
          if (msgEl) { msgEl.textContent = '🏆 You\'ve used all $75 in savings!'; msgEl.style.color = '#b45309'; }
        }
        if (removeEl) removeEl.style.display = state.promoDiscount > 0 ? '' : 'none';
        if (state.promoDiscount > 0 && typeof gtag === 'function') {
          gtag('event', 'promo_applied', { promo_code: code, discount: state.promoDiscount });
        }
      }
      updatePriceSummary();
    } catch (e) {
      if (msgEl) { msgEl.textContent = '❌ Could not verify code. Please try again.'; msgEl.style.color = '#dc2626'; }
    } finally {
      if (applyBtn) { applyBtn.disabled = false; applyBtn.textContent = 'Apply'; }
    }
  }

  function clearPromoCode() {
    state.promoCode = ''; state.promoDiscount = 0; window.promoDiscount = 0; state.promoTimesUsed = -1;
    window.promoCodeValue = ''; window.promoClaimId = null;
    const inp = document.getElementById('promoCodeInput');
    const msgEl = document.getElementById('promoMessage');
    const removeEl = document.getElementById('promoRemoveBtn');
    if (inp) inp.value = '';
    if (msgEl) { msgEl.textContent = ''; msgEl.style.color = ''; }
    if (removeEl) removeEl.style.display = 'none';
    updatePriceSummary();
  }

  /* ---- Step 1: Email ---- */
  function initStep1() {
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('bookingEmail')?.value || '').trim();
        if (!validateEmail(email)) {
          showError('bookingEmailErr', T('err_email') || 'Please enter a valid email address');
          return;
        }
        state.user = { name: '', surname: '', phone: '', email, address: '', apt: '', city: '', zip: '' };

        // Check if first-time customer → show Free Extra banner
        (async () => {
          try {
            const countRes = await fetch(
              SUPABASE_URL + '/rest/v1/bookings?email=eq.' + encodeURIComponent(email) + '&select=id&limit=1',
              { headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }
            );
            const countData = await countRes.json();
            state.isFirstTimeCustomer = Array.isArray(countData) && countData.length === 0;
          } catch (e) {
            state.isFirstTimeCustomer = false;
          }
          const banner = document.getElementById('freeExtraBanner');
          if (banner) banner.style.display = state.isFirstTimeCustomer ? '' : 'none';
        })();

        // Create Stripe SetupIntent early so card can be saved later.
        (async () => {
          try {
            await ensureStripeSetupIntent(email, '');
          } catch (err) {
            console.error('Stripe setup intent error:', err);
          }
        })();

        goToStep(2);
      });
    }
    const googleBtn = document.getElementById('googleAuthBtn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => {
        if (window.supabase) {
          window.supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: 'https://homelinescleaning.com/booking.html' }
          });
        }
      });
    }
  }

  /* ---- Step 2: Service Selection ---- */
  function renderServiceGrid() {
    const grid = document.getElementById('serviceGrid');
    if (!grid) return;
    grid.innerHTML = '';
    services.forEach(svc => {
      const card = document.createElement('div');
      card.className = 'service-option';
      card.dataset.id = svc.id;
      const svcName = T(svc.nameKey) || svc.nameKey;
      const svcDesc = T(svc.descKey) || svc.descKey;
      const isSofa = svc.id === 'sofa';
      card.innerHTML = `
        <div class="service-option-check">✓</div>
        <span class="service-option-icon">${svc.icon}</span>
        <h4>${svcName}</h4>
        <p>${svcDesc}</p>
        <div class="option-price">${svc.price} · ${svc.duration}</div>
        ${isSofa ? '<div class="service-badge">➕ Add-on</div>' : ''}
      `;
      const isSelected = state.services.find(s => s.id === svc.id);
      if (isSelected) card.classList.add('selected');
      card.addEventListener('click', () => {
        if (isSofa) {
          // Sofa/Mattress = add-on checkbox (independent)
          const idx = state.services.findIndex(s => s.id === 'sofa');
          if (idx > -1) {
            state.services.splice(idx, 1);
            state.sofaQuantity = 0;
            state.mattressQuantity = 0;
          } else {
            state.services.push(svc);
            if (hasMainServiceSelected()) {
              state.sofaQuantity = 0;
              state.mattressQuantity = 0;
            } else {
              state.sofaQuantity = 0;
              state.mattressQuantity = 1;
            }
          }
        } else {
          // Main services = radio (only one at a time)
          const sofaSvc = state.services.find(s => s.id === 'sofa') || null;
          const isAlreadySelected = !!state.services.find(s => s.id === svc.id);

          // Toggle off if user taps the already-selected main service
          const nextServices = [];
          if (sofaSvc) nextServices.push(sofaSvc);
          if (!isAlreadySelected) nextServices.push(svc);
          state.services = nextServices;

          // If sofa is selected as add-on (main service also selected), default both quantities to 0
          if (hasSofaSelected() && hasMainServiceSelected()) {
            state.sofaQuantity = 0;
            state.mattressQuantity = 0;
          }
        }

        // Always re-render so visuals match state (radio + checkbox behavior)
        renderServiceGrid();
        renderExtrasGrid();
        const nextBtn = document.getElementById('step2Next');
        if (nextBtn) nextBtn.disabled = state.services.length === 0;
        updatePriceSummary();
      });
      grid.appendChild(card);
    });
  }

  function initStep2() {
    renderServiceGrid();
    const nextBtn = document.getElementById('step2Next');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.addEventListener('click', () => {
        if (state.services.length > 0) goToStep(3);
      });
    }
    const backBtn = document.getElementById('step2Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(1));
  }

  /* ---- Step 3: Home Details & Extras ---- */
  function renderExtrasGrid() {
    const grid = document.getElementById('extrasGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const svcId = getMainServiceId();
    const includedSet = INCLUDED_EXTRAS_BY_SERVICE[svcId] || new Set([]);
    let didMutateState = false;

    /* Included items at top, preserving the requested order */
    const includedOrder = {
      deep: [
        'Inside kitchen cabinets (empty)',
        'Detail baseboards',
        'Interior windows up to 1250 sqft'
      ],
      move: [
        'Inside kitchen cabinets (empty)',
        'Detail baseboards',
        'Interior windows up to 1250 sqft'
      ],
      postconstruction: [
        'Inside kitchen cabinets (empty)',
        'Detail baseboards',
        'Interior windows up to 1250 sqft'
      ]
    };
    const topNames = includedOrder[svcId] || [];
    const topExtras = topNames
      .map(name => EXTRAS_LIST.find(e => e.name === name))
      .filter(Boolean);
    const restExtras = EXTRAS_LIST.filter(e => !includedSet.has(e.name));
    const finalList = [...topExtras, ...restExtras];

    finalList.forEach(extra => {
      const card = document.createElement('div');
      card.className = 'extra-card';
      card.dataset.name = extra.name;

      const isIncluded = includedSet.has(extra.name);

      if (isIncluded) {
        const idx = state.extras.findIndex(e => e.name === extra.name);
        if (idx > -1) {
          state.extras.splice(idx, 1);
          didMutateState = true;
        }
      }

      const isSelected = state.extras.some(e => e.name === extra.name);
      if (isSelected) card.classList.add('selected');
      if (isIncluded) card.classList.add('included');
      card.innerHTML = `
        <div class="extra-check">✓</div>
        <div class="extra-icon"><img src="${extra.icon}" alt="" width="36" height="36" loading="lazy"/></div>
        <div class="extra-name">${extra.name}</div>
        <div class="extra-price">${isIncluded ? '✅ Included' : `+$${extra.price}`}</div>
      `;

      if (!isIncluded) {
        card.addEventListener('click', () => {
          if (extra.name === 'Pets at home') {
            /* sync with pets toggle */
            const newPets = !state.hasPets;
            setPets(newPets);
            return;
          }
          toggleExtra(extra, card);
        });
      }
      grid.appendChild(card);
    });

    if (didMutateState) updatePriceSummary();
  }

  function preserveScrollOnMobile(fn) {
    if (window.innerWidth > 1100) {
      fn();
      return;
    }
    const saved = window.scrollY;
    fn();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, saved);
      });
    });
  }

  function toggleExtra(extra, card) {
    const idx = state.extras.findIndex(e => e.name === extra.name);
    if (idx > -1) {
      state.extras.splice(idx, 1);
      if (card) card.classList.remove('selected');
    } else {
      state.extras.push(extra);
      if (card) card.classList.add('selected');
    }
    if (extra.name === 'Pets at home') {
      state.hasPets = (idx === -1);
      syncPetsUI();
    }
    preserveScrollOnMobile(() => updatePriceSummary());
  }

  function setPets(val) {
    const petsExtra = PETS_EXTRA;
    const idx = state.extras.findIndex(e => e.name === petsExtra.name);
    state.hasPets = val;
    if (val && idx === -1) state.extras.push(petsExtra);
    if (!val && idx > -1)  state.extras.splice(idx, 1);
    syncPetsUI();
    /* sync extras grid card */
    const card = document.querySelector(`.extra-card[data-name="Pets at home"]`);
    if (card) card.classList.toggle('selected', val);
    preserveScrollOnMobile(() => updatePriceSummary());
  }

  function syncPetsUI() {
    document.getElementById('petsYes')?.classList.toggle('pets-active', state.hasPets);
    document.getElementById('petsNo')?.classList.toggle('pets-active', !state.hasPets);
  }

  function initStep3() {
    renderExtrasGrid();
    syncPetsUI();

    function clampQty(v) {
      const n = parseInt(v);
      if (isNaN(n)) return 0;
      return Math.max(0, Math.min(10, n));
    }

    function setQty(kind, nextVal) {
      const v = clampQty(nextVal);
      if (kind === 'sofa') state.sofaQuantity = v;
      if (kind === 'mattress') state.mattressQuantity = v;
      syncSofaQtyUI();
      updatePriceSummary();
    }

    document.getElementById('sofaQtyMinus')?.addEventListener('click', () => setQty('sofa', (parseInt(state.sofaQuantity) || 0) - 1));
    document.getElementById('sofaQtyPlus')?.addEventListener('click',  () => setQty('sofa', (parseInt(state.sofaQuantity) || 0) + 1));
    document.getElementById('mattressQtyMinus')?.addEventListener('click', () => setQty('mattress', (parseInt(state.mattressQuantity) || 0) - 1));
    document.getElementById('mattressQtyPlus')?.addEventListener('click',  () => setQty('mattress', (parseInt(state.mattressQuantity) || 0) + 1));

    syncSofaQtyUI();

    document.getElementById('petsYes')?.addEventListener('click', () => setPets(true));
    document.getElementById('petsNo')?.addEventListener('click',  () => setPets(false));

    document.getElementById('detailsBeds')?.addEventListener('change',      (e) => { state.bedrooms      = e.target.value; updatePriceSummary(); });
    document.getElementById('detailsBaths')?.addEventListener('change',     (e) => { state.bathrooms     = e.target.value; updatePriceSummary(); });
    document.getElementById('detailsHalfBaths')?.addEventListener('change', (e) => { state.halfBathrooms = e.target.value; updatePriceSummary(); });
    document.getElementById('detailsSqft')?.addEventListener('change',      (e) => { state.sqft          = e.target.value; updatePriceSummary(); });

    const nextBtn = document.getElementById('step3Next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const city = document.getElementById('detailsCitySelect')?.value;
        if (!city) {
          showError('detailsCitySelectErr', 'Please select your city');
          return;
        }
        state.serviceCity   = city;
        state.sqft          = document.getElementById('detailsSqft')?.value       || '';
        state.bedrooms      = document.getElementById('detailsBeds')?.value       || '';
        state.bathrooms     = document.getElementById('detailsBaths')?.value      || '';
        state.halfBathrooms = document.getElementById('detailsHalfBaths')?.value  || '0';
        state.notes         = document.getElementById('detailsNotes')?.value      || '';
        goToStep(4);
      });
    }
    const backBtn = document.getElementById('step3Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(2));
  }

  /* ---- Step 4: Calendar & Time ---- */
  function renderCalendar() {
    const { month, year } = state.calendar;
    const locale = langLocale();
    const titleEl = document.getElementById('calMonthTitle');
    if (titleEl) titleEl.textContent = new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const grid = document.getElementById('calGrid');
    if (!grid) return;
    grid.querySelectorAll('.cal-day, .cal-day-name').forEach(d => d.remove());

    const dayNames = Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 0, 7 + i).toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
    );
    dayNames.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-day-name';
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0);

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div'); empty.className = 'cal-day empty'; grid.appendChild(empty);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const el   = document.createElement('div'); el.className = 'cal-day'; el.textContent = d;
      const date = new Date(year, month, d); date.setHours(0,0,0,0);
      if (date < today) {
        el.classList.add('disabled');
      } else {
        if (date.getTime() === today.getTime()) el.classList.add('today');
        if (state.date) {
          const sel = new Date(state.date); sel.setHours(0,0,0,0);
          if (date.getTime() === sel.getTime()) el.classList.add('selected');
        }
        el.addEventListener('click', () => {
          state.date = new Date(year, month, d);
          renderCalendar();
          document.getElementById('selectedDateDisplay').textContent =
            state.date.toLocaleDateString(langLocale(), { weekday:'long', year:'numeric', month:'long', day:'numeric' });
          checkStep4();
        });
      }
      grid.appendChild(el);
    }
  }

  function initWheel(wheelEl, items, initialIdx, onSelect) {
    wheelEl.innerHTML = '';
    const mkSpacer = () => { const s = document.createElement('div'); s.style.height = (ITEM_H * 2) + 'px'; return s; };
    wheelEl.appendChild(mkSpacer());
    items.forEach(val => {
      const div = document.createElement('div'); div.className = 'tp-item'; div.textContent = val;
      wheelEl.appendChild(div);
    });
    wheelEl.appendChild(mkSpacer());
    requestAnimationFrame(() => { wheelEl.scrollTop = initialIdx * ITEM_H; applyWheelVisuals(wheelEl, initialIdx); });
    let snapTimer = null;
    wheelEl.addEventListener('scroll', () => {
      const liveF = wheelEl.scrollTop / ITEM_H;
      applyWheelVisuals(wheelEl, liveF);
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        const idx = Math.max(0, Math.min(items.length - 1, Math.round(wheelEl.scrollTop / ITEM_H)));
        wheelEl.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
        applyWheelVisuals(wheelEl, idx);
        onSelect(idx);
      }, 120);
    }, { passive: true });
    wheelEl.addEventListener('click', e => {
      const item = e.target.closest('.tp-item');
      if (!item) return;
      const idx = Array.from(wheelEl.querySelectorAll('.tp-item')).indexOf(item);
      if (idx >= 0) wheelEl.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    });
  }

  function applyWheelVisuals(wheelEl, centerF) {
    wheelEl.querySelectorAll('.tp-item').forEach((el, i) => {
      const dist = Math.abs(i - centerF);
      el.style.opacity   = Math.max(0.22, 1 - dist * 0.28);
      el.style.transform = `scale(${Math.max(0.70, 1 - dist * 0.09)})`;
      el.classList.toggle('tp-selected', Math.round(centerF) === i);
    });
  }

  function updateTimePicker() {
    const h = hourItems[pickerHourIdx];
    const m = minItems[pickerMinIdx];
    state.time = `${h}:${m} ${pickerAmPm}`;
    const disp = document.getElementById('selectedTimeDisplay');
    if (disp) disp.textContent = `Selected: ${state.time}`;
    document.getElementById('amBtn')?.classList.toggle('tp-ampm-active', pickerAmPm === 'AM');
    document.getElementById('pmBtn')?.classList.toggle('tp-ampm-active', pickerAmPm === 'PM');
    checkStep4();
    updatePriceSummary();
  }

  function checkStep4() {
    const nextBtn = document.getElementById('step4Next');
    if (nextBtn) nextBtn.disabled = !(state.date && state.time);
  }

  function initStep4() {
    renderCalendar();
    const hourWheelEl = document.getElementById('hourWheel');
    const minWheelEl  = document.getElementById('minWheel');
    if (hourWheelEl) initWheel(hourWheelEl, hourItems, pickerHourIdx, idx => { pickerHourIdx = idx; updateTimePicker(); });
    if (minWheelEl)  initWheel(minWheelEl,  minItems,  pickerMinIdx,  idx => { pickerMinIdx  = idx; updateTimePicker(); });
    document.getElementById('amBtn')?.addEventListener('click', () => { pickerAmPm = 'AM'; updateTimePicker(); });
    document.getElementById('pmBtn')?.addEventListener('click', () => { pickerAmPm = 'PM'; updateTimePicker(); });
    updateTimePicker();
    state.time = ''; // display-only init; night rate must not fire until user selects a time

    document.getElementById('calPrev')?.addEventListener('click', () => {
      state.calendar.month--;
      if (state.calendar.month < 0) { state.calendar.month = 11; state.calendar.year--; }
      renderCalendar();
    });
    document.getElementById('calNext')?.addEventListener('click', () => {
      state.calendar.month++;
      if (state.calendar.month > 11) { state.calendar.month = 0; state.calendar.year++; }
      renderCalendar();
    });

    const nextBtn = document.getElementById('step4Next');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.addEventListener('click', () => {
        if (state.date && state.time) { prefillDetailsForm(); goToStep(5); }
      });
    }
    const backBtn = document.getElementById('step4Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(3));
  }

  /* ---- Step 5: Contact Details ---- */
  function prefillDetailsForm() {
    const u = state.user;
    if (!u) return;
    const fill = (id, val) => { const el = document.getElementById(id); if (el && !el.value && val) el.value = val; };
    fill('detailsName',    u.name);
    fill('detailsSurname', u.surname);
    fill('detailsPhone',   u.phone);
    fill('detailsAddress', u.address);
    fill('detailsApt',     u.apt);
    fill('detailsCity',    state.serviceCity);
    fill('detailsZip',     u.zip);
  }

  function initStep5() {
    const detailsForm = document.getElementById('detailsForm');
    if (!detailsForm) return;
    detailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors(detailsForm);
      let valid = true;
      const name    = document.getElementById('detailsName').value.trim();
      const surname = document.getElementById('detailsSurname').value.trim();
      const phone   = document.getElementById('detailsPhone').value.trim();
      const address = document.getElementById('detailsAddress').value.trim();
      const apt     = document.getElementById('detailsApt').value.trim();
      const zip     = document.getElementById('detailsZip').value.trim();

      if (!name)                 { showError('detailsNameErr',    T('err_name')    || 'Please enter your first name');       valid = false; }
      if (!surname)              { showError('detailsSurnameErr', T('err_surname') || 'Please enter your last name');        valid = false; }
      if (!validatePhone(phone)) { showError('detailsPhoneErr',   T('err_phone')   || 'Please enter a valid phone number'); valid = false; }
      if (!address)              { showError('detailsAddressErr', T('err_address') || 'Please enter your street address');   valid = false; }
      if (!zip)                  { showError('detailsZipErr',     T('err_zip')     || 'Please enter your ZIP code');         valid = false; }

      if (!stripeCardComplete) {
        const cardErrEl = document.getElementById('stripeCardError');
        if (cardErrEl) {
          cardErrEl.textContent = 'Please enter your credit card to continue';
          cardErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        valid = false;
      }

      if (valid) {
        state.serviceCity   = document.getElementById('detailsCitySelect')?.value || state.serviceCity;
        state.sqft          = document.getElementById('detailsSqft')?.value        || state.sqft;
        state.bedrooms      = document.getElementById('detailsBeds')?.value        || state.bedrooms;
        state.bathrooms     = document.getElementById('detailsBaths')?.value       || state.bathrooms;
        state.halfBathrooms = document.getElementById('detailsHalfBaths')?.value   || state.halfBathrooms;
        state.notes         = document.getElementById('detailsNotes')?.value       || state.notes;
        state.user = { ...state.user, name, surname, phone, address, apt, city: state.serviceCity, zip };

        // Best-effort: create SetupIntent when entering the card step.
        (async () => {
          try {
            await ensureStripeSetupIntent(state.user?.email || '', `${state.user?.name || ''} ${state.user?.surname || ''}`.trim());
          } catch (err) {
            console.error('Stripe setup intent error (step 5):', err);
          }
        })();

        populateSummary();
        goToStep(6);
      }
    });
    document.getElementById('promoApplyBtn')?.addEventListener('click', () => applyPromoCode());
    document.getElementById('promoCodeInput')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromoCode(); } });
    document.getElementById('promoRemoveBtn')?.addEventListener('click', () => clearPromoCode());

    const backBtn = document.getElementById('step5Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(4));
  }

  /* ---- Step 6: Confirmation ---- */
  function populateSummary() {
    const set     = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const showRow = (id, show) => { const el = document.getElementById(id); if (el) el.style.display = show ? '' : 'none'; };
    const u = state.user;

    set('sumName', `${u.name}${u.surname ? ' ' + u.surname : ''}`);
    set('sumEmail',    u.email);
    set('sumPhone',    u.phone);
    set('sumAddress',  u.address ? `${u.address}${u.apt ? ' ' + u.apt : ''}, ${u.city}${u.zip ? ' ' + u.zip : ''}` : '—');
    set('sumService',  state.services.map(s => T(s.nameKey) || s.nameKey).join(', ') || '—');
    set('sumDate',     state.date?.toLocaleDateString(langLocale(), { weekday:'long', year:'numeric', month:'long', day:'numeric' }) || '—');
    set('sumTime',     state.time || '—');
    set('sumDuration', state.services.map(s => s.duration).join(' + ') || '—');

    /* sofa / mattress quantities */
    const sofaQty = Math.max(0, parseInt(state.sofaQuantity) || 0);
    const matQty  = Math.max(0, parseInt(state.mattressQuantity) || 0);
    if (sofaQty > 0 || matQty > 0) {
      const lines = [];
      if (sofaQty > 0) lines.push(`🛋️ Sofas (×${sofaQty}): $${sofaQty * 119}`);
      if (matQty > 0)  lines.push(`🛏️ Mattresses (×${matQty}): $${matQty * 89}`);
      set('sumSofaMattress', lines.join('\n'));
      showRow('sumSofaMattressRow', true);
    } else {
      showRow('sumSofaMattressRow', false);
    }

    /* city */
    set('sumCity', state.serviceCity || '—');

    /* home size */
    const homeParts = [];
    if (state.sqft)      homeParts.push(state.sqft + ' sqft');
    if (state.bedrooms)  homeParts.push(state.bedrooms + ' bed');
    if (state.bathrooms) homeParts.push(state.bathrooms + ' full bath');
    if (parseInt(state.halfBathrooms) > 0) homeParts.push(state.halfBathrooms + ' half bath');
    set('sumHomeSize', homeParts.length ? homeParts.join(' · ') : '—');

    /* extras */
    const nonPetExtras = state.extras.filter(e => e.name !== 'Pets at home');
    if (nonPetExtras.length) {
      set('sumExtras', nonPetExtras.map(e => `${e.name} (+$${e.price})`).join('\n'));
      showRow('sumExtrasRow', true);
    } else {
      showRow('sumExtrasRow', false);
    }

    /* pets */
    showRow('sumPetsRow', state.hasPets);

    /* notes */
    if (state.notes.trim()) {
      set('sumNotes', state.notes.trim());
      showRow('sumNotesRow', true);
    } else {
      showRow('sumNotesRow', false);
    }

    /* promo code */
    if (state.promoDiscount > 0) {
      set('sumPromo', `-$${state.promoDiscount} (${state.promoCode})`);
      showRow('sumPromoRow', true);
    } else {
      showRow('sumPromoRow', false);
    }

    /* total */
    const base      = calcBasePrice();
    const sofaMatt  = calcSofaMattressTotal();
    const bath      = calcBathSurcharge();
    const halfBath  = calcHalfBathSurcharge();
    const sq        = calcSqftSurcharge();
    const total     = calcTotal();
    const extrasTotal = calcExtrasTotal();
    let priceStr = '—';
    if (base > 0 || sofaMatt > 0) {
      priceStr = `$${total}`;
      const parts = [];
      if (base > 0) parts.push(`Base $${base}`);
      if (sofaMatt > 0) parts.push(`Sofa/Mattress $${sofaMatt}`);
      if (bath > 0)     parts.push(`+$${bath} full bath`);
      if (halfBath > 0) parts.push(`+$${halfBath} half bath`);
      if (sq > 0)       parts.push(`+$${sq} sqft`);
      if (extrasTotal > 0) parts.push(`+$${extrasTotal} extras`);
      if (state.promoDiscount > 0) parts.push(`−$${state.promoDiscount} promo`);
      if (parts.length > 1) priceStr += ` (${parts.join(', ')})`;
    }
    set('sumPrice', priceStr);
  }

  function initStep6() {
    const tosCheckbox = document.getElementById('tosCheckbox');
    const tosError    = document.getElementById('tosError');
    const confirmBtn  = document.getElementById('confirmBooking');
    if (tosCheckbox && confirmBtn) {
      tosCheckbox.addEventListener('change', function() {
        if (this.checked) {
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = '';
          confirmBtn.style.cursor  = '';
          if (tosError) tosError.style.display = 'none';
        } else {
          confirmBtn.disabled = true;
          confirmBtn.style.opacity = '0.5';
          confirmBtn.style.cursor  = 'not-allowed';
        }
      });
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        if (tosCheckbox && !tosCheckbox.checked) {
          if (tosError) tosError.style.display = '';
          return;
        }
        console.log('=== CONFIRM BOOKING START ===');

        confirmBtn.textContent = T('bk_processing') || 'Processing...';
        confirmBtn.disabled = true;

        const stripeErrEl = document.getElementById('stripeCardError');
        if (stripeErrEl) stripeErrEl.textContent = '';

        const showNonBlockingWarning = (text) => {
          if (!stripeErrEl) return;
          stripeErrEl.textContent = text;
        };

        const resetConfirmBtn = () => {
          confirmBtn.textContent = T('bk_confirm') || 'Confirm Booking';
          confirmBtn.disabled = false;
        };

        const refCode  = 'HL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const u        = state.user;
        const serviceNames = state.services.map(s => T(s.nameKey) || s.nameKey).join(', ') || '';
        const totalPrice   = calcTotal();

        console.log('Stripe instance:', !!stripeClient);
        console.log('Card element:', !!stripeCard);
        console.log('Client secret:', stripeClientSecret);

        let cardSaved = false;
        let stripeWarning = '';

        // Attempt to save card, but NEVER block booking creation.
        try {
          await withTimeout(15000, (async () => {
            console.log('[Stripe] initStripeCardMount()');
            initStripeCardMount();
            console.log('Stripe instance:', !!stripeClient);
            console.log('Card element:', !!stripeCard);
            console.log('Client secret:', stripeClientSecret);

            if (!stripeClient || !stripeCard) {
              throw new Error('Stripe not initialized');
            }

            if (!stripeClientSecret) {
              console.log('[Stripe] clientSecret missing, creating SetupIntent...');
              try {
                await ensureStripeSetupIntent(u?.email || '', `${u?.name || ''} ${u?.surname || ''}`.trim());
              } catch (e) {
                console.error('[Stripe] create-setup-intent failed:', e);
              }
            }

            console.log('[Stripe] clientSecret after ensure:', stripeClientSecret);
            console.log('Client secret:', stripeClientSecret);

            if (!stripeClientSecret) {
              // Requirement: skip Stripe entirely if clientSecret is null/undefined
              throw new Error('Missing client secret (skipping card save)');
            }

            const billing_details = {
              name: `${u?.name || ''} ${u?.surname || ''}`.trim() || undefined,
              email: u?.email || undefined,
              phone: u?.phone || undefined,
              address: u?.address ? {
                line1: u.address,
                city: u.city || undefined,
                postal_code: u.zip || undefined,
                country: 'US',
              } : undefined,
            };

            console.log('[Stripe] confirmCardSetup start');
            const setupRes = await stripeClient.confirmCardSetup(
              stripeClientSecret,
              {
                payment_method: {
                  card: stripeCard,
                  billing_details,
                },
              },
              { redirect: 'if_required' },
            );
            console.log('[Stripe] confirmCardSetup result:', { hasError: !!setupRes?.error });

            if (setupRes?.error) {
              throw new Error(setupRes.error.message || 'Card setup failed.');
            }

            cardSaved = true;
          })(), 'Stripe');
        } catch (stripeErr) {
          console.error('[Stripe] non-fatal error:', stripeErr);
          stripeWarning = 'Card could not be saved. You can add it later.';
          showNonBlockingWarning(stripeWarning);
        }

        const bookingData = {
          ref_code:     refCode,
          first_name:   u.name    || '',
          last_name:    u.surname || '',
          email:        u.email   || '',
          phone:        u.phone   || '',
          address:      u.address ? `${u.address}${u.apt ? ' ' + u.apt : ''}` : '',
          city:         u.city    || '',
          zip:          u.zip     || '',
          service:      serviceNames,
          price:        totalPrice,
          total_price:  totalPrice,
          booking_date: state.date ? state.date.toISOString().split('T')[0] : null,
          booking_time: state.time || '',
          status:       'pending',
          /* new fields */
          service_city: state.serviceCity   || null,
          sqft:         state.sqft            || null,
          bedrooms:     state.bedrooms        || null,
          bathrooms:    state.bathrooms       || null,
          half_baths:   state.halfBathrooms   || null,
          sofa_quantity:     Math.max(0, parseInt(state.sofaQuantity) || 0),
          mattress_quantity: Math.max(0, parseInt(state.mattressQuantity) || 0),
          extras:       state.extras.length ? state.extras : null,
          included_extras: getIncludedExtrasList(),
          notes:        state.notes      || null,
          promo_code:      state.promoCode    || null,
          coupon_discount: state.promoDiscount || 0,
          has_pets:     state.hasPets,
          is_night_booking: isNightBooking(),
          stripe_customer_id: stripeCustomerId || null,
          payment_status: 'pending',
          payment_method_saved: cardSaved,
          free_extra_earned: !!state.isFirstTimeCustomer
        };

        try {
          let userId = null;
          if (window.supabase) {
            try {
              const timeout = new Promise((_, reject) => setTimeout(() => reject('timeout'), 3000));
              const { data } = await Promise.race([window.supabase.auth.getUser(), timeout]);
              userId = data?.user?.id || null;
            } catch (e) {
              console.log('getUser skipped');
              userId = null;
            }
          }
          bookingData.user_id = userId;

          console.log('[Booking] inserting booking:', JSON.stringify(bookingData, null, 2));

          let insertData;
          const supabaseResult = window.supabase
            ? await Promise.race([
                window.supabase.from('bookings').insert([bookingData]).select(),
                new Promise(resolve => setTimeout(() => resolve({ timedOut: true }), 10000))
              ])
            : { timedOut: true };

          if (supabaseResult.timedOut) {
            console.warn('[Booking] supabase client timed out, using direct fetch');
            const resp = await fetch(SUPABASE_URL + '/rest/v1/bookings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': 'Bearer ' + SUPABASE_KEY,
                'Prefer': 'return=representation'
              },
              body: JSON.stringify(bookingData)
            });
            if (!resp.ok) {
              const body = await resp.json().catch(() => ({}));
              throw new Error('Booking insert failed: ' + resp.status + ' ' + (body.message || ''));
            }
            insertData = await resp.json();
          } else if (supabaseResult.error) {
            console.error('[Booking] insert error:', supabaseResult.error.message, supabaseResult.error.details, supabaseResult.error.hint);
            showNonBlockingWarning('Booking could not be saved. Please try again.');
            resetConfirmBtn();
            return;
          } else {
            insertData = supabaseResult.data;
          }

          console.log('[Booking] saved OK:', insertData);

          if (typeof gtag === 'function') {
            const svcName = state.services.map(s => s.nameKey || s.id).join(' + ');
            gtag('event', 'booking_submitted', { service: svcName, total: calcTotal() });
            if (state.isFirstTimeCustomer) {
              gtag('event', 'free_extra_earned');
            }
          }

          if (state.promoCode) {
            const currentTimesUsed = state.promoTimesUsed;
            console.log('[Promo] Current times_used:', window.promoTimesUsed);
            console.log('[Promo] Incrementing to:', window.promoTimesUsed + 1);
            fetch(
              SUPABASE_URL + '/rest/v1/savings_claims?promo_code=eq.' + encodeURIComponent(state.promoCode),
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPABASE_KEY,
                  'Authorization': 'Bearer ' + SUPABASE_KEY,
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify({ times_used: currentTimesUsed + 1 })
              }
            ).then(async r => {
              if (r.ok) {
                const result = await r.json();
                console.log('[Promo] times_used incremented, new value:', result?.[0]?.times_used);
              } else {
                const err = await r.text();
                console.warn('[Promo] increment failed:', r.status, err);
              }
            }).catch(e => console.warn('[Promo] increment error (non-fatal):', e));
          }

          const emailPayload = {
            email:        bookingData.email,
            first_name:   bookingData.first_name,
            last_name:    bookingData.last_name,
            ref_code:     bookingData.ref_code,
            service:      bookingData.service,
            booking_date: bookingData.booking_date,
            booking_time: bookingData.booking_time,
            price:        bookingData.price,
            address:      bookingData.address,
            city:         bookingData.city,
            phone:        bookingData.phone,
            service_city: state.serviceCity,
            sqft:         state.sqft,
            bedrooms:     state.bedrooms,
            bathrooms:    state.bathrooms,
            half_baths:   state.halfBathrooms,
            sofa_quantity: bookingData.sofa_quantity,
            mattress_quantity: bookingData.mattress_quantity,
            extras:       state.extras,
            included_extras: getIncludedExtrasList(),
            has_pets:     state.hasPets,
            notes:        state.notes,
            promo_code:   state.promoCode || null
          };

          const EMAIL_FN = SUPABASE_URL + '/functions/v1/send-booking-email';
          fetch(EMAIL_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'under_review', ...emailPayload })
          }).catch(e => console.log('[Email] under_review error:', e));

          fetch(EMAIL_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'admin_notification', ...emailPayload })
          }).catch(e => console.log('[Email] admin_notification error:', e));

          document.getElementById('bookingConfirmId').textContent = refCode;
          const freeExtraMsg = document.getElementById('freeExtraSuccessMsg');
          if (freeExtraMsg) freeExtraMsg.style.display = state.isFirstTimeCustomer ? '' : 'none';
          document.getElementById('step6').style.display = 'none';
          const success = document.getElementById('stepSuccess');
          if (success) {
            success.style.display = 'block';
            success.style.animation = 'fade-in-up 0.5s ease both';
          }
          for (let i = 1; i <= 6; i++) {
            const circle = document.getElementById(`progressStep${i}`);
            if (circle) circle.classList.add('done');
          }
          document.querySelectorAll('.progress-line').forEach(l => l.classList.add('done'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (fatalErr) {
          console.error('[Booking] fatal error:', fatalErr);
          showNonBlockingWarning('Booking could not be completed. Please try again.');
          resetConfirmBtn();
        }
      });
    }
    const backBtn = document.getElementById('step6Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(5));
  }

  /* ---- Supabase session / OAuth handler ---- */
  function handleOAuthSession(session) {
    if (!session) return;
    const u     = session.user;
    const meta  = u.user_metadata || {};
    const full  = meta.full_name || meta.name || u.email.split('@')[0];
    const parts = full.split(' ');
    state.user = {
      name: parts[0] || '', surname: parts.slice(1).join(' ') || '',
      phone: meta.phone_number || meta.phone || '', email: u.email || '',
      address: '', apt: '', city: '', zip: ''
    };
    state.isGuest = false;
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) loginEmail.value = u.email || '';
    if (state.step === 1) goToStep(2);
  }

  function initSupabaseAuth() {
    if (!window.supabase) return;

    const hasOAuthHash = window.location.hash.includes('access_token');
    if (hasOAuthHash) {
      console.log('[Auth] OAuth callback detected, processing...');
      setTimeout(async () => {
        try {
          const { data } = await window.supabase.auth.getSession();
          if (data?.session) {
            console.log('[Auth] Logged in as:', data.session.user.email);
            handleOAuthSession(data.session);
            history.replaceState(null, '', window.location.pathname);
          } else {
            console.log('[Auth] OAuth session not ready yet — onAuthStateChange will handle it');
          }
        } catch (e) {
          console.log('[Auth] OAuth processing failed:', e);
        }
      }, 1500);
    }

    window.supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Auth] event:', event, session?.user?.email || '');
      if (session && state.step === 1 && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        handleOAuthSession(session);
        if (hasOAuthHash) history.replaceState(null, '', window.location.pathname);
      }
    });
  }

  /* ---- Init all ---- */
  function init() {
    initPriceSummaryDrawer();
    initStep1();
    initStep2();
    initStep3();
    initStep4();
    initStep5();
    initStep6();
    updateProgress();

    if (!window.i18nOnLang) window.i18nOnLang = [];
    window.i18nOnLang.push(() => {
      renderServiceGrid();
      const nextBtn = document.getElementById('step2Next');
      if (nextBtn) nextBtn.disabled = state.services.length === 0;
      renderCalendar();
    });

    for (let i = 2; i <= 6; i++) {
      const el = stepEl(i);
      if (el) el.style.display = 'none';
    }
    const success = document.getElementById('stepSuccess');
    if (success) success.style.display = 'none';

    initSupabaseAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
