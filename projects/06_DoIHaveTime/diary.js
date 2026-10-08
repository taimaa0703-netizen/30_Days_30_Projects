// Saved calendar snapshots are independent of the live timer and task progress.
let diaryDays = {};
let diarySelected = localDateKey();
let diaryAnchor = new Date();
let diaryScrolledDay = null;
const diaryPixelsPerMinute = 3;
const diaryEventCopy = {
  en:{diaryAddEvent:'Add an event',diarySaveEvent:'Save event',diaryCancel:'Cancel',diaryEventInvalid:'Enter a valid date, name, time and duration.',diaryEventConflict:'This event overlaps a task or appointment. Choose another time.',diaryEventDayEnd:'The event must finish within the selected day.',diaryEventSaved:'Event added to your diary.'},
  he:{diaryAddEvent:'הוספת אירוע',diarySaveEvent:'שמור אירוע',diaryCancel:'ביטול',diaryEventInvalid:'הזן תאריך, שם, שעה ומשך תקינים.',diaryEventConflict:'האירוע חופף למשימה או לפגישה. בחר שעה אחרת.',diaryEventDayEnd:'האירוע צריך להסתיים בתוך היום שנבחר.',diaryEventSaved:'האירוע נוסף ליומן שלך.'},
  ar:{diaryAddEvent:'أضف حدث',diarySaveEvent:'احفظ الحدث',diaryCancel:'إلغاء',diaryEventInvalid:'اكتب تاريخ، اسم، ساعة ومدة صحيحة.',diaryEventConflict:'الحدث بتداخل مع مهمة أو موعد. اختار ساعة ثانية.',diaryEventDayEnd:'لازم الحدث يخلص ضمن اليوم اللي اخترته.',diaryEventSaved:'أضفنا الحدث لدفترك.'}
};
Object.keys(diaryEventCopy).forEach(lang=>Object.assign(translations[lang],diaryEventCopy[lang]));
Object.assign(translations.en,{diaryWeeklyGrid:'Weekly grid'});
Object.assign(translations.he,{diaryWeeklyGrid:'טבלה שבועית'});
Object.assign(translations.ar,{diaryWeeklyGrid:'جدول الأسبوع'});
function openDiaryEvent(key) {
  byId('diaryEventDate').value=key;byId('diaryEventName').value='';
  byId('diaryEventHour').value='9';byId('diaryEventMinute').value='0';byId('diaryEventPeriod').value='AM';byId('diaryEventDuration').value='30';
  byId('diaryEventError').textContent='';byId('diaryEventDialog').showModal();byId('diaryEventName').focus();
}
function insertDiaryEvent(day, event) {
  if(day?.steps.some(step=>!['free','reserve'].includes(step.kind)&&event.start<step.end&&event.end>step.start))return null;
  const steps=[];
  (day?.steps||[]).forEach(step=>{
    if(event.start>=step.end||event.end<=step.start){steps.push({...step});return;}
    if(step.start<event.start)steps.push({...step,end:event.start});
    if(step.end>event.end)steps.push({...step,start:event.end});
  });
  steps.push(event);steps.sort((a,b)=>a.start-b.start);
  return {date:localDateKey(new Date(event.start)),start:Math.min(day?.start??event.start,event.start),end:Math.max(day?.end??event.end,event.end),steps};
}
function saveDiaryEvent() {
  const t=translations[currentLanguage],fail=key=>{byId('diaryEventError').textContent=t[key];};
  const key=byId('diaryEventDate').value,name=byId('diaryEventName').value.trim();
  const date=dateFromKey(key),hour=Number(byId('diaryEventHour').value),minute=Number(byId('diaryEventMinute').value||0),duration=Number(byId('diaryEventDuration').value);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||localDateKey(date)!==key||!name||!Number.isInteger(hour)||hour<1||hour>12||!Number.isInteger(minute)||minute<0||minute>59||!Number.isInteger(duration)||duration<1||duration>1440){fail('diaryEventInvalid');return false;}
  date.setHours(hour%12+(byId('diaryEventPeriod').value==='PM'?12:0),minute,0,0);
  const event={kind:'appointment',name,start:date.getTime(),end:date.getTime()+duration*60000};
  const next=dateFromKey(key);next.setDate(next.getDate()+1);
  if(event.end>next.getTime()){fail('diaryEventDayEnd');return false;}
  const updated=insertDiaryEvent(diaryDays[key],event);
  if(!updated||appointments.some(item=>event.start<item.end&&event.end>item.start)){fail('diaryEventConflict');return false;}
  if(!validDiaryDay(updated)){fail('diaryEventInvalid');return false;}
  if(plan&&localDateKey(new Date(plan.start))===key)invalidatePlan();
  diaryDays[key]=updated;appointments.push({id:`event-${Date.now()}-${appointments.length}`,name,start:event.start,end:event.end});appointments.sort((a,b)=>a.start-b.start);
  diarySelected=key;diaryAnchor=date;persistDiary();saveState();renderAppointments();renderDiary();
  byId('diaryEventDialog').close?.();byId('diaryShareStatus').textContent=t.diaryEventSaved;return true;
}
function diaryEventLayout(minute, duration) {
  const slot = duration * diaryPixelsPerMinute;
  return { top: minute * diaryPixelsPerMinute, height: Math.max(0, slot - Math.min(2, slot / 3)), compact: slot < 64, marker: slot < 14 };
}
const diaryCopy = {
  en: { availableTime: 'Let’s shape your day', heroTitle: 'Your day, in view.', usageIntro: 'Choose a date and your day’s hours. Add appointments and tasks; SPARE finds a place for them and saves a clear schedule in your diary.', viewDiary: 'My diary', diaryDate: 'Which day are we planning?', diaryTitle: 'A place for every part of your day', diaryIntro: 'A weekly view of your saved schedules. Pick a day to see its full timeline.', shareDay: 'Share this day', exportCalendar: 'Add to my calendar', planSelectedDay: 'Plan this day', diaryStorage: 'Saved in this browser. A shared link includes the day’s event names and times as a read-only snapshot; it does not update automatically.', diaryEmpty: 'A blank page for your next plan. Choose “Plan this day” to get started.', deleteDiaryDay: 'Delete saved day', diaryCopied: 'Link copied. Share it with a friend to show this schedule.', diaryShareFallback: 'Copy this link:', diaryShareLong: 'This schedule is too long for a share link. Use the calendar export instead.', diaryTodayHint: 'Leave the date empty to plan today.', startLater: 'Choose a start time', fixedHint: 'Add appointments for the selected day. Your tasks will fit around them.', startInvalid: 'Choose a valid start on today or a future date; the finish must be later.', deadlineAlert: 'Choose a finish time after the start.', finishAt: 'My day ends at', buildPlan: 'Build my day', findTimeMeaning: 'Create a schedule with tasks, appointments, breaks and free space. It is saved automatically in your diary.' },
  he: { availableTime: 'בוא נסדר את היום שלך', heroTitle: 'היום שלך, מול העיניים.', usageIntro: 'בחר תאריך ושעות ליום שלך. הוסף פגישות ומשימות; SPARE מסדרת אותן ושומרת סדר יום ברור ביומן שלך.', viewDiary: 'היומן שלי', diaryDate: 'איזה יום מתכננים?', diaryTitle: 'מקום לכל חלק ביום שלך', diaryIntro: 'תצוגה שבועית של התוכניות ששמרת. בחר יום כדי לראות את סדר היום המלא.', shareDay: 'שתף את היום', exportCalendar: 'הוסף ליומן שלי', planSelectedDay: 'תכנן את היום הזה', diaryStorage: 'נשמר בדפדפן הזה. קישור משותף כולל את שמות האירועים והשעות, לצפייה בלבד; הוא אינו מתעדכן אוטומטית.', diaryEmpty: 'דף חדש לתוכנית הבאה שלך. בחר ״תכנן את היום הזה״ כדי להתחיל.', deleteDiaryDay: 'מחק יום שמור', diaryCopied: 'הקישור הועתק. אפשר לשלוח אותו לחבר כדי להציג את סדר היום.', diaryShareFallback: 'העתק את הקישור:', diaryShareLong: 'התוכנית ארוכה מדי לקישור שיתוף. אפשר לייצא אותה ליומן.', diaryTodayHint: 'ללא תאריך נבחר, מתכננים את היום.', startLater: 'בחירת שעת התחלה', fixedHint: 'הוסף פגישות ליום שנבחר. המשימות יסתדרו סביבן.', startInvalid: 'בחר שעת התחלה תקינה היום או בתאריך עתידי, וסיום אחריה.', deadlineAlert: 'בחר שעת סיום אחרי שעת ההתחלה.', finishAt: 'היום שלי מסתיים בשעה', buildPlan: 'סדר לי את היום', findTimeMeaning: 'יצירת סדר יום עם משימות, פגישות, הפסקות וזמן פנוי. התוכנית נשמרת אוטומטית ביומן שלך.' },
  ar: { availableTime: 'خلّينا نرتّب يومك', heroTitle: 'يومك، قدّام عيونك.', usageIntro: 'اختار اليوم وساعاتك، وأضف مواعيدك ومهامك. SPARE برتّبلك جدول واضح وبحفظه بدفترك، مع استراحات ومساحة تتنفّس.', viewDiary: 'دفتري', diaryDate: 'أي يوم بدك ترتّب؟', diaryTitle: 'لكل إشي بيومك مكان', diaryIntro: 'شوف جداولك المحفوظة بالأسبوع. اختار يوم وشوف تفاصيله بالساعات.', shareDay: 'شارك يومك', exportCalendar: 'أضف لتقويمي', planSelectedDay: 'رتّب هاليوم', diaryStorage: 'دفترك محفوظ بهالمتصفح. رابط المشاركة فيه أسماء المواعيد والمهام وساعاتها، للعرض بس؛ ما بتحدّث لحاله.', diaryEmpty: 'صفحة جديدة ليومك. اضغط «رتّب هاليوم» وابدأ.', deleteDiaryDay: 'احذف اليوم المحفوظ', diaryCopied: 'نسخنا الرابط. ابعته لصاحبك عشان يشوف جدولك.', diaryShareFallback: 'انسخ هالرابط:', diaryShareLong: 'الجدول طويل لرابط مشاركة. بتقدر تنزّله كملف تقويم.', diaryTodayHint: 'إذا ما اخترت تاريخ، بنرتّب اليوم.', startLater: 'اختار ساعة البداية', fixedHint: 'أضف مواعيدك لليوم اللي اخترته. المهام بتترتّب حواليها.', startInvalid: 'اختار بداية صحيحة اليوم أو بتاريخ جاي، والنهاية تكون بعدها.', deadlineAlert: 'اختار ساعة نهاية بعد البداية.', finishAt: 'يومي بخلص الساعة', buildPlan: 'رتبلي المهام', findTimeMeaning: 'بنرتّبلك يومك بالساعات: مهام، مواعيد، استراحات ومساحة فاضية. الجدول بنحفظ تلقائيًا بدفترك.' }
};
function diaryStepName(step) {
  const t = translations[currentLanguage];
  return step.kind === 'break' ? t.breakName : step.kind === 'free' ? t.freeSlot : step.kind === 'reserve' ? t.reserveSlot : step.name;
}
function snapshotPlan() {
  if (!plan) return null;
  let cursor = plan.start;
  const steps = plan.steps.map(step => {
    const start = step.start ?? cursor; cursor = start + step.minutes * 60000;
    return { kind: step.kind, name: diaryStepName(step), start, end: cursor };
  });
  if (!steps.some(step => step.kind === 'free') && plan.available > plan.used + plan.buffer) steps.push({kind:'free',name:translations[currentLanguage].freeSlot,start:plan.start+plan.used*60000,end:plan.end-plan.buffer*60000});
  if (!steps.some(step => step.kind === 'reserve') && plan.buffer) steps.push({kind:'reserve',name:translations[currentLanguage].reserveSlot,start:plan.end-plan.buffer*60000,end:plan.end});
  return { date: localDateKey(new Date(plan.start)), start: plan.start, end: plan.end, steps };
}
function validDiaryDay(value) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value.date) && Number.isFinite(value.start) && Number.isFinite(value.end) && localDateKey(new Date(value.start)) === value.date && value.end > value.start && value.end-value.start <= 7*86400000 && Array.isArray(value.steps) && value.steps.length <= 500 && value.steps.every((step,index) => ['work','break','free','reserve','appointment'].includes(step.kind) && typeof step.name === 'string' && step.name.length <= 1000 && Number.isFinite(step.start) && Number.isFinite(step.end) && step.end>step.start && step.start>=value.start && step.end<=value.end && (!index || step.start >= value.steps[index-1].end));
}
function saveDiaryPlan() {
  const snapshot = snapshotPlan();
  if (!validDiaryDay(snapshot)) return;
  for (let cursor = snapshot.start; cursor < snapshot.end;) {
    const midnight = new Date(cursor); midnight.setHours(0,0,0,0);
    const end = Math.min(addDays(midnight,1).getTime(),snapshot.end), key=localDateKey(midnight);
    const chunk={date:key,start:cursor,end,steps:snapshot.steps.filter(step=>step.start<end&&step.end>cursor).map(step=>({...step,start:Math.max(step.start,cursor),end:Math.min(step.end,end)}))};
    const previous=diaryDays[key];
    if(previous&&chunk.start>previous.start){const earlier=previous.steps.filter(step=>step.start<chunk.start).map(step=>({...step,end:Math.min(step.end,chunk.start)}));chunk.steps=[...earlier,...chunk.steps];chunk.start=previous.start;}
    diaryDays[key]=chunk;cursor=end;
  }
  diarySelected = snapshot.date; diaryAnchor = new Date(snapshot.start);
  persistDiary(); renderDiary();
}
function persistDiary() { try { localStorage.setItem('spareDiary',JSON.stringify(diaryDays)); } catch {} }
function selectedPlanningDay(now = Date.now()) {
  const value = byId('diaryDate').value;
  if (!value) return new Date(now);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(NaN);
  const date = new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
  return localDateKey(date) === value ? date : new Date(NaN);
}
function renderDiary() {
  const t = translations[currentLanguage], locale = currentLanguage === 'ar' ? 'ar' : currentLanguage === 'he' ? 'he-IL' : 'en-GB';
  const first = weekBeginning(diaryAnchor), days = Array.from({length:7},(_,i)=>addDays(first,i));
  const dateLabel = date => date.toLocaleDateString(locale,{day:'numeric',month:'short'});
  byId('diaryPeriod').textContent = `${dateLabel(first)} — ${dateLabel(days[6])}`;
  byId('diaryWeek').innerHTML = '';
  const dates = document.createElement('div'); dates.className = 'diary-date-strip';
  dates.innerHTML = '<span class="diary-zone" aria-hidden="true">AM / PM</span>';
  days.forEach(date => {
    const key = localDateKey(date), button = document.createElement('button'); button.type='button';
    button.className = `diary-date${key === localDateKey() ? ' is-today' : ''}`;
    button.setAttribute('aria-pressed',String(key===diarySelected));
    button.innerHTML = `<span>${date.toLocaleDateString(locale,{weekday:'short'})}</span><strong>${date.getDate()}</strong><small>${diaryDays[key] ? '●' : '·'}</small>`;
    button.addEventListener('click',()=>{diarySelected=key;renderDiary();});
    const cell=document.createElement('div');cell.className='diary-date-cell';cell.appendChild(button);
    const add=document.createElement('button');add.type='button';add.className='diary-add-event';add.textContent='+';add.setAttribute('aria-label',`${t.diaryAddEvent}: ${dateLabel(date)}`);add.addEventListener('click',()=>openDiaryEvent(key));cell.appendChild(add);dates.appendChild(cell);
  });
  byId('diaryWeek').appendChild(dates);
  const body = document.createElement('div'); body.className='diary-calendar-body';
  const labels = document.createElement('div'); labels.className='diary-hour-labels';
  labels.innerHTML=Array.from({length:24},(_,h)=>`<span style="top:${h*60*diaryPixelsPerMinute}px">${String(h%12||12).padStart(2,'0')} ${h<12?'AM':'PM'}</span>`).join('');body.appendChild(labels);
  days.forEach(date=>{
    const key=localDateKey(date), column=document.createElement('div');column.className=`diary-column${key===diarySelected?' selected-day':''}`;
    (diaryDays[key]?.steps||[]).forEach(step=>{
      const start=new Date(step.start), midnight=new Date(date);midnight.setHours(0,0,0,0);const next=addDays(midnight,1);
      if(step.start>=next.getTime()||step.end<=midnight.getTime())return;
      const end=new Date(Math.min(step.end,next.getTime()));
      const minute=start.getHours()*60+start.getMinutes();
      const duration=(end.getTime()-Math.max(step.start,midnight.getTime()))/60000;
      const box=diaryEventLayout(minute,duration);
      const event=document.createElement('button');event.type='button';event.className=`diary-event diary-${step.kind}${box.compact?' diary-event-compact':''}${box.marker?' diary-event-marker':''}`;
      event.style.top=`${box.top}px`;event.style.height=`${box.height}px`;
      event.title=`${step.name}: ${clockTime(step.start)} — ${clockTime(step.end)}`;
      event.setAttribute('aria-label',`${step.name}: ${clockTime(step.start)} — ${clockTime(step.end)}`);
      event.innerHTML=`<strong>${escapeHTML(step.name)}</strong><small>${clockTime(step.start)} — ${clockTime(step.end)}</small>`;
      event.addEventListener('click',()=>{diarySelected=key;renderDiary();byId('diarySelectedTitle').scrollIntoView({behavior:'smooth',block:'start'});});column.appendChild(event);
    });body.appendChild(column);
  });
  byId('diaryWeek').appendChild(body);
  const selected=diaryDays[diarySelected];
  byId('diarySelectedTitle').textContent=new Date(diarySelected+'T12:00:00').toLocaleDateString(locale,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  byId('diarySelectedSteps').innerHTML=selected?selected.steps.map(step=>`<div class="plan-item ${step.kind}-step"><div class="plan-time">${clockTime(step.start)} – ${clockTime(step.end)}</div><div class="plan-name">${escapeHTML(step.name)}<small>${formatDuration(Math.round((step.end-step.start)/60000))}</small></div></div>`).join(''):`<div class="diary-empty">${t.diaryEmpty}</div>`;
  ['shareDiaryDay','exportDiaryDay','deleteDiaryDay'].forEach(id=>byId(id).disabled=!selected);
  if (diaryScrolledDay !== diarySelected && document.querySelector('.app').getAttribute('data-workspace-view') === 'diary') {
    const firstHour=selected?new Date(selected.start).getHours():8;
    byId('diaryScroll').scrollTop=Math.max(0,firstHour*60*diaryPixelsPerMinute-20);
    diaryScrolledDay=diarySelected;
  }
  byId('diaryDateHint').textContent=t.diaryTodayHint;
}
function sharePayload(day) { return {version:1,language:currentLanguage,timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone,day}; }
async function shareDiary(day, statusId) {
  if (!validDiaryDay(day)) return;
  const t=translations[currentLanguage], status=byId(statusId);
  const url=new URL('share.html',window.location.href);url.hash=encodeURIComponent(JSON.stringify(sharePayload(day)));
  if(url.href.length>24000){status.textContent=t.diaryShareLong;return;}
  try { await navigator.clipboard.writeText(url.href);status.textContent=t.diaryCopied; }
  catch { status.textContent=t.diaryShareFallback;const field=document.createElement('input');field.type='text';field.readOnly=true;field.value=url.href;field.className='share-link';status.appendChild(field);field.focus();field.select(); }
}
function icsEscape(value) { return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function calendarFile(day) {
  const stamp=time=>new Date(time).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SPARE//Day Planner//EN','CALSCALE:GREGORIAN'];
  day.steps.filter(step=>step.kind==='work'||step.kind==='appointment'||step.kind==='break').forEach((step,i)=>lines.push('BEGIN:VEVENT',`UID:spare-${day.date}-${i}-${step.start}@spare.local`,`DTSTAMP:${stamp(Date.now())}`,`DTSTART:${stamp(step.start)}`,`DTEND:${stamp(step.end)}`,`SUMMARY:${icsEscape(step.name)}`,'END:VEVENT'));
  lines.push('END:VCALENDAR');
  // RFC 5545 folding uses byte lengths, so Arabic/Hebrew also stay within 75 octets.
  return lines.map(line=>{let out='',current='',bytes=0;for(const char of line){const size=new TextEncoder().encode(char).length;if(bytes+size>75){out+=current+'\r\n';current=' ';bytes=1;}current+=char;bytes+=size;}return out+current;}).join('\r\n')+'\r\n';
}
function exportDiary(day) {
  if(!validDiaryDay(day))return;
  const url=URL.createObjectURL(new Blob([calendarFile(day)],{type:'text/calendar;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`SPARE-${day.date}.ics`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function initDiary() {
  byId('diaryEventForm').addEventListener('submit',event=>{event.preventDefault();saveDiaryEvent();});
  byId('diaryAddSelected').addEventListener('click',()=>openDiaryEvent(diarySelected));
  byId('diaryMobileWeek').addEventListener('click',()=>{
    const button=byId('diaryMobileWeek'),enabled=button.getAttribute('aria-pressed')!=='true';
    button.setAttribute('aria-pressed',String(enabled));byId('diaryPanel').classList.toggle('diary-week-mode',enabled);
    if(enabled){diaryScrolledDay=null;renderDiary();}
  });
  ['closeDiaryEvent','cancelDiaryEvent'].forEach(id=>byId(id).addEventListener('click',()=>byId('diaryEventDialog').close()));
  Object.keys(diaryCopy).forEach(lang=>Object.assign(translations[lang],diaryCopy[lang]));
  translations.he.viewDiary='המחברת שלי';
  const setupCopy = {
    en: {daySetupTitle:'A clear start to your day',daySetupHint:'Choose your day and hours. Add extras only if you need them.',dayPreferences:'Energy & breaks · optional',dayDefaults:'A balanced pace, short breaks and breathing room are set by default. Change them here if you wish.',fixedTitle:'Add a fixed appointment',durationMode:'Set a duration instead',deadlineMode:'Set a finish time',goToTasks:'Continue to tasks'},
    he: {daySetupTitle:'היום שלך מתחיל כאן',daySetupHint:'בחר תאריך ושעות. את השאר אפשר להתאים לפי הצורך.',dayPreferences:'אנרגיה והפסקות · לבחירתך',dayDefaults:'כבר הגדרנו קצב מאוזן, הפסקות קצרות ומרווח ביטחון. אפשר לשנות אותם כאן.',fixedTitle:'הוסף פגישה קבועה',durationMode:'לפי משך זמן',deadlineMode:'לפי שעת סיום',goToTasks:'ממשיכים למשימות'},
    ar: {daySetupTitle:'يومك ببدأ من هون',daySetupHint:'اختار اليوم والساعات. باقي التفاصيل حسب حاجتك.',dayPreferences:'الطاقة والاستراحات · اختياري',dayDefaults:'الافتراضي طاقة متوسطة، استراحات قصيرة ومجال للمفاجآت. بتقدر تغيّرهم هون.',fixedTitle:'أضف موعد ثابت',durationMode:'حدّد مدة بدل ساعة نهاية',deadlineMode:'حدّد ساعة النهاية',goToTasks:'كمّل للمهام'}
  };
  Object.keys(setupCopy).forEach(lang=>Object.assign(translations[lang],setupCopy[lang]));
  Object.assign(translations.en,{setupStartTitle:'Day & start',setupEndTitle:'End of the day',daySetupTitle:'Your day, organized',daySetupHint:'Set your day’s hours. Add appointments if needed, then continue to your tasks.'});
  Object.assign(translations.he,{setupStartTitle:'תאריך והתחלה',setupEndTitle:'סיום היום',daySetupTitle:'היום שלך, מסודר',daySetupHint:'הגדר את שעות היום. הוסף פגישות לפי הצורך, ואז המשך למשימות.'});
  Object.assign(translations.ar,{setupStartTitle:'اليوم والبداية',setupEndTitle:'نهاية اليوم',daySetupTitle:'يومك، بشكل مرتّب',daySetupHint:'حدّد ساعات يومك. أضف مواعيد إذا عندك، وبعدين كمّل للمهام.'});
  Object.assign(translations.en,{tasksTitle:'Give each task a place',newTask:'Add a task',taskNameLabel:'Task name',taskDurationLabel:'Estimated duration',taskBoardHeading:'Your added tasks'});
  Object.assign(translations.he,{tasksTitle:'מקום לכל משימה',newTask:'הוספת משימה',taskNameLabel:'שם המשימה',taskDurationLabel:'משך זמן משוער',taskBoardHeading:'המשימות שהוספת'});
  Object.assign(translations.ar,{tasksTitle:'لكل مهمة مكان',newTask:'أضف مهمة',taskNameLabel:'اسم المهمة',taskDurationLabel:'قديش بدها وقت',taskBoardHeading:'المهام اللي أضفتها'});
  let fresh=false;try {fresh=!localStorage.getItem('sparePlanner');}catch {}
  if (fresh) {
    byId('timeMode').value='deadline';
    const finish=new Date(Date.now()+120*60000),today=new Date();
    if(localDateKey(finish)!==localDateKey(today))finish.setTime(new Date(today.getFullYear(),today.getMonth(),today.getDate(),23,59).getTime());
    byId('finishAt').value=`${String(finish.getHours()).padStart(2,'0')}:${String(finish.getMinutes()).padStart(2,'0')}`;
    updateMode();
  }
  try { const saved=JSON.parse(localStorage.getItem('spareDiary')||'{}');Object.entries(saved).forEach(([key,value])=>{if(key===value.date&&validDiaryDay(value))diaryDays[key]=value;}); } catch {}
  byId('sharePlan').addEventListener('click',()=>shareDiary(snapshotPlan(),'shareStatus'));
  byId('exportPlan').addEventListener('click',()=>exportDiary(snapshotPlan()));
  byId('openDiary').addEventListener('click',()=>showWorkspace('diary'));
  byId('shareDiaryDay').addEventListener('click',()=>shareDiary(diaryDays[diarySelected],'diaryShareStatus'));
  byId('exportDiaryDay').addEventListener('click',()=>exportDiary(diaryDays[diarySelected]));
  byId('deleteDiaryDay').addEventListener('click',()=>{delete diaryDays[diarySelected];persistDiary();renderDiary();});
  byId('diaryPrevious').addEventListener('click',()=>{diaryAnchor=addDays(diaryAnchor,-7);diarySelected=localDateKey(weekBeginning(diaryAnchor));renderDiary();});
  byId('diaryNext').addEventListener('click',()=>{diaryAnchor=addDays(diaryAnchor,7);diarySelected=localDateKey(weekBeginning(diaryAnchor));renderDiary();});
  byId('diaryToday').addEventListener('click',()=>{diaryAnchor=new Date();diarySelected=localDateKey();renderDiary();});
  byId('diaryPlanDay').addEventListener('click',()=>{invalidatePlan();byId('diaryDate').value=diarySelected;if(diarySelected!==localDateKey())byId('startMode').value='later';updateMode();renderAppointments();saveState();showWorkspace('time');});
  renderDiary();
}
