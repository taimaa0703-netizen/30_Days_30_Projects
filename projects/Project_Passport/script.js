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
Object.assign(WORDS.en,{preview:'PERSONALIZED PASSPORT • LIVE PREVIEW'});
Object.assign(WORDS.ar,{preview:'جواز السفر المخصّص • معاينة مباشرة'});
Object.assign(WORDS.he,{preview:'הדרכון האישי • תצוגה מקדימה'});
Object.assign(WORDS.en,{creatorLabel:'A NOTE FROM THE CREATOR',creatorHeading:'THIS ISN’T JUST A PASSPORT.',creatorMessage:'It’s a little piece of my journey — learning, experimenting, making mistakes, and building something new every day.',creatorThanks:'Thank you for being part of my journey.'});
Object.assign(WORDS.ar,{creatorLabel:'رسالة صغيرة منّي إلكم',creatorHeading:'هاد مش بس جواز سفر.',creatorMessage:'كل مشروع هون هو خطوة صغيرة برحلتي بالتعلّم والتجربة. مش كل إشي بزبط من أول مرة، بس مع كل محاولة بتعلّم إشي جديد.',creatorThanks:'وشكرًا إلكم إنكم جزء من هالرحلة، وعم تشاركوني إياها خطوة بخطوة.'});
Object.assign(WORDS.he,{creatorLabel:'כמה מילים ממני אליכם',creatorHeading:'זה לא סתם דרכון.',creatorMessage:'כל פרויקט כאן הוא צעד קטן במסע שלי — ללמוד, להתנסות, לטעות ולבנות משהו חדש בכל יום.',creatorThanks:'תודה שאתם חלק מהמסע הזה, ושאתם מלווים אותי צעד אחר צעד.'});

Object.assign(WORDS.en,{inviteEyebrow:'THE NEXT STAMP COULD BE YOURS',inviteHeading:'To say thank you, I want to do something special tied to the journey we’ve shared, so here are the participation details, because you’re part of these projects too.',inviteMessage:'Complete the first 10 stamps, share your passport, and become part of the next project.',inviteCTA:'JOIN THE JOURNEY ↗'});
Object.assign(WORDS.ar,{inviteEyebrow:'يمكن الختم الجاي يكون باسمك!',inviteHeading:'مع الشكر، حابّة أعمل نشاط حلو مرتبط بالرحلة اللي مشيناها سوا، وهون بعرضلكم شروط المشاركة، لأنكم كمان جزء من الرحلة.',inviteMessage:'كمّل أول 10 أختام، شارك جوازك، وخليك جزء من المشروع الجاي.',inviteCTA:'يلا نبدأ ↗'});
Object.assign(WORDS.he,{inviteEyebrow:'אולי החותמת הבאה תהיה שלכם',inviteHeading:'לכבוד התודה, אני רוצה לעשות פעילות יפה שקשורה למסע שעברנו יחד, ובזה אני מציגה לכם את תנאי ההשתתפות, כי אתם גם חלק מהפרויקטים.',inviteMessage:'השלימו את עשר החותמות הראשונות, שתפו את הדרכון שלכם והיו חלק מהפרויקט הבא.',inviteCTA:'מצטרפים למסע ↗'});
Object.assign(WORDS.he,{
 creatorLabel:'כמה מילים ממני',
 creatorHeading:'זה לא רק דרכון.',
 creatorMessage:'זהו חלק קטן מהמסע שלי: ללמוד, להתנסות, לטעות ולבנות משהו חדש בכל יום.',
 creatorThanks:'תודה שאתם חלק מהמסע הזה ומלווים אותי בכל צעד.',
 inviteEyebrow:'אולי החותמת הבאה תהיה שלכם',
 inviteHeading:'לכבוד התודה, אני רוצה לעשות פעילות יפה שקשורה למסע שעברנו יחד, ובזה אני מציגה לכם את תנאי ההשתתפות, כי אתם גם חלק מהפרויקטים.',
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
Object.assign(WORDS.ar,{stepsTitle:'كيف تشاركوا؟',step1:'تابعوا صفحتي على الإنستغرام 💗',step2:'شفتوا المشاريع الـ10 الأولى؟ اجمعوا أختامها بجواز سفركم! ✈️',step3:'نزّلوا جواز سفركم وشاركوه بالستوري، مع منشن لحسابي. ♡',prizeTitle:'🎁 شو الجائزة؟',prizeMain:'فكرتك ممكن تكون واحد من المشاريع الجايّة! 💻💗',prizeSub:'إنت بتقترح الفكرة، وأنا بحوّلها لمشروع حقيقي ضمن تحدّي 30 يوم، 30 مشروع! ✨'});
Object.assign(WORDS.he,{stepsTitle:'איך משתתפים?',step1:'עקבו אחרי הדף שלי באינסטגרם 💗',step2:'ראיתם את 10 הפרויקטים הראשונים? אספו את החותמות שלהם בדרכון שלכם! ✈️',step3:'הורידו את הדרכון ושתפו אותו בסטורי, עם תיוג של החשבון שלי. ♡',prizeTitle:'🎁 מה הפרס?',prizeMain:'הרעיון שלכם יכול להיות אחד מהפרויקטים הבאים שלי! 💻💗',prizeSub:'אתם מציעים את הרעיון, ואני הופכת אותו לפרויקט אמיתי במסגרת האתגר 30 ימים, 30 פרויקטים! ✨'});
Object.assign(WORDS.en,{stepsTitle:'How to join',step1:'Follow my Instagram page 💗',step2:'Seen the first 10 projects? Collect their stamps in your passport! ✈️',step3:'Download your passport and share it on your story, tagging my account. ♡',prizeTitle:'🎁 What\'s the prize?',prizeMain:'Your idea could be one of my upcoming projects! 💻💗',prizeSub:'You suggest the idea, and I\'ll turn it into a real project in the 30 Days, 30 Projects challenge! ✨'});
Object.assign(WORDS.ar,{inviteHeading:'مع الشكر، حابّة أعمل نشاط حلو مرتبط بالرحلة اللي مشيناها سوا، وهون بعرضلكم شروط المشاركة، لأنكم كمان جزء من الرحلة.',inviteMessage:'كمّل أول 10 أختام، شارك جوازك، وخليك جزء من المشروع الجاي.',inviteCTA:'يلا نبدأ ↗',share:'مشاركة',explore:'استكشفوا',win:'الجائزة',toast:'تم جمع ختم جديد'});
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
function makeStamp(p,inked){
 const div=document.createElement('div');div.className='ink-stamp'+(inked?' inked':'');
 const seal=document.createElement('span');seal.className='passport-seal';
 const arc=document.createElement('span');arc.className='seal-top';arc.textContent='DEV / PASS';
 const mark=document.createElement('strong');mark.className='seal-symbol';mark.textContent='>_';
 const bottom=document.createElement('span');bottom.className='seal-bottom';bottom.textContent=`DAY ${String(p.day).padStart(2,'0')}`;
 seal.append(arc,mark,bottom);
 const meta=document.createElement('span');meta.className='ink-meta';
 const title=document.createElement('b');title.textContent=p.name;
 const terminal=document.createElement('code');terminal.className='terminal-command';terminal.textContent='> '+['focus.start()','bill.split()','crew.vote()','parking.save()','budget.plan()','day.organize()','ads.analyze()','leads.decode()','water.detect()','subs.audit()'][p.day-1];
 const date=document.createElement('small');date.textContent=`${p.published}  ·  ${inked?'ACCESS GRANTED':'LOCKED'}`;
 meta.append(title,terminal,date);div.append(seal,meta);return div;
}
function render(){document.documentElement.lang=state.lang;document.documentElement.dir='rtl';const textDir=state.lang==='en'?'ltr':'rtl';document.querySelectorAll('[data-t]').forEach(el=>{el.dir=textDir});document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.lang));document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));$('explorerName').textContent=state.name||'Explorer';const n=state.done.length;$('count').innerHTML=`${n}<span>/10</span>`;$('percent').textContent=(n*10)+'%';$('remaining').textContent=10-n;$('progress').style.width=(n*10)+'%';$('download').disabled=n!==10;$('rewardText').textContent=t(n===10?'unlocked':'locked');
 $('cards').replaceChildren(...PROJECTS.map((p,i)=>{const done=state.done.includes(i);const el=document.createElement('article');el.className='mission-card'+(done?' done':'');const stamp=document.createElement('div');stamp.className='stamp';stamp.textContent=done?'</>':'{ }';const info=document.createElement('div');info.className='mission-info';const small=document.createElement('small');small.textContent=`DAY ${String(p.day).padStart(2,'0')} • ${p.published}`;const h=document.createElement('h3');h.textContent=p.name;const desc=document.createElement('p');desc.textContent=p.mission[state.lang==='ar'?1:state.lang==='he'?2:0];info.append(small,h,desc);const b=document.createElement('button');b.textContent=t(done?'collected':'view');b.addEventListener('click',()=>openMission(i));el.append(stamp,info,b);return el}));
 $('leftPage').replaceChildren(...PROJECTS.slice(0,5).map((p,i)=>makeStamp(p,state.done.includes(i))));
 $('rightPage').replaceChildren(...PROJECTS.slice(5).map((p,i)=>makeStamp(p,state.done.includes(i+5))));
 $('coverOwner').textContent=(state.name||'EXPLORER').toLocaleUpperCase();
 removeDecorativeGlyphs();}
function openMission(i){if(!state.name){$('nameDialog').showModal();return}current=i;const p=PROJECTS[i];$('modalDay').textContent=`DAY ${String(p.day).padStart(2,'0')}`;$('modalTitle').textContent=p.name;$('modalMission').textContent=p.mission[state.lang==='ar'?1:state.lang==='he'?2:0]+(p.video?' '+t('videoNotice'):'');$('modalPublished').textContent=`${t('published')}: ${p.published}`;const link=$('openProject');link.href=p.path?new URL('../../'+p.path,location.href).href:CONFIG.mainSite;link.textContent=t(p.path?'openProject':'unavailable');$('completeMission').textContent=t(state.done.includes(i)?'undo':p.video?'watchDone':'markComplete');$('missionDialog').showModal()}
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{state.lang=b.dataset.lang;persist();render()}));$('start').addEventListener('click',()=>{if(!state.name)$('nameDialog').showModal();else $('passport').scrollIntoView({behavior:'smooth'})});$('editName').addEventListener('click',()=>{$('nameInput').value=state.name;$('nameDialog').showModal()});$('nameForm').addEventListener('submit',e=>{if(e.submitter?.value!=='save')return;const name=$('nameInput').value.trim();if(!name){e.preventDefault();return}state.name=name;persist();render();window.setPersonalizedPassportName?.(name);setTimeout(()=>$('passport').scrollIntoView({behavior:'smooth'}),100)});$('closeMission').addEventListener('click',()=>$('missionDialog').close());$('completeMission').addEventListener('click',()=>{if(state.done.includes(current))state.done=state.done.filter(i=>i!==current);else{state.done.push(current);toast(t('toast'))}persist();$('missionDialog').close();render()});
function downloadPassport(){if(state.done.length===10)window.downloadPersonalizedPassport()}
$('saveVideo').dataset.t='exportVideo';
$('download').addEventListener('click',downloadPassport);render();

// Keep the stamp-tracking passport opening control separate from the original-artwork editor.
(()=>{
 const book=document.getElementById('flipbook');
 const cover=document.getElementById('flipCover');
 const labels={en:['Open passport ↗','Close passport ↶'],ar:['افتح جواز السفر ↗','إغلاق جواز السفر ↶'],he:['פתיחת הדרכון ↗','סגירת הדרכון ↶']};
 const toggleButton=document.createElement('button');
 toggleButton.className='passport-close';
 toggleButton.type='button';
 book.append(toggleButton);
 let open=false;
 function sync(){
  const lang=document.documentElement.lang||'en',words=labels[lang]||labels.en;
  book.classList.toggle('is-open',open);
  cover.disabled=true;
  cover.tabIndex=-1;
  cover.setAttribute('aria-hidden','true');
  document.getElementById('coverHint').textContent='';
  document.getElementById('coverOwner').textContent='';
  toggleButton.textContent=words[open?1:0];
  toggleButton.setAttribute('aria-label',words[open?1:0]);
  toggleButton.setAttribute('aria-expanded',String(open));
 }
 toggleButton.addEventListener('click',()=>{open=!open;sync()});
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setTimeout(sync,0)));
 new MutationObserver(sync).observe(document.getElementById('explorerName'),{childList:true,characterData:true,subtree:true});
 sync();
})();

// Animated challenge video using the original personalized passport image.
(()=>{
 const videoBtn=document.getElementById('saveVideo');
 const status=document.getElementById('exportStatus');
 let passportCanvas;
 const ready=async()=>{await window.passportArtworkReady;await window.passportFontsReady;passportCanvas=window.createPersonalizedPassportCanvas(state.name)};
 const drawCover=(c,x,y,w,h)=>{const ratio=Math.min(w/passportCanvas.width,h/passportCanvas.height),iw=passportCanvas.width*ratio,ih=passportCanvas.height*ratio;c.drawImage(passportCanvas,x+(w-iw)/2,y+(h-ih)/2,iw,ih)};
 const rounded=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r)};
 const label=(c,text,x,y,size,color)=>{c.save();c.fillStyle=color;c.font=`700 ${size}px Arial`;c.textAlign='center';c.textBaseline='middle';c.fillText(text,x,y);c.restore()};
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
   c.save();c.globalAlpha=reveal;c.translate(360,500);c.scale(.88+.12*reveal,.88+.12*reveal);c.shadowColor='#30131f38';c.shadowBlur=22;drawCover(c,-330,-290,660,580);c.restore();
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
  try{await ready();const open=passportCanvas;const mime=['video/mp4;codecs=avc1.42E01E','video/webm;codecs=vp9','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));if(!mime){status.textContent='Video export is not supported here. Use the PNG option.';return}
   videoBtn.disabled=true;status.textContent='Recording your 15-second passport story…';const canvas=document.createElement('canvas');canvas.width=VIDEO_WIDTH;canvas.height=VIDEO_HEIGHT;const c=canvas.getContext('2d');stream=canvas.captureStream(VIDEO_FPS);const track=stream.getVideoTracks()[0],chunks=[];const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:3500000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};const done=new Promise((resolve,reject)=>{rec.onstop=resolve;rec.onerror=event=>reject(event.error||Error('Video recording failed'))});drawFrame(c,open,0);rec.start();if(track.requestFrame)track.requestFrame();const started=performance.now();let frameId=0;const drawCurrentFrame=()=>{const elapsed=Math.min(VIDEO_DURATION,performance.now()-started);drawFrame(c,open,elapsed);if(track.requestFrame)track.requestFrame()};const render=()=>{drawCurrentFrame();if(performance.now()-started<VIDEO_DURATION)frameId=requestAnimationFrame(render)};frameId=requestAnimationFrame(render);const fallback=setInterval(()=>{if(document.visibilityState==='hidden')drawCurrentFrame()},1000/VIDEO_FPS);await new Promise(resolve=>setTimeout(resolve,VIDEO_DURATION));cancelAnimationFrame(frameId);clearInterval(fallback);drawFrame(c,open,VIDEO_DURATION);if(track.requestFrame)track.requestFrame();rec.stop();await done;const blob=new Blob(chunks,{type:mime});if(!blob.size)throw Error('The video export was empty');const metadataUrl=URL.createObjectURL(blob);let duration;try{const video=document.createElement('video');video.preload='metadata';video.src=metadataUrl;await new Promise((resolve,reject)=>{video.onloadedmetadata=resolve;video.onerror=()=>reject(Error('The exported video could not be verified'))});duration=video.duration;video.removeAttribute('src');video.load()}finally{URL.revokeObjectURL(metadataUrl)}if(!Number.isFinite(duration)||Math.abs(duration-VIDEO_DURATION/1000)>1/VIDEO_FPS)throw Error('The browser interrupted the recording before all 15 seconds were captured. Keep this tab open and try again.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='project-passport-animation.'+(mime.includes('mp4')?'mp4':'webm');a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='Your 15-second video is ready to share.';
  }catch(e){status.textContent='Could not export video: '+e.message}finally{if(stream)stream.getTracks().forEach(track=>track.stop());videoBtn.disabled=false}
 }
 videoBtn.addEventListener('click',exportVideo);
 const obs=new MutationObserver(()=>{videoBtn.disabled=state.done.length!==10});obs.observe(document.getElementById('count'),{childList:true,subtree:true});videoBtn.disabled=state.done.length!==10;
})();

// The personal invitation uses the same passport onboarding as the hero.
document.getElementById('joinChallenge')?.addEventListener('click',()=>document.getElementById('start').click());

(() => {
 const copy={
  en:{title:'PERSONALIZE YOUR PASSPORT',description:'Add your name in the open space above the passport. Your preview updates as you type.',name:'Your name',placeholder:'Type your name in any language',download:'Download PNG · 1080 × 1920',share:'Share passport',video:'Save animated video',loading:'Loading the original passport and name fonts…',ready:'Your personalized passport is ready.',imageError:'The original passport image could not be loaded. Please try again later.',fontError:'The name fonts could not be loaded. Check your connection and try again.',downloadError:'Could not create the PNG. Please try again.',shareUnavailable:'Image sharing is not supported in this browser. Download the PNG to share it.',shareError:'Could not share the passport. Please try again.'},
  ar:{title:'أضفوا أسماءكم إلى جواز السفر',description:'اكتبوا الاسم في المساحة الفارغة فوق جواز السفر. تتحدّث المعاينة أثناء الكتابة.',name:'الاسم',placeholder:'اكتبوا الاسم بأي لغة',download:'تنزيل PNG · 1080 × 1920',share:'مشاركة جواز السفر',video:'تنزيل الفيديو المتحرك',loading:'جارٍ تحميل الصورة الأصلية والخطوط…',ready:'أصبح جواز السفر المخصّص جاهزًا.',imageError:'تعذّر تحميل صورة جواز السفر الأصلية. حاولوا مرة أخرى لاحقًا.',fontError:'تعذّر تحميل الخطوط. تحققوا من الاتصال وحاولوا مرة أخرى.',downloadError:'تعذّر إنشاء صورة PNG. حاولوا مرة أخرى.',shareUnavailable:'مشاركة الصور غير مدعومة في هذا المتصفح. نزّلوا صورة PNG لمشاركتها.',shareError:'تعذّرت مشاركة جواز السفر. حاولوا مرة أخرى.'},
  he:{title:'הוסיפו את שמכם לדרכון',description:'הקלידו את שמכם באזור הריק מעל הדרכון. התצוגה מתעדכנת בזמן ההקלדה.',name:'השם שלכם',placeholder:'הקלידו שם בכל שפה',download:'הורדת PNG · 1080 × 1920',share:'שיתוף הדרכון',video:'שמירת סרטון מונפש',loading:'תמונת הדרכון והגופנים נטענים…',ready:'הדרכון האישי שלכם מוכן.',imageError:'טעינת תמונת הדרכון המקורית נכשלה. נסו שוב מאוחר יותר.',fontError:'טעינת הגופנים נכשלה. בדקו את החיבור ונסו שוב.',downloadError:'יצירת תמונת PNG נכשלה. נסו שוב.',shareUnavailable:'שיתוף תמונות אינו נתמך בדפדפן הזה. הורידו את תמונת ה-PNG כדי לשתף אותה.',shareError:'שיתוף הדרכון נכשל. נסו שוב.'}
 };
 const section=document.getElementById('personalizerPreview');
 const videoButton=document.getElementById('saveVideo');
 const input=section.querySelector('#personalizerName');
 const canvas=section.querySelector('#personalizerCanvas');
 const context=canvas.getContext('2d');
 const download=section.querySelector('#personalizerDownload');
 const share=section.querySelector('#personalizerShare');
 const status=section.querySelector('#personalizerStatus');
 const videoStatus=section.querySelector('#exportStatus');
 const labels={
  title:section.querySelector('#personalizerTitle'),
  description:section.querySelector('.personalizer-description'),
  name:section.querySelector('label'),
  download,
  share,
  video:videoButton,
  status,
  canvas
 };
 const image=new Image();
 let imageLoaded=false;
 let fontsLoaded=false;
 input.value=state.name;

 const fontLink=document.createElement('link');
 fontLink.rel='stylesheet';
 fontLink.href='https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&family=Noto+Serif+Hebrew:wght@400;600;700&display=swap';
 const fontStylesheetReady=new Promise((resolve,reject)=>{
  fontLink.onload=resolve;
  fontLink.onerror=()=>reject(Error('The Arabic and Hebrew name fonts could not be loaded'));
 });
 document.head.append(fontLink);
 const fontsReady=fontStylesheetReady.then(()=>Promise.all([
  document.fonts.load('600 60px "Noto Naskh Arabic"','تميمة'),
  document.fonts.load('600 60px "Noto Serif Hebrew"','תאימה')
 ])).then(()=>{fontsLoaded=true;draw();updateReadyState()});
 window.passportFontsReady=fontsReady;

 function updateReadyState(){
  const ready=imageLoaded&&fontsLoaded;
  download.disabled=!ready;
  share.disabled=!ready||!navigator.share;
  videoButton.disabled=!ready||state.done.length!==10;
  if(ready&&!status.dataset.error)status.textContent=(copy[state.lang]||copy.en).ready;
 }
 function reportError(message){
  videoStatus.textContent=message;
 }

 function translate(){
  const words=copy[state.lang]||copy.en;
  labels.title.textContent=words.title;
  labels.description.textContent=words.description;
  labels.name.textContent=words.name;
  input.placeholder=words.placeholder;
  labels.download.textContent=words.download;
  labels.share.textContent=words.share;
  labels.video.textContent=words.video;
  labels.canvas.setAttribute('aria-label',`${words.title}. ${input.value.trim()||words.name}`);
  if(!imageLoaded||!fontsLoaded)labels.status.textContent=words.loading;
  else if(!status.dataset.error)labels.status.textContent=words.ready;
 }

 function drawArtwork(target,width,height,name){
  target.fillStyle='#f6e3da';
  target.fillRect(0,0,width,height);
  target.imageSmoothingEnabled=true;
  target.imageSmoothingQuality='high';
  const scale=Math.min(width/image.naturalWidth,height/image.naturalHeight);
  const drawWidth=image.naturalWidth*scale;
  const drawHeight=image.naturalHeight*scale;
  const imageX=(width-drawWidth)/2;
  const imageY=(height-drawHeight)/2;
  target.drawImage(image,imageX,imageY,drawWidth,drawHeight);
  if(!name.trim())return;

  const isRtl=/[\u0590-\u08ff]/u.test(name);
  target.save();
  target.direction=isRtl?'rtl':'ltr';
  target.textAlign='center';
  target.textBaseline='alphabetic';
  target.fillStyle='#68283D';
  target.shadowColor='rgba(255,239,222,.75)';
  target.shadowBlur=2;
  target.shadowOffsetY=1;
  const maxWidth=drawWidth*.84;
  let fontSize=Math.round(drawHeight*.037);
  const minimumFontSize=Math.round(drawHeight*.021);
  const family=isRtl?'"Noto Naskh Arabic", "Noto Serif Hebrew", serif':'"Playfair Display", "Noto Serif Hebrew", serif';
  while(fontSize>minimumFontSize){
   target.font=`600 ${fontSize}px ${family}`;
   if(target.measureText(name).width<=maxWidth)break;
   fontSize-=2;
  }
  target.font=`600 ${fontSize}px ${family}`;
  target.fillText(name,imageX+drawWidth*.5,imageY+drawHeight*.22,maxWidth);
  target.restore();
 }

 function draw(){if(imageLoaded)drawArtwork(context,canvas.width,canvas.height,input.value)}
 function createPersonalizedPassportCanvas(name=input.value){
  const output=document.createElement('canvas');
  output.width=1080;
  output.height=1920;
  drawArtwork(output.getContext('2d'),output.width,output.height,name);
  return output;
 }
 window.createPersonalizedPassportCanvas=createPersonalizedPassportCanvas;
 window.setPersonalizedPassportName=name=>{input.value=name;draw()};

 function canvasBlob(){
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Canvas PNG encoding failed')),'image/png'));
 }

 function setStatus(key,isError=false){
  status.dataset.error=isError?'true':'';
  status.textContent=(copy[state.lang]||copy.en)[key];
 }

 window.passportArtworkReady=new Promise((resolve,reject)=>{
  image.onload=()=>{imageLoaded=true;draw();updateReadyState();resolve()};
  image.onerror=()=>{setStatus('imageError',true);reject(Error('The original passport image could not be loaded'))};
 });
 image.src=new URL('../../images/project-passport.png',document.baseURI).href;

 fontsReady.catch(error=>{
  console.error('Passport name fonts failed to load',error);
  setStatus('fontError',true);
 });
 window.passportArtworkReady.catch(error=>console.error('Original passport image failed to load',error));

 input.addEventListener('input',()=>{
  state.name=input.value;
  persist();
  $('explorerName').textContent=state.name||'Explorer';
  translate();
  draw();
 });
 document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',translate));
 async function exportImage(){
  await window.passportArtworkReady;
  await fontsReady;
  draw();
  return canvasBlob();
 }
 async function downloadImage(){
  try{
   const blob=await exportImage();
   const url=URL.createObjectURL(blob);
   const anchor=document.createElement('a');
   anchor.href=url;
   anchor.download='project-passport.png';
   document.body.append(anchor);
   anchor.click();
   anchor.remove();
   setTimeout(()=>URL.revokeObjectURL(url),10000);
  }catch(error){
   console.error('Passport PNG download failed',error);
   setStatus(error.message.includes('fonts')?'fontError':'downloadError',true);
   reportError(error.message);
  }
 }
 window.downloadPersonalizedPassport=downloadImage;
 download.addEventListener('click',downloadImage);
 share.addEventListener('click',async()=>{
  if(!navigator.share)return;
  try{
   const file=new File([await exportImage()],'project-passport.png',{type:'image/png'});
   if(navigator.canShare&&!navigator.canShare({files:[file]})){
    setStatus('shareUnavailable',true);
    return;
   }
   await navigator.share({files:[file],title:'Project Passport'});
  }catch(error){
   if(error.name==='AbortError')return;
   console.error('Passport image share failed',error);
   setStatus('shareError',true);
  }
 });
 translate();
})();
