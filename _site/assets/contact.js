/* ==========================================================================
   Pool Boys NOLA — contact form
   --------------------------------------------------------------------------
   Posts { email, subject, message } as JSON to the API Gateway endpoint and
   reports the outcome in #form-status. Loaded only by contact.html.

   The form carries `novalidate` so the browser's own bubbles stay out of the
   way; we still run checkValidity() and hand the first bad field back to the
   user, which keeps the message in our own status box instead of a tooltip.
   ========================================================================== */

const ENDPOINT = 'https://4iqlzkp9u6.execute-api.us-east-1.amazonaws.com/prod/contact';
const FALLBACK_EMAIL = 'hello@poolboysnola.com';

const form = document.getElementById('contact-form');
const statusBox = document.getElementById('form-status');

if (form && statusBox) {
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.textContent;

  function setStatus(state, message) {
    statusBox.dataset.state = state;
    statusBox.innerHTML = message;
  }

  function clearStatus() {
    delete statusBox.dataset.state;
    statusBox.textContent = '';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearStatus();

    // Our own pass first, so the message lands in the status box.
    const invalid = form.querySelector(':invalid');
    if (invalid) {
      setStatus('error', invalid.validationMessage || 'Please fill in every required field.');
      invalid.focus();
      return;
    }

    const data = new FormData(form);
    const payload = {
      email: data.get('email').trim(),
      subject: data.get('subject').trim(),
      message: data.get('message').trim()
    };

    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('HTTP ' + response.status);

      setStatus('ok', "Thanks — that's with us. We'll get back to you within one business day.");
      form.reset();
    } catch (error) {
      // Network failure, CORS rejection, or a non-2xx from the API. Either
      // way the visitor still needs a way to reach us, so give them one.
      setStatus('error',
        'Sorry — we couldn\'t send that just now. Please try again, or email us directly at ' +
        `<a href="mailto:${FALLBACK_EMAIL}">${FALLBACK_EMAIL}</a>.`);
      console.error('Contact form submission failed:', error);
    } finally {
      button.disabled = false;
      button.textContent = buttonLabel;
    }
  });
}
