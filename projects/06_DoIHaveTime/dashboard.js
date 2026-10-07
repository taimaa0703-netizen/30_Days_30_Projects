// Local dated journal. Task completion and measured focus are separate data.
const dashboardCopy = {
  en: { progressLabel: 'YOUR PROGRESS', dashboardTitle: 'A little progress, every day.', periodLabel: 'Dashboard period', weekView: 'Week', monthView: 'Month', previousPeriod: 'Previous period', nextPeriod: 'Next period', currentPeriod: 'Today', completedLabel: 'Completed tasks', focusLabel: 'Measured focus', activeLabel: 'Active days', dailyFocus: 'Your focus, day by day', measuredNote: 'Focus time comes from the timer. Checking a task does not add time.', unfinishedLabel: 'Still on your mind', carryHint: 'Move unfinished tasks to next week, and bring them into your planner when you are ready.', carryNext: 'Next week', planToday: 'Plan today', emptyBacklog: 'No unfinished tasks in this period.', noActivity: 'Your first step starts the story. Add a task and start the timer.', steadyInsight: '{days} active days and {done} completed tasks. Every step counts.', estimateInsight: 'For {count} completed, timed tasks: {planned} min estimated, {actual} min measured.', carriedLabel: 'Moved to next week', todayLabel: 'Today', plannedLabel: 'planned', doneLabel: 'done', weekStart: 'Weeks start on Monday.' },
  he: { progressLabel: 'ההתקדמות שלך', dashboardTitle: 'קצת התקדמות, בכל יום.', periodLabel: 'תקופת הדאשבורד', weekView: 'שבוע', monthView: 'חודש', previousPeriod: 'לתקופה הקודמת', nextPeriod: 'לתקופה הבאה', currentPeriod: 'היום', completedLabel: 'משימות שהושלמו', focusLabel: 'זמן ריכוז שנמדד', activeLabel: 'ימים פעילים', dailyFocus: 'הריכוז שלך, יום אחרי יום', measuredNote: 'זמן הריכוז נמדד בטיימר. סימון משימה כהושלמה לא מוסיף זמן.', unfinishedLabel: 'מה עוד נשאר?', carryHint: 'אפשר להעביר משימות לשבוע הבא, ולהחזיר אותן לתכנון כשמתאים לך.', carryNext: 'לשבוע הבא', planToday: 'לתכנן היום', emptyBacklog: 'אין משימות פתוחות בתקופה הזאת.', noActivity: 'הצעד הראשון מתחיל את הסיפור. מוסיפים משימה ומפעילים את הטיימר.', steadyInsight: '{days} ימים פעילים ו־{done} משימות שהושלמו. כל צעד נחשב.', estimateInsight: 'ב־{count} משימות שהושלמו עם מדידת זמן: {planned} דקות בהערכה, {actual} דקות בפועל.', carriedLabel: 'הועברה לשבוע הבא', todayLabel: 'היום', plannedLabel: 'תוכננו', doneLabel: 'הושלמו', weekStart: 'השבוע מתחיל ביום שני.' },
  ar: { progressLabel: 'تقدّمك', dashboardTitle: 'تقدّم صغير، كل يوم.', periodLabel: 'فترة لوحة التقدّم', weekView: 'أسبوع', monthView: 'شهر', previousPeriod: 'الفترة السابقة', nextPeriod: 'الفترة التالية', currentPeriod: 'اليوم', completedLabel: 'المهام المكتملة', focusLabel: 'وقت التركيز المقاس', activeLabel: 'أيام النشاط', dailyFocus: 'تركيزك، يوم بيوم', measuredNote: 'وقت التركيز من المؤقت. تعليم المهمة كمكتملة ما بضيف وقت.', unfinishedLabel: 'شو ضلّ ببالك؟', carryHint: 'انقلي المهام للأسبوع الجاي، ورجّعيها للتخطيط لما تكوني جاهزة.', carryNext: 'للأسبوع الجاي', planToday: 'خطّط اليوم', emptyBacklog: 'ما في مهام مفتوحة بهالفترة.', noActivity: 'أول خطوة بتبدأ الحكاية. أضيفي مهمة وشغّلي المؤقت.', steadyInsight: '{days} أيام نشاط و{done} مهام مكتملة. كل خطوة بتفرق.', estimateInsight: 'بـ {count} مهام مكتملة مع قياس الوقت: {planned} دقيقة تقدير و{actual} دقيقة فعلية.', carriedLabel: 'انتقلت للأسبوع الجاي', todayLabel: 'اليوم', plannedLabel: 'مخطط', doneLabel: 'مكتمل', weekStart: 'الأسبوع ببدأ يوم الاثنين.' }
};
dashboardCopy.ar.carryHint = 'انقل المهام للأسبوع الجاي، ورجّعها للتخطيط لما تكون جاهز.';
dashboardCopy.ar.noActivity = 'أول خطوة بتبدأ الحكاية. أضف مهمة وشغّل التايمر.';
Object.keys(dashboardCopy).forEach(lang => Object.assign(translations[lang], dashboardCopy[lang]));
let journal = { entries: [], focus: [] };
let dashboardMode = 'week';
let dashboardAnchor = new Date();
let journalSequence = 0;

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function dateFromKey(key) { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(date, count) { const copy = new Date(date); copy.setDate(copy.getDate() + count); return copy; }
function weekBeginning(date) { const start = new Date(date); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (start.getDay() + 6) % 7); return start; }
function dashboardRange(mode = dashboardMode, anchor = dashboardAnchor) {
  const start = mode === 'week' ? weekBeginning(anchor) : new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = mode === 'week' ? addDays(start, 7) : new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end, from: localDateKey(start), to: localDateKey(end) };
}
function loadJournal() {
  try {
    const data = JSON.parse(localStorage.getItem('spareJournal') || 'null');
    if (!data) return;
    journal.entries = Array.isArray(data.entries) ? data.entries.filter(e => typeof e.id === 'string' && typeof e.name === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && Number.isSafeInteger(e.plannedMinutes) && e.plannedMinutes > 0 && Number.isSafeInteger(e.remaining) && e.remaining >= 0 && e.remaining <= e.plannedMinutes) : [];
    journal.focus = Array.isArray(data.focus) ? data.focus.filter(e => typeof e.taskId === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && Number.isFinite(e.seconds) && e.seconds > 0) : [];
  } catch {}
}
function persistJournal() { try { localStorage.setItem('spareJournal', JSON.stringify(journal)); } catch {} }
function syncJournal() {
  tasks.forEach(task => {
    let entry = journal.entries.find(entry => entry.id === task.journalId);
    if (!entry) {
      task.journalId = `${Date.now()}-${++journalSequence}-${task.id}`;
      entry = { id: task.journalId, name: task.name, date: localDateKey(), plannedDates: [localDateKey()], plannedMinutes: task.minutes, remaining: task.remaining, completedAt: null, priority: task.priority, must: !!task.must, canSplit: !!task.canSplit, effort: task.effort || 'normal', actualSeconds: task.actualSeconds || 0 };
      journal.entries.push(entry);
    }
    const completedBefore = entry.remaining === 0;
    entry.remaining = task.remaining; entry.actualSeconds = task.actualSeconds || 0;
    entry.deleted = false;
    if (task.remaining === 0 && (!completedBefore || !entry.completedAt)) entry.completedAt = localDateKey();
    if (task.remaining > 0) entry.completedAt = null;
  });
  persistJournal();
  if (typeof renderDashboard === 'function') renderDashboard();
}
function markJournalDeleted(task) {
  const entry = journal.entries.find(entry => entry.id === task?.journalId);
  if (entry && entry.remaining > 0) { entry.deleted = true; persistJournal(); }
}
function logSessionFocus() {
  const step = plan?.steps[session?.index];
  if (!step || step.kind !== 'work') return;
  const task = tasks.find(task => task.id === step.taskId);
  if (!task) return;
  if (!task.journalId) syncJournal();
  const total = elapsedSeconds(), delta = total - (session.loggedSeconds || 0);
  if (delta <= 0) return;
  const end = Date.now();
  let cursor = end - delta * 1000;
  while (cursor < end) {
    const day = new Date(cursor), tomorrow = addDays(day, 1); tomorrow.setHours(0, 0, 0, 0);
    const finish = Math.min(end, tomorrow.getTime());
    const date = localDateKey(day);
    const existing = journal.focus.find(item => item.taskId === task.journalId && item.date === date);
    if (existing) existing.seconds += (finish - cursor) / 1000;
    else journal.focus.push({ taskId: task.journalId, date, seconds: (finish - cursor) / 1000 });
    cursor = finish;
  }
  session.loggedSeconds = total;
  persistJournal(); renderDashboard();
}
function summarizePeriod(range) {
  const within = key => key >= range.from && key < range.to;
  const planned = journal.entries.filter(e => !e.deleted && (within(e.date) || e.plannedDates?.some(within)));
  const completed = journal.entries.filter(e => !e.deleted && e.completedAt && within(e.completedAt));
  const focus = journal.focus.filter(e => within(e.date));
  const activeDates = new Set([...completed.map(e => e.completedAt), ...focus.map(e => e.date)]);
  return { planned, completed, focus, activeDays: activeDates.size, seconds: focus.reduce((n, e) => n + e.seconds, 0) };
}
function carryTaskToNextWeek(id) {
  const entry = journal.entries.find(e => e.id === id);
  if (!entry || entry.deleted || entry.remaining === 0) return;
  const base = dateFromKey(entry.date);
  const next = addDays(weekBeginning(base > new Date() ? base : new Date()), 7);
  const active = tasks.find(task => task.journalId === id);
  invalidatePlan();
  if (active) tasks = tasks.filter(task => task.journalId !== id);
  entry.date = localDateKey(next);
  entry.plannedDates = [...new Set([...(entry.plannedDates || []), localDateKey(base), entry.date])];
  persistJournal(); renderTasks(); saveState();
}
function bringTaskToToday(id) {
  const entry = journal.entries.find(e => e.id === id);
  if (!entry || entry.deleted || entry.remaining === 0) return;
  invalidatePlan();
  entry.plannedDates = [...new Set([...(entry.plannedDates || []), entry.date, localDateKey()])];
  entry.date = localDateKey();
  if (!tasks.some(task => task.journalId === id)) tasks.push({ id: nextTaskId++, journalId: id, name: entry.name, minutes: entry.plannedMinutes, remaining: entry.remaining, priority: [1, 2, 3].includes(entry.priority) ? entry.priority : 2, must: !!entry.must, canSplit: !!entry.canSplit, effort: entry.effort || 'normal', actualSeconds: entry.actualSeconds || 0 });
  renderTasks(); saveState();
  if (typeof showWorkspace === 'function') showWorkspace('tasks');
  taskList.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function dashboardLocale() { return currentLanguage === 'he' ? 'he-IL' : currentLanguage === 'ar' ? 'ar' : 'en-GB'; }
function renderDashboard() {
  const t = translations[currentLanguage], range = dashboardRange(), stats = summarizePeriod(range), locale = dashboardLocale();
  const labelDate = date => date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  byId('periodTitle').textContent = dashboardMode === 'month' ? range.start.toLocaleDateString(locale, { month: 'long', year: 'numeric' }) : `${labelDate(range.start)} – ${labelDate(addDays(range.end, -1))}`;
  byId('weekView').setAttribute('aria-pressed', String(dashboardMode === 'week'));
  byId('monthView').setAttribute('aria-pressed', String(dashboardMode === 'month'));
  byId('completedStat').textContent = String(stats.completed.length);
  byId('plannedStat').textContent = `${stats.planned.length} ${t.plannedLabel}`;
  // Include completions of tasks originally planned outside this period in the adjacent note.
  byId('completedStat').setAttribute('aria-label', `${stats.completed.length} ${t.doneLabel}; ${stats.planned.length} ${t.plannedLabel}`);
  byId('focusStat').textContent = formatDuration(Math.round(stats.seconds / 60));
  byId('activeStat').textContent = String(stats.activeDays);
  const days = [];
  for (let day = new Date(range.start); day < range.end; day = addDays(day, 1)) days.push(new Date(day));
  const values = days.map(day => stats.focus.filter(e => e.date === localDateKey(day)).reduce((n, e) => n + e.seconds, 0) / 60);
  const max = Math.max(1, ...values);
  byId('focusChart').classList.toggle('monthly-chart', dashboardMode === 'month');
  byId('focusChart').innerHTML = days.map((day, index) => {
    const label = dashboardMode === 'week' ? day.toLocaleDateString(locale, { weekday: 'short' }) : String(day.getDate());
    return `<div class="focus-column" title="${escapeHTML(labelDate(day))}: ${Math.round(values[index])} ${t.minutesShort}"><span class="chart-value">${Math.round(values[index])}</span><div class="bar-track"><div class="focus-bar" style="height:${values[index] ? Math.max(3, values[index] / max * 100) : 0}%"></div></div><span class="chart-label">${escapeHTML(label)}</span></div>`;
  }).join('');
  byId('monthCalendar').classList.toggle('hidden', dashboardMode !== 'month');
  if (dashboardMode === 'month') {
    const offset = (range.start.getDay() + 6) % 7;
    const weekdayLabels = Array.from({ length: 7 }, (_, i) => `<span class="calendar-weekday">${escapeHTML(addDays(weekBeginning(range.start), i).toLocaleDateString(locale, { weekday: 'short' }))}</span>`).join('');
    byId('monthCalendar').innerHTML = weekdayLabels + '<span></span>'.repeat(offset) + days.map(day => {
      const key = localDateKey(day), completed = journal.entries.filter(e => !e.deleted && e.completedAt === key).length;
      const minutes = Math.round(journal.focus.filter(e => e.date === key).reduce((n, e) => n + e.seconds, 0) / 60);
      return `<div class="calendar-day${completed || minutes ? ' has-activity' : ''}${key === localDateKey() ? ' is-today' : ''}" title="${escapeHTML(labelDate(day))}: ${completed} ${t.doneLabel}, ${minutes} ${t.minutesShort}"><strong>${day.getDate()}</strong><small>${completed ? `${completed} ✓` : minutes ? '●' : ''}</small></div>`;
    }).join('');
  }
  const timed = stats.completed.filter(e => e.actualSeconds >= 60);
  byId('dashboardInsight').textContent = timed.length ? t.estimateInsight.replace('{count}', timed.length).replace('{planned}', timed.reduce((n, e) => n + e.plannedMinutes, 0)).replace('{actual}', Math.round(timed.reduce((n, e) => n + e.actualSeconds, 0) / 60)) : stats.activeDays ? t.steadyInsight.replace('{days}', stats.activeDays).replace('{done}', stats.completed.length) : t.noActivity;
  const backlog = stats.planned.filter(e => e.remaining > 0 && e.date >= range.from && e.date < range.to);
  byId('completedJournalList').innerHTML = stats.completed.map(entry => `<div class="completed-journal-row"><span aria-hidden="true">✓</span><strong>${escapeHTML(entry.name)}</strong><small>${escapeHTML(labelDate(dateFromKey(entry.completedAt)))}</small></div>`).join('') || `<p class="dashboard-note">${t.noActivity}</p>`;
  byId('backlogCount').textContent = String(backlog.length);
  byId('backlogList').innerHTML = '';
  if (!backlog.length) byId('backlogList').textContent = t.emptyBacklog;
  backlog.forEach(entry => {
    const row = document.createElement('div'); row.className = 'backlog-task';
    const text = document.createElement('div'); text.className = 'backlog-task-info';
    text.innerHTML = `<strong>${escapeHTML(entry.name)}</strong><small>${formatDuration(entry.remaining)}</small>`; row.appendChild(text);
    const today = document.createElement('button'); today.type = 'button'; today.textContent = t.planToday; today.addEventListener('click', () => bringTaskToToday(entry.id)); row.appendChild(today);
    const next = document.createElement('button'); next.type = 'button'; next.textContent = t.carryNext; next.addEventListener('click', () => carryTaskToNextWeek(entry.id)); row.appendChild(next);
    byId('backlogList').appendChild(row);
  });
}
function initDashboard() {
  loadJournal(); syncJournal();
  ['week', 'month'].forEach(mode => byId(`${mode}View`).addEventListener('click', () => { dashboardMode = mode; renderDashboard(); }));
  function navigate(direction) {
    if (dashboardMode === 'week') dashboardAnchor = addDays(dashboardAnchor, direction * 7);
    else dashboardAnchor = new Date(dashboardAnchor.getFullYear(), dashboardAnchor.getMonth() + direction, 1);
    renderDashboard();
  }
  byId('previousPeriod').addEventListener('click', () => navigate(-1)); byId('nextPeriod').addEventListener('click', () => navigate(1));
  byId('currentPeriod').addEventListener('click', () => { dashboardAnchor = new Date(); renderDashboard(); });
}
