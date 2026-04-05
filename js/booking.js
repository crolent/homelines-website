/* ===== BOOKING MULTI-STEP FLOW ===== */
(function () {
  const state = {
    step: 1,
    totalSteps: 5,
    user: null,
    isGuest: true,
    services: [],
    date: null,
    time: null,
    calendar: { month: new Date().getMonth(), year: new Date().getFullYear() }
  };

  const T = (k) => (window.i18nT && window.i18nT(k)) || k;
  const langLocale = () => ({ en:'en-US', ru:'ru-RU', tr:'tr-TR', es:'es-ES' })[localStorage.getItem('hl_lang') || 'en'] || 'en-US';

  const services = [
    { id: 'standard', icon: '🏠', nameKey: 'svc1_name', descKey: 'bsvc1_desc', price: '$89', duration: '2–3 hrs' },
    { id: 'deep',     icon: '✨', nameKey: 'svc2_name', descKey: 'bsvc2_desc', price: '$149', duration: '4–6 hrs' },
    { id: 'move',     icon: '📦', nameKey: 'svc3_name', descKey: 'bsvc3_desc', price: '$199', duration: '5–7 hrs' },
    { id: 'office',   icon: '🏢', nameKey: 'svc4_name', descKey: 'bsvc4_desc', price: '$129', duration: '2–4 hrs' },
    { id: 'window',   icon: '🪟', nameKey: 'svc5_name', descKey: 'bsvc5_desc', price: '$79',  duration: '1–3 hrs' },
    { id: 'sofa',     icon: '🛋️', nameKey: 'svc6_name', descKey: 'bsvc6_desc', price: '$99',  duration: '2–4 hrs' }
  ];

  const ITEM_H    = 44;
  const hourItems = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minItems  = ['00', '15', '30', '45'];
  let pickerHourIdx = 8;
  let pickerMinIdx  = 0;
  let pickerAmPm    = 'AM';

  /* ---- DOM refs ---- */
  const stepEl = (n) => document.getElementById(`step${n}`);

  /* ---- Validation helpers ---- */
  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validatePhone(v) { return /^[\+\d\s\-\(\)]{7,15}$/.test(v.trim()); }
  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    el.previousElementSibling && el.previousElementSibling.classList.add('error');
  }
  function clearErrors(form) {
    form.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
  }

  /* ---- Progress bar ---- */
  function updateProgress() {
    for (let i = 1; i <= state.totalSteps; i++) {
      const circle = document.getElementById(`progressStep${i}`);
      const line = document.getElementById(`progressLine${i}`);
      if (!circle) continue;
      circle.classList.remove('active', 'done');
      if (i < state.step) circle.classList.add('done');
      else if (i === state.step) circle.classList.add('active');
      if (line) {
        line.classList.toggle('done', i < state.step);
      }
    }
  }

  /* ---- Step navigation ---- */
  function goToStep(n) {
    const current = stepEl(state.step);
    const next = stepEl(n);
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
        if (idx > -1) {
          state.services.splice(idx, 1);
          card.classList.remove('selected');
        } else {
          state.services.push(svc);
          card.classList.add('selected');
        }
        const nextBtn = document.getElementById('step2Next');
        if (nextBtn) nextBtn.disabled = state.services.length === 0;
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

  /* ---- Step 3: Calendar & Time ---- */
  function renderCalendar() {
    const { month, year } = state.calendar;
    const locale = langLocale();
    const titleEl = document.getElementById('calMonthTitle');
    if (titleEl) titleEl.textContent = new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

    const grid = document.getElementById('calGrid');
    if (!grid) return;

    const existingDays = grid.querySelectorAll('.cal-day, .cal-day-name');
    existingDays.forEach(d => d.remove());

    const dayNames = Array.from({ length: 7 }, (_, i) =>
      new Date(2024, 0, 7 + i).toLocaleDateString(locale, { weekday: 'short' }).toUpperCase()
    );
    dayNames.forEach(d => {
      const el = document.createElement('div');
      el.className = 'cal-day-name';
      el.textContent = d;
      grid.appendChild(el);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const el = document.createElement('div');
      el.className = 'cal-day';
      el.textContent = d;
      const date = new Date(year, month, d);
      date.setHours(0,0,0,0);

      if (date < today) {
        el.classList.add('disabled');
      } else {
        if (date.getTime() === today.getTime()) el.classList.add('today');
        if (state.date) {
          const sel = new Date(state.date);
          sel.setHours(0,0,0,0);
          if (date.getTime() === sel.getTime()) el.classList.add('selected');
        }
        el.addEventListener('click', () => {
          state.date = new Date(year, month, d);
          renderCalendar();
          document.getElementById('selectedDateDisplay').textContent =
            state.date.toLocaleDateString(langLocale(), { weekday:'long', year:'numeric', month:'long', day:'numeric' });
          checkStep3();
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
      const div = document.createElement('div');
      div.className = 'tp-item';
      div.textContent = val;
      wheelEl.appendChild(div);
    });
    wheelEl.appendChild(mkSpacer());
    requestAnimationFrame(() => {
      wheelEl.scrollTop = initialIdx * ITEM_H;
      applyWheelVisuals(wheelEl, initialIdx);
    });
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
      const dist    = Math.abs(i - centerF);
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
    checkStep3();
  }

  function checkStep3() {
    const nextBtn = document.getElementById('step3Next');
    if (nextBtn) nextBtn.disabled = !(state.date && state.time);
  }

  function initStep3() {
    renderCalendar();

    const hourWheelEl = document.getElementById('hourWheel');
    const minWheelEl  = document.getElementById('minWheel');
    if (hourWheelEl) {
      initWheel(hourWheelEl, hourItems, pickerHourIdx, idx => { pickerHourIdx = idx; updateTimePicker(); });
    }
    if (minWheelEl) {
      initWheel(minWheelEl, minItems, pickerMinIdx, idx => { pickerMinIdx = idx; updateTimePicker(); });
    }
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

    const nextBtn = document.getElementById('step3Next');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.addEventListener('click', () => {
        if (state.date && state.time) {
          prefillDetailsForm();
          goToStep(4);
        }
      });
    }

    const backBtn = document.getElementById('step3Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(2));
  }

  /* ---- Step 4: Your Details ---- */
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

  function initStep4() {
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

      if (!name)                  { showError('detailsNameErr',    T('err_name')    || 'Please enter your first name');       valid = false; }
      if (!surname)               { showError('detailsSurnameErr', T('err_surname') || 'Please enter your last name');        valid = false; }
      if (!validatePhone(phone))  { showError('detailsPhoneErr',   T('err_phone')   || 'Please enter a valid phone number'); valid = false; }
      if (!address)               { showError('detailsAddressErr', T('err_address') || 'Please enter your street address');   valid = false; }
      if (!city)                  { showError('detailsCityErr',    T('err_city')    || 'Please enter your city');             valid = false; }
      if (!zip)                   { showError('detailsZipErr',     T('err_zip')     || 'Please enter your ZIP code');          valid = false; }

      if (valid) {
        state.user = { ...state.user, name, surname, phone, address, apt, city, zip };
        populateSummary();
        goToStep(5);
      }
    });

    const backBtn = document.getElementById('step4Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(3));
  }

  /* ---- Step 5: Confirmation ---- */
  function populateSummary() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const u = state.user;
    set('sumName', `${u.name}${u.surname ? ' ' + u.surname : ''}`);
    set('sumEmail', u.email);
    set('sumPhone', u.phone);
    set('sumAddress', u.address ? `${u.address}${u.apt ? ' ' + u.apt : ''}, ${u.city}${u.zip ? ' ' + u.zip : ''}` : '—');
    const serviceNames = state.services.map(s => T(s.nameKey) || s.nameKey).join(', ') || '—';
    const totalPrice = state.services.length
      ? '$' + state.services.reduce((sum, s) => sum + parseInt(s.price.replace('$','')), 0)
      : '—';
    set('sumService', serviceNames);
    set('sumDate', state.date?.toLocaleDateString(langLocale(), { weekday:'long', year:'numeric', month:'long', day:'numeric' }) || '—');
    set('sumTime', state.time || '—');
    set('sumPrice', totalPrice);
    set('sumDuration', state.services.map(s => s.duration).join(' + ') || '—');
  }

  function initStep5() {
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.textContent = T('bk_processing') || 'Processing...';
        confirmBtn.disabled = true;

        const refCode = 'HL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const u = state.user;
        const serviceNames = state.services.map(s => T(s.nameKey) || s.nameKey).join(', ') || '';
        const totalPrice = state.services.length
          ? state.services.reduce((sum, s) => sum + parseInt(s.price.replace('$', '')), 0)
          : 0;

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
          status:       'pending'
        };

        if (window.supabase) {
          /* Step A: optionally attach user_id if a session already exists */
          try {
            const { data } = await window.supabase.auth.getUser();
            if (data?.user?.id) bookingData.user_id = data.user.id;
          } catch (e) {
            console.warn('getUser (non-fatal):', e);
          }

          /* Step B: always attempt the insert */
          console.log('Inserting booking:', JSON.stringify(bookingData, null, 2));
          try {
            const { data: insertData, error } = await window.supabase
              .from('bookings')
              .insert([bookingData])
              .select();
            if (error) {
              console.error('Booking insert error:', error.message, error.details, error.hint);
            } else {
              console.log('Booking saved OK:', insertData);
              try {
                const EMAIL_URL = 'https://acfsvzbjfiynlcbjvtbq.supabase.co/functions/v1/send-booking-email';
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
                };
                const [reviewRes, adminRes] = await Promise.all([
                  fetch(EMAIL_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'under_review', ...basePayload }),
                  }),
                  fetch(EMAIL_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'admin_notification', phone: bookingData.phone, ...basePayload }),
                  }),
                ]);
                if (reviewRes.ok) console.log('under_review email sent');
                else console.error('under_review email failed:', await reviewRes.json());
                if (adminRes.ok) console.log('admin_notification email sent');
                else console.error('admin_notification email failed:', await adminRes.json());
              } catch (emailErr) {
                console.error('Email function error:', emailErr);
              }
            }
          } catch (e) {
            console.error('Booking insert exception:', e);
          }

        }

        document.getElementById('bookingConfirmId').textContent = refCode;
        document.getElementById('step5').style.display = 'none';
        const success = document.getElementById('stepSuccess');
        if (success) {
          success.style.display = 'block';
          success.style.animation = 'fade-in-up 0.5s ease both';
        }
        for (let i = 1; i <= 5; i++) {
          const circle = document.getElementById(`progressStep${i}`);
          if (circle) circle.classList.add('done');
        }
        document.querySelectorAll('.progress-line').forEach(l => l.classList.add('done'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    const backBtn = document.getElementById('step5Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(4));
  }

  /* ---- Supabase session / OAuth handler ---- */
  function handleOAuthSession(session) {
    if (!session) return;
    const u = session.user;
    const meta = u.user_metadata || {};
    const fullName = meta.full_name || meta.name || u.email.split('@')[0];
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName  = nameParts.slice(1).join(' ') || '';

    state.user = {
      name: firstName,
      surname: lastName,
      phone: meta.phone_number || meta.phone || '',
      email: u.email || '',
      address: '',
      apt: '',
      city: '',
      zip: ''
    };
    state.isGuest = false;

    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) loginEmail.value = u.email || '';

    if (state.step === 1) goToStep(2);
  }

  function initSupabaseAuth() {
    if (!window.supabase) return;
    window.supabase.auth.onAuthStateChange((event, session) => {
      if (session && state.step === 1 &&
          (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        handleOAuthSession(session);
      }
    });
  }

  /* ---- Init all ---- */
  function init() {
    initStep1();
    initStep2();
    initStep3();
    initStep4();
    initStep5();
    updateProgress();

    if (!window.i18nOnLang) window.i18nOnLang = [];
    window.i18nOnLang.push(() => {
      renderServiceGrid();
      const nextBtn = document.getElementById('step2Next');
      if (nextBtn) nextBtn.disabled = state.services.length === 0;
      renderCalendar();
    });

    for (let i = 2; i <= 5; i++) {
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
