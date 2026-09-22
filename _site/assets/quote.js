/* ==========================================================================
   Pool Boys NOLA — multi-step quote form
   --------------------------------------------------------------------------
   Loaded on every page. Any link or button carrying data-quote opens a modal
   that walks the visitor through six questions and then asks how to reach
   them. On the last step it posts to the same endpoint the contact form uses,
   sending each question and its answer as a structured list.

   Those triggers keep href="contact.html", which is the no-JavaScript path:
   if this file never runs, the CTA still lands on the contact page.

   To change the questions, edit STEPS. Everything else — the completion bar,
   the step count, validation, the recap on the last step — follows from it.

   Wrapped in an IIFE so nothing here collides with site.js or contact.js,
   which share the same global scope on contact.html.
   ========================================================================== */

(function () {
  'use strict';

  const ENDPOINT = 'https://4iqlzkp9u6.execute-api.us-east-1.amazonaws.com/prod/contact';
  const FALLBACK_EMAIL = 'hello@poolboysnola.com';

  const STEPS = [
    {
      name: 'service',
      question: 'What kind of pool service would you like?',
      sub: 'Pick the closest fit — you can tell us more at the end.',
      options: ['Cleaning and maintenance', 'Winterization', 'Inspection'],
      stack: true
    },
    {
      name: 'pool_type',
      question: 'What type of pool do you own?',
      options: ['In-ground', 'Above ground']
    },
    {
      name: 'material',
      question: 'What material is your pool?',
      sub: "Not sure? That's a perfectly normal answer.",
      options: ['Concrete', 'Tile', 'Fiberglass', 'Vinyl', "I don't know"]
    },
    {
      name: 'water_type',
      question: 'What type of water is your pool?',
      options: ['Chlorinated water', 'Saltwater']
    },
    {
      name: 'water_state',
      question: 'How does your pool water appear?',
      options: ['Pool water is green or cloudy', 'Pool water is clear'],
      stack: true
    },
    {
      name: 'frequency',
      question: 'How often would you like your pool cleaned?',
      options: ['Once a week', 'Every other week', 'Once a month', 'One time only']
    }
  ];

  const TOTAL = STEPS.length + 1; // the six questions plus the contact step

  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>';

  /* ---------- markup ----------------------------------------------------- */

  // `required` on every radio in the group is what makes an unanswered
  // question show up as :invalid, which is how Next refuses to move on.
  function optionsHTML(step) {
    return step.options.map(option => `
            <label class="quote-option">
              <input type="radio" name="${step.name}" value="${option}" required>
              <span class="quote-box">${CHECK}</span>
              <span>${option}</span>
            </label>`).join('');
  }

  function stepsHTML() {
    return STEPS.map((step, index) => `
        <section class="quote-step" data-step="${index}">
          <fieldset>
            <legend>${step.question}</legend>
            ${step.sub ? `<p class="sub">${step.sub}</p>` : ''}
            <div class="quote-options${step.stack ? ' stack' : ''}">${optionsHTML(step)}
            </div>
          </fieldset>
        </section>`).join('');
  }

  const DIALOG_HTML = `
<div class="quote-overlay" id="quote-overlay">
  <button type="button" class="quote-backdrop" tabindex="-1" aria-label="Close"></button>
  <div class="quote-dialog" role="dialog" aria-modal="true" aria-labelledby="quote-title">
    <button type="button" class="quote-close" aria-label="Close the quote form">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>

    <h2 class="visually-hidden" id="quote-title">Get a free quote</h2>

    <div class="quote-progress">
      <div class="quote-progress-head">
        <span id="quote-step-label">Step 1 of ${TOTAL}</span>
        <span class="pct" id="quote-pct">0% complete</span>
      </div>
      <div class="quote-track" role="progressbar" aria-labelledby="quote-title"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="quote-track">
        <div class="quote-bar" id="quote-bar"></div>
      </div>
    </div>

    <p class="form-status" id="quote-status" role="status" aria-live="polite"></p>

    <form id="quote-form" novalidate>
      ${stepsHTML()}

      <section class="quote-step" data-step="${STEPS.length}">
        <h2>Last bit — where do we send the quote?</h2>
        <p class="sub">We answer within one business day. No call centre, no drip campaign.</p>

        <div class="quote-recap"><dl id="quote-recap-list"></dl></div>

        <div class="quote-grid">
          <label class="field">
            <span>Name <span class="req" aria-hidden="true">*</span></span>
            <input type="text" name="name" autocomplete="name" placeholder="Jordan Fontaine" required>
          </label>
          <label class="field">
            <span>Email <span class="req" aria-hidden="true">*</span></span>
            <input type="email" name="email" autocomplete="email" placeholder="you@example.com" required>
          </label>
          <label class="field">
            <span>Phone</span>
            <input type="tel" name="phone" autocomplete="tel" placeholder="(504) 555-0142">
          </label>
          <label class="field">
            <span>Neighborhood or street</span>
            <input type="text" name="address" autocomplete="address-line1" placeholder="Lakeview">
          </label>
          <label class="field full">
            <span>Anything else we should know?</span>
            <textarea name="notes" maxlength="1200" rows="3" placeholder="Pool size, equipment, when you last had it serviced."></textarea>
          </label>
        </div>
      </section>

      <div class="quote-foot">
        <button type="button" class="quote-back" id="quote-back" hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
          Back
        </button>
        <button type="submit" class="cta-btn" id="quote-next">Next</button>
      </div>
    </form>

    <section class="quote-done" id="quote-done">
      <div class="tick">${CHECK}</div>
      <h2>Got it — thanks.</h2>
      <p>Your answers are with us. We'll come back within one business day with a plan and a price, and we'll say up front if your pool needs something different from what you picked.</p>
      <button type="button" class="cta-btn" data-quote-close>Close</button>
    </section>
  </div>
</div>`;

  /* ---------- mount ------------------------------------------------------ */

  const host = document.createElement('div');
  host.innerHTML = DIALOG_HTML;
  const overlay = host.firstElementChild;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector('.quote-dialog');
  const form = overlay.querySelector('#quote-form');
  const statusBox = overlay.querySelector('#quote-status');
  const bar = overlay.querySelector('#quote-bar');
  const track = overlay.querySelector('#quote-track');
  const pct = overlay.querySelector('#quote-pct');
  const stepLabel = overlay.querySelector('#quote-step-label');
  const backBtn = overlay.querySelector('#quote-back');
  const nextBtn = overlay.querySelector('#quote-next');
  const donePanel = overlay.querySelector('#quote-done');
  const recapList = overlay.querySelector('#quote-recap-list');
  const panels = Array.from(form.querySelectorAll('.quote-step'));

  let current = 0;
  let opener = null;
  let pointerPick = false; // set on pointerdown, so arrow keys don't auto-advance

  /* ---------- helpers ---------------------------------------------------- */

  function setStatus(state, message) {
    statusBox.dataset.state = state;
    statusBox.innerHTML = message;
  }

  function clearStatus() {
    delete statusBox.dataset.state;
    statusBox.textContent = '';
  }

  function answers() {
    const data = new FormData(form);
    return STEPS.map(step => ({ step, value: data.get(step.name) }));
  }

  function paintProgress() {
    // The bar reports steps *finished*, so it reads 0% on the first question
    // and only fills completely once the form is sent.
    const done = Math.round((current / TOTAL) * 100);
    bar.style.width = done + '%';
    track.setAttribute('aria-valuenow', String(done));
    pct.textContent = done + '% complete';
    stepLabel.textContent = `Step ${current + 1} of ${TOTAL}`;
  }

  function paintRecap() {
    recapList.innerHTML = answers().map(({ step, value }) => `
      <div><dt>${step.question.replace(/\?$/, '')}</dt><dd>${value || '—'}</dd></div>`).join('');
  }

  function show(index, { focus = true } = {}) {
    current = Math.max(0, Math.min(index, panels.length - 1));
    panels.forEach((panel, i) => {
      if (i === current) panel.setAttribute('data-current', '');
      else panel.removeAttribute('data-current');
    });

    const last = current === panels.length - 1;
    backBtn.hidden = current === 0;
    nextBtn.textContent = last ? 'Send my details' : 'Next';
    if (last) paintRecap();
    paintProgress();
    clearStatus();

    if (focus) {
      const target = panels[current].querySelector('input:checked, input, textarea');
      if (target) target.focus({ preventScroll: true });
    }
    dialog.scrollTop = 0;
  }

  function firstInvalid() {
    // Radio groups report as a group; checkValidity on the panel's fields is
    // enough to catch both a missed answer and a bad email.
    return panels[current].querySelector(':invalid');
  }

  /* ---------- open / close ---------------------------------------------- */

  function open(trigger) {
    opener = trigger || null;
    donePanel.removeAttribute('data-current');
    form.hidden = false;
    overlay.setAttribute('data-open', '');
    document.documentElement.style.overflow = 'hidden';
    show(current, { focus: false });
    // Focus the dialog itself rather than the first radio, so a screen reader
    // reads the question before the options.
    dialog.setAttribute('tabindex', '-1');
    dialog.focus({ preventScroll: true });
  }

  function close() {
    overlay.removeAttribute('data-open');
    document.documentElement.style.overflow = '';
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-quote]');
    if (trigger) {
      event.preventDefault();
      open(trigger);
      return;
    }
    if (event.target.closest('.quote-close, .quote-backdrop, [data-quote-close]')) close();
  });

  document.addEventListener('keydown', event => {
    if (!overlay.hasAttribute('data-open')) return;

    if (event.key === 'Escape') {
      close();
      return;
    }

    // Keep Tab inside the dialog while it is open.
    if (event.key !== 'Tab') return;
    const focusable = Array.from(dialog.querySelectorAll(
      'button, input:not([type="radio"]), textarea, a[href], [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null && !el.disabled);
    // Radios are reachable via one tab stop per group, which the browser
    // handles — include only the checked one, or the first if none is.
    panels[current].querySelectorAll('.quote-options').forEach(group => {
      const radios = Array.from(group.querySelectorAll('input[type="radio"]'));
      const stop = radios.find(r => r.checked) || radios[0];
      if (stop) focusable.push(stop);
    });
    focusable.sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- stepping -------------------------------------------------- */

  form.addEventListener('pointerdown', () => { pointerPick = true; });

  form.addEventListener('change', event => {
    if (event.target.type !== 'radio') return;
    clearStatus();
    // Clicking an answer moves on by itself. Arrow-key selection does not,
    // because changing the choice would run away from the keyboard user.
    if (pointerPick && current < panels.length - 1) {
      const from = current;
      setTimeout(() => { if (current === from) show(from + 1); }, 240);
    }
    pointerPick = false;
  });

  backBtn.addEventListener('click', () => show(current - 1));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearStatus();

    const invalid = firstInvalid();
    if (invalid) {
      const missedAnswer = invalid.type === 'radio';
      setStatus('error', missedAnswer
        ? 'Pick an answer to carry on.'
        : (invalid.validationMessage || 'Please fill in every required field.'));
      invalid.focus({ preventScroll: true });
      return;
    }

    if (current < panels.length - 1) {
      show(current + 1);
      return;
    }

    await send();
  });

  /* ---------- submit ---------------------------------------------------- */

  // Builds the structured question/answer list the Lambda expects: the six
  // quote questions first, then the contact details as their own Q&A pairs.
  function buildAnswers(data) {
    const list = STEPS.map(step => ({
      question: step.question,
      answer: data.get(step.name) || '—'
    }));

    list.push({ question: 'Name', answer: (data.get('name') || '').trim() });
    list.push({ question: 'Phone', answer: (data.get('phone') || '').trim() || 'not given' });
    list.push({ question: 'Neighborhood or street', answer: (data.get('address') || '').trim() || 'not given' });

    const notes = (data.get('notes') || '').trim();
    if (notes) list.push({ question: 'Anything else we should know?', answer: notes });

    return list;
  }

  async function send() {
    const data = new FormData(form);
    const payload = {
      email: data.get('email').trim(),
      subject: `Quote request — ${data.get('service')} (${data.get('frequency')})`,
      answers: buildAnswers(data)
    };

    nextBtn.disabled = true;
    nextBtn.textContent = 'Sending…';

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      form.hidden = true;
      donePanel.setAttribute('data-current', '');
      bar.style.width = '100%';
      track.setAttribute('aria-valuenow', '100');
      pct.textContent = '100% complete';
      stepLabel.textContent = 'All done';
      clearStatus();
      donePanel.querySelector('.cta-btn').focus({ preventScroll: true });

      // A fresh start next time it is opened.
      form.reset();
      current = 0;
    } catch (error) {
      setStatus('error',
        'Sorry — we couldn\'t send that just now. Please try again, or email us directly at ' +
        `<a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`);
      console.error('Quote form submission failed:', error);
    } finally {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Send my details';
    }
  }

  show(0, { focus: false });
})();
