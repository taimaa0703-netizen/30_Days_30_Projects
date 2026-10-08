'use strict';
// Demo-only local sign-in: the profile never leaves this browser and nothing is verified.
Object.assign(hebrewCopy, {
  'Sign in': 'כניסה',
  'Sign out': 'יציאה',
  'Sign in to ADPULSE': 'כניסה ל־ADPULSE',
  'Demo sign-in. Your details stay in this browser and are not sent anywhere.': 'כניסת דמו. הפרטים נשמרים בדפדפן זה בלבד ואינם נשלחים לשום מקום.',
  'Full name': 'שם מלא',
  'Email': 'אימייל',
  'Cancel': 'ביטול',
  'Enter your name and a valid email address.': 'יש להזין שם ואימייל תקין.'
});
(() => {
  const KEY = 'adpulseProfile';
  const $ = selector => document.querySelector(selector);
  const readProfile = () => {
    try {
      const profile = JSON.parse(localStorage.getItem(KEY));
      return profile && typeof profile.name === 'string' && typeof profile.email === 'string' ? profile : null;
    } catch { return null; }
  };
  const initials = name => name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';
  function render() {
    const profile = readProfile();
    $('#signInBtn').hidden = Boolean(profile);
    $('#userMenu').hidden = !profile;
    if (profile) {
      $('#userAvatar').textContent = initials(profile.name);
      $('#userAvatar').title = `${profile.name} · ${profile.email}`;
    }
  }
  function init() {
    const dialog = $('#signInDialog'), form = $('#signInForm'), error = $('#signInError');
    $('#signInBtn').addEventListener('click', () => { error.textContent = ''; form.reset(); dialog.showModal(); $('#signInName').focus(); });
    $('#signInCancel').addEventListener('click', () => dialog.close());
    form.addEventListener('submit', event => {
      event.preventDefault();
      const name = $('#signInName').value.trim(), email = $('#signInEmail').value.trim();
      if (!name || name.length > 60 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
        error.textContent = t('Enter your name and a valid email address.');
        return;
      }
      try { localStorage.setItem(KEY, JSON.stringify({name, email})); } catch {}
      dialog.close();
      render();
    });
    $('#signOutBtn').addEventListener('click', () => { try { localStorage.removeItem(KEY); } catch {} render(); });
    document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => { error.textContent = ''; }));
    render();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
