const ADMIN_EMAIL = window.TAMO_SUPABASE_CONFIG.adminEmail.toLowerCase();
const supabaseClient = window.supabase.createClient(
  window.TAMO_SUPABASE_CONFIG.url,
  window.TAMO_SUPABASE_CONFIG.publishableKey
);
const $ = selector => document.querySelector(selector);
const loginCard = $('#login-card');
const dashboard = $('#dashboard');
const loginFeedback = $('#login-feedback');
const dashboardFeedback = $('#dashboard-feedback');
const loginButton = $('#login-button');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[char]));
const statusNames = {
  new: 'חדשה',
  in_progress: 'בטיפול',
  completed: 'הושלמה'
};

async function loadInquiries() {
  dashboardFeedback.textContent = 'טוען פניות';
  const { data, error } = await supabaseClient
    .from('inquiries')
    .select('id, created_at, name, email, project_type, goal, audience, stage, budget, timeline, notes, status')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Could not load inquiries', error);
    dashboardFeedback.textContent = 'לא הצלחנו לטעון פניות. בדקו את החיבור ואת הרשאות המאגר.';
    return;
  }

  dashboardFeedback.textContent = data.length ? `מוצגות ${data.length} הפניות האחרונות` : 'עדיין לא התקבלו פניות';
  $('#inquiry-list').innerHTML = data.map(inquiry => `
    <article class="inquiry-card" data-id="${escapeHtml(inquiry.id)}">
      <div class="inquiry-heading">
        <div><p class="inquiry-date">${escapeHtml(new Date(inquiry.created_at).toLocaleString('he-IL'))}</p><h2>${escapeHtml(inquiry.name)}</h2></div>
        <button class="delete-button" type="button" data-delete="${escapeHtml(inquiry.id)}">מחיקת פנייה</button>
      </div>
      <a class="email-link" href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a>
      <div class="inquiry-grid">
        <p><strong>סוג הפרויקט</strong>${escapeHtml(inquiry.project_type)}</p>
        <p><strong>קהל יעד</strong>${escapeHtml(inquiry.audience)}</p>
        <p><strong>שלב</strong>${escapeHtml(inquiry.stage)}</p>
        <p><strong>תקציב</strong>${escapeHtml(inquiry.budget)}</p>
        <p><strong>מועד התחלה</strong>${escapeHtml(inquiry.timeline)}</p>
      </div>
      <p class="inquiry-goal">${escapeHtml(inquiry.goal)}</p>
      ${inquiry.notes ? `<p class="inquiry-notes">${escapeHtml(inquiry.notes)}</p>` : ''}
      <label class="status-label">סטטוס
        <select data-status="${escapeHtml(inquiry.id)}">
          ${Object.entries(statusNames).map(([value, name]) => `<option value="${value}" ${inquiry.status === value ? 'selected' : ''}>${name}</option>`).join('')}
        </select>
      </label>
    </article>
  `).join('');

  document.querySelectorAll('[data-status]').forEach(select => {
    select.addEventListener('change', () => updateStatus(select));
  });
  document.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', () => deleteInquiry(button));
  });
}

async function updateStatus(select) {
  const { error } = await supabaseClient
    .from('inquiries')
    .update({ status: select.value })
    .eq('id', select.dataset.status);

  if (error) {
    console.error('Could not update inquiry status', error);
    await loadInquiries();
    dashboardFeedback.textContent = 'עדכון הסטטוס נכשל';
    return;
  }

  dashboardFeedback.textContent = 'הסטטוס עודכן';
}

async function deleteInquiry(button) {
  if (!window.confirm('למחוק את הפנייה לצמיתות?')) return;

  const { error } = await supabaseClient
    .from('inquiries')
    .delete()
    .eq('id', button.dataset.delete);

  if (error) {
    console.error('Could not delete inquiry', error);
    dashboardFeedback.textContent = 'מחיקת הפנייה נכשלה';
    return;
  }

  await loadInquiries();
}

async function showSession(session) {
  const email = session?.user?.email?.toLowerCase();
  if (!session) {
    loginCard.hidden = false;
    dashboard.hidden = true;
    return;
  }

  if (email !== ADMIN_EMAIL) {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('Could not sign out an unauthorized dashboard user', error);
    loginFeedback.textContent = 'לחשבון הזה אין הרשאת מנהלת';
    loginCard.hidden = false;
    dashboard.hidden = true;
    return;
  }

  loginCard.hidden = true;
  dashboard.hidden = false;
  await loadInquiries();
}

$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  loginButton.disabled = true;
  loginFeedback.textContent = '';
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: $('#login-email').value.trim(),
    password: $('#login-password').value
  });
  loginButton.disabled = false;

  if (error) {
    console.error('Dashboard sign-in failed', error);
    loginFeedback.textContent = 'הכניסה נכשלה. בדקו את כתובת המייל והסיסמה.';
    return;
  }

  await showSession(data.session);
});

$('#refresh-button').addEventListener('click', loadInquiries);
$('#logout-button').addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    console.error('Dashboard sign-out failed', error);
    dashboardFeedback.textContent = 'היציאה נכשלה. נסו שוב.';
    return;
  }
  await showSession(null);
});

supabaseClient.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Could not restore dashboard session', error);
    loginFeedback.textContent = 'לא הצלחנו לבדוק את מצב הכניסה';
    return;
  }
  return showSession(data.session);
});
