/* ===== BOOKING MULTI-STEP FLOW ===== */
(function () {
  const state = {
    step: 1,
    totalSteps: 4,
    user: null,
    isGuest: true,
    services: [],
    date: null,
    time: null,
    calendar: { month: new Date().getMonth(), year: new Date().getFullYear() }
  };

  const services = [
    { id: 'standard', icon: '🏠', name: 'Standard Cleaning', desc: 'Regular home cleaning', price: '$89', duration: '2–3 hrs' },
    { id: 'deep', icon: '✨', name: 'Deep Cleaning', desc: 'Thorough deep clean', price: '$149', duration: '4–6 hrs' },
    { id: 'move', icon: '📦', name: 'Move In/Out', desc: 'Full property clean', price: '$199', duration: '5–7 hrs' },
    { id: 'office', icon: '🏢', name: 'Office Cleaning', desc: 'Commercial spaces', price: '$129', duration: '2–4 hrs' },
    { id: 'window', icon: '🪟', name: 'Window Cleaning', desc: 'Interior & exterior', price: '$79', duration: '1–3 hrs' },
    { id: 'sofa', icon: '🛋️', name: 'Sofa/Mattress Cleaning', desc: 'Steam & deep clean', price: '$99', duration: '2–4 hrs' }
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

  /* ---- Step 1: Auth ---- */
  function initStep1() {
    const tabs = document.querySelectorAll('.auth-tab');
    const panels = document.querySelectorAll('.auth-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.panel);
        if (target) target.classList.add('active');
      });
    });

    /* Guest form submit */
    const guestForm = document.getElementById('guestForm');
    if (guestForm) {
      guestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors(guestForm);
        let valid = true;

        const name = guestForm.querySelector('#guestName').value.trim();
        const surname = guestForm.querySelector('#guestSurname').value.trim();
        const phone = guestForm.querySelector('#guestPhone').value.trim();
        const email = guestForm.querySelector('#guestEmail').value.trim();

        if (!name) { showError('guestNameErr', 'Please enter your name'); valid = false; }
        if (!surname) { showError('guestSurnameErr', 'Please enter your surname'); valid = false; }
        if (!validatePhone(phone)) { showError('guestPhoneErr', 'Please enter a valid phone number'); valid = false; }
        if (!validateEmail(email)) { showError('guestEmailErr', 'Please enter a valid email'); valid = false; }

        if (valid) {
          state.user = { name, surname, phone, email };
          state.isGuest = true;
          goToStep(2);
        }
      });
    }

    /* Login form submit */
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors(loginForm);
        let valid = true;

        const email = loginForm.querySelector('#loginEmail').value.trim();
        const phone = loginForm.querySelector('#loginPhone').value.trim();
        const name = loginForm.querySelector('#loginName').value.trim();

        if (!name) { showError('loginNameErr', 'Please enter your name'); valid = false; }
        if (!validateEmail(email)) { showError('loginEmailErr', 'Please enter a valid email'); valid = false; }
        if (!validatePhone(phone)) { showError('loginPhoneErr', 'Please enter a valid phone number'); valid = false; }

        if (valid) {
          state.user = { name, surname: '', phone, email };
          state.isGuest = false;
          goToStep(2);
        }
      });
    }
  }

  /* ---- Step 2: Service Selection ---- */
  function initStep2() {
    const grid = document.getElementById('serviceGrid');
    if (!grid) return;

    services.forEach(svc => {
      const card = document.createElement('div');
      card.className = 'service-option';
      card.dataset.id = svc.id;
      card.innerHTML = `
        <div class="service-option-check">✓</div>
        <span class="service-option-icon">${svc.icon}</span>
        <h4>${svc.name}</h4>
        <p>${svc.desc}</p>
        <div class="option-price">${svc.price} · ${svc.duration}</div>
      `;
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
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const titleEl = document.getElementById('calMonthTitle');
    if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

    const grid = document.getElementById('calGrid');
    if (!grid) return;

    const existingDays = grid.querySelectorAll('.cal-day, .cal-day-name');
    existingDays.forEach(d => d.remove());

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
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
            state.date.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
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
          populateSummary();
          goToStep(4);
        }
      });
    }

    const backBtn = document.getElementById('step3Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(2));
  }

  /* ---- Step 4: Confirmation ---- */
  function populateSummary() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const u = state.user;
    set('sumName', `${u.name}${u.surname ? ' ' + u.surname : ''}`);
    set('sumEmail', u.email);
    set('sumPhone', u.phone);
    const serviceNames = state.services.map(s => s.name).join(', ') || '—';
    const totalPrice = state.services.length
      ? '$' + state.services.reduce((sum, s) => sum + parseInt(s.price.replace('$','')), 0)
      : '—';
    set('sumService', serviceNames);
    set('sumDate', state.date?.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) || '—');
    set('sumTime', state.time || '—');
    set('sumPrice', totalPrice);
    set('sumDuration', state.services.map(s => s.duration).join(' + ') || '—');
  }

  function initStep4() {
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        confirmBtn.textContent = 'Processing...';
        confirmBtn.disabled = true;
        setTimeout(() => {
          const bookingId = 'HL-' + Math.random().toString(36).substr(2, 6).toUpperCase();
          document.getElementById('bookingConfirmId').textContent = bookingId;
          document.getElementById('step4').style.display = 'none';
          const success = document.getElementById('stepSuccess');
          if (success) {
            success.style.display = 'block';
            success.style.animation = 'fade-in-up 0.5s ease both';
          }
          for (let i = 1; i <= 4; i++) {
            const circle = document.getElementById(`progressStep${i}`);
            if (circle) circle.classList.add('done');
          }
          document.querySelectorAll('.progress-line').forEach(l => l.classList.add('done'));
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 1800);
      });
    }

    const backBtn = document.getElementById('step4Back');
    if (backBtn) backBtn.addEventListener('click', () => goToStep(3));
  }

  /* ---- Init all ---- */
  function init() {
    initStep1();
    initStep2();
    initStep3();
    initStep4();
    updateProgress();

    for (let i = 2; i <= 4; i++) {
      const el = stepEl(i);
      if (el) el.style.display = 'none';
    }
    const success = document.getElementById('stepSuccess');
    if (success) success.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
