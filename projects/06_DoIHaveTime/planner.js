// Planning and focus session behavior. All durations are stored in whole minutes.
const plannerCopy = {
  en: {
    timeMode: 'Plan by', durationMode: 'Free time', deadlineMode: 'Finish by a time', finishAt: 'Finish today by',
    breakLabel: 'Break after every 45 minutes', breakFive: '5 minutes', breakTen: '10 minutes', noBreaks: 'No breaks',
    bufferLabel: 'Keep 10% free for surprises', mustToday: 'Must do today', canSplit: 'Can start with part of this task',
    focusNow: 'ONE STEP AT A TIME', startSession: 'Start / resume', pauseSession: 'Pause', finishSession: 'Done / next',
    replanSession: 'Running late? Update my plan', breakName: 'A little break', partial: 'First part',
    remaining: 'remaining', done: 'Done', ready: 'Ready when you are.', paused: 'Paused. Your finish time stays the same.',
    running: 'Just this step. Everything else can wait.', overtime: 'Time is up. Finish this step or update your plan.',
    complete: 'Your planned steps are complete. You can plan the remaining tasks.',
    summary: '{work} min of work · {breaks} min of breaks · {buffer} min of breathing room',
    mustWarning: 'Some must-do work does not fit. Reduce its scope or give it more time.',
    fitMessage: 'A plan with room to breathe.', laterMessage: 'Start here. The rest can wait.',
    deadlineAlert: 'Choose a finish time later today.', noTime: 'Your time window has ended. Choose a new time to continue.',
    removeTask: 'Remove task', savedHint: 'Your tasks and settings are saved on this device.'
  },
  he: {
    timeMode: 'איך לתכנן?', durationMode: 'לפי זמן פנוי', deadlineMode: 'לפי שעת סיום', finishAt: 'לסיים היום עד',
    breakLabel: 'הפסקה אחרי כל 45 דקות', breakFive: '5 דקות', breakTen: '10 דקות', noBreaks: 'בלי הפסקות',
    bufferLabel: 'להשאיר 10% פנויים למקרה הצורך', mustToday: 'חובה להיום', canSplit: 'אפשר להתחיל בחלק מהמשימה',
    focusNow: 'צעד אחד בכל פעם', startSession: 'להתחיל / להמשיך', pauseSession: 'השהיה', finishSession: 'סיימתי / הבא',
    replanSession: 'התעכבתי — לעדכן את התוכנית', breakName: 'הפסקה קטנה', partial: 'חלק ראשון',
    remaining: 'נותרו', done: 'הושלם', ready: 'אפשר להתחיל כשנוח לך.', paused: 'בהשהיה. שעת הסיום נשארת קבועה.',
    running: 'רק הצעד הזה. כל השאר יכול לחכות.', overtime: 'הזמן הסתיים. אפשר לסיים את הצעד או לעדכן את התוכנית.',
    complete: 'הצעדים בתוכנית הושלמו. אפשר לתכנן את המשימות שנותרו.',
    summary: '{work} דקות עבודה · {breaks} דקות הפסקה · {buffer} דקות מרווח ביטחון',
    mustWarning: 'חלק ממשימות החובה לא נכנסו בזמן. כדאי לצמצם אותן או לפנות להן יותר זמן.',
    fitMessage: 'תוכנית שמשאירה מקום לנשום.', laterMessage: 'מתחילים כאן. השאר יכול לחכות.',
    deadlineAlert: 'יש לבחור שעת סיום מאוחרת יותר היום.', noTime: 'חלון הזמן הסתיים. יש לבחור זמן חדש כדי להמשיך.',
    removeTask: 'מחיקת משימה', savedHint: 'המשימות וההגדרות נשמרות במכשיר הזה.'
  },
  ar: {
    timeMode: 'طريقة التخطيط', durationMode: 'اكم ساعه او دقيقه فاضي؟', deadlineMode: 'لأي ساعة بدك تخلّص', finishAt: 'نخلّص اليوم قبل الساعة:',
    breakLabel: 'استراحة بعد كل 45 دقيقة', breakFive: '5 دقائق', breakTen: '10 دقائق', noBreaks: 'بدون استراحات',
    bufferLabel: 'نترك 10% لأي إشي مفاجئ', mustToday: 'لازم تخلص اليوم', canSplit: 'ممكن أبدأ بجزء من المهمة',
    focusNow: 'خطوة وحدة كل مرة', startSession: 'ابدأ / كمّل', pauseSession: 'وقّف مؤقتًا', finishSession: 'خلصت / التالي',
    replanSession: 'تأخرت — حدّث خطتي', breakName: 'استراحة صغيرة', partial: 'الجزء الأول',
    remaining: 'باقي', done: 'خلصت', ready: 'ابدأ لما تكون جاهز.', paused: 'متوقف مؤقتًا. وقت النهاية بضل نفسه.',
    running: 'ركّز على هاي الخطوة. الباقي بستنى.', overtime: 'خلص الوقت. خلّص الخطوة أو حدّث خطتك.',
    complete: 'خلصت خطوات الخطة. بتقدر تخطط للمهام اللي ضلّت.',
    summary: '{work} دقيقة شغل · {breaks} دقيقة استراحة · {buffer} دقيقة احتياط',
    mustWarning: 'جزء من المهام الضرورية ما بلحق. قلّل حجمها أو خصّص إلها وقت أكتر.',
    fitMessage: 'خطة بتتركلك مجال تتنفس.', laterMessage: 'ابدأ هون. الباقي بستنى.',
    deadlineAlert: 'اختار وقت نهاية لاحق اليوم.', noTime: 'خلص الوقت المتاح. اختار وقت جديد عشان تكمّل.',
    removeTask: 'حذف المهمة', savedHint: 'مهامك وإعداداتك محفوظة على هاد الجهاز.'
  }
};
const adaptiveCopy = {
  en: {
    energyLabel: 'How is your energy?', energyHigh: 'Full of energy', energyBalanced: 'Doing okay', energyLow: 'Low energy',
    highHint: '45-minute focus blocks, with room for deeper work.', balancedHint: '30-minute blocks. A steady, comfortable pace.', lowHint: 'Light tasks first. Up to 20 minutes per task you allow us to split. You can do more later.',
    effortLabel: 'How much focus does it need?', effortLight: 'Light / simple', effortNormal: 'Some focus', effortDeep: 'Deep focus',
    estimateHint: 'Last time, “{name}” took about {minutes} minutes of focus ({count} completed tasks).', applyEstimate: 'Use this estimate',
    dayChanged: 'My day changed', urgentLabel: 'What urgent task came up?', addUrgent: 'Add and update my plan',
    urgentAdded: 'Your urgent task is in the plan. The finish time stays the same.', urgentDeferred: 'To make room, some work moves to later: {names}.',
    urgentNoFit: 'The urgent task does not fit. Give it more time or reduce its scope.', gentlePart: 'A small start',
    focusLearned: 'Focused time recorded. Next time, we can suggest an estimate.',
    breakAdaptive: 'Break after each focus block',
    savedHint: 'Your tasks, settings and time estimates are saved on this device.'
  },
  he: {
    energyLabel: 'איך האנרגיה שלך עכשיו?', energyHigh: 'מלאת אנרגיה', energyBalanced: 'סבבה', energyLow: 'אין לי הרבה כוח',
    highHint: 'מקטעי ריכוז של 45 דקות, עם מקום לעבודה מעמיקה.', balancedHint: 'מקטעים של 30 דקות. קצב נעים ויציב.', lowHint: 'משימות קלות קודם. עד 20 דקות למשימה שאפשר לחלק. אפשר להמשיך בהמשך.',
    effortLabel: 'כמה ריכוז צריך?', effortLight: 'קלילה / פשוטה', effortNormal: 'קצת ריכוז', effortDeep: 'ריכוז עמוק',
    estimateHint: 'בפעמים הקודמות, ״{name}״ לקחה כ־{minutes} דקות ריכוז ({count} משימות שהושלמו).', applyEstimate: 'להשתמש בהערכה',
    dayChanged: 'היום השתנה', urgentLabel: 'איזו משימה דחופה נכנסה?', addUrgent: 'להוסיף ולעדכן את התוכנית',
    urgentAdded: 'המשימה הדחופה נכנסה לתוכנית. שעת הסיום נשארת קבועה.', urgentDeferred: 'כדי לפנות מקום, חלק מהעבודה נדחה: {names}.',
    urgentNoFit: 'המשימה הדחופה לא נכנסת בזמן. כדאי לפנות עוד זמן או לצמצם אותה.', gentlePart: 'התחלה קטנה',
    focusLearned: 'זמן הריכוז נשמר. בפעם הבאה נוכל להציע הערכה.',
    breakAdaptive: 'הפסקה אחרי כל מקטע ריכוז',
    savedHint: 'המשימות, ההגדרות והערכות הזמן נשמרות במכשיר הזה.'
  },
  ar: {
    energyLabel: 'مستوى طاقتك هلا', energyHigh: 'عندي طاقة عالية', energyBalanced: 'طاقتي متوسطة', energyLow: 'طاقتي قليلة',
    highHint: 'فترات تركيز من 45 دقيقة، مع مجال للشغل العميق.', balancedHint: 'فترات من 30 دقيقة. خطوة خطوة وبراحة.', lowHint: 'المهام الخفيفة أولًا. لحد 20 دقيقة لكل مهمة بتسمح نقسمها. بتقدر تكمّل بعدين.',
    effortLabel: 'مستوى التركيز المطلوب', effortLight: 'مهمة بسيطة', effortNormal: 'تركيز متوسط', effortDeep: 'تركيز عالي',
    estimateHint: 'بالمرات السابقة، «{name}» أخدت حوالي {minutes} دقيقة تركيز ({count} مهام مكتملة).', applyEstimate: 'استخدم هالتقدير',
    dayChanged: 'يومي تغيّر', urgentLabel: 'شو المهمة المستعجلة اللي طلعت؟', addUrgent: 'أضفها وحدّث خطتي',
    urgentAdded: 'المهمة المستعجلة دخلت الخطة. وقت النهاية بضل نفسه.', urgentDeferred: 'عشان نلاقي مجال، جزء من الشغل تأجل: {names}.',
    urgentNoFit: 'المهمة المستعجلة ما بتلحق. خصّص وقت أكتر أو قلّل حجمها.', gentlePart: 'بداية صغيرة',
    focusLearned: 'حفظنا وقت التركيز. المرة الجاية بنقدر نقترح تقدير.',
    breakAdaptive: 'استراحة بعد كل فترة تركيز',
    savedHint: 'مهامك وإعداداتك وتقديرات الوقت محفوظة على هاد الجهاز.'
  }
};
const composerCopy = {
  en: { newTask: 'A new task, a little more clarity.', taskNameLabel: 'What would you like to do?', taskDurationLabel: 'Give it some time', taskPreferences: 'Make it fit your day', durationExample: 'Two and a half hours? Enter 2 hours and 30 minutes.', priorityHighClean: 'High', mustHint: 'Give this a place at the front.', splitHint: 'A small start counts, too.', addTaskClean: 'Add to my tasks', taskComposerHint: 'One task at a time. You can add more next.', taskAdded: 'Added “{name}”. Ready for the next one?' },
  he: { newTask: 'משימה חדשה, קצת יותר סדר.', taskNameLabel: 'מה תרצי לעשות?', taskDurationLabel: 'נותנים לה זמן', taskPreferences: 'מתאימים אותה ליום שלך', durationExample: 'שעתיים וחצי? מזינים 2 שעות ו־30 דקות.', priorityHighClean: 'גבוהה', mustHint: 'המשימה תקבל קדימות בתוכנית.', splitHint: 'גם התחלה קטנה נחשבת.', addTaskClean: 'להוסיף למשימות שלי', taskComposerHint: 'משימה אחת בכל פעם. אחר כך אפשר להוסיף עוד.', taskAdded: '״{name}״ נוספה. מה המשימה הבאה?' },
  ar: { newTask: 'مهمة جديدة، وترتيب أوضح.', taskNameLabel: 'شو حاب تعمل', taskDurationLabel: 'نعطيها وقتها', taskPreferences: 'نرتّبها حسب يومك', durationExample: 'ساعتين ونص؟ اكتب ساعتين و30 دقيقة.', priorityHighClean: 'عالية', mustHint: 'نعطيها أولوية بالخطة.', splitHint: 'حتى البداية الصغيرة بتفرق.', addTaskClean: 'أضف لمهامي', taskComposerHint: 'مهمة وحدة كل مرة. بتقدر تضيف كمان بعدها.', taskAdded: 'أضفنا «{name}». جاهز للمهمة الجاية.' }
};
const usageCopy = {
  en: { usageTitle: 'Your time, made clear', usageIntro: 'Add your tasks and their duration, then choose your free time or finish time. SPARE puts the work that fits into a realistic plan.', usageExtra: 'Start the built-in timer for each step. Come back throughout the week to manage tasks and see your weekly and monthly progress.', findTimeMeaning: '“Find my time” builds a plan inside your available time, with your priorities, energy, breaks and breathing room in mind.' },
  he: { usageTitle: 'הזמן שלך, בצורה ברורה', usageIntro: 'מוסיפים משימות ואת הזמן שהן דורשות, ובוחרים זמן פנוי או שעת סיום. SPARE מסדרת את מה שאפשר להספיק לתוכנית מציאותית.', usageExtra: 'לכל צעד יש טיימר מובנה. אפשר לחזור לאורך השבוע, לנהל משימות ולראות התקדמות שבועית וחודשית.', findTimeMeaning: '״מצא לי את הזמן״ בונה תוכנית בתוך הזמן הפנוי שלך, לפי העדיפויות, האנרגיה, ההפסקות ומרווח הביטחון שבחרת.' },
  ar: { usageTitle: 'رتّب وقتك، خطوة خطوة', usageIntro: 'أضف مهامك والوقت اللي بدها إياه، وحدّد اكم ساعة أو دقيقة فاضي أو بأي ساعة بدك تخلّص. SPARE برتّبلك المهام اللي بتلحق تعملها بخطة واقعية.', usageExtra: 'في تايمر لكل خطوة عشان تتابع وقتك. بتقدر تستعمل الموقع طول الأسبوع، تحفظ مهامك وتنقل اللي ضلّ للأسبوع الجاي، وتشوف تقدّمك الأسبوعي والشهري.', findTimeMeaning: '«رتبلي المهام» يعني رتّبلي المهام اللي بقدر أعملها بالوقت المتاح، حسب أولوياتي وطاقتي، مع الاستراحات ووقت احتياط.' }
};
Object.keys(plannerCopy).forEach(lang => {
  Object.assign(translations[lang], plannerCopy[lang], adaptiveCopy[lang], composerCopy[lang], usageCopy[lang]);
  Object.assign(translations[lang], {
    en: { completeTask: 'Mark task as done', reopenTask: 'Mark task as not done', comfortSettings: 'Breaks & breathing room', energySettings: 'Energy & breaks', optionalPreferences: 'Task preferences (optional)' },
    he: { completeTask: 'לסמן את המשימה כהושלמה', reopenTask: 'לבטל את סימון ההשלמה', comfortSettings: 'הפסקות ומקום לנשום', energySettings: 'אנרגיה והפסקות', optionalPreferences: 'העדפות למשימה (לבחירתך)' },
    ar: { completeTask: 'علّم المهمة كمكتملة', reopenTask: 'إلغاء علامة الاكتمال', comfortSettings: 'استراحات ومجال نتنفس', energySettings: 'الطاقة والاستراحات', optionalPreferences: 'خيارات المهمة (اختياري)' }
  }[lang]);
  translations[lang].breakLabel = translations[lang].breakAdaptive;
});

const byId = id => document.getElementById(id);
let plan = null;
let session = null;
let tickHandle = null;
let nextTaskId = 1;
let timeHistory = [];
let urgentNotice = null;
const settingsIds = ['availableHours', 'availableTime', 'timeMode', 'finishAt', 'breakMinutes', 'useBuffer', 'energyLevel'];

function saveState() {
  syncJournal();
  try {
    const settings = Object.fromEntries(settingsIds.map(id => [id, byId(id).type === 'checkbox' ? byId(id).checked : byId(id).value]));
    localStorage.setItem('sparePlanner', JSON.stringify({ tasks, settings, timeHistory }));
  } catch { /* Planning works even when browser storage is unavailable. */ }
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem('sparePlanner') || 'null');
    if (!saved) return;
    tasks = Array.isArray(saved.tasks) ? saved.tasks.filter(task => Number.isSafeInteger(task.id) && typeof task.name === 'string' &&
      Number.isSafeInteger(task.minutes) && task.minutes > 0 && Number.isSafeInteger(task.remaining) && task.remaining >= 0 &&
      task.remaining <= task.minutes && [1, 2, 3].includes(task.priority)).map(task => ({ ...task, must: !!task.must, canSplit: !!task.canSplit,
        urgent: !!task.urgent, effort: ['light', 'normal', 'deep'].includes(task.effort) ? task.effort : 'normal',
        actualSeconds: Number.isFinite(task.actualSeconds) && task.actualSeconds >= 0 ? task.actualSeconds : 0 })) : [];
    timeHistory = Array.isArray(saved.timeHistory) ? saved.timeHistory.filter(entry => typeof entry.key === 'string' &&
      Array.isArray(entry.samples) && entry.samples.every(sample => Number.isFinite(sample) && sample >= 1 && sample <= 10080))
      .slice(-50).map(entry => ({ key: entry.key, samples: entry.samples.slice(-5) })) : [];
    nextTaskId = Math.max(0, ...tasks.map(task => task.id)) + 1;
    settingsIds.forEach(id => {
      const value = saved.settings?.[id];
      if (byId(id).type === 'checkbox' && typeof value === 'boolean') byId(id).checked = value;
      else if (typeof value === 'string') byId(id).value = value;
    });
  } catch { /* Ignore malformed saved data. */ }
}

function toMinutes(minutesInput, hoursInput) {
  const minutes = Number(minutesInput.value), hours = Number(hoursInput.value);
  if (!Number.isSafeInteger(minutes) || !Number.isSafeInteger(hours) || minutes < 0 || hours < 0) return NaN;
  const total = hours * 60 + minutes;
  return Number.isSafeInteger(total) ? total : NaN;
}

function setAvailableMinutes(total) {
  availableHours.value = Math.floor(total / 60);
  availableTime.value = total % 60;
}

function stopTicker() { clearInterval(tickHandle); tickHandle = null; }
function elapsedSeconds(now = Date.now()) {
  return session ? session.elapsed + (session.running ? Math.max(0, (now - session.startedAt) / 1000) : 0) : 0;
}

function creditCurrentStep() {
  logSessionFocus();
  if (!session || !plan) return;
  const step = plan.steps[session.index];
  if (step?.kind === 'work') {
    const task = tasks.find(task => task.id === step.taskId);
    if (task) {
      task.actualSeconds = (task.actualSeconds || 0) + elapsedSeconds();
      task.remaining = Math.max(0, task.remaining - Math.min(step.minutes, Math.floor(elapsedSeconds() / 60)));
      recordCompletedTask(task);
    }
  }
}

function invalidatePlan() {
  creditCurrentStep();
  stopTicker(); session = null; plan = null; urgentNotice = null;
  byId('results').classList.add('hidden');
  if (typeof showWorkspace === 'function') showWorkspace(document.querySelector('.app').getAttribute('data-workspace-view') || 'time');
  renderTasks();
  saveState();
}

function updateMode() {
  syncDeadlineClock();
  const deadline = byId('timeMode').value === 'deadline';
  byId('durationFields').classList.toggle('hidden', deadline);
  byId('timePresets').classList.toggle('hidden', deadline);
  byId('deadlineFields').classList.toggle('hidden', !deadline);
  syncTaskChoices();
}

function syncDeadlineClock() {
  const match = /^(\d{2}):(\d{2})$/.exec(byId('finishAt').value);
  byId('finishHour').value = match ? Number(match[1]) % 12 || 12 : '';
  byId('finishMinute').value = match ? match[2] : '';
  byId('finishPeriod').value = match && Number(match[1]) >= 12 ? 'PM' : 'AM';
}

function updateDeadlineClock() {
  const hour = Number(byId('finishHour').value);
  const minute = Number(byId('finishMinute').value || 0);
  const valid = Number.isInteger(hour) && hour >= 1 && hour <= 12 && Number.isInteger(minute) && minute >= 0 && minute <= 59;
  byId('finishAt').value = valid
    ? `${String(hour % 12 + (byId('finishPeriod').value === 'PM' ? 12 : 0)).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : '';
  invalidatePlan();
}

['finishHour', 'finishMinute'].forEach(id => byId(id).addEventListener('input', updateDeadlineClock));
byId('finishPeriod').addEventListener('change', updateDeadlineClock);

function getAvailable(now = Date.now()) {
  if (byId('timeMode').value !== 'deadline') return toMinutes(availableTime, availableHours);
  const match = /^(\d{2}):(\d{2})$/.exec(byId('finishAt').value);
  if (!match) return NaN;
  const end = new Date(now);
  end.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return Math.floor((end.getTime() - now) / 60000);
}

// Pure scheduler: reserve buffer, prioritize must-do work, and split only with consent.
function createPlan(source, available, breakMinutes = 5, useBuffer = true, energy = 'high') {
  const focusLimit = energy === 'low' ? 20 : energy === 'balanced' ? 30 : 45;
  const effortRank = { light: 0, normal: 1, deep: 2 };
  const buffer = useBuffer ? Math.ceil(available * .1) : 0;
  const budget = Math.max(0, available - buffer);
  const steps = [], later = [];
  let used = 0, workSinceBreak = 0;
  const sorted = source.filter(task => task.remaining > 0).slice().sort((a, b) =>
    Number(b.urgent || false) - Number(a.urgent || false) || Number(b.must) - Number(a.must) ||
    (energy === 'low' ? (effortRank[a.effort || 'normal'] - effortRank[b.effort || 'normal']) : 0) ||
    b.priority - a.priority || a.remaining - b.remaining);
  function schedule(task, target, commit) {
    let cost = 0, work = 0, since = workSinceBreak;
    const additions = [];
    while (work < target) {
      const pause = breakMinutes && since >= focusLimit ? breakMinutes : 0;
      const room = budget - used - cost - pause;
      if (room <= 0) break;
      const chunk = Math.min(target - work, breakMinutes ? focusLimit - (pause ? 0 : since) : focusLimit, room);
      if (chunk <= 0 || (chunk < 10 && work + chunk < target)) break;
      if (pause) { additions.push({ kind: 'break', minutes: pause }); cost += pause; since = 0; }
      additions.push({ kind: 'work', taskId: task.id, name: task.name, minutes: chunk, must: task.must });
      work += chunk; cost += chunk; since += chunk;
    }
    if (commit) { steps.push(...additions); used += cost; workSinceBreak = since; }
    return work;
  }
  sorted.forEach(task => {
    const target = energy === 'low' && task.canSplit ? Math.min(20, task.remaining) : task.remaining;
    const fits = schedule(task, target, false) === target;
    const allocated = fits || task.canSplit ? schedule(task, target, true) : 0;
    if (allocated < task.remaining) later.push({ ...task, remaining: task.remaining - allocated, partial: allocated > 0 });
  });
  return { steps, later, available, buffer, used, energy, work: steps.filter(s => s.kind === 'work').reduce((n, s) => n + s.minutes, 0) };
}

function buildPlan(options = {}) {
  const t = translations[currentLanguage];
  const now = Date.now();
  const end = options.end || (plan?.end ?? null);
  const available = end ? Math.floor((end - now) / 60000) : getAvailable(now);
  if (!Number.isFinite(available) || available <= 0) {
    alert(end ? t.noTime : byId('timeMode').value === 'deadline' ? t.deadlineAlert : t.timeAlert);
    return;
  }
  creditCurrentStep(); stopTicker(); session = null;
  if (!tasks.some(task => task.remaining > 0)) { plan = null; byId('results').classList.add('hidden'); renderTasks(); saveState(); alert(t.noTasksAlert); return; }
  urgentNotice = null;
  plan = createPlan(tasks, available, Number(byId('breakMinutes').value), byId('useBuffer').checked, byId('energyLevel').value);
  plan.start = now;
  plan.end = end || now + available * 60000;
  session = { index: 0, elapsed: 0, startedAt: null, running: false };
  renderTasks(); renderPlan(); saveState();
  if (options.scroll !== false) {
    if (typeof showWorkspace === 'function') showWorkspace('plan');
    else byId('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function addTask() {
  const name = taskName.value.trim(), minutes = toMinutes(taskMinutes, taskHours);
  if (!name || !Number.isFinite(minutes) || minutes <= 0) { alert(translations[currentLanguage].addTaskAlert); return; }
  invalidatePlan();
  tasks.push({ id: nextTaskId++, name, minutes, remaining: minutes, priority: Number(priority.value),
    must: byId('mustToday').checked, canSplit: byId('canSplit').checked, effort: byId('taskEffort').value, actualSeconds: 0 });
  taskName.value = taskMinutes.value = taskHours.value = '';
  priority.value = '3'; byId('mustToday').checked = false;
  byId('taskEffort').value = 'normal'; renderEstimate();
  syncTaskChoices();
  byId('taskFeedback').textContent = translations[currentLanguage].taskAdded.replace('{name}', name);
  renderTasks(); saveState(); taskName.focus();
}

function removeTask(id) { invalidatePlan(); markJournalDeleted(tasks.find(task => task.id === id)); tasks = tasks.filter(task => task.id !== id); renderTasks(); saveState(); }
function toggleTaskDone(id) {
  const task = tasks.find(task => task.id === id);
  if (!task) return;
  const wasDone = task.remaining === 0;
  const end = plan?.end;
  invalidatePlan();
  if (wasDone) {
    task.remaining = Number.isSafeInteger(task.completionRemaining) && task.completionRemaining > 0
      ? Math.min(task.minutes, task.completionRemaining) : task.minutes;
    delete task.completionRemaining;
  } else {
    task.completionRemaining = task.remaining || task.minutes;
    task.remaining = 0;
  }
  renderTasks(); saveState();
  if (end && end - Date.now() >= 60000 && tasks.some(task => task.remaining > 0)) buildPlan({ end, scroll: false });
}
function getPriorityText(value) { const t = translations[currentLanguage]; return value === 3 ? t.high : value === 2 ? t.medium : t.low; }
function formatDuration(minutes) {
  const t = translations[currentLanguage], h = Math.floor(minutes / 60), m = minutes % 60;
  return [h ? `${h} ${t.hours}` : '', m || !h ? `${m} ${t.minutesShort}` : ''].filter(Boolean).join(' · ');
}
function escapeHTML(value) { const div = document.createElement('div'); div.textContent = String(value); return div.innerHTML; }
function renderTasks() {
  const t = translations[currentLanguage];
  taskCount.textContent = `${tasks.filter(task => task.remaining > 0).length} ${t.tasks}`;
  byId('emptyTasks').classList.toggle('hidden', tasks.length > 0);
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const item = document.createElement('div'); item.className = `task-item${task.remaining === 0 ? ' completed-task' : ''}`;
    const check = document.createElement('button');
    check.type = 'button'; check.className = 'task-check'; check.textContent = '✓';
    check.setAttribute('role', 'checkbox'); check.setAttribute('aria-checked', String(task.remaining === 0));
    check.setAttribute('aria-label', `${task.remaining === 0 ? t.reopenTask : t.completeTask}: ${task.name}`);
    check.addEventListener('click', () => toggleTaskDone(task.id));
    item.innerHTML = `<div class="task-info"><strong>${escapeHTML(task.name)}</strong><span class="task-meta"><span class="task-duration-badge">${task.remaining === 0 ? t.done : formatDuration(task.remaining)}</span><span class="task-priority-badge">${task.must ? t.mustToday : getPriorityText(task.priority)}</span></span></div>`;
    item.prepend(check);
    const remove = document.createElement('button'); remove.className = 'remove-btn'; remove.textContent = '×';
    remove.setAttribute('aria-label', `${t.removeTask}: ${task.name}`); remove.addEventListener('click', () => removeTask(task.id));
    item.appendChild(remove); taskList.appendChild(item);
  });
}

function clockTime(timestamp) { return new Date(timestamp).toLocaleTimeString(currentLanguage === 'ar' ? 'ar' : currentLanguage === 'he' ? 'he-IL' : 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); }
function renderPlan() {
  if (!plan) return;
  const t = translations[currentLanguage];
  let minute = 0;
  byId('plannedTasks').innerHTML = plan.steps.map((step, index) => {
    const start = plan.start + minute * 60000; minute += step.minutes;
    const task = tasks.find(task => task.id === step.taskId);
    const isPartial = plan.later.some(task => task.id === step.taskId && task.partial);
    return `<div class="plan-item ${step.kind === 'break' ? 'break-step' : ''} ${index < session.index ? 'completed-task' : ''}">
      <div class="plan-time">${clockTime(start)} → ${clockTime(plan.start + minute * 60000)}</div>
      <div class="plan-name">${escapeHTML(step.kind === 'break' ? t.breakName : step.name)}<small>${formatDuration(step.minutes)}${task?.must ? ` · ${t.mustToday}` : ''}${isPartial ? ` · ${plan.energy === 'low' ? t.gentlePart : t.partial}` : ''}</small></div></div>`;
  }).join('') || `<p>${t.nothingFits}</p>`;
  byId('laterTasks').innerHTML = plan.later.map(task => `<div class="plan-item later-item"><div class="plan-name">${escapeHTML(task.name)}<small>${formatDuration(task.remaining)} · ${t.remaining}${task.must ? ` · ${t.mustToday}` : ''}</small></div></div>`).join('');
  byId('laterCard').classList.toggle('hidden', !plan.later.length);
  byId('timeUsed').textContent = `${formatDuration(plan.used)} / ${formatDuration(plan.available)}`;
  byId('progressBar').style.width = `${plan.used / plan.available * 100}%`;
  byId('planSummary').textContent = t.summary.replace('{work}', plan.work).replace('{breaks}', plan.used - plan.work).replace('{buffer}', plan.buffer);
  byId('realityMessage').textContent = plan.later.some(task => task.must) ? t.mustWarning : plan.later.length ? t.laterMessage : t.fitMessage;
  byId('results').classList.remove('hidden'); renderSession(); renderUrgentNotice();
}

function renderSession() {
  const t = translations[currentLanguage], step = plan?.steps[session?.index];
  byId('sessionCard').classList.toggle('break-session', step?.kind === 'break');
  byId('sessionCard').classList.toggle('hidden', !plan?.steps.length);
  if (!step) {
    byId('sessionName').textContent = t.complete; byId('timerDisplay').textContent = '00:00'; byId('sessionStatus').textContent = '';
    ['startSession', 'pauseSession', 'finishSession'].forEach(id => { byId(id).disabled = true; });
    return;
  }
  const remaining = Math.ceil(step.minutes * 60 - elapsedSeconds());
  const seconds = Math.abs(remaining), hours = Math.floor(seconds / 3600);
  byId('timerDisplay').textContent = `${remaining < 0 ? '+' : ''}${hours ? `${String(hours).padStart(2, '0')}:` : ''}${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  byId('sessionName').textContent = step.kind === 'break' ? t.breakName : step.name;
  const status = Date.now() >= plan.end ? 'noTime' : remaining <= 0 ? 'overtime' : session.running ? 'running' : session.elapsed ? 'paused' : 'ready';
  if (byId('sessionStatus').textContent !== t[status]) byId('sessionStatus').textContent = t[status];
  byId('startSession').disabled = session.running; byId('pauseSession').disabled = !session.running; byId('finishSession').disabled = false;
}

function startSession() {
  if (!session || !plan?.steps[session.index] || session.running) return;
  if (Date.now() >= plan.end) { alert(translations[currentLanguage].noTime); return; }
  session.startedAt = Date.now(); session.running = true;
  stopTicker(); tickHandle = setInterval(() => {
    renderSession();
    if (elapsedSeconds() - (session?.loggedSeconds || 0) >= 15) logSessionFocus();
  }, 1000); renderSession();
}
function pauseSession() {
  if (!session?.running) return;
  logSessionFocus();
  session.elapsed = elapsedSeconds(); session.running = false; stopTicker(); renderSession();
}
function finishSession() {
  const step = plan?.steps[session?.index]; if (!step) return;
  logSessionFocus();
  if (step.kind === 'work') {
    const task = tasks.find(task => task.id === step.taskId);
    if (task) {
      task.actualSeconds = (task.actualSeconds || 0) + elapsedSeconds();
      task.remaining = Math.max(0, task.remaining - step.minutes);
      recordCompletedTask(task);
    }
  }
  stopTicker(); session.index++; session.elapsed = 0; session.loggedSeconds = 0; session.running = false; session.startedAt = null;
  renderTasks(); renderPlan(); saveState();
}
function replanSession() { if (plan) buildPlan({ end: plan.end, scroll: false }); }
function changeLanguage(lang) {
  currentLanguage = translations[lang] ? lang : 'en';
  const t = translations[currentLanguage];
  document.documentElement.lang = currentLanguage; document.documentElement.dir = currentLanguage === 'en' ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-i18n]').forEach(el => { if (t[el.dataset.i18n]) el.textContent = t[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t[el.dataset.i18nPlaceholder]; });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => { el.setAttribute('aria-label', t[el.dataset.i18nAriaLabel]); });
  document.querySelectorAll('.lang-btn').forEach(el => { el.classList.toggle('active', el.dataset.lang === currentLanguage); el.setAttribute('aria-pressed', String(el.dataset.lang === currentLanguage)); });
  try { localStorage.setItem('spareLanguage', currentLanguage); } catch {}
  renderTasks(); if (plan) renderPlan();
  renderEnergyHint(); renderEstimate(); renderUrgentNotice();
  syncTaskChoices();
  renderDashboard();
}
function resetApp() {
  creditCurrentStep(); syncJournal();
  stopTicker(); tasks = []; session = null; plan = null; urgentNotice = null;
  ['availableTime', 'availableHours', 'taskName', 'taskHours', 'taskMinutes', 'finishAt'].forEach(id => { byId(id).value = ''; });
  byId('timeMode').value = 'duration'; byId('breakMinutes').value = '5'; byId('useBuffer').checked = true;
  byId('mustToday').checked = false; byId('canSplit').checked = true; priority.value = '3';
  byId('energyLevel').value = 'balanced'; byId('taskEffort').value = 'normal';
  setUrgentPanel(false); renderEnergyHint(); renderEstimate(); renderUrgentNotice();
  syncTaskChoices(); byId('taskFeedback').textContent = translations[currentLanguage].taskComposerHint;
  updateMode(); renderTasks(); byId('results').classList.add('hidden'); saveState(); window.scrollTo({ top: 0, behavior: 'smooth' });
  if (typeof showWorkspace === 'function') showWorkspace('time');
}

function historyKey(name) { return name.trim().normalize('NFC').toLocaleLowerCase().replace(/\s+/g, ' '); }
function recordCompletedTask(task) {
  if (task.remaining !== 0 || task.historyRecorded || (task.actualSeconds || 0) < 60) return;
  const minutes = Math.round(task.actualSeconds / 60);
  if (minutes > 10080) return;
  const key = historyKey(task.name);
  let entry = timeHistory.find(entry => entry.key === key);
  if (!entry) { entry = { key, samples: [] }; timeHistory.push(entry); }
  entry.samples.push(minutes); entry.samples = entry.samples.slice(-5);
  timeHistory = timeHistory.slice(-50); task.historyRecorded = true;
}
function getSuggestedMinutes(name) {
  const entry = timeHistory.find(entry => entry.key === historyKey(name));
  return entry?.samples.length ? Math.max(1, Math.round(entry.samples.reduce((a, b) => a + b, 0) / entry.samples.length)) : null;
}
function renderEstimate() {
  const suggestion = getSuggestedMinutes(taskName.value);
  byId('estimateSuggestion').classList.toggle('hidden', suggestion === null);
  if (suggestion === null) return;
  const entry = timeHistory.find(entry => entry.key === historyKey(taskName.value));
  byId('estimateText').textContent = translations[currentLanguage].estimateHint.replace('{name}', taskName.value.trim())
    .replace('{minutes}', suggestion).replace('{count}', entry.samples.length);
}
function renderEnergyHint() {
  const energy = byId('energyLevel').value;
  byId('energyHint').textContent = translations[currentLanguage][energy === 'low' ? 'lowHint' : energy === 'high' ? 'highHint' : 'balancedHint'];
}
function setUrgentPanel(open) {
  byId('urgentPanel').classList.toggle('hidden', !open);
  byId('dayChanged').setAttribute('aria-expanded', String(open));
  if (open) byId('urgentName').focus();
}
function renderUrgentNotice() {
  byId('planNotice').classList.toggle('hidden', !urgentNotice);
  if (!urgentNotice) return;
  const t = translations[currentLanguage];
  byId('planNotice').textContent = urgentNotice.fits ? t.urgentAdded : t.urgentNoFit;
  if (urgentNotice.deferred.length) byId('planNotice').textContent += ` ${t.urgentDeferred.replace('{names}', urgentNotice.deferred.join(', '))}`;
}
function addUrgentTask() {
  const name = byId('urgentName').value.trim();
  const minutes = toMinutes(byId('urgentMinutes'), byId('urgentHours'));
  if (!name || !Number.isFinite(minutes) || minutes <= 0) { alert(translations[currentLanguage].addTaskAlert); return; }
  if (!plan || plan.end - Date.now() < 60000) { alert(translations[currentLanguage].noTime); return; }
  const end = plan.end;
  const previous = new Map();
  plan.steps.slice(session.index).filter(step => step.kind === 'work').forEach(step => previous.set(step.taskId, (previous.get(step.taskId) || 0) + step.minutes));
  // Remove only progress from the current step; completed earlier steps already reduced remaining.
  const current = plan.steps[session.index];
  if (current?.kind === 'work') previous.set(current.taskId, Math.max(0, previous.get(current.taskId) - Math.min(current.minutes, Math.floor(elapsedSeconds() / 60))));
  invalidatePlan();
  const task = { id: nextTaskId++, name, minutes, remaining: minutes, priority: 3, must: true, urgent: true, canSplit: true, effort: 'normal', actualSeconds: 0 };
  tasks.push(task);
  buildPlan({ end, scroll: false });
  const allocated = new Map();
  plan.steps.filter(step => step.kind === 'work').forEach(step => allocated.set(step.taskId, (allocated.get(step.taskId) || 0) + step.minutes));
  const deferred = tasks.filter(task => (previous.get(task.id) || 0) > (allocated.get(task.id) || 0)).map(task => task.name);
  urgentNotice = { fits: (allocated.get(task.id) || 0) > 0, deferred };
  byId('urgentName').value = byId('urgentHours').value = byId('urgentMinutes').value = '';
  setUrgentPanel(false); renderUrgentNotice(); saveState();
}

function syncTaskChoices() {
  document.querySelectorAll('[data-choice-target]').forEach(button => {
    const active = byId(button.dataset.choiceTarget).value === button.dataset.value;
    button.setAttribute('aria-pressed', String(active));
  });
}
document.querySelectorAll('[data-choice-target]').forEach(button => {
  button.addEventListener('click', () => {
    byId(button.dataset.choiceTarget).value = button.dataset.value;
    syncTaskChoices();
    if (settingsIds.includes(button.dataset.choiceTarget)) byId(button.dataset.choiceTarget).dispatchEvent(new Event('change', { bubbles: true }));
  });
});
byId('dayChanged').addEventListener('click', () => setUrgentPanel(byId('urgentPanel').classList.contains('hidden')));
byId('addUrgent').addEventListener('click', addUrgentTask);
['urgentName', 'urgentHours', 'urgentMinutes'].forEach(id => byId(id).addEventListener('keydown', event => { if (event.key === 'Enter') addUrgentTask(); }));
taskName.addEventListener('input', renderEstimate);
byId('applyEstimate').addEventListener('click', () => {
  const minutes = getSuggestedMinutes(taskName.value); if (minutes === null) return;
  taskHours.value = Math.floor(minutes / 60); taskMinutes.value = minutes % 60;
});
byId('addTask').addEventListener('click', addTask);
byId('buildPlan').addEventListener('click', () => buildPlan());
byId('reset').addEventListener('click', resetApp);
byId('startSession').addEventListener('click', startSession);
byId('pauseSession').addEventListener('click', pauseSession);
byId('finishSession').addEventListener('click', finishSession);
byId('replanSession').addEventListener('click', replanSession);
[taskName, taskMinutes, taskHours].forEach(el => el.addEventListener('keydown', event => { if (event.key === 'Enter') addTask(); }));
settingsIds.forEach(id => byId(id).addEventListener('change', () => {
  if (id === 'energyLevel' && plan) replanSession();
  else invalidatePlan();
  updateMode(); renderEnergyHint(); saveState();
}));
[availableTime, availableHours, byId('finishAt')].forEach(el => el.addEventListener('input', invalidatePlan));
document.querySelectorAll('[data-minutes]').forEach(el => el.addEventListener('click', () => { invalidatePlan(); byId('timeMode').value = 'duration'; setAvailableMinutes(Number(el.dataset.minutes)); updateMode(); saveState(); }));
document.querySelectorAll('.lang-btn').forEach(el => el.addEventListener('click', () => changeLanguage(el.dataset.lang)));
restoreState(); updateMode();
let savedLanguage = 'en'; try { savedLanguage = localStorage.getItem('spareLanguage') || 'en'; } catch {}
changeLanguage(savedLanguage);
initDashboard();
window.addEventListener?.('pagehide', () => { creditCurrentStep(); stopTicker(); session = null; plan = null; saveState(); });
