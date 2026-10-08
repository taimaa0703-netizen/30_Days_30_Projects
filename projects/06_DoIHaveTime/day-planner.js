// Today's fixed appointments complement flexible tasks; they never consume task progress.
let appointments = [];
const dayCopy = {
  en: { startLabel: 'When do you want to start?', startNow: 'Start now', startLater: 'Choose a time today', startHint: 'Choose your start, then your available duration or finish time.', fixedTitle: 'Have a meeting at a fixed time?', fixedHint: 'Add today’s appointments. Tasks fit around them. Appointments must be inside your time window.', fixedName: 'Appointment name', fixedStart: 'Starts at', fixedDuration: 'Duration in minutes', addFixed: 'Add appointment', fixedInvalid: 'Enter a name, valid start time and duration.', fixedOverlap: 'Appointments cannot overlap. Adjust their times.', fixedOutside: 'Each appointment must fit inside your chosen time window.', startInvalid: 'Choose a start time later today, with a finish after it.', scheduledWait: 'Your plan starts at {time}. You can view it now; the timer becomes available then.', appointmentLabel: 'Fixed appointment', freeSlot: 'Free time', reserveSlot: 'Room for surprises', viewDayTitle: 'Here is how your day could look', saveForLater: 'These tasks need another time' },
  he: { startLabel: 'מתי תרצה להתחיל?', startNow: 'מתחילים עכשיו', startLater: 'בחירת שעה היום', startHint: 'בחר שעת התחלה, ואז משך זמן פנוי או שעת סיום.', fixedTitle: 'יש פגישה בשעה קבועה?', fixedHint: 'הוסף התחייבויות להיום. המשימות יסתדרו סביבן. כל התחייבות צריכה להיות בתוך חלון הזמן שבחרת.', fixedName: 'שם ההתחייבות', fixedStart: 'מתחילה בשעה', fixedDuration: 'משך בדקות', addFixed: 'הוסף התחייבות', fixedInvalid: 'הזן שם, שעת התחלה תקינה ומשך זמן.', fixedOverlap: 'התחייבויות לא יכולות לחפוף. עדכן את השעות.', fixedOutside: 'כל התחייבות צריכה להיכנס לחלון הזמן שבחרת.', startInvalid: 'בחר שעת התחלה מאוחרת יותר היום, עם שעת סיום אחריה.', scheduledWait: 'התוכנית מתחילה ב־{time}. אפשר לצפות בה עכשיו; הטיימר יהיה זמין בשעת ההתחלה.', appointmentLabel: 'התחייבות קבועה', freeSlot: 'זמן פנוי', reserveSlot: 'מרווח למקרה הצורך', viewDayTitle: 'כך היום שלך יכול להיראות', saveForLater: 'המשימות האלה צריכות זמן אחר' },
  ar: { startLabel: 'من أي ساعة بدك تبدأ؟', startNow: 'ابدأ الان', startLater: 'اختار ساعة اليوم', startHint: 'حدّد البداية، وبعدين اكم وقت فاضي أو لأي ساعة بدك تخلّص.', fixedTitle: 'عندك موعد بساعة ثابتة؟', fixedHint: 'أضف مواعيدك لليوم. بنرتّب المهام حواليها. لازم كل موعد يكون ضمن الوقت اللي حدّدته.', fixedName: 'اسم الموعد', fixedStart: 'ببدأ الساعة', fixedDuration: 'مدة الموعد بالدقائق', addFixed: 'أضف الموعد', fixedInvalid: 'اكتب اسم الموعد، ساعة صحيحة ومدة.', fixedOverlap: 'المواعيد ما بنفع تتداخل. عدّل ساعاتها.', fixedOutside: 'لازم كل موعد يكون ضمن الوقت اللي حدّدته.', startInvalid: 'اختار ساعة بداية لاحق اليوم، والنهاية تكون بعدها.', scheduledWait: 'خطتك بتبدأ الساعة {time}. بتقدر تشوفها هلا، والتايمر بصير متاح بوقت البداية.', appointmentLabel: 'موعد ثابت', freeSlot: 'وقت فاضي', reserveSlot: 'مجال لأي إشي مفاجئ', viewDayTitle: 'هيك ممكن يمشي يومك', saveForLater: 'هاي المهام بدها وقت ثاني' }
};
Object.keys(dayCopy).forEach(lang => Object.assign(translations[lang], dayCopy[lang]));

function readDayClock(prefix, now = Date.now()) {
  const hour = Number(byId(prefix + 'Hour').value), minute = Number(byId(prefix + 'Minute').value || 0);
  if (!Number.isInteger(hour) || hour < 1 || hour > 12 || !Number.isInteger(minute) || minute < 0 || minute > 59) return NaN;
  const date = selectedPlanningDay(now);
  date.setHours(hour % 12 + (byId(prefix + 'Period').value === 'PM' ? 12 : 0), minute, 0, 0);
  return date.getTime();
}
function planningStart(now = Date.now()) {
  if (byId('diaryDate').value && localDateKey(selectedPlanningDay(now)) !== localDateKey(new Date(now)) && byId('startMode').value !== 'later') return NaN;
  return byId('startMode').value === 'later' ? readDayClock('start', now) : now;
}
function addAppointment() {
  const t = translations[currentLanguage], name = byId('fixedName').value.trim();
  const start = readDayClock('fixed'), minutes = Number(byId('fixedDuration').value);
  if (!name || !Number.isFinite(start) || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440) { alert(t.fixedInvalid); return; }
  const end = start + minutes * 60000;
  if (appointments.some(item => start < item.end && end > item.start)) { alert(t.fixedOverlap); return; }
  invalidatePlan();
  appointments.push({ id: `${Date.now()}-${appointments.length}`, name, start, end });
  appointments.sort((a, b) => a.start - b.start);
  ['fixedName', 'fixedHour', 'fixedMinute', 'fixedDuration'].forEach(id => byId(id).value = '');
  renderAppointments(); saveState();
}
function renderAppointments() {
  byId('fixedList').innerHTML = '';
  appointments.filter(item => localDateKey(new Date(item.start)) === localDateKey(selectedPlanningDay())).forEach(item => {
    const row = document.createElement('div'); row.className = 'fixed-item';
    row.innerHTML = `<div><strong>${escapeHTML(item.name)}</strong><small>${clockTime(item.start)} → ${clockTime(item.end)}</small></div>`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×';
    remove.setAttribute('aria-label', `${translations[currentLanguage].removeTask}: ${item.name}`);
    remove.addEventListener('click', () => { invalidatePlan(); appointments = appointments.filter(a => a.id !== item.id); renderAppointments(); saveState(); });
    row.appendChild(remove); byId('fixedList').appendChild(row);
  });
}

function createDayPlan(source, available, breaks, useBuffer, energy, start, fixed, preferred = 'auto') {
  const remaining = source.map(task => ({ ...task }));
  const occupied = fixed.reduce((total, item) => total + (item.end - item.start) / 60000, 0);
  const steps = [], buffer = useBuffer ? Math.min(Math.ceil(available * .1), Math.max(0, available - occupied)) : 0;
  let cursor = start, reserveRemaining = buffer;
  const end = start + available * 60000;
  // Reserve breathing room from the latest available gaps, never from a meeting.
  const gaps = []; let previous = start;
  fixed.forEach(item => { gaps.push({ start: previous, end: item.start, after: item }); previous = item.end; });
  gaps.push({ start: previous, end });
  for (let i = gaps.length - 1; i >= 0; i--) {
    const capacity = Math.floor((gaps[i].end - gaps[i].start) / 60000);
    gaps[i].reserve = Math.min(capacity, reserveRemaining); reserveRemaining -= gaps[i].reserve;
  }
  gaps.forEach(gap => {
    const room = Math.floor((gap.end - gap.start) / 60000) - gap.reserve;
    const eligible = remaining.map(task => energy === 'low' && task.canSplit ? { ...task, remaining: Math.min(task.remaining, Math.max(0, 20 - (source.find(original => original.id === task.id).remaining - task.remaining))) } : task);
    const part = createPlan(eligible, room, breaks, false, energy, preferred);
    const first = steps.length;
    steps.push(...part.steps);
    part.steps.forEach(step => { if (step.kind === 'work') remaining.find(task => task.id === step.taskId).remaining -= step.minutes; });
    if (room > part.used) steps.push({ kind: 'free', minutes: room - part.used });
    if (gap.reserve) steps.push({ kind: 'reserve', minutes: gap.reserve });
    if (gap.after) steps.push({ kind: 'appointment', name: gap.after.name, minutes: (gap.after.end - gap.after.start) / 60000 });
    cursor = gap.start;
    steps.slice(first).forEach(step => { step.start = step.kind === 'appointment' ? gap.after.start : cursor; cursor = step.start + step.minutes * 60000; });
  });
  let work = 0, appointmentMinutes = 0, breakTotal = 0;
  steps.forEach(step => { if (step.kind === 'work') work += step.minutes; if (step.kind === 'appointment') appointmentMinutes += step.minutes; if (step.kind === 'break') breakTotal += step.minutes; });
  return { steps, later: remaining.filter(task => task.remaining > 0).map(task => ({ ...task, partial: task.remaining < source.find(original => original.id === task.id).remaining })), available, buffer, used: work + breakTotal + appointmentMinutes, work, appointmentMinutes, energy };
}
