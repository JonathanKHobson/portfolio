// Public EmailJS template contract already used by Kyle's ProGM contact form.
// No private API key or configurable recipient is exposed here.
(() => {
  const form = document.querySelector('.contact-form');
  if (!form || !window.fetch || !window.AbortController) return;
  const endpoint = 'https://api.emailjs.com/api/v1.0/email/send';
  const config = {service_id: 'service_9wx16fe', template_id: 'template_hjbmxbn', user_id: 'DpN9hLocoU__4dYVX'};
  const fieldset = form.querySelector('fieldset');
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('span');
  const status = form.querySelector('.contact-status');
  const fields = ['name', 'email', 'message'].map(name => form.elements.namedItem(name));
  let sending = false;
  let lastSent = 0;
  form.hidden = false;

  const setStatus = (message, state, fallback = false) => {
    status.textContent = message;
    status.dataset.state = state;
    if (fallback) {
      const link = document.createElement('a');
      link.href = 'mailto:JonathanKyleHobson@gmail.com';
      link.textContent = 'Email Kyle instead';
      status.append(document.createTextNode(' '), link);
    }
  };
  const clearError = field => {
    field.removeAttribute('aria-invalid');
    const error = document.getElementById(`${field.name}-error`);
    error.textContent = '';
    error.hidden = true;
  };
  fields.forEach(field => field.addEventListener('input', () => clearError(field)));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    let invalid;
    fields.forEach(field => {
      clearError(field);
      field.value = field.value.trim();
      const message = !field.value ? ({name: 'Add your name.', email: 'Add an email address for the reply.', message: 'Add a short message about what you have in mind.'}[field.name])
        : field.name === 'email' && field.validity.typeMismatch ? 'Use an email address such as name@example.com.' : '';
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        const error = document.getElementById(`${field.name}-error`);
        error.textContent = message;
        error.hidden = false;
        invalid ||= field;
      }
    });
    if (invalid) { setStatus('Check the highlighted fields, then send your message.', 'error'); invalid.focus(); return; }
    if (form.elements.namedItem('website').value) { setStatus('This message could not be sent through the form.', 'error', true); status.focus(); return; }
    if (Date.now() - lastSent < 30000) { setStatus('Your previous message was sent. Please wait a moment before sending another.', 'success'); status.focus(); return; }
    if (navigator.onLine === false) { setStatus('You appear to be offline. Your message is still here; reconnect and try again.', 'error', true); status.focus(); return; }

    sending = true;
    fieldset.disabled = true;
    form.setAttribute('aria-busy', 'true');
    label.textContent = 'Sending…';
    setStatus('Sending your message…', 'sending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const edition = form.dataset.edition;
    const params = {
      title: `${edition} portfolio inquiry`,
      name: fields[0].value,
      email: fields[1].value,
      topic: edition,
      consent: 'Reply to this inquiry',
      message: `Portfolio: ${edition}\n\n${fields[2].value}`,
      page: window.location.origin + window.location.pathname,
    };
    try {
      const response = await fetch(endpoint, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...config, template_params: params}), signal: controller.signal});
      if (!response.ok) {
        setStatus(response.status === 429 ? 'The contact service is busy. Your message is still here; please try again in a little while.' : 'The contact service could not send this message. Your message is still here; you can try again.', 'error', true);
      } else {
        lastSent = Date.now();
        form.reset();
        setStatus('Thanks, your message was sent. I’ll reply to the email address you provided.', 'success');
      }
    } catch {
      setStatus('I couldn’t confirm whether your message was sent. It may have arrived. Your message is still here if you want to try again or contact me by email.', 'uncertain', true);
    } finally {
      clearTimeout(timeout);
      sending = false;
      fieldset.disabled = false;
      form.removeAttribute('aria-busy');
      label.textContent = 'Send message';
      status.focus();
    }
  });
})();
