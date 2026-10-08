'use strict';
const sharedCopy = {
  en: {label:'A day, shared with you',note:'A read-only snapshot of this schedule. Times are shown in the sender’s time zone; updates need a new link.',start:'Plan your own day',invalid:'This shared schedule could not be opened.'},
  he: {label:'יום ששיתפו איתך',note:'עותק לצפייה בלבד. השעות מוצגות באזור הזמן של השולח; עדכונים מצריכים קישור חדש.',start:'תכנן את היום שלך',invalid:'לא ניתן לפתוח את התוכנית המשותפת.'},
  ar: {label:'يوم انشارك معك',note:'نسخة للعرض بس. الساعات حسب توقيت اللي شارك الجدول؛ أي تحديث بده رابط جديد.',start:'رتّب يومك إنت كمان',invalid:'ما قدرنا نفتح الجدول المشترك.'}
};
try {
  if (location.hash.length > 24000) throw new Error('Too large');
  const payload=JSON.parse(decodeURIComponent(location.hash.slice(1)));
  const lang=['en','he','ar'].includes(payload.language)?payload.language:'en',copy=sharedCopy[lang],day=payload.day;
  if(payload.version!==1||!day||!/^\d{4}-\d{2}-\d{2}$/.test(day.date)||!Number.isFinite(day.start)||!Number.isFinite(day.end)||day.end<=day.start||day.end-day.start>7*86400000||!Array.isArray(day.steps)||day.steps.length>500)throw new Error('Invalid');
  const kinds=['work','appointment','break','free','reserve'];
  if(!day.steps.every(step=>kinds.includes(step.kind)&&typeof step.name==='string'&&step.name.length<=1000&&Number.isFinite(step.start)&&Number.isFinite(step.end)&&step.end>step.start&&step.start>=day.start&&step.end<=day.end))throw new Error('Invalid steps');
  // Validate the supplied IANA zone before rendering; older links use this browser's zone.
  const zone=typeof payload.timeZone==='string'?payload.timeZone:undefined;
  const time = timestamp=>new Date(timestamp).toLocaleTimeString(lang,{hour:'2-digit',minute:'2-digit',hour12:true,timeZone:zone});
  time(day.start);
  document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';
  document.getElementById('sharedLabel').textContent=copy.label;
  document.getElementById('sharedTitle').textContent=new Date(day.start).toLocaleDateString(lang,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:zone});
  document.getElementById('sharedNote').textContent=copy.note;
  document.getElementById('sharedStart').textContent=copy.start;
  const container=document.getElementById('sharedSteps');
  day.steps.forEach(step=>{
    const row=document.createElement('article');row.className=`shared-event diary-${step.kind}`;
    const clock=document.createElement('span');clock.className='shared-clock';clock.textContent=`${time(step.start)} – ${time(step.end)}`;
    const name=document.createElement('h2');name.textContent=step.name;
    row.append(clock,name);container.appendChild(row);
  });
} catch {
  const lang=(navigator.language||'en').slice(0,2);document.getElementById('sharedTitle').textContent=(sharedCopy[lang]||sharedCopy.en).invalid;
  document.getElementById('sharedSteps').replaceChildren();
}
