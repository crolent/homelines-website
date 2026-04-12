/* ===== NAVBAR ===== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');


  if (!navbar) return;

  const hasDarkHero = document.querySelector('.hero, .page-hero');

  if (!hasDarkHero) {
    navbar.classList.add('scrolled');
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else if (hasDarkHero) {
      navbar.classList.remove('scrolled');
    }
  });

  if (hamburger && mobileMenu) {
    const closeMobile = () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { mobileMenu.style.display = ''; }, 350);
    };

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.contains('open');
      if (isOpen) {
        closeMobile();
      } else {
        hamburger.classList.add('open');
        mobileMenu.style.display = 'flex';
        requestAnimationFrame(() => mobileMenu.classList.add('open'));
        document.body.style.overflow = 'hidden';
      }
    });

    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMobile);
    });
  }

  /* Menu bubbles */
  const menuBubbles = document.getElementById('menuBubbles');
  if (menuBubbles) {
    for (let i = 0; i < 14; i++) {
      const b = document.createElement('div');
      b.className = 'bubble';
      const size = Math.random() * 48 + 10;
      const drift = (Math.random() - 0.5) * 120;
      b.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${Math.random() * 12 + 9}s;
        animation-delay: ${Math.random() * 14}s;
        --drift: ${drift}px;
        opacity: 0;
      `;
      menuBubbles.appendChild(b);
    }
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });
})();

/* ===== AUTH-AWARE NAV LINKS ===== */
(function initAuthNav() {
  function run(attempt) {
    const navAccount  = document.getElementById('navAccountLink');
    const navSignIn   = document.getElementById('navSignInLink');
    const mNavAccount = document.getElementById('mNavAccountLink');
    const mNavSignIn  = document.getElementById('mNavSignInLink');

    if (!navAccount && !navSignIn && !mNavAccount && !mNavSignIn) return;

    if (!window.supabase?.auth?.getSession) {
      if ((attempt || 0) < 20) setTimeout(() => run((attempt || 0) + 1), 150);
      return;
    }

    const show = (el, on) => { if (!el) return; el.style.display = on ? '' : 'none'; };

    async function refresh() {
      try {
        const { data } = await window.supabase.auth.getSession();
        const isLoggedIn = !!data?.session?.user;
        show(navAccount,  isLoggedIn);
        show(mNavAccount, isLoggedIn);
        show(navSignIn,   !isLoggedIn);
        show(mNavSignIn,  !isLoggedIn);
      } catch (e) {
        show(navAccount,  false);
        show(mNavAccount, false);
        show(navSignIn,   true);
        show(mNavSignIn,  true);
      }
    }

    refresh();
    try { window.supabase.auth.onAuthStateChange(() => refresh()); } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => run(0));
  } else {
    run(0);
  }
})();

/* ===== SCROLL REVEAL ===== */
(function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
})();

/* ===== PARTICLES ===== */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 12 : 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 2;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: ${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
})();

/* ===== BUBBLES ===== */
(function initBubbles() {
  const container = document.getElementById('bubbles');
  if (!container) return;

  const count = window.innerWidth < 768 ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    b.className = 'bubble';
    const size = Math.random() * 50 + 14;
    const drift = (Math.random() - 0.5) * 140;
    b.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${size}px;
      height: ${size}px;
      animation-duration: ${Math.random() * 14 + 10}s;
      animation-delay: ${Math.random() * 14}s;
      --drift: ${drift}px;
      opacity: 0;
    `;
    container.appendChild(b);
  }
})();

/* ===== COUNTER ANIMATION ===== */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current).toLocaleString();
    }, 16);
  }

  function startCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  startCounters();
})();

/* ===== CONTACT FORM ===== */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    const successEl = document.getElementById('formSuccess');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const data = {
      first_name: document.getElementById('contactFirstName')?.value.trim() || '',
      last_name:  document.getElementById('contactLastName')?.value.trim()  || '',
      email:      document.getElementById('contactEmail')?.value.trim()     || '',
      phone:      document.getElementById('contactPhone')?.value.trim()     || '',
      service:    document.getElementById('contactService')?.value          || '',
      message:    document.getElementById('contactMessage')?.value.trim()   || ''
    };

    function showMsg(text, isError) {
      btn.textContent = originalText;
      btn.disabled = false;
      if (!successEl) return;
      successEl.textContent = text;
      if (isError) {
        successEl.style.color = '#dc2626';
        successEl.style.background = 'rgba(220,38,38,0.08)';
        successEl.style.borderColor = 'rgba(220,38,38,0.25)';
      } else {
        successEl.style.color = '';
        successEl.style.background = '';
        successEl.style.borderColor = '';
      }
      successEl.classList.add('show');
      setTimeout(() => successEl.classList.remove('show'), 5000);
    }

    try {
      const res = await fetch('https://acfsvzbjfiynlcbjvtbq.supabase.co/rest/v1/contact_messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'sb_publishable_3tsuAIyp2yIn2MVadqgcRA_RKvkgf8g',
          'Authorization': 'Bearer sb_publishable_3tsuAIyp2yIn2MVadqgcRA_RKvkgf8g',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP ${res.status}`);
      }
      fetch('https://acfsvzbjfiynlcbjvtbq.supabase.co/functions/v1/send-booking-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'contact_message', ...data })
      });
      form.reset();
      showMsg('\u2705 Message sent! We\'ll get back to you within 1 hour.', false);
    } catch (err) {
      console.error('Contact form error:', err);
      showMsg('\u274c Something went wrong. Please try again.', true);
    }
  });
})();

/* ===== SMOOTH NAV SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
