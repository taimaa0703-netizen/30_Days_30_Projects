const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = 'projects/06_DoIHaveTime/';
const html = fs.readFileSync(root + 'index.html', 'utf8');
let now = new Date(2026, 9, 7, 12, 0).getTime();
class FakeDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}
function element() {
  const classes = new Set();
  return {
    value: '', checked: false, type: '', dataset: {}, style: {}, textContent: '', innerHTML: '', listeners: {},
    classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x),
      toggle(x, on) { on ? classes.add(x) : classes.delete(x); } },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    dispatchEvent(event) { this.listeners[event.type]?.(event); },
    setAttribute(name, value) { this[name] = value; }, getAttribute(name) { return this[name] ?? null; }, appendChild() {}, prepend() {}, focus() {}, scrollIntoView() {}
  };
}
const elements = {}, ids = [];
const appElement = element();
for (const match of html.matchAll(/<[^>]+id="([^"]+)"[^>]*>/g)) {
  const el = elements[match[1]] = element(); ids.push(match[1]);
  el.type = /type="([^"]+)"/.exec(match[0])?.[1] || '';
  el.checked = /\bchecked\b/.test(match[0]);
}
assert.equal(new Set(ids).size, ids.length, 'Unique IDs');
const translated = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(match => Object.assign(element(), { dataset: { i18n: match[1] } }));
const presets = [30, 60, 90].map(n => Object.assign(element(), { dataset: { minutes: String(n) } }));
const choices = [...html.matchAll(/data-choice-target="([^"]+)" data-value="([^"]+)"/g)].map(match => Object.assign(element(), { dataset: { choiceTarget: match[1], value: match[2] } }));
elements.timeMode.value = 'duration'; elements.breakMinutes.value = '5'; elements.priority.value = '3';
elements.energyLevel.value = 'high'; elements.taskEffort.value = 'normal';
const storage = new Map(), alerts = [];
const ctx = {
  Date: FakeDate, Math, Number, JSON, Object, String, TextEncoder, Event: class { constructor(type) { this.type = type; } },
  document: {
    getElementById(id) { assert.ok(elements[id], `Existing element ${id}`); return elements[id]; },
    createElement: element, documentElement: {},
    querySelector: () => appElement,
    querySelectorAll(selector) { return selector === '[data-i18n]' ? translated : selector === '[data-minutes]' ? presets : selector === '[data-choice-target]' ? choices : []; }
  },
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  window: { scrollTo() {} }, alert: msg => alerts.push(msg), setInterval: () => 1, clearInterval() {}
};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(root + 'script.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(root + 'dashboard.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(root + 'day-planner.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(root + 'diary.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(root + 'planner.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(root + 'workspace.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync(root + 'task-note.js', 'utf8'), ctx);
const run = source => vm.runInContext(source, ctx);
elements.viewTime.listeners.click();
assert.equal(appElement.getAttribute('data-workspace-view'),'time','Mobile screen selector opens day settings');
run('showWorkspace("plan")');
assert.equal(elements.viewPlan['aria-selected'],'true','Mobile and desktop share the same selected tab');
assert.ok(!html.includes('id="quickDownloadNote"')&&!html.includes('id="openTaskNote"'),'Note shortcuts are removed from other screens');
assert.ok(html.indexOf('id="finishNoteCard"')>html.indexOf('id="planPanel"')&&html.indexOf('id="finishNoteCard"')<html.indexOf('id="diaryPanel"'),'Picture note belongs to the day schedule');
run('showWorkspace("diary")');
for (const duration of [0.5, 1, 5, 10, 20, 60]) {
  const box=run(`diaryEventLayout(540,${duration})`);
  assert.ok(box.height>0 && box.height<=duration*3,'Short event fits its true time slot');
  assert.ok(box.top+box.height<=run(`diaryEventLayout(${540+duration},5).top`),'Adjacent calendar events never overlap');
}
assert.equal(run('diaryEventLayout(540,5).compact'),true);
assert.equal(run('diaryEventLayout(540,1).marker'),true);
run('limitProbe={value:"99"};limitTimeInput(limitProbe,0,24)');
assert.equal(run('limitProbe.value'),'24','Hours are capped while typing or pasting');
run('limitProbe.value="999";limitTimeInput(limitProbe,0,60)');
assert.equal(run('limitProbe.value'),'60','Minutes are capped at 60');
run('limitProbe.value="-3";limitTimeInput(limitProbe,0,24)');
assert.equal(run('limitProbe.value'),'0','Negative durations are removed');
run('limitProbe.value="";limitTimeInput(limitProbe,0,60)');
assert.equal(run('limitProbe.value'),'','An empty field stays editable');
assert.equal(run('toMinutes({value:"60"},{value:"24"})'),1500,'Maximum field values are accepted');
assert.equal(run('Number.isNaN(toMinutes({value:"61"},{value:"0"}))'),true,'Out-of-range values also fail calculation validation');
assert.equal(run('Number.isNaN(toMinutes({value:"0"},{value:"25"}))'),true);
assert.equal(elements.timeMode.value,'deadline','New diary starts with an explicit finish time');
run('byId("timeMode").value="duration";updateMode()');

for (const lang of ['en', 'ar', 'he']) {
  run(`changeLanguage('${lang}')`);
  translated.forEach(el => assert.ok(run(`translations[currentLanguage]['${el.dataset.i18n}']`), `Translation ${lang}/${el.dataset.i18n}`));
}
run(`tasks = [
  {id:1,name:'Study',minutes:150,remaining:150,priority:3,must:true,canSplit:true},
  {id:2,name:'Email',minutes:10,remaining:10,priority:1,must:false,canSplit:false}
]`);
run('testPlan = createPlan(tasks, 60, 5, true)');
assert.equal(run('testPlan.buffer'), 6);
assert.equal(run('testPlan.steps[0].taskId'), 1, 'Must-do task first');
assert.equal(run('testPlan.steps[0].minutes'), 45, 'Focus block');
assert.ok(run('testPlan.used + testPlan.buffer <= 60'));
assert.equal(run('testPlan.later.find(t => t.id === 1).remaining'), 105, 'Partial task preserved');
run('tasks[0].canSplit = false; testPlan = createPlan(tasks, 60, 5, true)');
assert.ok(run('testPlan.steps.every(s => s.taskId !== 1)'), 'Do not split without consent');
assert.equal(run('testPlan.steps[0].taskId'), 2, 'Smaller task can fit');
run('tasks[0].canSplit = true; testPlan = createPlan(tasks, 180, 5, true)');
assert.ok(run('testPlan.steps.some(s => s.kind === "break")'));
assert.equal(run('testPlan.steps.at(-1).kind'), 'work', 'No trailing break');

// Random budgets and task mixes protect the scheduler's time and allocation invariants.
for (let i = 0; i < 250; i++) {
  const source = Array.from({ length: 5 }, (_, id) => ({ id, name: `Task ${id}`, minutes: 1 + Math.floor(Math.random() * 180),
    priority: 1 + Math.floor(Math.random() * 3), must: Math.random() > .5, canSplit: Math.random() > .5 }));
  source.forEach(task => { task.remaining = task.minutes; });
  ctx.source = source; ctx.budget = 1 + Math.floor(Math.random() * 300);
  const plan = run('createPlan(source, budget, 5, true)');
  assert.ok(plan.used + plan.buffer <= ctx.budget);
  assert.equal(plan.used, plan.steps.reduce((sum, step) => sum + step.minutes, 0));
  assert.ok(plan.steps.every(step => step.minutes > 0));
  assert.notEqual(plan.steps.at(-1)?.kind, 'break');
  for (const task of source) {
    const allocated = plan.steps.filter(step => step.taskId === task.id).reduce((sum, step) => sum + step.minutes, 0);
    const remaining = plan.later.find(later => later.id === task.id)?.remaining || 0;
    assert.equal(allocated + remaining, task.remaining);
    if (!task.canSplit) assert.ok(allocated === 0 || allocated === task.remaining);
  }
}

run('tasks = tasks.slice(0,1); setAvailableMinutes(180); buildPlan()');
const originalEnd = run('plan.end');
run('startSession()'); now += 120000;
assert.equal(run('Math.floor(elapsedSeconds())'), 120);
run('pauseSession()'); now += 60000;
assert.equal(run('Math.floor(elapsedSeconds())'), 120, 'Pause freezes focus time');
run(`changeLanguage('ar')`);
assert.equal(run('plan.end'), originalEnd, 'Language switch preserves deadline');
run('replanSession()');
assert.equal(run('tasks[0].remaining'), 148, 'Only actual focus time is credited');
assert.equal(run('plan.available'), 177, 'Pause still consumes wall-clock budget');
assert.equal(run('plan.end'), originalEnd);
run('finishSession()'); assert.equal(run('tasks[0].remaining'), 103);
assert.equal(elements.timeMode.value, 'duration');

run('invalidatePlan(); timeModeElement = byId("timeMode"); timeModeElement.value="deadline"; byId("finishAt").value="14:00"');
assert.equal(run('getAvailable()'), 117, 'Deadline uses local time today');
run('byId("finishAt").value="11:00"; buildPlan()'); assert.ok(alerts.length > 0, 'Reject past deadline');
presets[2].listeners.click();
assert.equal(elements.availableHours.value, 1); assert.equal(elements.availableTime.value, 30);
run('saveState(); tasks=[]; restoreState()'); assert.ok(run('tasks.length') > 0, 'Restore task list');
run('resetApp()'); assert.equal(run('tasks.length'), 0); assert.equal(run('session'), null);
assert.equal(elements.availableHours.value, '');
// Low energy chooses easy work and caps tasks the user allowed us to split.
run(`tasks = [
  {id:10,name:'Deep study',minutes:150,remaining:150,priority:3,must:false,canSplit:true,effort:'deep'},
  {id:11,name:'Easy admin',minutes:30,remaining:30,priority:1,must:false,canSplit:true,effort:'light'}
]; testPlan=createPlan(tasks,180,5,true,'low')`);
assert.equal(run('testPlan.steps[0].taskId'), 11);
assert.ok(run('testPlan.steps.filter(s=>s.kind==="work").every(s=>s.minutes <= 20)'));
assert.equal(run('testPlan.later.find(t=>t.id===10).remaining'), 130);
run('tasks[0].must=true; testPlan=createPlan(tasks,180,5,true,"low")');
assert.equal(run('testPlan.steps[0].taskId'), 10, 'Must-do still leads when tired');
run('tasks[0].canSplit=false; testPlan=createPlan(tasks,180,5,true,"low")');
assert.equal(run('testPlan.steps.filter(s=>s.taskId===10).reduce((n,s)=>n+s.minutes,0)'), 0, 'No partial allocation without consent');

// A task estimated at 30 minutes actually took 60: learn 60, not the estimate.
run(`resetApp(); byId('energyLevel').value='high'; byId('breakMinutes').value='0'; byId('useBuffer').checked=false;
tasks=[{id:20,name:'Study',minutes:30,remaining:30,priority:3,must:false,canSplit:true,effort:'deep',actualSeconds:0}];
setAvailableMinutes(120); buildPlan(); startSession()`);
now += 60 * 60000;
run('finishSession()');
assert.equal(run('getSuggestedMinutes(" study ")'), 60);
run(`taskName.value='Study'; renderEstimate()`);
assert.equal(elements.estimateSuggestion.classList.contains('hidden'), false);
elements.applyEstimate.listeners.click();
assert.equal(elements.taskHours.value, 1); assert.equal(elements.taskMinutes.value, 0);
run('recordCompletedTask(tasks[0])'); assert.equal(run('timeHistory.find(e=>e.key==="study").samples.length'),1);
run(`tasks.push({id:21,name:'Not timed',minutes:5,remaining:0,priority:1,actualSeconds:0});recordCompletedTask(tasks[1])`);
assert.equal(run('getSuggestedMinutes("Not timed")'), null, 'Untimed completions do not become data');

// Urgent insertion preserves finish time, credits focus progress once and explains displacement.
run(`resetApp(); byId('energyLevel').value='high'; byId('breakMinutes').value='0'; byId('useBuffer').checked=false;
tasks=[{id:30,name:'Original work',minutes:60,remaining:60,priority:3,must:true,canSplit:true,effort:'normal',actualSeconds:0}];
setAvailableMinutes(60);buildPlan();startSession()`);
const urgentEnd = run('plan.end'); now += 5*60000;
run(`byId('urgentName').value='Urgent call';byId('urgentMinutes').value='20';addUrgentTask()`);
assert.equal(run('plan.end'),urgentEnd);
assert.equal(run('tasks.find(t=>t.id===30).remaining'),55);
assert.equal(run('plan.steps[0].name'),'Urgent call');
assert.ok(run('urgentNotice.deferred.includes("Original work")'));
assert.ok(run('plan.used<=55'));
for(const lang of ['he','ar','en']){run(`changeLanguage('${lang}')`);assert.equal(run('plan.end'),urgentEnd);}
run('saveState();timeHistory=[];restoreState()'); assert.equal(run('getSuggestedMinutes("Study")'),60);

const stack=[],voids=new Set(['meta','link','input','br','hr','img']);
for(const m of html.matchAll(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi)){
  const tag=m[1].toLowerCase();if(voids.has(tag))continue;
  if(m[0][1]==='/')assert.equal(stack.pop(),tag,'HTML nesting');else stack.push(tag);
}
assert.equal(stack.length,0);
run('resetApp()');
choices.find(button => button.dataset.choiceTarget === 'priority' && button.dataset.value === '1').listeners.click();
choices.find(button => button.dataset.choiceTarget === 'taskEffort' && button.dataset.value === 'deep').listeners.click();
run(`taskName.value='New task';taskHours.value='2';taskMinutes.value='30';addTask()`);
assert.equal(run('tasks[0].priority'),1);
assert.equal(run('tasks[0].effort'),'deep');
assert.equal(run('tasks[0].minutes'),150);
assert.ok(elements.taskFeedback.textContent.includes('New task'));
assert.equal(choices.find(button => button.dataset.choiceTarget === 'priority' && button.dataset.value === '3')['aria-pressed'],'true');
assert.equal(choices.find(button => button.dataset.choiceTarget === 'taskEffort' && button.dataset.value === 'normal')['aria-pressed'],'true');
const completedId=run('tasks[0].id');
run(`toggleTaskDone(${completedId})`);assert.equal(run('tasks[0].remaining'),0);
run('saveState();tasks=[];restoreState()');assert.equal(run('tasks[0].remaining'),0);
run(`toggleTaskDone(${completedId})`);assert.equal(run('tasks[0].remaining'),150);
run(`setAvailableMinutes(180);buildPlan();startSession()`);const checkboxEnd=run('plan.end');now+=2*60000;
run(`toggleTaskDone(${completedId});toggleTaskDone(${completedId})`);assert.equal(run('tasks[0].remaining'),148,'Undo restores progress after measured work');
assert.equal(run('timeHistory.some(e=>e.key==="new task")'),false,'Checking done does not invent a timing sample');
// Journal keeps earlier days after a new plan and never invents time for checked tasks.
run('resetApp();journal={entries:[],focus:[]};persistJournal()');
now=new FakeDate(2026,9,7,12,0).getTime();
run(`taskName.value='Weekly task';taskMinutes.value='30';addTask();setAvailableMinutes(90);buildPlan();startSession()`);
const journalTaskId=run('tasks[0].journalId');
now+=2*60000;run('logSessionFocus();logSessionFocus()');
assert.equal(run('journal.focus.reduce((n,e)=>n+e.seconds,0)'),120,'No duplicate focus checkpoints');
run('pauseSession()');now+=60000;run('logSessionFocus()');
assert.equal(run('journal.focus.reduce((n,e)=>n+e.seconds,0)'),120,'Pause is not focus time');
run('startSession()');now+=60000;run('finishSession()');
assert.equal(run('journal.focus.reduce((n,e)=>n+e.seconds,0)'),180);
assert.equal(run('summarizePeriod(dashboardRange("week",new Date())).completed.length'),1);
run('resetApp()');assert.equal(run('journal.entries.length'),1,'Reset preserves earlier journal');
now=new FakeDate(2026,9,8,12,0).getTime();
run(`taskName.value='Untimed checkbox';taskMinutes.value='10';addTask();toggleTaskDone(tasks[0].id)`);
assert.equal(run('journal.focus.reduce((n,e)=>n+e.seconds,0)'),180,'Checkbox adds no focus');
assert.equal(run('summarizePeriod(dashboardRange("week",new Date())).completed.length'),2);
run('toggleTaskDone(tasks[0].id)');assert.equal(run('summarizePeriod(dashboardRange("week",new Date())).completed.length'),1,'Undo completion updates dashboard');
const carryId=run('tasks[0].journalId');run(`carryTaskToNextWeek('${carryId}')`);
assert.equal(run('tasks.length'),0);assert.equal(run(`journal.entries.find(e=>e.id==='${carryId}').date`),'2026-10-12');
assert.equal(run('summarizePeriod(dashboardRange("week",new Date())).planned.length'),2,'Original planned history remains');
run(`bringTaskToToday('${carryId}')`);assert.equal(run('tasks.length'),1);assert.equal(run('tasks[0].journalId'),carryId);
assert.equal(run('journal.entries.length'),2,'Carry does not duplicate records');
run('persistJournal();journal={entries:[],focus:[]};loadJournal()');assert.equal(run('journal.entries.length'),2);
assert.equal(run('dashboardRange("month",new Date(2026,11,20)).to'),'2027-01-01','Year boundary');
assert.equal(run('dashboardRange("month",new Date(2028,1,20)).end.getDate()'),1,'Leap month boundary');

// One continuous focus interval crossing midnight belongs to two dates.
run('resetApp();journal={entries:[],focus:[]};persistJournal()');now=new FakeDate(2026,9,31,23,59).getTime();
run(`taskName.value='Midnight work';taskMinutes.value='10';addTask();setAvailableMinutes(30);buildPlan();startSession()`);
now+=2*60000;run('logSessionFocus()');
assert.equal(run('journal.focus.find(e=>e.date==="2026-10-31").seconds'),60);
assert.equal(run('journal.focus.find(e=>e.date==="2026-11-01").seconds'),60);
run('dashboardMode="month";dashboardAnchor=new Date();renderDashboard()');
assert.ok(elements.monthCalendar.innerHTML.includes('calendar-day'));
elements.timeMode.value='deadline';elements.timeMode.listeners.change();
assert.equal(elements.timeMode.value,'deadline');
assert.equal(elements.deadlineFields.classList.contains('hidden'),false);
assert.equal(elements.durationFields.classList.contains('hidden'),true);
choices.find(button=>button.dataset.choiceTarget==='energyLevel' && button.dataset.value==='low').listeners.click();
assert.equal(elements.energyLevel.value,'low');
choices.find(button=>button.dataset.choiceTarget==='breakMinutes' && button.dataset.value==='10').listeners.click();
assert.equal(elements.breakMinutes.value,'10');
presets[0].listeners.click();assert.equal(elements.timeMode.value,'duration');
assert.equal(elements.deadlineFields.classList.contains('hidden'),true,'Duration preset switches the visible fields');
run(`resetApp();taskName.value='Workspace task';taskMinutes.value='10';addTask();setAvailableMinutes(60);buildPlan()`);
assert.equal(appElement.getAttribute('data-workspace-view'),'plan');
run('startSession();showWorkspace("progress")');assert.equal(run('session.running'),true,'Navigation preserves active timer');
assert.equal(elements.viewProgress['aria-selected'],'true');
elements.goToTasks.listeners.click();assert.equal(appElement.getAttribute('data-workspace-view'),'tasks');
run('resetApp();showWorkspace("plan")');assert.equal(elements.emptyPlan.classList.contains('hidden'),false);
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g))if(!match[1].includes('://'))assert.ok(fs.existsSync(root+match[1].split('?')[0]));
run(`dayStart = new Date(2026,9,7,9).getTime();
dayResult = createDayPlan([{id:1,name:'Study',remaining:90,minutes:90,priority:3,canSplit:false},{id:2,name:'Email',remaining:20,minutes:20,priority:1,canSplit:false}],180,5,true,'high',dayStart,[{name:'Meeting',start:dayStart+60*60000,end:dayStart+90*60000}]);`);
assert.equal(run('dayResult.steps.find(s=>s.kind==="appointment").start'),run('dayStart+60*60000'),'Fixed meeting starts at its actual time');
assert.equal(run('dayResult.work'),20,'Unsplittable task cannot bridge a meeting');
assert.ok(run('dayResult.steps.some(s=>s.kind==="free")'),'Free gaps are visible');
assert.equal(run('dayResult.steps.reduce((n,s)=>n+s.minutes,0)'),180,'Day window is fully accounted for');
assert.equal(run('dayResult.buffer'),18,'Reserve survives fixed appointments');
run(`fullMeeting = createDayPlan([],60,5,true,'high',dayStart,[{name:'Meeting',start:dayStart,end:dayStart+60*60000}]);`);
assert.equal(run('fullMeeting.buffer'),0,'Reserve cannot overlap a full-window meeting');
assert.equal(run('fullMeeting.used'),60);
run(`dayResult = createDayPlan([{id:1,name:'Study',remaining:90,minutes:90,priority:3,canSplit:true}],180,5,true,'low',dayStart,[{name:'Meeting',start:dayStart+60*60000,end:dayStart+90*60000}]);`);
assert.equal(run('dayResult.work'),20,'Low energy allocation stays capped across gaps');
run(`resetApp(); taskName.value='Later';taskMinutes.value='30';addTask();byId('startMode').value='later';const nextStart=new Date(Date.now()+3600000);byId('startHour').value=nextStart.getHours()%12||12;byId('startMinute').value=nextStart.getMinutes();byId('startPeriod').value=nextStart.getHours()>=12?'PM':'AM';setAvailableMinutes(60);buildPlan();startSession();`);
assert.equal(run('session.running'),false,'Future timer cannot start early');
assert.ok(elements.sessionStatus.textContent.includes(run('clockTime(plan.start)')),'Future start is explained');
run('resetApp()');
run(`futureDate=addDays(new Date(),2);byId('diaryDate').value=localDateKey(futureDate);byId('startMode').value='later';byId('startHour').value='9';byId('startMinute').value='0';byId('startPeriod').value='AM';byId('timeMode').value='deadline';byId('finishAt').value='13:00';taskName.value='مهمة <script>';taskHours.value='1';taskMinutes.value='30';addTask();byId('fixedName').value='פגישה';byId('fixedHour').value='10';byId('fixedMinute').value='0';byId('fixedPeriod').value='AM';byId('fixedDuration').value='30';addAppointment();buildPlan();`);
assert.equal(run('localDateKey(new Date(plan.start))'),run('localDateKey(futureDate)'),'Selected date drives plan start');
assert.equal(run('plan.steps.find(s=>s.kind==="appointment").start'),run('new Date(futureDate.getFullYear(),futureDate.getMonth(),futureDate.getDate(),10).getTime()'),'Meeting follows selected date');
assert.ok(run('validDiaryDay(diaryDays[localDateKey(futureDate)])'),'Future schedule is saved as a valid diary day');
const diarySaved=JSON.parse(storage.get('spareDiary'));
assert.ok(diarySaved[run('localDateKey(futureDate)')],'Saved diary persists in browser storage');
run('calendarText=calendarFile(snapshotPlan())');
assert.ok(run('calendarText.includes("BEGIN:VCALENDAR") && calendarText.includes("BEGIN:VEVENT") && calendarText.includes("SUMMARY:פגישה")'),'Calendar export includes the real appointment');
assert.ok(run('calendarText.split("\\r\\n").every(line=>new TextEncoder().encode(line).length<=75)'),'Calendar folds lines by UTF-8 bytes');
const shared=JSON.parse(run('JSON.stringify(sharePayload(snapshotPlan()))'));
assert.equal(shared.version,1);assert.ok(shared.timeZone);assert.equal(shared.day.date,run('localDateKey(futureDate)'));
assert.ok(shared.day.steps.some(step=>step.name.includes('<script>')),'Share payload retains names as text');
assert.equal(run('validDiaryDay({...snapshotPlan(),steps:[{kind:"work",name:"Bad",start:0,end:1}]})'),false,'Malformed saved steps are rejected');
run('showWorkspace("diary")');assert.equal(elements.viewDiary['aria-selected'],'true','Diary tab is selectable');
run(`categorySource=[{id:1,name:'Work',category:'work',remaining:20,priority:3},{id:2,name:'Study',category:'study',remaining:20,priority:1},{id:3,name:'Urgent',category:'home',remaining:10,priority:1,urgent:true}];categoryPlan=createPlan(categorySource,60,0,false,'high','study');`);
assert.equal(run('categoryPlan.steps[0].taskId'),3,'Urgent tasks stay first');
assert.equal(run('categoryPlan.steps[1].taskId'),2,'Selected category follows urgent work');
assert.equal(run('taskCategory({})'),'other','Older tasks remain visible in Other');
run(`resetApp();byId('taskCategory').value='study';taskName.value='Category task';taskMinutes.value='20';addTask();`);
assert.equal(run('tasks[0].category'),'study');
assert.equal(run('journal.entries.find(e=>e.id===tasks[0].journalId).category'),'study','Journal preserves category');
assert.equal(JSON.parse(storage.get('sparePlanner')).tasks[0].category,'study','Saved task preserves category');
run(`eventBase=new Date(2026,9,10,9).getTime();eventDay={date:'2026-10-10',start:eventBase,end:eventBase+120*60000,steps:[{kind:'free',name:'Free',start:eventBase,end:eventBase+120*60000}]};newEvent={kind:'appointment',name:'Coffee',start:eventBase+30*60000,end:eventBase+60*60000};eventResult=insertDiaryEvent(eventDay,newEvent);`);
assert.equal(run('eventResult.steps.length'),3,'Event splits free time without overlapping it');
assert.ok(run('validDiaryDay(eventResult)'));
assert.equal(run('insertDiaryEvent(eventResult,{...newEvent,name:"Conflict"})'),null,'Occupied slots reject overlaps');
run(`eventDate=localDateKey(addDays(new Date(),4));byId('diaryEventDate').value=eventDate;byId('diaryEventName').value='New diary event';byId('diaryEventHour').value='11';byId('diaryEventMinute').value='0';byId('diaryEventPeriod').value='AM';byId('diaryEventDuration').value='30';eventSaved=saveDiaryEvent();`);
assert.equal(run('eventSaved'),true,'Event can be added to a blank diary day');
assert.ok(run('validDiaryDay(diaryDays[eventDate])'));
assert.ok(JSON.parse(storage.get('spareDiary'))[run('eventDate')],'Added event persists');
assert.ok(run('appointments.some(item=>item.name==="New diary event")'),'Planner sees diary events as fixed appointments');
assert.equal(run('saveDiaryEvent()'),false,'Duplicate event is rejected');
console.log('PASS: planner/journal regressions, diary event creation and conflicts, categories, sharing and persistence.');
