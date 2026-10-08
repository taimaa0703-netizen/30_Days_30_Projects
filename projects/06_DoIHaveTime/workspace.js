// Presentation navigation only; planning, timers and stored data stay in their modules.
const workspaceCopy = {
  en: { workspaceLabel: 'Your workspace', viewTime: 'My time', viewTasks: 'My tasks', viewPlan: 'My plan', viewProgress: 'Progress', goToTasks: 'Next: my tasks', emptyPlanTitle: 'Your next step starts here.', emptyPlanHint: 'Choose your time and add a task. Then build your plan.' },
  he: { workspaceLabel: 'מרחב העבודה שלך', viewTime: 'הזמן שלי', viewTasks: 'המשימות שלי', viewPlan: 'התוכנית שלי', viewProgress: 'ההתקדמות', goToTasks: 'ממשיכים למשימות', emptyPlanTitle: 'הצעד הבא מתחיל כאן.', emptyPlanHint: 'בוחרים זמן ומוסיפים משימה. אחר כך בונים את התוכנית.' },
  ar: { workspaceLabel: 'مساحة التخطيط', viewTime: 'وقتي', viewTasks: 'مهامي', viewPlan: 'خطتي', viewProgress: 'تقدّمي', goToTasks: 'كمّل للمهام', emptyPlanTitle: 'خطوتك الجاية بتبدأ هون.', emptyPlanHint: 'حدّد وقتك وأضف مهمة، وبعدين ابنِ خطتك.' }
};
Object.keys(workspaceCopy).forEach(lang => Object.assign(translations[lang], workspaceCopy[lang]));
Object.assign(translations.en, {viewTime: 'Day settings', viewPlan: 'Day schedule'});
Object.assign(translations.he, {viewTime: 'הגדרות היום', viewPlan: 'סדר היום'});
Object.assign(translations.ar, {viewTime: 'إعدادات اليوم', viewPlan: 'جدول يومي'});
Object.assign(translations.en,{mobileViewTime:'Day',mobileViewTasks:'Tasks',mobileViewPlan:'Schedule',mobileViewProgress:'Progress',mobileViewDiary:'Diary'});
Object.assign(translations.he,{mobileViewTime:'היום',mobileViewTasks:'משימות',mobileViewPlan:'סדר יום',mobileViewProgress:'התקדמות',mobileViewDiary:'מחברת'});
Object.assign(translations.ar,{mobileViewTime:'يومي',mobileViewTasks:'مهامي',mobileViewPlan:'جدولي',mobileViewProgress:'تقدّمي',mobileViewDiary:'دفتري'});
const workspaceViews = ['time', 'tasks', 'plan', 'progress', 'diary'];
const workspaceButtons = ['viewTime', 'viewTasks', 'viewPlan', 'viewProgress', 'viewDiary'].map(byId);
function showWorkspace(view, focus = false) {
  if (!workspaceViews.includes(view)) return;
  const previousView = document.querySelector('.app').getAttribute('data-workspace-view');
  const changed = previousView !== view;
  document.querySelector('.app').setAttribute('data-workspace-view', view);
  workspaceButtons.forEach((button, index) => {
    const selected = workspaceViews[index] === view;
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected && focus) button.focus({ preventScroll: true });
  });
  byId('emptyPlan').classList.toggle('hidden', !!plan);
  if (view === 'diary') renderDiary();
  if (view === 'plan' && typeof refreshTaskNote === 'function') refreshTaskNote();
  if (changed && previousView !== null) {
    const alignNavigation = () => {
      document.querySelector('.workspace-nav')?.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
    };
    // Align after the selected panel has been laid out, including on iOS.
    if (window.requestAnimationFrame) window.requestAnimationFrame(alignNavigation);
    else alignNavigation();
  }
}
workspaceButtons.forEach((button, index) => {
  button.addEventListener('click', () => showWorkspace(workspaceViews[index]));
  button.addEventListener('keydown', event => {
    const rtl = document.documentElement.dir === 'rtl';
    let next;
    const count = workspaceViews.length;
    if (event.key === 'ArrowRight') next = (index + (rtl ? count - 1 : 1)) % count;
    if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : count - 1)) % count;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = count - 1;
    if (next !== undefined) { event.preventDefault(); showWorkspace(workspaceViews[next], true); }
  });
});
byId('goToTasks').addEventListener('click', () => { showWorkspace('tasks'); taskName.focus({ preventScroll: true }); });
byId('emptyPlanTasks').addEventListener('click', () => { showWorkspace('tasks'); taskName.focus({ preventScroll: true }); });
showWorkspace('diary');
changeLanguage(currentLanguage);
