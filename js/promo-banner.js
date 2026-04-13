(function initPromoBanner() {
  if (sessionStorage.getItem('promoBannerClosed')) return;

  var PHONE = '+17546105038';
  var PHONE_DISPLAY = '+1 (754) 610-5038';

  var banner = document.createElement('div');
  banner.id = 'promoBanner';
  banner.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'z-index:10000',
    'background:linear-gradient(135deg,#e53e3e,#c53030)',
    'color:#fff',
    'padding:10px 20px',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'gap:12px',
    'flex-wrap:wrap',
    'box-shadow:0 4px 18px rgba(197,48,48,0.35)',
    'font-family:inherit',
    'font-size:0.9rem',
    'line-height:1.4',
    'text-align:center'
  ].join(';');

  banner.innerHTML = [
    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center;">',
      '<span style="font-size:1.1rem;">📞</span>',
      '<strong>CALL NOW &amp; Get 35% OFF Your First Cleaning!</strong>',
      '<span style="opacity:0.85;font-size:0.82rem;white-space:nowrap;">Offer ends tonight!</span>',
      '<span id="promoCountdown" style="background:rgba(0,0,0,0.25);padding:3px 10px;border-radius:999px;font-weight:800;font-size:0.88rem;font-variant-numeric:tabular-nums;white-space:nowrap;">00:00:00</span>',
    '</div>',
    '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">',
      '<a id="callNowBtn" href="tel:' + PHONE + '" ',
        'onclick="if(typeof gtag===\'function\')gtag(\'event\',\'call_now_clicked\');" ',
        'style="background:#fff;color:#c53030;font-weight:900;font-size:0.88rem;padding:8px 18px;border-radius:8px;text-decoration:none;white-space:nowrap;transition:opacity 0.2s;" ',
        'onmouseover="this.style.opacity=\'0.9\'" onmouseout="this.style.opacity=\'1\'">',
        '📞 <span class="call-label-full">Call Now: ' + PHONE_DISPLAY + '</span>',
        '<span class="call-label-short" style="display:none;">Call Now</span>',
      '</a>',
      '<button id="promoBannerClose" aria-label="Close banner" ',
        'style="background:rgba(255,255,255,0.15);border:none;color:#fff;cursor:pointer;font-size:1.1rem;line-height:1;padding:6px 8px;border-radius:6px;transition:background 0.2s;" ',
        'onmouseover="this.style.background=\'rgba(255,255,255,0.25)\'" onmouseout="this.style.background=\'rgba(255,255,255,0.15)\'">',
        '✕',
      '</button>',
    '</div>'
  ].join('');

  document.body.insertBefore(banner, document.body.firstChild);

  /* Push page content down */
  function applyOffset() {
    var h = banner.offsetHeight;
    document.body.style.paddingTop = h + 'px';
  }
  applyOffset();
  window.addEventListener('resize', applyOffset);

  /* Countdown to midnight local time */
  function updateCountdown() {
    var now = new Date();
    var midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    var diff = Math.max(0, midnight - now);
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    var pad = function(n) { return String(n).padStart(2, '0'); };
    var el = document.getElementById('promoCountdown');
    if (el) el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  updateCountdown();
  var timer = setInterval(updateCountdown, 1000);

  /* Mobile: shorter button label */
  var mq = window.matchMedia('(max-width: 540px)');
  function applyMobile(e) {
    var full  = banner.querySelector('.call-label-full');
    var short = banner.querySelector('.call-label-short');
    if (!full || !short) return;
    if (e.matches) {
      full.style.display  = 'none';
      short.style.display = '';
      banner.style.flexDirection = 'column';
    } else {
      full.style.display  = '';
      short.style.display = 'none';
      banner.style.flexDirection = '';
    }
    applyOffset();
  }
  mq.addEventListener ? mq.addEventListener('change', applyMobile) : mq.addListener(applyMobile);
  applyMobile(mq);

  /* Close button */
  document.getElementById('promoBannerClose').addEventListener('click', function() {
    clearInterval(timer);
    banner.remove();
    document.body.style.paddingTop = '';
    sessionStorage.setItem('promoBannerClosed', '1');
  });
})();
