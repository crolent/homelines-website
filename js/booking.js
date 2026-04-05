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
    extras: [],      /* array of { name, price } */
    hasPets: false,
    notes: '',
    couponCode: '',
    couponDiscount: 0,
    couponPct: 0
  };

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
    { name: 'Eco friendly green products',           price: 25,  icon: 'images/extras/eco-products.svg' },
    { name: 'Extra garage',                          price: 45,  icon: 'images/extras/extra-garage.svg' },
    { name: 'Parking fee',                           price: 15,  icon: 'images/extras/parking-fee.svg' }
  ];

  const PETS_EXTRA = EXTRAS_LIST.find(e => e.name === 'Pets at home');

  /* ---- Pricing tables ---- */
  // Index: 0=Studio, 1=1bed, 2=2bed, 3=3bed, 4=4bed, 5=5+
  const BASE_PRICES = {
    standard:        [110, 110, 145, 190, 240, 295],
    deep:            [150, 150, 200, 260, 325, 400],
    move:            [200, 200, 280, 360, 450, 550],
    hotel:           [110, 110, 150, 200, 265, 335],
    postconstruction:[250, 250, 350, 450, 560, 680],
    sofa:            [120, 120, 120, 120, 120, 120]
  };
  const SQFT_AVG   = { studio:750, 1:1000, 2:1350, 3:1750, 4:2250, 5:2850 };
  const COUPON_CODES = { WELCOME10:0.10, FIRST20:0.20, CLEAN15:0.15 };

  const T = (k) => (window.i18nT && window.i18nT(k)) || k;
  const langLocale = () => ({ en:'en-US', ru:'ru-RU', tr:'tr-TR', es:'es-ES' })[localStorage.getItem('hl_lang') || 'en'] || 'en-US';

  const services = [
    { id: 'standard', icon: '🏠', nameKey: 'svc1_name', descKey: 'bsvc1_desc', price: '$89',  duration: '2–3 hrs' },
    { id: 'deep',     icon: '✨', nameKey: 'svc2_name', descKey: 'bsvc2_desc', price: '$149', duration: '4–6 hrs' },
    { id: 'move',     icon: '📦', nameKey: 'svc3_name', descKey: 'bsvc3_desc', price: '$199', duration: '5–7 hrs' },
    { id: 'hotel',    icon: '🏡', nameKey: 'svc4_name', descKey: 'bsvc4_desc', price: '$129', duration: '2–4 hrs' },
    { id: 'postconstruction', icon: '🔨', nameKey: 'svc5_name', descKey: 'bsvc5_desc', price: '$249', duration: '5–8 hrs' },
    { id: 'sofa',     icon: '🛋️', nameKey: 'svc6_name', descKey: 'bsvc6_desc', price: '$99',  duration: '2–4 hrs' }
  ];

  const ITEM_H    = 44;
  const hourItems = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minItems  = ['00', '15', '30', '45'];
  let pickerHourIdx = 8;
  let pickerMinIdx  = 0;
  let pickerAmPm    = 'AM';

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
  function calcBasePrice() {
    if (!state.services.length) return 0;
    return state.services.reduce((sum, s) => {
      const row = BASE_PRICES[s.id];
      return sum + (row ? row[getBedIdx()] : 0);
    }, 0);
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
    const sub  = Math.max(89, base + calcBathSurcharge() + calcHalfBathSurcharge() + calcSqftSurcharge() + calcExtrasTotal());
    const disc = state.couponPct ? Math.round(sub * state.couponPct) : 0;
    state.couponDiscount = disc;
    return sub - disc;
  }

  /* ---- Live price summary ---- */
  function updatePriceSummary() {
    const box = document.getElementById('priceSummary');
    if (!box) return;
    const base     = calcBasePrice();
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
    if (base) {
      rows += `<div class="ps-row ps-base"><span class="ps-label">Base price</span><span class="ps-val">$${base}</span></div>`;
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
    if (state.couponDiscount > 0) {
      rows += `<div class="ps-row ps-disc"><span class="ps-label">Coupon (${state.couponCode})</span><span class="ps-val">−$${state.couponDiscount}</span></div>`;
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

    box.style.display = hasData ? '' : 'none';

    // First-time swipe hint on mobile
    if (hasData) box._firstHint?.();
  }

  /* ---- Price summary drawer (mobile) ---- */
  function initPriceSummaryDrawer() {
    const box      = document.getElementById('priceSummary');
    const bar      = document.getElementById('psBar');
    const overlay  = document.getElementById('psOverlay');
    const panel    = document.getElementById('psPanel');
    const closeBtn = document.getElementById('psPanelClose');
    if (!box || !bar || !panel) return;

    let isOpen      = false;
    let hintDone    = false;
    let touchStartY = 0;
    let dragStartPx = 0;

    function isMobile() { return window.innerWidth <= 1100; }
    function closedPx() { return (panel.offsetHeight || Math.round(window.innerHeight * 0.65)) + 10; }

    function slide(toPx, withAnim) {
      panel.style.transition = withAnim ? 'transform 0.3s ease' : 'none';
      panel.style.transform  = `translateY(${toPx}px)`;
    }

    function openDrawer(animate) {
      isOpen = true;
      slide(0, animate !== false);
      overlay?.classList.add('ps-active');
      box.classList.add('ps-expanded');
    }

    function closeDrawer(animate) {
      isOpen = false;
      slide(closedPx(), animate !== false);
      overlay?.classList.remove('ps-active');
      box.classList.remove('ps-expanded');
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
      panel.style.transition = 'transform 0.3s ease';
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

    closeBtn?.addEventListener('click',  () => closeDrawer());
    overlay?.addEventListener('click',   () => closeDrawer());

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
  }

  /* ---- Step 1: Email ---- */
  function initStep1() {
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
      emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = (document.getElementById('bookingEmail')?.value || '').trim();
        if (!validateEmail(email)) {
          showError('bookingEmailErr', T('err_email') || 'Please enter a valid email address');
          return;
        }
        state.user = { name: '', surname: '', phone: '', email, address: '', apt: '', city: '', zip: '' };
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
      card.innerHTML = `
        <div class="service-option-check">✓</div>
        <span class="service-option-icon">${svc.icon}</span>
        <h4>${svcName}</h4>
        <p>${svcDesc}</p>
        <div class="option-price">${svc.price} · ${svc.duration}</div>
      `;
      if (state.services.find(s => s.id === svc.id)) card.classList.add('selected');
      card.addEventListener('click', () => {
        const idx = state.services.findIndex(s => s.id === svc.id);
        if (idx > -1) { state.services.splice(idx, 1); card.classList.remove('selected'); }
        else           { state.services.push(svc);       card.classList.add('selected'); }
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
    EXTRAS_LIST.forEach(extra => {
      const card = document.createElement('div');
      card.className = 'extra-card';
      card.dataset.name = extra.name;
      const isSelected = state.extras.some(e => e.name === extra.name);
      if (isSelected) card.classList.add('selected');
      card.innerHTML = `
        <div class="extra-check">✓</div>
        <div class="extra-icon"><img src="${extra.icon}" alt="" width="36" height="36" loading="lazy"/></div>
        <div class="extra-name">${extra.name}</div>
        <div class="extra-price">+$${extra.price}</div>
      `;
      card.addEventListener('click', () => {
        if (extra.name === 'Pets at home') {
          /* sync with pets toggle */
          const newPets = !state.hasPets;
          setPets(newPets);
          return;
        }
        toggleExtra(extra, card);
      });
      grid.appendChild(card);
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
    updatePriceSummary();
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
    updatePriceSummary();
  }

  function syncPetsUI() {
    document.getElementById('petsYes')?.classList.toggle('pets-active', state.hasPets);
    document.getElementById('petsNo')?.classList.toggle('pets-active', !state.hasPets);
  }

  function initStep3() {
    renderExtrasGrid();
    syncPetsUI();

    document.getElementById('petsYes')?.addEventListener('click', () => setPets(true));
    document.getElementById('petsNo')?.addEventListener('click',  () => setPets(false));

    document.getElementById('detailsBeds')?.addEventListener('change',      (e) => { state.bedrooms      = e.target.value; updatePriceSummary(); });
    document.getElementById('detailsBaths')?.addEventListener('change',     (e) => { state.bathrooms     = e.target.value; updatePriceSummary(); });
    document.getElementById('detailsHalfBaths')?.addEventListener('change', (e) => { state.halfBathrooms = e.target.value; updatePriceSummary(); });
    document.getElementById('detailsSqft')?.addEventListener('change',      (e) => { state.sqft          = e.target.value; updatePriceSummary(); });

    document.getElementById('couponApplyBtn')?.addEventListener('click', () => {
      const code = (document.getElementById('couponInput')?.value || '').trim().toUpperCase();
      const msg  = document.getElementById('couponMsg');
      if (!code) { if (msg) msg.textContent = ''; return; }
      const pct = COUPON_CODES[code];
      if (pct) {
        state.couponCode = code;
        state.couponPct  = pct;
        const total = calcTotal();
        if (msg) {
          msg.textContent = `✅ "${code}" applied — ${pct * 100}% off (−$${state.couponDiscount})!`;
          msg.style.color = '#16a34a';
        }
      } else {
        state.couponCode     = '';
        state.couponPct      = 0;
        state.couponDiscount = 0;
        if (msg) { msg.textContent = 'Invalid coupon code.'; msg.style.color = '#dc2626'; }
      }
      updatePriceSummary();
    });

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
    fill('detailsCity',    u.city);
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
      const city    = document.getElementById('detailsCity').value.trim();
      const zip     = document.getElementById('detailsZip').value.trim();

      if (!name)                 { showError('detailsNameErr',    T('err_name')    || 'Please enter your first name');       valid = false; }
      if (!surname)              { showError('detailsSurnameErr', T('err_surname') || 'Please enter your last name');        valid = false; }
      if (!validatePhone(phone)) { showError('detailsPhoneErr',   T('err_phone')   || 'Please enter a valid phone number'); valid = false; }
      if (!address)              { showError('detailsAddressErr', T('err_address') || 'Please enter your street address');   valid = false; }
      if (!city)                 { showError('detailsCityErr',    T('err_city')    || 'Please enter your city');             valid = false; }
      if (!zip)                  { showError('detailsZipErr',     T('err_zip')     || 'Please enter your ZIP code');         valid = false; }

      if (valid) {
        state.serviceCity   = document.getElementById('detailsCitySelect')?.value || state.serviceCity;
        state.sqft          = document.getElementById('detailsSqft')?.value        || state.sqft;
        state.bedrooms      = document.getElementById('detailsBeds')?.value        || state.bedrooms;
        state.bathrooms     = document.getElementById('detailsBaths')?.value       || state.bathrooms;
        state.halfBathrooms = document.getElementById('detailsHalfBaths')?.value   || state.halfBathrooms;
        state.notes         = document.getElementById('detailsNotes')?.value       || state.notes;
        state.user = { ...state.user, name, surname, phone, address, apt, city, zip };
        populateSummary();
        goToStep(6);
      }
    });
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

    /* coupon */
    if (state.couponDiscount > 0) {
      set('sumCoupon', `-$${state.couponDiscount} (${state.couponCode})`);
      showRow('sumCouponRow', true);
    } else {
      showRow('sumCouponRow', false);
    }

    /* total */
    const base      = calcBasePrice();
    const bath      = calcBathSurcharge();
    const halfBath  = calcHalfBathSurcharge();
    const sq        = calcSqftSurcharge();
    const total     = calcTotal();
    const extrasTotal = calcExtrasTotal();
    let priceStr = '—';
    if (base > 0) {
      priceStr = `$${total}`;
      const parts = [`Base $${base}`];
      if (bath > 0)     parts.push(`+$${bath} full bath`);
      if (halfBath > 0) parts.push(`+$${halfBath} half bath`);
      if (sq > 0)       parts.push(`+$${sq} sqft`);
      if (extrasTotal > 0) parts.push(`+$${extrasTotal} extras`);
      if (state.couponDiscount > 0) parts.push(`−$${state.couponDiscount} coupon`);
      if (parts.length > 1) priceStr += ` (${parts.join(', ')})`;
    }
    set('sumPrice', priceStr);
  }

  function initStep6() {
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.textContent = T('bk_processing') || 'Processing...';
        confirmBtn.disabled = true;

        const refCode  = 'HL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const u        = state.user;
        const serviceNames = state.services.map(s => T(s.nameKey) || s.nameKey).join(', ') || '';
        const totalPrice   = calcTotal();

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
          booking_date: state.date ? state.date.toISOString().split('T')[0] : null,
          booking_time: state.time || '',
          status:       'pending',
          /* new fields */
          sqft:         state.sqft            || null,
          bedrooms:     state.bedrooms        || null,
          bathrooms:    state.bathrooms       || null,
          half_baths:   state.halfBathrooms   || null,
          extras:       state.extras.length ? state.extras : null,
          notes:        state.notes      || null,
          coupon_code:  state.couponCode || null,
          has_pets:     state.hasPets
        };

        if (window.supabase) {
          try {
            const { data } = await window.supabase.auth.getUser();
            if (data?.user?.id) bookingData.user_id = data.user.id;
          } catch (e) { console.warn('getUser (non-fatal):', e); }

          console.log('Inserting booking:', JSON.stringify(bookingData, null, 2));
          try {
            const { data: insertData, error } = await window.supabase
              .from('bookings').insert([bookingData]).select();
            if (error) {
              console.error('Booking insert error:', error.message, error.details, error.hint);
            } else {
              console.log('Booking saved OK:', insertData);
              try {
                const EMAIL_URL   = 'https://acfsvzbjfiynlcbjvtbq.supabase.co/functions/v1/send-booking-email';
                const basePayload = {
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
                  service_city: state.serviceCity,
                  sqft:         state.sqft,
                  bedrooms:     state.bedrooms,
                  bathrooms:    state.bathrooms,
                  half_baths:   state.halfBathrooms,
                  extras:       state.extras,
                  has_pets:     state.hasPets,
                  notes:        state.notes
                };
                const [reviewRes, adminRes] = await Promise.all([
                  fetch(EMAIL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'under_review', ...basePayload }) }),
                  fetch(EMAIL_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'admin_notification', phone: bookingData.phone, ...basePayload }) }),
                ]);
                if (reviewRes.ok) console.log('under_review email sent');
                else console.error('under_review failed:', await reviewRes.json());
                if (adminRes.ok) console.log('admin_notification sent');
                else console.error('admin_notification failed:', await adminRes.json());
              } catch (emailErr) { console.error('Email function error:', emailErr); }
            }
          } catch (e) { console.error('Booking insert exception:', e); }
        }

        document.getElementById('bookingConfirmId').textContent = refCode;
        document.getElementById('step6').style.display = 'none';
        const success = document.getElementById('stepSuccess');
        if (success) { success.style.display = 'block'; success.style.animation = 'fade-in-up 0.5s ease both'; }
        for (let i = 1; i <= 6; i++) {
          const circle = document.getElementById(`progressStep${i}`);
          if (circle) circle.classList.add('done');
        }
        document.querySelectorAll('.progress-line').forEach(l => l.classList.add('done'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    window.supabase.auth.onAuthStateChange((event, session) => {
      if (session && state.step === 1 && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        handleOAuthSession(session);
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
