/* ==========================================================================
   Pool Boys NOLA — shared page behaviour
   --------------------------------------------------------------------------
   The nav and footer are no longer built here. Jekyll stitches them in at
   build time from _includes/header.html and _includes/footer.html, driven by
   _data/site.yml — so the links are in the HTML that gets served, which is
   what search engines index most reliably. Edit those files, not this one,
   to change the nav, the footer, or the contact details.

   What is left here is behaviour that can only happen in the browser:
   the mobile drawer, and the scroll reveal.
   ========================================================================== */

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

/* ---------- scroll reveal ------------------------------------------------
   Anything with class="scroll-reveal" fades up the first time it scrolls
   into view. The .js-reveal flag on <html> is what arms the hidden state in
   the stylesheet, so if this script never runs the content stays visible;
   reduced-motion preferences are handled in CSS.                          */

const revealTargets = document.querySelectorAll('.scroll-reveal');
if (revealTargets.length && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-reveal');
  const observer = new IntersectionObserver((entries, self) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      self.unobserve(entry.target); // reveal once, not on every pass
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  revealTargets.forEach(el => observer.observe(el));
}
