(function initCookieBanner() {
  if (localStorage.getItem('cookiesAccepted') !== null) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.style.cssText = [
    'position:fixed',
    'bottom:0',
    'left:0',
    'right:0',
    'z-index:9999',
    'background:#1a2b4a',
    'color:#fff',
    'padding:14px 20px',
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'gap:14px',
    'flex-wrap:wrap',
    'box-shadow:0 -4px 18px rgba(0,0,0,0.3)',
    'transform:translateY(100%)',
    'transition:transform 0.35s ease',
    'font-family:inherit',
    'font-size:0.88rem',
    'line-height:1.5'
  ].join(';');

  banner.innerHTML = `
    <p style="margin:0;flex:1;min-width:200px;">
      We use cookies to improve your experience. By continuing to use this site,
      you agree to our <a href="/privacy-policy.html" style="color:#4db8e8;text-decoration:underline;font-weight:700;">Privacy Policy</a>.
    </p>
    <div id="cookieBtns" style="display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap;">
      <button id="cookieAccept" style="background:#4db8e8;color:#fff;border:none;padding:9px 22px;border-radius:8px;font-weight:800;font-size:0.88rem;cursor:pointer;white-space:nowrap;">Accept</button>
      <button id="cookieDecline" style="background:transparent;color:#fff;border:1.5px solid #fff;padding:9px 22px;border-radius:8px;font-weight:800;font-size:0.88rem;cursor:pointer;white-space:nowrap;">Decline</button>
    </div>
  `;

  document.body.appendChild(banner);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      banner.style.transform = 'translateY(0)';
    });
  });

  function hide() {
    banner.style.transform = 'translateY(100%)';
    setTimeout(function() { banner.remove(); }, 400);
  }

  document.getElementById('cookieAccept').addEventListener('click', function() {
    localStorage.setItem('cookiesAccepted', 'true');
    hide();
  });

  document.getElementById('cookieDecline').addEventListener('click', function() {
    localStorage.setItem('cookiesAccepted', 'false');
    window['ga-disable-G-518Q8V6VDS'] = true;
    hide();
  });

  var mq = window.matchMedia('(max-width: 540px)');
  function applyMobile(e) {
    var btns = document.getElementById('cookieBtns');
    if (!btns) return;
    if (e.matches) {
      banner.style.flexDirection = 'column';
      btns.style.width = '100%';
      btns.style.flexDirection = 'column';
      var accept  = document.getElementById('cookieAccept');
      var decline = document.getElementById('cookieDecline');
      if (accept)  accept.style.width  = '100%';
      if (decline) decline.style.width = '100%';
    } else {
      banner.style.flexDirection = '';
      btns.style.width = '';
      btns.style.flexDirection = '';
    }
  }
  mq.addEventListener ? mq.addEventListener('change', applyMobile) : mq.addListener(applyMobile);
  applyMobile(mq);
})();
