(() => {
  const config = window.TAMO_SUPABASE_CONFIG;
  const client = window.supabase.createClient(config.url, config.publishableKey);
  let saving = false;

  function localizeConsent(container) {
    const english = document.documentElement.lang === 'en';
    const note = container.querySelector('.mail-disclosure');
    const noteText = english
      ? 'Your inquiry will be saved securely and visible only to the site administrator'
      : 'הפנייה תישמר במאגר מאובטח ותהיה זמינה רק למנהלת האתר';
    if (note && note.textContent !== noteText) note.textContent = noteText;

  }

  function formIsAvailable(body) {
    return Boolean(body && window.TAMO_INQUIRY_STATE);
  }

  async function submitInquiry(button) {
    const body = document.querySelector('.wizard-body');
    const feedback = document.querySelector('#feedback');
    const english = document.documentElement.lang === 'en';
    if (!formIsAvailable(body)) {
      feedback.textContent = english ? 'The inquiry form is not available' : 'טופס הפנייה אינו זמין כרגע';
      return;
    }

    const insert = window.TAMO_GET_INQUIRY();

    saving = true;
    button.disabled = true;
    feedback.textContent = english ? 'Saving your inquiry' : 'שומרת את הפנייה';

    try {
      const { error } = await client.from('inquiries').insert(insert);
      if (error) throw error;
      feedback.textContent = english
        ? 'Your inquiry was saved successfully. TAMO can now follow up with you'
        : 'הפנייה נשמרה בהצלחה. אפשר לחזור אליכם בנוגע לפרטים שמסרתם';
      button.textContent = english ? 'Inquiry saved' : 'הפנייה נשמרה';
    } catch (error) {
      console.error('Could not save inquiry', error);
      feedback.textContent = english
        ? 'We could not save your inquiry. Please try again later or email taimaa.openu@gmail.com'
        : 'שמירת הפנייה נכשלה. אפשר לנסות שוב מאוחר יותר או לשלוח מייל ל־taimaa.openu@gmail.com';
      button.disabled = false;
    } finally {
      saving = false;
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('#send');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!saving) void submitInquiry(button);
  }, true);

  const observer = new MutationObserver(() => localizeConsent(document));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  localizeConsent(document);
})();
