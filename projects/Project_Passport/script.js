'use strict';
// Set your Instagram profile URL here before publishing.
const CONFIG={instagram:'https://www.instagram.com/',mainSite:'https://taimaa0703-netizen.github.io/30_Days_30_Projects/'};
const PROJECTS=[
 {name:'FocusFlow',slug:'01_FocusFlow',mission:['Complete a focus session.','كمّل جلسة تركيز.','השלימו סשן ריכוז.'],path:'projects/01_FocusFlow/'},
 {name:'Split It',mission:['Split a bill.','قسّم فاتورة.','חלקו חשבון.'],path:'projects/02_SplitIt/'},
 {name:"Who’s Most Likely To?",mission:['Play a round with friends.','العب جولة مع أصحابك.','שחקו סיבוב עם חברים.'],path:'projects/03_WhosMostLikelyTo/'},
 {name:'Parked.',mission:['Save a parking spot.','احفظ مكان سيارتك.','שמרו מקום חניה.'],path:'projects/04_Parked/'},
 {name:'KEEP.',mission:['Make a monthly budget.','اعمل ميزانية شهرية.','צרו תקציב חודשי.'],path:'projects/05_KEEP/'},
 {name:'SPARE',mission:['Plan your day.','خطّط ليومك.','תכננו את היום שלכם.'],path:'projects/06_SPARE/'},
 {name:'ADPULSE',mission:['Explore the marketing dashboard.','استكشف لوحة تحليل الحملات.','גלו את לוח ניתוח הקמפיינים.'],path:'projects/07_ADPULSE/'},
 {name:'Lead DNA',mission:['Explore the lead-analysis project.','استكشف مشروع تحليل الليدات.','גלו את פרויקט ניתוח הלידים.'],path:''},
 {name:'DROP ALERT',mission:['Have you seen my DROP ALERT project post?','شفتوا بوست مشروع DROP ALERT؟','ראיתם את הפוסט של DROP ALERT?'],path:'',video:true},
 {name:'Subscription Detective',mission:['Review your subscriptions.','راجع اشتراكاتك.','בדקו את המנויים שלכם.'],path:'projects/Subscription_Detective_Day10/'}
].map((p,i)=>({...p,day:i+1,published:`${String(i+2).padStart(2,'0')}.10.2026`}));
const WORDS={
 en:{edition:'FIRST 10 • EXPLORER EDITION',hero:'10 projects. 10 digital stamps. One adventure.',start:'Get my passport ↗',private:'Saved privately in this browser.',how:'HOW IT WORKS',share:'SHARE',shareDesc:'Share my Instagram profile on your story and tag me.',shareButton:'Share profile ↗',explore:'EXPLORE',exploreDesc:'Try the projects and collect code stamps.',win:'WIN',winDesc:'Save your open passport, share it on your story and tag me.',yourPassport:'YOUR DIGITAL PASSPORT',welcome:'Welcome aboard,',editName:'Edit name ✎',stamps:'STAMPS COLLECTED',complete:'COMPLETED',remaining:'TO EXPLORE',fieldNotes:'MISSION LOG',destinations:'Your 10 destinations',missionHint:'Explore each project and confirm its mission.',finalStop:'THE FINAL UNLOCK',certificate:'Your open passport',locked:'Collect all 10 stamps to unlock your finished passport.',unlocked:'All 10 stamps collected! Save your open passport and tag me on Instagram.',download:'Save open passport ↓',honor:'Stamps are self-reported. Instagram story tags and prize eligibility are checked manually.',firstExplorer:'THE FIRST EXPLORER',prizeTitle:'A little challenge. A real reward.',prizeDesc:'The first eligible participant to finish 10 missions, share my profile and completed passport in stories, and tag me may choose a small coding project or up to one hour of technical help. Winner verified manually.',back:'← All projects',nameLabel:'NAME ON PASSPORT',nameTitle:'Who’s exploring?',create:'Create passport →',openProject:'Open project ↗',markComplete:'Mission done — collect code stamp ',watchDone:'Yes, I saw the post — collect stamp ',undo:'Remove stamp',honorMission:'Confirm only after completing the mission. Day 09 is a viewing mission.',view:'Explore ↗',collected:'Stamped ✓',toast:'New stamp unlocked! ',saved:'Open passport saved!',preview:'YOUR OPEN PASSPORT • LIVE PREVIEW',published:'PUBLISHED',videoNotice:'Day 09 uses physical hardware. Check out the project post and confirm you saw it.',unavailable:'See project showcase ↗'},
 ar:{edition:'أول 10 مشاريع • نسخة المستكشفين',hero:'10 مشاريع. 10 أختام رقمية. مغامرة واحدة.',start:'افتح جواز سفري ↗',private:'تقدّمك محفوظ على هذا المتصفح.',how:'كيف بيشتغل التحدّي',share:'SHARE',shareDesc:'شارك حسابي على الستوري واعملّي تاغ.',shareButton:'شارك الحساب ↗',explore:'EXPLORE',exploreDesc:'جرّب المشاريع واجمع أختام الكود.',win:'WIN',winDesc:'احفظ جواز السفر المفتوح وشاركه بالستوري واعملّي تاغ.',yourPassport:'جواز سفرك الرقمي',welcome:'أهلًا فيك،',editName:'تعديل الاسم ✎',stamps:'أختام جمعتها',complete:'نسبة الإنجاز',remaining:'مشاريع متبقية',fieldNotes:'سجل المهمات',destinations:'محطاتك العشرة',missionHint:'استكشف كل مشروع وأكّد إتمام المهمة.',finalStop:'الفتح النهائي',certificate:'جواز سفرك المفتوح',locked:'اجمع 10 أختام لتفتح جوازك الكامل.',unlocked:'جمعت كل الأختام! احفظ الجواز المفتوح واعملّي تاغ.',download:'احفظ الجواز المفتوح ↓',honor:'الأختام بتعتمد على تأكيد المشاركين. التاغات والفائز بنتحقق منهم يدويًا.',firstExplorer:'أول مستكشف',prizeTitle:'تحدّي صغير. جائزة حقيقية.',prizeDesc:'أول مشارك مؤهّل بكمّل 10 مهمات وبشارك الحساب والجواز بالستوري مع تاغ، بقدر يختار مشروع برمجة صغير أو مساعدة تقنية لحد ساعة. التحقق يدوي.',back:'← كل المشاريع',nameLabel:'الاسم على الجواز',nameTitle:'مين المستكشف؟',create:'أنشئ الجواز →',openProject:'افتح المشروع ↗',markComplete:'خلصت المهمة — اجمع ختم كود ',watchDone:'آه، شفت البوست — اجمع الختم ',undo:'إزالة الختم',honorMission:'أكّد بس بعد ما تكمّل المهمة. مشروع 09 للمشاهدة.',view:'استكشف ↗',collected:'مختوم ✓',toast:'جمعت ختم جديد! ',saved:'تم حفظ الجواز!',preview:'جواز السفر المفتوح • معاينة',published:'نُشر بتاريخ',videoNotice:'مشروع 09 مع أجهزة حقيقية. شوف البوست وأكّد إنك شفته.',unavailable:'شوف المشاريع ↗'},
 he:{edition:'עשרת הראשונים • מהדורת החוקרים',hero:'10 פרויקטים. 10 חותמות דיגיטליות. הרפתקה אחת.',start:'קבלת הדרכון שלי ↗',private:'ההתקדמות נשמרת בדפדפן הזה.',how:'איך זה עובד',share:'SHARE',shareDesc:'שתפו את הפרופיל שלי בסטורי ותייגו אותי.',shareButton:'שיתוף הפרופיל ↗',explore:'EXPLORE',exploreDesc:'התנסו בפרויקטים ואספו חותמות קוד.',win:'WIN',winDesc:'שמרו את הדרכון הפתוח, שתפו בסטורי ותייגו אותי.',yourPassport:'הדרכון הדיגיטלי שלכם',welcome:'ברוכים הבאים,',editName:'עריכת שם ✎',stamps:'חותמות שנאספו',complete:'הושלם',remaining:'נשארו לחקור',fieldNotes:'יומן המשימות',destinations:'עשרת היעדים שלכם',missionHint:'גלו כל פרויקט ואשרו את המשימה שלו.',finalStop:'הפתיחה הסופית',certificate:'הדרכון הפתוח שלכם',locked:'אספו 10 חותמות כדי לפתוח את הדרכון המלא.',unlocked:'אספתם 10 חותמות! שמרו את הדרכון הפתוח ותייגו אותי.',download:'שמירת הדרכון הפתוח ↓',honor:'החותמות מבוססות על דיווח עצמי. התיוגים והזכייה נבדקים ידנית.',firstExplorer:'החוקר הראשון',prizeTitle:'אתגר קטן. פרס אמיתי.',prizeDesc:'המשתתף הראשון שעומד בתנאים, משלים 10 משימות, משתף את הפרופיל ואת הדרכון בסטורי ומתייג, יוכל לבחור פרויקט תכנות קטן או שעת עזרה טכנית. האימות ידני.',back:'← כל הפרויקטים',nameLabel:'השם בדרכון',nameTitle:'מי יוצא לחקור?',create:'יצירת דרכון →',openProject:'פתיחת הפרויקט ↗',markComplete:'המשימה הושלמה — חותמת קוד ',watchDone:'כן, ראיתי את הפוסט — אספו חותמת ',undo:'הסרת חותמת',honorMission:'אשרו רק אחרי השלמת המשימה. Day 09 הוא משימת צפייה.',view:'לחקור ↗',collected:'הוחתם ✓',toast:'נאספה חותמת חדשה! ',saved:'הדרכון הפתוח נשמר!',preview:'הדרכון הפתוח • תצוגה מקדימה',published:'פורסם בתאריך',videoNotice:'Day 09 הוא פרויקט חומרה. צפו בפוסט ואשרו שראיתם אותו.',unavailable:'לצפייה בפרויקטים ↗'}
};
Object.assign(WORDS.en,{creatorLabel:'A NOTE FROM THE CREATOR',creatorHeading:'THIS ISN’T JUST A PASSPORT.',creatorMessage:'It’s a little piece of my journey — learning, experimenting, making mistakes, and building something new every day.',creatorThanks:'Thank you for being part of my journey.'});
Object.assign(WORDS.ar,{creatorLabel:'رسالة صغيرة منّي إلكم',creatorHeading:'هاد مش بس جواز سفر.',creatorMessage:'كل مشروع هون هو خطوة صغيرة برحلتي بالتعلّم والتجربة. مش كل إشي بزبط من أول مرة، بس مع كل محاولة بتعلّم إشي جديد.',creatorThanks:'وشكرًا إلكم إنكم جزء من هالرحلة، وعم تشاركوني إياها خطوة بخطوة.'});
Object.assign(WORDS.he,{creatorLabel:'כמה מילים ממני אליכם',creatorHeading:'זה לא סתם דרכון.',creatorMessage:'כל פרויקט כאן הוא צעד קטן במסע שלי — ללמוד, להתנסות, לטעות ולבנות משהו חדש בכל יום.',creatorThanks:'תודה שאתם חלק מהמסע הזה, ושאתם מלווים אותי צעד אחר צעד.'});

Object.assign(WORDS.en,{inviteEyebrow:'THE NEXT STAMP COULD BE YOURS',inviteHeading:'What if stamp 11 had your name on it?',inviteMessage:'This journey became more special because you joined it. Explore the first 10 projects, collect your stamps, and share your completed passport on Instagram while tagging me. The first eligible Explorer can choose a small idea for project 11 — and have their name featured on its stamp!',inviteCTA:'JOIN THE CHALLENGE ↗'});
Object.assign(WORDS.ar,{inviteEyebrow:'يمكن الختم الجاي يكون باسمك!',inviteHeading:'تخيّلوا أن يحمل الختم رقم 11 اسمكم',inviteMessage:'وجودكم معي في هذه الرحلة يجعلها أجمل. جرّبوا المشاريع العشرة الأولى، واجمعوا الأختام، وشاركوا جوازكم المكتمل في القصة مع الإشارة إلى حسابي. أول مشارك يستوفي الشروط يستطيع اختيار فكرة مشروع صغير لليوم 11، وسيظهر اسمه على ختم المشروع.',inviteCTA:'انضمّوا إلى التحدّي ↗'});
Object.assign(WORDS.he,{inviteEyebrow:'אולי החותמת הבאה תהיה שלכם',inviteHeading:'מה אם החותמת ה־11 תהיה על שמכם?',inviteMessage:'המסע הזה מיוחד יותר בזכותכם! נסו את עשרת הפרויקטים הראשונים, אספו חותמות, שתפו את הדרכון המלא בסטורי ותייגו אותי. המשתתף הראשון שעומד בתנאים יוכל לבחור רעיון לפרויקט קטן ליום 11, ושמו יופיע על החותמת שלו.',inviteCTA:'הצטרפו לאתגר ↗'});
Object.assign(WORDS.he,{
 creatorLabel:'כמה מילים ממני',
 creatorHeading:'זה לא רק דרכון.',
 creatorMessage:'זהו חלק קטן מהמסע שלי: ללמוד, להתנסות, לטעות ולבנות משהו חדש בכל יום.',
 creatorThanks:'תודה שאתם חלק מהמסע הזה ומלווים אותי בכל צעד.',
 inviteEyebrow:'אולי החותמת הבאה תהיה שלכם',
 inviteHeading:'רוצים שהחותמת ה־11 תהיה על שמכם?',
 inviteMessage:'כדי להודות לכם שהצטרפתם למסע שלי, אני מזמינה אתכם להתנסות בעשרת הפרויקטים הראשונים. המשתתף הראשון שישלים את כל המשימות, ישתף את הדרכון ואת הפרופיל שלי בסטורי ויתייג אותי, יוכל לבחור רעיון לפרויקט ה־11 ושמו יופיע על החותמת שלו.',
 inviteCTA:'הצטרפו לאתגר ↗',
 share:'שיתוף',
 explore:'התנסות',
 win:'הפרס',
 toast:'נאספה חותמת חדשה',
 shareDesc:'שתפו את הפרופיל שלי בסטורי ותייגו אותי.',
 winDesc:'שמרו את הדרכון לאחר השלמת המשימות, שתפו אותו בסטורי ותייגו אותי.',
 missionHint:'פתחו כל פרויקט, התנסו בו ואז סמנו את המשימה כהושלמה.',
 finalStop:'השלב האחרון',
 locked:'השלימו את כל 10 המשימות כדי לפתוח את הדרכון המלא.',
 unlocked:'כל 10 המשימות הושלמו! שמרו את הדרכון ושתפו אותו בסטורי.',
 markComplete:'המשימה הושלמה — איסוף חותמת',
 watchDone:'כן, צפיתי בפוסט — איסוף חותמת',
 undo:'הסרת החותמת',
 honorMission:'אספו חותמת רק לאחר השלמת המשימה. יום 9 הוא משימת צפייה.',
 videoNotice:'ביום 9 יש פרויקט חומרה פיזי. צפו בפוסט הפרויקט ואשרו שראיתם אותו.',
 published:'תאריך פרסום',
 closePassport:'סגירת הדרכון'
});
Object.assign(WORDS.ar,{inviteHeading:'تخيّلوا أن يحمل الختم رقم 11 اسمكم',inviteMessage:'شكرًا لانضمامكم إلى رحلتي. جرّبوا المشاريع العشرة الأولى واجمعوا أختامكم، ثم شاركوا جوازكم المكتمل على إنستغرام مع الإشارة إلى حسابي. سيختار أول مشارك يستوفي الشروط فكرة المشروع الحادي عشر، وسيظهر اسمه على ختمه.',inviteCTA:'انضمّوا إلى التحدّي ↗',share:'مشاركة',explore:'استكشفوا',win:'الجائزة',toast:'تم جمع ختم جديد'});
const KEY='project-passport-v2';let state;try{state=JSON.parse(localStorage.getItem(KEY))||JSON.parse(localStorage.getItem('project-passport-v1'))||{}}catch{state={}};
state={name:typeof state.name==='string'?state.name:'',done:Array.isArray(state.done)?[...new Set(state.done.filter(n=>Number.isInteger(n)&&n>=0&&n<10))]:[],lang:WORDS[state.lang]?state.lang:'en'};
const $=id=>document.getElementById(id),t=k=>WORDS[state.lang][k]||k;let current=0;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
const cleanDecorativeGlyphs=value=>String(value).replace(/[♥✧☆]/gu,'');
function removeDecorativeGlyphs(){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(!['SCRIPT','STYLE'].includes(node.parentElement?.tagName))node.nodeValue=cleanDecorativeGlyphs(node.nodeValue)}}
function toast(msg){const el=$('toast');el.textContent=cleanDecorativeGlyphs(msg);el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
const TERMINAL_CODES=['focus.start()','bill.split()','crew.vote()','parking.save()','budget.plan()','day.organize()','ads.analyze()','leads.decode()','water.detect()','subs.audit()'];
function makeStamp(p,inked){
 const div=document.createElement('div');div.className='ink-stamp'+(inked?' inked':'');
 const seal=document.createElement('span');seal.className='passport-seal';
 const arc=document.createElement('span');arc.className='seal-top';arc.textContent='DEV / PASS';
 const mark=document.createElement('strong');mark.className='seal-symbol';mark.textContent='>_';
 const bottom=document.createElement('span');bottom.className='seal-bottom';bottom.textContent=`DAY ${String(p.day).padStart(2,'0')}`;
 seal.append(arc,mark,bottom);
 const meta=document.createElement('span');meta.className='ink-meta';
 const title=document.createElement('b');title.textContent=p.name;
 const terminal=document.createElement('code');terminal.className='terminal-command';terminal.textContent='> '+TERMINAL_CODES[p.day-1];
 const date=document.createElement('small');date.textContent=`${p.published}  ·  ${inked?'ACCESS GRANTED':'LOCKED'}`;
 meta.append(title,terminal,date);div.append(seal,meta);return div;
}
function render(){document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==='en'?'ltr':'rtl';document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.lang));document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));$('explorerName').textContent=state.name||'Explorer';const n=state.done.length;$('count').innerHTML=`${n}<span>/10</span>`;$('percent').textContent=(n*10)+'%';$('remaining').textContent=10-n;$('progress').style.width=(n*10)+'%';$('download').disabled=n!==10;$('rewardText').textContent=t(n===10?'unlocked':'locked');
 $('cards').replaceChildren(...PROJECTS.map((p,i)=>{const done=state.done.includes(i);const el=document.createElement('article');el.className='mission-card'+(done?' done':'');const stamp=document.createElement('div');stamp.className='stamp';stamp.textContent=done?'</>':'{ }';const info=document.createElement('div');info.className='mission-info';const small=document.createElement('small');small.textContent=`DAY ${String(p.day).padStart(2,'0')} • ${p.published}`;const h=document.createElement('h3');h.textContent=p.name;const desc=document.createElement('p');desc.textContent=p.mission[state.lang==='ar'?1:state.lang==='he'?2:0];info.append(small,h,desc);const b=document.createElement('button');b.textContent=t(done?'collected':'view');b.addEventListener('click',()=>openMission(i));el.append(stamp,info,b);return el}));
 $('leftPage').replaceChildren(...PROJECTS.slice(0,5).map((p,i)=>makeStamp(p,state.done.includes(i))));$('rightPage').replaceChildren(...PROJECTS.slice(5).map((p,i)=>makeStamp(p,state.done.includes(i+5))));removeDecorativeGlyphs();}
function openMission(i){if(!state.name){$('nameDialog').showModal();return}current=i;const p=PROJECTS[i];$('modalDay').textContent=`DAY ${String(p.day).padStart(2,'0')}`;$('modalTitle').textContent=p.name;$('modalMission').textContent=p.mission[state.lang==='ar'?1:state.lang==='he'?2:0]+(p.video?' '+t('videoNotice'):'');$('modalPublished').textContent=`${t('published')}: ${p.published}`;const link=$('openProject');link.href=p.path?new URL('../../'+p.path,location.href).href:CONFIG.mainSite;link.textContent=t(p.path?'openProject':'unavailable');$('completeMission').textContent=t(state.done.includes(i)?'undo':p.video?'watchDone':'markComplete');$('missionDialog').showModal()}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{state.lang=b.dataset.lang;persist();render()}));$('start').addEventListener('click',()=>{if(!state.name)$('nameDialog').showModal();else $('passport').scrollIntoView({behavior:'smooth'})});$('editName').addEventListener('click',()=>{$('nameInput').value=state.name;$('nameDialog').showModal()});$('nameForm').addEventListener('submit',e=>{if(e.submitter?.value!=='save')return;const name=$('nameInput').value.trim();if(!name){e.preventDefault();return}state.name=name;persist();render();setTimeout(()=>$('passport').scrollIntoView({behavior:'smooth'}),100)});$('closeMission').addEventListener('click',()=>$('missionDialog').close());$('completeMission').addEventListener('click',()=>{if(state.done.includes(current))state.done=state.done.filter(i=>i!==current);else{state.done.push(current);toast(t('toast'))}persist();$('missionDialog').close();render()});$('shareProfile').addEventListener('click',async()=>{const url=CONFIG.instagram;if(navigator.share){try{await navigator.share({title:'Project Passport',text:'PROJECT PASSPORT',url})}catch{}}else{try{await navigator.clipboard.writeText(url);toast('Link copied ✓')}catch{window.open(url,'_blank','noopener')}}});
function createPassportCanvas(){
 if(state.done.length!==10)return null;
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=1200;
 const c=canvas.getContext('2d');
 c.fillStyle='#e8d9c9';c.fillRect(0,0,1800,1200);
 c.fillStyle='#682a43';round(c,55,85,1690,1010,28);c.fill();
 c.fillStyle='#fff9ed';round(c,75,105,812,970,14);c.fill();round(c,913,105,812,970,14);c.fill();
 c.fillStyle='#d2b8ad';c.fillRect(892,105,16,970);
 c.textAlign='center';c.fillStyle='#f6d5a1';c.font='bold 30px monospace';c.fillText('PROJECT PASSPORT  /  EXPLORER EDITION',900,56);
 c.fillStyle='#71374f';c.font='bold 23px monospace';c.fillText('01—05  /  DEV PASSPORT',480,158);c.fillText('06—10  /  DEV PASSPORT',1320,158);
 PROJECTS.forEach((p,i)=>{
   const slot=i%5; const x=(i<5?105:942)+[10,105,0,90,20][slot],y=[195,375,545,725,895][slot];
   c.save();c.translate(x+280,y+50);c.rotate([-10,8,-4,12,-8][i%5]*Math.PI/180);
   c.strokeStyle='#651a3a';c.fillStyle='#651a3a';c.lineWidth=8;
   c.strokeRect(-275,-52,550,104);c.lineWidth=2;c.strokeRect(-268,-45,536,90);
   // Rectangular terminal ticket instead of a round passport seal.
   c.fillStyle='#651a3a';c.fillRect(-258,-40,94,80);
   c.fillStyle='#fff9ed';c.textAlign='center';c.font='bold 13px monospace';c.fillText('DEV / PASS',-211,-21);
   c.font='bold 28px monospace';c.fillText('>_',-211,7);
   c.font='bold 12px monospace';c.fillText('DAY '+String(p.day).padStart(2,'0'),-211,29);
   c.fillStyle='#651a3a';
   c.textAlign='left';c.font='bold 23px Arial';let name=p.name;if(c.measureText(name).width>335)c.font='bold 18px Arial';c.fillText(p.name,-153,-22);
   c.fillStyle='#651a3a';c.fillRect(-156,-7,Math.min(385,160+TERMINAL_CODES[i].length*9),26);c.fillStyle='#fff9ed';c.font='bold 15px monospace';c.fillText('> '+TERMINAL_CODES[i],-151,11);c.fillStyle='#651a3a';
   c.font='bold 14px monospace';c.fillText(p.published+'  /  STAMPED',-151,35);
   c.restore();
 });
 c.fillStyle='#fff2d7';c.font='bold 23px Arial';c.textAlign='center';c.fillText('EXPLORER: '+state.name.slice(0,35)+'   •   10 / 10 STAMPS',900,1146);
 return canvas;
}
function downloadPassport(){const canvas=createPassportCanvas();if(canvas)saveCanvas(canvas,'project-passport-open.png')}
function saveCanvas(canvas,name){canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000);toast(t('saved'))},'image/png')}
$('download').addEventListener('click',downloadPassport);render();

// Flipbook interaction: preserve all existing stamp, progress and PNG functionality.
(()=>{
 const book=document.getElementById('flipbook'),cover=document.getElementById('flipCover');
 const labels={en:['OPEN PASSPORT ↗','CLOSE PASSPORT ↶','TAP TO OPEN ↗','Close passport'],ar:['افتح جواز السفر ↗','سكّر جواز السفر ↶','اضغط لتفتح ↗','إغلاق جواز السفر'],he:['פתיחת הדרכון ↗','סגירת הדרכון ↶','לחצו לפתיחה ↗','סגירת הדרכון']};
 const closeButton=document.createElement('button');
 closeButton.className='passport-close';
 closeButton.type='button';
 closeButton.hidden=true;
 book.append(closeButton);
 let open=false;
 function sync(){const lang=document.documentElement.lang||'en',v=labels[lang]||labels.en;book.classList.toggle('is-open',open);cover.setAttribute('aria-expanded',String(open));cover.setAttribute('aria-label',open?v[1]:v[0]);document.getElementById('coverHint').textContent=open?v[1]:v[2];document.getElementById('coverOwner').textContent=document.getElementById('explorerName').textContent||'EXPLORER';closeButton.textContent=v[3];closeButton.setAttribute('aria-label',v[3]);closeButton.hidden=!open;}
 cover.addEventListener('click',()=>{open=!open;sync()});
 closeButton.addEventListener('click',()=>{open=false;sync();cover.focus()});
 document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(sync,0)));
 new MutationObserver(sync).observe(document.getElementById('explorerName'),{childList:true,characterData:true,subtree:true});
 sync();
})();


// Shareable keepsake and animated passport export. Both use the participant's current stamps.
(()=>{
 const posterBtn=document.getElementById('saveKeepsake');
 const videoBtn=document.getElementById('saveVideo');
 const status=document.getElementById('exportStatus');
 const cover=new Image();cover.src='journey-cover.png';
 const ready=()=>cover.complete&&cover.naturalWidth>0?Promise.resolve():new Promise((resolve,reject)=>{cover.onload=resolve;cover.onerror=()=>reject(Error('Cover image unavailable'))});
 const drawCover=(c,x,y,w,h)=>{const ratio=Math.min(w/cover.naturalWidth,h/cover.naturalHeight),iw=cover.naturalWidth*ratio,ih=cover.naturalHeight*ratio;c.drawImage(cover,x+(w-iw)/2,y+(h-ih)/2,iw,ih)};
 const rounded=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r)};
 const label=(c,t,x,y,size=28,color='#f1d6a6')=>{c.fillStyle=color;c.font=`600 ${size}px Arial`;c.textAlign='center';c.fillText(t,x,y)};
 function poster(){const open=createPassportCanvas();if(!open)return null;const a=document.createElement('canvas');a.width=1080;a.height=1920;const c=a.getContext('2d');const bg=c.createLinearGradient(0,0,1080,1920);bg.addColorStop(0,'#f8f0e8');bg.addColorStop(1,'#ead5d9');c.fillStyle=bg;c.fillRect(0,0,1080,1920);c.fillStyle='#682a43';rounded(c,36,35,1008,1850,40);c.fill();label(c,'30 DAYS  /  30 PROJECTS',540,125,28);label(c,'MY PROJECT PASSPORT',540,197,53,'#fff7e9');drawCover(c,260,245,560,785);label(c,'THE JOURNEY',540,1110,31);c.save();c.shadowColor='#2e1323';c.shadowBlur=30;c.drawImage(open,65,1170,950,633);c.restore();label(c,(state.name||'EXPLORER').slice(0,28).toUpperCase()+'  •  10 / 10 STAMPS',540,1845,25);return a}
 async function exportPoster(){try{await ready();saveCanvas(poster(),'project-passport-keepsake.png')}catch(e){status.textContent=e.message}}
 function drawFrame(c,open,progress){c.fillStyle='#f6ece5';c.fillRect(0,0,720,1280);c.fillStyle='#682a43';rounded(c,20,20,680,1240,28);c.fill();label(c,'30 DAYS / 30 PROJECTS',360,93,20);label(c,'PROJECT PASSPORT',360,160,35,'#fff7e9');const eased=progress<.2?0:progress>.62?1:(progress-.2)/.42;const ease=eased*eased*(3-2*eased);const coverX=145-85*ease,coverY=220-65*ease,coverW=430-230*ease,coverH=640-345*ease; c.save();c.globalAlpha=1-ease*.1;drawCover(c,coverX,coverY,coverW,coverH);c.restore();if(ease>0){c.save();c.globalAlpha=ease;c.shadowColor='#170812';c.shadowBlur=16;c.drawImage(open,35,615-105*ease,650,433);c.restore()}if(progress>.75){label(c,'10 PROJECTS. 10 STAMPS.',360,1095,27);label(c,(state.name||'EXPLORER').slice(0,24).toUpperCase(),360,1152,25,'#fff7e9')}else{label(c,'A JOURNEY OF LEARNING & BUILDING',360,1140,20)}}
 async function exportVideo(){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video export is not supported in this browser. Try Chrome or Edge, or save the image.';return}
  try{await ready();const open=createPassportCanvas();if(!open)return;const mime=['video/mp4;codecs=avc1.42E01E','video/webm;codecs=vp9','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));if(!mime){status.textContent='Video export is not supported here. Use the PNG option.';return}
   videoBtn.disabled=true;status.textContent='Recording your passport animation…';const canvas=document.createElement('canvas');canvas.width=720;canvas.height=1280;const c=canvas.getContext('2d');const stream=canvas.captureStream(30);const chunks=[];const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise((resolve,reject)=>{rec.onstop=resolve;rec.onerror=reject});rec.start();const duration=4800,start=performance.now();await new Promise(resolve=>{function frame(now){const p=Math.min(1,(now-start)/duration);drawFrame(c,open,p);if(p<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)});await new Promise(r=>setTimeout(r,200));rec.stop();await done;stream.getTracks().forEach(t=>t.stop());const blob=new Blob(chunks,{type:mime});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='project-passport-animation.'+(mime.includes('mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Video saved! If Instagram does not accept WebM, convert it to MP4 before uploading.';
  }catch(e){status.textContent='Could not export video: '+e.message}finally{videoBtn.disabled=false}
 }
 posterBtn.addEventListener('click',exportPoster);videoBtn.addEventListener('click',exportVideo);
 const obs=new MutationObserver(()=>{const ok=state.done.length===10;posterBtn.disabled=!ok;videoBtn.disabled=!ok});obs.observe(document.getElementById('count'),{childList:true,subtree:true});posterBtn.disabled=videoBtn.disabled=state.done.length!==10;
})();

// The personal invitation uses the same passport onboarding as the hero.
document.getElementById('joinChallenge')?.addEventListener('click',()=>document.getElementById('start').click());
