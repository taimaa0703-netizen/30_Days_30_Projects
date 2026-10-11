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

Object.assign(WORDS.en,{inviteEyebrow:'THE NEXT STAMP COULD BE YOURS',inviteHeading:'Could the next stamp have your name on it?',inviteMessage:'Complete the first 10 stamps, share your passport, and become part of the next project.',inviteCTA:'JOIN THE JOURNEY ↗'});
Object.assign(WORDS.ar,{inviteEyebrow:'يمكن الختم الجاي يكون باسمك!',inviteHeading:'تخيّل الختم الجاي يكون باسمك؟ 👀',inviteMessage:'كمّل أول 10 أختام، شارك جوازك، وخليك جزء من المشروع الجاي.',inviteCTA:'يلا نبدأ ↗'});
Object.assign(WORDS.he,{inviteEyebrow:'אולי החותמת הבאה תהיה שלכם',inviteHeading:'אולי החותמת הבאה תהיה על שמכם?',inviteMessage:'השלימו את עשר החותמות הראשונות, שתפו את הדרכון שלכם והיו חלק מהפרויקט הבא.',inviteCTA:'מצטרפים למסע ↗'});
Object.assign(WORDS.he,{
 creatorLabel:'כמה מילים ממני',
 creatorHeading:'זה לא רק דרכון.',
 creatorMessage:'זהו חלק קטן מהמסע שלי: ללמוד, להתנסות, לטעות ולבנות משהו חדש בכל יום.',
 creatorThanks:'תודה שאתם חלק מהמסע הזה ומלווים אותי בכל צעד.',
 inviteEyebrow:'אולי החותמת הבאה תהיה שלכם',
 inviteHeading:'אולי החותמת הבאה תהיה על שמכם?',
 inviteMessage:'השלימו את עשר החותמות הראשונות, שתפו את הדרכון שלכם והיו חלק מהפרויקט הבא.',
 inviteCTA:'מצטרפים למסע ↗',
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
Object.assign(WORDS.ar,{inviteHeading:'تخيّل الختم الجاي يكون باسمك؟ 👀',inviteMessage:'كمّل أول 10 أختام، شارك جوازك، وخليك جزء من المشروع الجاي.',inviteCTA:'يلا نبدأ ↗',share:'مشاركة',explore:'استكشفوا',win:'الجائزة',toast:'تم جمع ختم جديد'});
Object.assign(WORDS.en,{
 how:'YOUR BOARDING PASS',
 joinTitle:'Your next adventure starts here',
 joinDescription:'Explore the projects, collect your stamps, and share the journey.',
 ticketLabel:'30 DAYS / 30 PROJECTS',
 ticketPassenger:'PASSENGER',
 ticketPassengerName:'PROJECT EXPLORER',
 ticketDestination:'DESTINATION',
 ticketDestinationName:'THE NEXT PROJECT',
 ticketFlight:'FLIGHT',
 ticketGate:'GATE',
 ticketStepsLabel:'YOUR JOURNEY',
 ticketStep1Title:'Explore the projects',
 ticketStep1Description:'Open each project and take a look.',
 ticketStep2Title:'Confirm your visit',
 ticketStep2Description:'After viewing, confirm to collect its stamp.',
 ticketStep3Title:'Download & share your passport',
 ticketStep3Description:'After all 10 stamps, download your passport, share it to your story, and tag me.',
 ticketCta:'Explore the projects',
 ticketFoot:'YOUR JOURNEY. YOUR STAMPS. YOUR PASSPORT.'
});
Object.assign(WORDS.ar,{
 how:'بطاقة صعودك إلى الرحلة',
 joinTitle:'مغامرتك القادمة تبدأ من هنا',
 joinDescription:'استكشفوا المشاريع، واجمعوا الأختام، وشاركوا رحلتكم.',
 ticketLabel:'30 يومًا / 30 مشروعًا',
 ticketPassenger:'المسافر',
 ticketPassengerName:'مستكشف المشاريع',
 ticketDestination:'الوجهة',
 ticketDestinationName:'المشروع القادم',
 ticketFlight:'رقم الرحلة',
 ticketGate:'البوابة',
 ticketStepsLabel:'محطات الرحلة',
 ticketStep1Title:'استكشفوا المشاريع',
 ticketStep1Description:'افتحوا كل مشروع وتعرّفوا عليه.',
 ticketStep2Title:'أكّدوا زيارتكم',
 ticketStep2Description:'بعد الاطلاع على المشروع، أكّدوا زيارتكم لتحصلوا على ختمه.',
 ticketStep3Title:'نزّلوا جوازكم وشاركوه',
 ticketStep3Description:'بعد جمع الأختام العشرة، نزّلوا جوازكم وانشروه في القصة وأشيروا إلى حسابي.',
 ticketCta:'استكشفوا المشاريع',
 ticketFoot:'رحلتكم. أختامكم. جوازكم.'
});
Object.assign(WORDS.he,{
 how:'כרטיס העלייה למסע',
 joinTitle:'ההרפתקה הבאה שלכם מתחילה כאן',
 joinDescription:'גלו את הפרויקטים, אספו חותמות ושתפו את המסע.',
 ticketLabel:'30 ימים / 30 פרויקטים',
 ticketPassenger:'נוסעים',
 ticketPassengerName:'חוקרי פרויקטים',
 ticketDestination:'יעד',
 ticketDestinationName:'הפרויקט הבא',
 ticketFlight:'טיסה',
 ticketGate:'שער',
 ticketStepsLabel:'מסלול המסע',
 ticketStep1Title:'צפו בפרויקטים',
 ticketStep1Description:'פתחו כל פרויקט והתרשמו ממנו.',
 ticketStep2Title:'אשרו שצפיתם',
 ticketStep2Description:'לאחר הצפייה, אשרו אותה כדי לאסוף חותמת.',
 ticketStep3Title:'הורידו ושתפו את הדרכון',
 ticketStep3Description:'לאחר איסוף כל 10 החותמות, הורידו את הדרכון, שתפו אותו בסטורי ותייגו אותי.',
 ticketCta:'לצפייה בפרויקטים',
 ticketFoot:'המסע שלכם. החותמות שלכם. הדרכון שלכם.'
});
const KEY='project-passport-v2';let state;try{state=JSON.parse(localStorage.getItem(KEY))||JSON.parse(localStorage.getItem('project-passport-v1'))||{}}catch{state={}};
state={name:typeof state.name==='string'?state.name:'',done:Array.isArray(state.done)?[...new Set(state.done.filter(n=>Number.isInteger(n)&&n>=0&&n<10))]:[],lang:WORDS[state.lang]?state.lang:'en'};
const $=id=>document.getElementById(id),t=k=>WORDS[state.lang][k]||k;let current=0;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
const cleanDecorativeGlyphs=value=>String(value).replace(/[♥✧☆]/gu,'');
function removeDecorativeGlyphs(){const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode())){if(!['SCRIPT','STYLE'].includes(node.parentElement?.tagName))node.nodeValue=cleanDecorativeGlyphs(node.nodeValue)}}
function toast(msg){const el=$('toast');el.textContent=cleanDecorativeGlyphs(msg);el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600)}
const TERMINAL_CODES=['focus.start()','bill.split()','crew.vote()','parking.save()','budget.plan()','day.organize()','ads.analyze()','leads.decode()','water.detect()','subs.audit()'];
function round(c,x,y,w,h,r){c.beginPath();c.roundRect(x,y,w,h,r)}
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
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{state.lang=b.dataset.lang;persist();render()}));$('start').addEventListener('click',()=>{if(!state.name)$('nameDialog').showModal();else $('passport').scrollIntoView({behavior:'smooth'})});$('editName').addEventListener('click',()=>{$('nameInput').value=state.name;$('nameDialog').showModal()});$('nameForm').addEventListener('submit',e=>{if(e.submitter?.value!=='save')return;const name=$('nameInput').value.trim();if(!name){e.preventDefault();return}state.name=name;persist();render();setTimeout(()=>$('passport').scrollIntoView({behavior:'smooth'}),100)});$('closeMission').addEventListener('click',()=>$('missionDialog').close());$('completeMission').addEventListener('click',()=>{if(state.done.includes(current))state.done=state.done.filter(i=>i!==current);else{state.done.push(current);toast(t('toast'))}persist();$('missionDialog').close();render()});
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
 const book=document.getElementById('flipbook');
 const cover=document.getElementById('flipCover');
 const labels={en:['Open passport ↗','Close passport ↶'],ar:['افتح جواز السفر ↗','إغلاق جواز السفر ↶'],he:['פתיחת הדרכון ↗','סגירת הדרכון ↶']};
 const toggleButton=document.createElement('button');
 toggleButton.className='passport-close';
 toggleButton.type='button';
 book.append(toggleButton);
 let open=false;
 function sync(){const lang=document.documentElement.lang||'en',v=labels[lang]||labels.en;book.classList.toggle('is-open',open);cover.disabled=true;cover.tabIndex=-1;cover.setAttribute('aria-hidden','true');document.getElementById('coverHint').textContent='';document.getElementById('coverOwner').textContent='';toggleButton.textContent=v[open?1:0];toggleButton.setAttribute('aria-label',v[open?1:0]);toggleButton.setAttribute('aria-expanded',String(open));}
 toggleButton.addEventListener('click',()=>{open=!open;sync()});
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
 function poster(){
  if(state.done.length!==10)return null;
  const width=1080,height=1920,a=document.createElement('canvas');a.width=width;a.height=height;
  const c=a.getContext('2d'),wine='#682a43',gold='#f1d6a6',cream='#fff9ed',ink='#4e1c32';
  const bg=c.createLinearGradient(0,0,width,height);bg.addColorStop(0,'#f8f0e8');bg.addColorStop(1,'#ead5d9');c.fillStyle=bg;c.fillRect(0,0,width,height);
  c.fillStyle=wine;rounded(c,28,28,1024,1864,38);c.fill();
  c.strokeStyle='#d8b77c';c.lineWidth=2;rounded(c,45,45,990,1830,28);c.stroke();
  c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=gold;c.font='700 23px Arial';c.fillText('30 DAYS  /  30 PROJECTS',540,105);
  c.fillStyle=cream;c.font='700 45px Arial';c.fillText('MY PROJECT PASSPORT',540,166);
  c.save();c.shadowColor='#2e1323';c.shadowBlur=24;drawCover(c,92,202,230,330);c.restore();
  c.textAlign='left';c.fillStyle=gold;c.font='700 20px Arial';c.fillText('THE JOURNEY',370,270);
  c.fillStyle=cream;c.font='700 42px Arial';c.fillText((state.name||'EXPLORER').slice(0,20).toUpperCase(),370,328,590);
  c.fillStyle=gold;c.font='700 51px Arial';c.fillText('10 / 10',370,406);
  c.fillStyle=cream;c.font='600 19px Arial';c.fillText('STAMPS COLLECTED',575,405);
  c.fillStyle='#d8b77c';rounded(c,370,438,620,4,2);c.fill();
  c.fillStyle=cream;c.font='600 18px Arial';c.fillText('A JOURNEY OF LEARNING, BUILDING AND GROWING',370,482,610);
  c.textAlign='left';c.fillStyle=gold;c.font='700 23px Arial';c.fillText('YOUR 10 STAMPS',68,607);
  c.textAlign='right';c.fillStyle='#f5e7d7';c.font='600 16px Arial';c.fillText('ALL PROJECTS COMPLETE',1012,606);
  const columns=[68,546],cardWidth=466,cardHeight=184,rowGap=18,gridTop=640;
  PROJECTS.forEach((project,index)=>{
   const x=columns[index<5?0:1],y=gridTop+(index%5)*(cardHeight+rowGap);
   c.save();c.shadowColor='#30131f28';c.shadowBlur=12;c.shadowOffsetY=4;
   c.fillStyle=cream;rounded(c,x,y,cardWidth,cardHeight,18);c.fill();c.restore();
   c.strokeStyle='#d8b77c';c.lineWidth=2;rounded(c,x+4,y+4,cardWidth-8,cardHeight-8,14);c.stroke();
   c.fillStyle=wine;rounded(c,x+18,y+16,82,30,15);c.fill();
   c.textAlign='center';c.textBaseline='middle';c.fillStyle=gold;c.font='700 14px Arial';c.fillText('DAY '+String(project.day).padStart(2,'0'),x+59,y+31);
   c.fillStyle=wine;rounded(c,x+113,y+16,112,30,15);c.fill();
   c.fillStyle=cream;c.font='700 12px Arial';c.fillText('STAMPED',x+169,y+31);
   c.textAlign='left';c.textBaseline='alphabetic';c.fillStyle=ink;let fontSize=24;c.font=`700 ${fontSize}px Arial`;
   while(c.measureText(project.name).width>285&&fontSize>17){fontSize--;c.font=`700 ${fontSize}px Arial`}
   c.fillText(project.name,x+20,y+82,292);
   c.fillStyle=wine;rounded(c,x+18,y+98,302,34,7);c.fill();
   c.textAlign='left';c.textBaseline='middle';c.fillStyle=cream;c.font='700 14px monospace';c.fillText('> '+TERMINAL_CODES[index],x+28,y+115,282);
   c.textBaseline='alphabetic';c.fillStyle='#755a61';c.font='600 13px Arial';c.fillText(project.published+'  •  COLLECTED',x+20,y+158,298);
   const stampX=x+385,stampY=y+91;
   c.save();c.translate(stampX,stampY);c.rotate(-.12);c.strokeStyle='#8b3a55';c.lineWidth=3;c.beginPath();c.arc(0,0,40,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,34,0,Math.PI*2);c.stroke();c.textAlign='center';c.textBaseline='middle';c.fillStyle='#8b3a55';c.font='700 11px Arial';c.fillText('PASSPORT',0,-9);c.font='700 13px Arial';c.fillText('✓  OK',0,9);c.restore();
  });
  c.textAlign='center';c.textBaseline='alphabetic';c.fillStyle=gold;c.font='700 22px Arial';c.fillText('SHARE YOUR JOURNEY TO YOUR STORY',540,1690);
  c.fillStyle=cream;c.font='600 17px Arial';c.fillText('TAG ME — AND THANK YOU FOR BEING PART OF THE JOURNEY',540,1726);
  c.strokeStyle='#d8b77c';c.lineWidth=1; c.beginPath();c.moveTo(215,1760);c.lineTo(865,1760);c.stroke();
  c.fillStyle='#f5e7d7';c.font='600 15px Arial';c.fillText('30 DAYS  /  30 PROJECTS     •     EXPLORER EDITION',540,1800);
  return a
 }
 async function exportPoster(){try{await ready();saveCanvas(poster(),'project-passport-keepsake.png')}catch(e){status.textContent=e.message}}
 const VIDEO_WIDTH=720,VIDEO_HEIGHT=1280,VIDEO_DURATION=15000,VIDEO_FPS=30;
 const videoText={
  en:{
   reveal:'جرّبوا المشاريع واجمعوا 10 أختام 🛂',
   requirements:'HOW TO JOIN THE CHALLENGE',
   steps:['Share my Instagram profile to your Story and tag me.','Complete all 10 stamps.','Share your completed passport to your Story and tag me again.'],
   prizeTitle:'A PROJECT 11 MADE WITH YOU',
   prize:'The first eligible participant can choose a small idea for Project 11 — and have their name featured on stamp 11.',
   thanksAr:'شكرًا إنكم جزء من رحلتي ♡',
   thanksEn:'Thank you for being part of my journey.'
  },
  ar:{
   reveal:'جرّبوا المشاريع واجمعوا 10 أختام 🛂',
   requirements:'كيف تشاركون في التحدّي',
   steps:['شاركوا حسابي على إنستغرام في قصتكم وأشيروا إلى حسابي.','اجمعوا الأختام العشرة كلها.','شاركوا جوازكم المكتمل في قصتكم وأشيروا إلى حسابي مرة أخرى.'],
   prizeTitle:'المشروع الحادي عشر بمشاركتكم',
   prize:'أول مشارك يستوفي الشروط يستطيع اختيار فكرة صغيرة للمشروع 11، وسيظهر اسمه على الختم رقم 11.',
   thanksAr:'شكرًا إنكم جزء من رحلتي ♡',
   thanksEn:'Thank you for being part of my journey.'
  },
  he:{
   reveal:'جرّبوا المشاريع واجمعوا 10 أختام 🛂',
   requirements:'איך משתתפים באתגר',
   steps:['שתפו את פרופיל האינסטגרם שלי בסטורי ותייגו אותי.','אספו את כל 10 החותמות.','שתפו את הדרכון המלא בסטורי ותייגו אותי שוב.'],
   prizeTitle:'פרויקט 11 נוצר יחד איתכם',
   prize:'המשתתף הראשון שיעמוד בתנאים יוכל לבחור רעיון קטן לפרויקט 11, ושמו יופיע על חותמת 11.',
   thanksAr:'شكرًا إنكم جزء من رحلتي ♡',
   thanksEn:'Thank you for being part of my journey.'
  }
 };
 const easeInOut=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x)};
 function drawVideoText(c,text,x,y,maxWidth,lineHeight,font,color,direction='ltr'){
  c.save();c.font=font;c.fillStyle=color;c.textAlign='center';c.textBaseline='alphabetic';c.direction=direction;
  const lines=[];let line='';
  for(const word of text.split(/\s+/)){
   const candidate=line?`${line} ${word}`:word;
   if(line&&c.measureText(candidate).width>maxWidth){lines.push(line);line=word}else line=candidate;
  }
  if(line)lines.push(line);
  lines.forEach((entry,index)=>c.fillText(entry,x,y+index*lineHeight,maxWidth));
  c.restore();
  return lines.length;
 }
 function videoPanel(c,x,y,w,h,options={}){
  c.save();c.globalAlpha=options.alpha??1;c.fillStyle=options.fill||'#fffaf2';c.strokeStyle=options.stroke||'#d8b77c';c.lineWidth=options.lineWidth||2;rounded(c,x,y,w,h,options.radius||24);c.fill();c.stroke();c.restore();
 }
 function drawVideoBackdrop(c,accent='#d8b77c'){
  const gradient=c.createLinearGradient(0,0,VIDEO_WIDTH,VIDEO_HEIGHT);
  gradient.addColorStop(0,'#f8f0e8');gradient.addColorStop(.55,'#fffaf2');gradient.addColorStop(1,'#ead5d9');
  c.fillStyle=gradient;c.fillRect(0,0,VIDEO_WIDTH,VIDEO_HEIGHT);
  c.save();c.strokeStyle=accent;c.globalAlpha=.22;c.lineWidth=2;
  c.beginPath();c.arc(360,640,510,0,Math.PI*2);c.stroke();
  c.globalAlpha=.1;c.beginPath();c.arc(360,640,550,0,Math.PI*2);c.stroke();c.restore();
 }
 function drawVideoScene(c,open,index,localTime){
  const copy=videoText[state.lang]||videoText.en;
  const rtl=state.lang==='ar';
  const fade=easeInOut(Math.min(1,localTime/.45));
  c.save();c.globalAlpha=fade;
  drawVideoBackdrop(c);
  if(index===0){
   label(c,'30 DAYS / 30 PROJECTS',360,100,19,'#8a6a3b');
   const zoom=1+.025*Math.sin(Math.min(1,localTime/3)*Math.PI);
   c.save();c.translate(360,580);c.scale(zoom,zoom);drawCover(c,-238,-350,476,700);c.restore();
   videoPanel(c,42,975,636,126,{fill:'#682a43',stroke:'#d8b77c'});
   drawVideoText(c,'10 PROJECTS. 10 STAMPS. ONE JOURNEY.',360,1052,580,42,'700 27px Arial','#fff7e9');
   c.restore();return;
  }
  if(index===1){
   label(c,'PROJECT PASSPORT  /  10 STAMPS',360,145,18,'#8a6a3b');
   const reveal=easeInOut(Math.min(1,localTime/1.1));
   c.save();c.globalAlpha=reveal;c.translate(360,500);c.scale(.88+.12*reveal,.88+.12*reveal);c.shadowColor='#30131f38';c.shadowBlur=22;c.drawImage(open,-330,-220,660,440);c.restore();
   const flap=1-reveal;
   if(flap>.01){c.save();c.translate(360,500);c.scale(Math.max(.025,flap),1);drawCover(c,-245,-365,490,730);c.restore()}
   videoPanel(c,42,810,636,188,{fill:'#682a43',stroke:'#d8b77c'});
   drawVideoText(c,copy.reveal,360,885,570,42,'700 27px Arial','#fff7e9','rtl');
   drawVideoText(c,'10 / 10 STAMPS',360,955,570,32,'700 19px Arial','#f1d6a6');
   c.restore();return;
  }
  if(index===2){
   drawVideoText(c,copy.requirements,360,150,620,42,'700 30px Arial','#682a43',rtl?'rtl':'ltr');
   const directions=rtl?'rtl':'ltr';
   const stepY=[250,535,820];
   copy.steps.forEach((text,step)=>{
    const appear=easeInOut(Math.min(1,(localTime-step*.55)/.45));
    const y=stepY[step]+(1-appear)*24;
    videoPanel(c,40,y,640,225,{alpha:appear,fill:'#fffdfa',stroke:'#d8b77c'});
    c.save();c.globalAlpha=appear;c.fillStyle='#682a43';c.beginPath();c.arc(rtl?620:100,y+54,28,0,Math.PI*2);c.fill();
    c.fillStyle='#f1d6a6';c.font='700 17px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(String(step+1).padStart(2,'0'),rtl?620:100,y+54);c.restore();
    drawVideoText(c,text,rtl?340:380,y+88,rtl?500:500,34,'600 22px Arial','#4e1c32',directions);
   });
   c.restore();return;
  }
  if(index===3){
   label(c,'THE FIRST ELIGIBLE PARTICIPANT',360,235,16,'#9b7540');
   videoPanel(c,48,340,624,570,{fill:'#682a43',stroke:'#d8b77c',radius:30});
   label(c,'PROJECT 11',360,485,25,'#f1d6a6');
   drawVideoText(c,copy.prizeTitle,360,555,520,44,'700 32px Arial','#fff7e9',rtl?'rtl':'ltr');
   c.save();c.fillStyle='#d8b77c';c.beginPath();c.arc(360,665,36,0,Math.PI*2);c.fill();c.fillStyle='#682a43';c.font='700 24px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText('11',360,665);c.restore();
   drawVideoText(c,copy.prize,360,765,520,39,'600 22px Arial','#fff7e9',rtl?'rtl':'ltr');
   label(c,'YOUR NAME ON STAMP 11',360,1005,18,'#8a6a3b');
   c.restore();return;
  }
  const bloom=c.createRadialGradient(360,475,30,360,640,580);
  bloom.addColorStop(0,'#fffaf2');bloom.addColorStop(1,'#e8d7d1');c.fillStyle=bloom;c.fillRect(0,0,VIDEO_WIDTH,VIDEO_HEIGHT);
  label(c,'30 DAYS / 30 PROJECTS',360,215,18,'#8a6a3b');
  drawCover(c,275,300,170,255);
  videoPanel(c,38,710,644,255,{fill:'#682a43',stroke:'#d8b77c',radius:28});
  drawVideoText(c,copy.thanksAr,360,805,580,46,'700 29px Arial','#f1d6a6','rtl');
  drawVideoText(c,copy.thanksEn,360,885,580,42,'600 24px Arial','#fff7e9','ltr');
  c.restore();
 }
 const VIDEO_SCENES=[{start:0,end:3},{start:3,end:7},{start:7,end:11},{start:11,end:13},{start:13,end:15}];
 function drawFrame(c,open,elapsedMs){
  const seconds=Math.max(0,Math.min(15,elapsedMs/1000));
  let sceneIndex=VIDEO_SCENES.findIndex(scene=>seconds<scene.end);
  if(sceneIndex<0)sceneIndex=VIDEO_SCENES.length-1;
  const scene=VIDEO_SCENES[sceneIndex],local=seconds-scene.start;
  if(sceneIndex>0&&local<.32){
   const previous=VIDEO_SCENES[sceneIndex-1],blend=easeInOut(local/.32);
   drawVideoScene(c,open,sceneIndex-1,previous.end-previous.start);
   c.save();c.globalAlpha=blend;drawVideoScene(c,open,sceneIndex,local);c.restore();
  }else drawVideoScene(c,open,sceneIndex,local);
  if(sceneIndex===VIDEO_SCENES.length-1&&seconds>14.68){c.save();c.globalAlpha=1-easeInOut((seconds-14.68)/.32);c.fillStyle='#f8f0e8';c.fillRect(0,0,VIDEO_WIDTH,VIDEO_HEIGHT);c.restore()}
 }
 async function exportVideo(){
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video export is not supported in this browser. Try Chrome or Edge, or save the image.';return}
  let stream;
  try{await ready();const open=createPassportCanvas();if(!open)return;const mime=['video/mp4;codecs=avc1.42E01E','video/webm;codecs=vp9','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));if(!mime){status.textContent='Video export is not supported here. Use the PNG option.';return}
   videoBtn.disabled=true;status.textContent='Recording your 15-second passport story…';const canvas=document.createElement('canvas');canvas.width=VIDEO_WIDTH;canvas.height=VIDEO_HEIGHT;const c=canvas.getContext('2d');stream=canvas.captureStream(VIDEO_FPS);const track=stream.getVideoTracks()[0],chunks=[];const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise((resolve,reject)=>{rec.onstop=resolve;rec.onerror=event=>reject(event.error||Error('Video recording failed'))});drawFrame(c,open,0);rec.start();if(track.requestFrame)track.requestFrame();const started=performance.now();let frameId=0;const drawCurrentFrame=()=>{const elapsed=Math.min(VIDEO_DURATION,performance.now()-started);drawFrame(c,open,elapsed);if(track.requestFrame)track.requestFrame()};const render=()=>{drawCurrentFrame();if(performance.now()-started<VIDEO_DURATION)frameId=requestAnimationFrame(render)};frameId=requestAnimationFrame(render);const fallback=setInterval(()=>{if(document.visibilityState==='hidden')drawCurrentFrame()},1000/VIDEO_FPS);await new Promise(resolve=>setTimeout(resolve,VIDEO_DURATION));cancelAnimationFrame(frameId);clearInterval(fallback);drawFrame(c,open,VIDEO_DURATION);if(track.requestFrame)track.requestFrame();rec.stop();await done;const blob=new Blob(chunks,{type:mime});if(!blob.size)throw Error('The video export was empty');const metadataUrl=URL.createObjectURL(blob);let duration;try{const video=document.createElement('video');video.preload='metadata';video.src=metadataUrl;await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(Error('The exported video could not be verified'))});duration=video.duration;video.removeAttribute('src');video.load()}finally{URL.revokeObjectURL(metadataUrl)}if(!Number.isFinite(duration)||Math.abs(duration-VIDEO_DURATION/1000)>1/VIDEO_FPS)throw Error('The browser interrupted the recording before all 15 seconds were captured. Keep this tab open and try again.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='project-passport-animation.'+(mime.includes('mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Your 15-second video is ready to share.';
  }catch(e){status.textContent='Could not export video: '+e.message}finally{if(stream)stream.getTracks().forEach(track=>track.stop());videoBtn.disabled=false}
 }
 posterBtn.addEventListener('click',exportPoster);videoBtn.addEventListener('click',exportVideo);
 const obs=new MutationObserver(()=>{const ok=state.done.length===10;posterBtn.disabled=!ok;videoBtn.disabled=!ok});obs.observe(document.getElementById('count'),{childList:true,subtree:true});posterBtn.disabled=videoBtn.disabled=state.done.length!==10;
})();

// The personal invitation uses the same passport onboarding as the hero.
document.getElementById('joinChallenge')?.addEventListener('click',()=>document.getElementById('start').click());
