// Presentation navigation only; planning, timers and stored data stay in their modules.
const workspaceCopy = {
  en: { workspaceLabel: 'Your workspace', viewTime: 'My time', viewTasks: 'My tasks', viewPlan: 'My plan', viewProgress: 'Progress', goToTasks: 'Next: my tasks', emptyPlanTitle: 'Your next step starts here.', emptyPlanHint: 'Choose your time and add a task. Then build your plan.' },
  he: { workspaceLabel: 'מרחב העבודה שלך', viewTime: 'הזמן שלי', viewTasks: 'המשימות שלי', viewPlan: 'התוכנית שלי', viewProgress: 'ההתקדמות', goToTasks: 'ממשיכים למשימות', emptyPlanTitle: 'הצעד הבא מתחיל כאן.', emptyPlanHint: 'בוחרים זמן ומוסיפים משימה. אחר כך בונים את התוכנית.' },
  ar: { workspaceLabel: 'مساحة التخطيط', viewTime: 'وقتي', viewTasks: 'مهامي', viewPlan: 'خطتي', viewProgress: 'تقدّمي', goToTasks: 'كمّل للمهام', emptyPlanTitle: 'خطوتك الجاية بتبدأ هون.', emptyPlanHint: 'حدّد وقتك وأضف مهمة، وبعدين ابنِ خطتك.' }
};
Object.keys(workspaceCopy).forEach(lang => Object.assign(translations[lang], workspaceCopy[lang]));
const workspaceViews = ['time', 'tasks', 'plan', 'progress'];
const workspaceButtons = ['viewTime', 'viewTasks', 'viewPlan', 'viewProgress'].map(byId);
function showWorkspace(view, focus = false) {
  if (!workspaceViews.includes(view)) return;
  document.querySelector('.app').setAttribute('data-workspace-view', view);
  workspaceButtons.forEach((button, index) => {
    const selected = workspaceViews[index] === view;
    button.setAttribute('aria-selected', String(selected));
    button.setAttribute('tabindex', selected ? '0' : '-1');
    if (selected && focus) button.focus();
  });
  byId('emptyPlan').classList.toggle('hidden', !!plan);
}
workspaceButtons.forEach((button, index) => {
  button.addEventListener('click', () => showWorkspace(workspaceViews[index]));
  button.addEventListener('keydown', event => {
    const rtl = document.documentElement.dir === 'rtl';
    let next;
    if (event.key === 'ArrowRight') next = (index + (rtl ? 3 : 1)) % 4;
    if (event.key === 'ArrowLeft') next = (index + (rtl ? 1 : 3)) % 4;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = 3;
    if (next !== undefined) { event.preventDefault(); showWorkspace(workspaceViews[next], true); }
  });
});
byId('goToTasks').addEventListener('click', () => { showWorkspace('tasks'); taskName.focus(); });
byId('emptyPlanTasks').addEventListener('click', () => { showWorkspace('tasks'); taskName.focus(); });
showWorkspace('time');
changeLanguage(currentLanguage);
