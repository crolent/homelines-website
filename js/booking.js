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

  const timeSlots = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
    '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'
  ];

  const busySlots = ['11:00 AM', '02:00 PM', '05:00 PM'];

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

  function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    timeSlots.forEach(slot => {
      const el = document.createElement('div');
      el.className = 'time-slot';
      el.textContent = slot;
      if (busySlots.includes(slot)) {
        el.classList.add('busy');
      } else {
        if (state.time === slot) el.classList.add('selected');
        el.addEventListener('click', () => {
          state.time = slot;
          grid.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          checkStep3();
        });
      }
      grid.appendChild(el);
    });
  }

  function checkStep3() {
    const nextBtn = document.getElementById('step3Next');
    if (nextBtn) nextBtn.disabled = !(state.date && state.time);
  }

  function initStep3() {
    renderCalendar();
    renderTimeSlots();

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
          ref_code: refCode,
          name: `${u.name}${u.surname ? ' ' + u.surname : ''}`,
          email: u.email || '',
          phone: u.phone || '',
          address: u.address ? `${u.address}${u.apt ? ' ' + u.apt : ''}, ${u.city}${u.zip ? ' ' + u.zip : ''}` : '',
          service: serviceNames,
          date: state.date ? state.date.toISOString().split('T')[0] : null,
          time: state.time || '',
          price: totalPrice
        };

        if (window.supabase) {
          try {
            const { data: { user } } = await window.supabase.auth.getUser();
            if (user) bookingData.user_id = user.id;
            const { error } = await window.supabase.from('bookings').insert([bookingData]);
            if (error) console.error('Booking save error:', error);
          } catch (e) {
            console.error('Supabase error:', e);
          }
          if (u.email) {
            try {
              await window.supabase.auth.signInWithOtp({
                email: u.email,
                options: { shouldCreateUser: true, emailRedirectTo: 'https://homelinescleaning.com/booking.html' }
              });
            } catch (otpErr) {
              console.error('OTP error:', otpErr);
            }
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
