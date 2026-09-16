/* ==========================================================================
   Pool Boys NOLA — shared header / footer templates
   --------------------------------------------------------------------------
   Every page includes:
     <div data-site-header></div>   ... replaced by the nav
     <div data-site-footer></div>   ... replaced by the footer
     <script src="assets/site.js" defer></script>

   Mark the current page on <body>, e.g. <body data-page="about">, so the
   matching nav link gets aria-current="page".

   Edit SITE below and the change lands on every page at once.
   ========================================================================== */

const SITE = {
  name: 'Pool Boys NOLA',
  tagline: 'Powered by chemistry — and a genuine love of clear, blue water. Salt or chlorine, we speak your pool’s language.',
  home: 'h2know-pool-co.html',

  // --- Contact details: change these in one place -------------------------
  email: 'hello@poolboysnola.com',
  phone: { label: '(555) 010-POOL', href: 'tel:+15550107665' },
  serviceAreaShort: 'Greater New Orleans & the Northshore',

  // --- Top navigation ----------------------------------------------------
  // `section` = an anchor on the home page. `href` = a standalone page.
  nav: [
    { label: 'Services', section: 'services' },
    { label: 'Salt vs. Chlorine', section: 'versus' },
    { label: 'How it works', section: 'how' },
    { label: 'Service area', href: 'service-area.html', page: 'service-area' },
    { label: 'About us', href: 'about.html', page: 'about' }
  ],
  cta: { label: 'Get a free quote', href: '#contact' },

  // --- Footer link columns ----------------------------------------------
  footerColumns: [
    {
      title: 'Explore',
      links: [
        { label: 'Services', section: 'services' },
        { label: 'Salt vs. Chlorine', section: 'versus' },
        { label: 'How it works', section: 'how' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', href: 'about.html', page: 'about' },
        { label: 'Service area', href: 'service-area.html', page: 'service-area' },
        { label: 'Get a free quote', href: '#contact' }
      ]
    }
  ]
};

/* ---------- helpers ------------------------------------------------------ */

const currentPage = document.body.dataset.page || 'home';

/** Anchors on the home page need the filename prefix when we're elsewhere. */
function hrefFor(item) {
  if (item.section) {
    return currentPage === 'home' ? '#' + item.section : SITE.home + '#' + item.section;
  }
  return item.href;
}

function isActive(item) {
  return Boolean(item.page) && item.page === currentPage;
}

function navLink(item, extraAttrs = '') {
  const active = isActive(item) ? ' aria-current="page"' : '';
  return `<a href="${hrefFor(item)}"${active}${extraAttrs}>${item.label}</a>`;
}

const BRAND_MARK = `
  <svg class="brand-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="23" fill="var(--teal)"/>
    <path d="M12 30c2.5 2 4.5 2 7 0s4.5-2 7 0 4.5 2 7 0 4.5-2 7 0" stroke="var(--gold)" stroke-width="2.4" stroke-linecap="round" fill="none"/>
    <path d="M12 22c2.5 2 4.5 2 7 0s4.5-2 7 0 4.5 2 7 0 4.5-2 7 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.85"/>
    <circle cx="24" cy="13" r="3.4" fill="var(--coral)"/>
  </svg>`;

/* ---------- header template --------------------------------------------- */

function headerHTML() {
  const homeHref = currentPage === 'home' ? '#top' : SITE.home;

  return `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-nav">
  <div class="nav-row">
    <a href="${homeHref}" class="brand">
      ${BRAND_MARK}
      <span class="brand-name">${SITE.name}</span>
    </a>
    <nav class="links" aria-label="Main">
      ${SITE.nav.map(item => navLink(item)).join('\n      ')}
    </nav>
    <a href="${SITE.cta.href}" class="cta-btn">${SITE.cta.label}</a>
    <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
    ${SITE.nav.map(item => navLink(item)).join('\n    ')}
    <a href="${SITE.cta.href}" class="cta-btn">${SITE.cta.label}</a>
  </nav>
</header>`;
}

/* ---------- footer template --------------------------------------------- */

function footerHTML() {
  const homeHref = currentPage === 'home' ? '#top' : SITE.home;
  const year = new Date().getFullYear();

  const columns = SITE.footerColumns.map(col => `
      <div>
        <h4>${col.title}</h4>
        <ul>
          ${col.links.map(link => `<li>${navLink(link)}</li>`).join('\n          ')}
        </ul>
      </div>`).join('');

  return `
<footer id="contact">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="${homeHref}" class="brand">
          ${BRAND_MARK}
          <span class="brand-name">${SITE.name}</span>
        </a>
        <p>${SITE.tagline}</p>
      </div>
      <div>
        <h4>Get in touch</h4>
        <ul>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><a href="${SITE.phone.href}">${SITE.phone.label}</a></li>
          <li><a href="service-area.html">${SITE.serviceAreaShort}</a></li>
        </ul>
      </div>${columns}
    </div>
    <div class="footer-bottom">
      <span>&copy; ${year} ${SITE.name}. All rights reserved.</span>
      <span>Made for pool people, by pool geeks.</span>
    </div>
  </div>
</footer>`;
}

/* ---------- mount ------------------------------------------------------- */

function mount(selector, html) {
  const slot = document.querySelector(selector);
  if (!slot) return;
  slot.outerHTML = html;
}

mount('[data-site-header]', headerHTML());
mount('[data-site-footer]', footerHTML());

// Mobile drawer
const toggle = document.querySelector('.menu-toggle');
const drawer = document.getElementById('mobile-nav');
if (toggle && drawer) {
  toggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  // Tapping a link closes the drawer (matters for same-page anchors)
  drawer.addEventListener('click', event => {
    if (event.target.closest('a')) {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
  });
}
