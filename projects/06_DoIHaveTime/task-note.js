const noteCopy = {
  en: {noteTitle:'A little note for your next steps',noteHint:'All unfinished tasks, including those saved for later, as a picture with a kind reminder.',makeTaskNote:'Create my picture note',downloadTaskNote:'Download PNG',noteAlt:'Picture note with unfinished tasks',noteHeading:'One step at a time.',noteQuote:'You don’t have to finish everything at once. Every small step counts.',noteEmpty:'You’ve finished your tasks. Make room for a well-earned pause.',noteError:'Could not create the picture. Please try again.'},
  he: {noteTitle:'פתק קטן לצעדים הבאים שלך',noteHint:'כל המשימות שנותרו, גם אלה שנדחו, בתמונה עם משפט מעודד.',makeTaskNote:'צור לי פתק כתמונה',downloadTaskNote:'הורד תמונת PNG',noteAlt:'פתק תמונה עם המשימות שנותרו',noteHeading:'צעד קטן, עוד קצת קדימה.',noteQuote:'לא חייבים לסיים הכול בבת אחת. כל צעד קטן שלך נחשב.',noteEmpty:'סיימת את המשימות שלך. מגיע לך רגע לנשום.',noteError:'לא הצלחנו ליצור את התמונה. נסה שוב.'},
  ar: {noteTitle:'ورقة صغيرة لخطواتك الجايّة',noteHint:'كل المهام اللي ضلّت، حتى اللي تأجّلت، بصورة ومعها كلمة حلوة إلك.',makeTaskNote:'اعملّي ورقة بصورة',downloadTaskNote:'نزّل الصورة PNG',noteAlt:'ورقة بصورة فيها المهام اللي ضلّت',noteHeading:'خطوة صغيرة، بتقرّبك.',noteQuote:'مش لازم تخلّص كل إشي مرة وحدة. كل خطوة منك إلها قيمة.',noteEmpty:'خلّصت مهامك. خد نفس، هالراحة بتستاهلها.',noteError:'ما قدرنا نعمل الصورة. جرّب مرة ثانية.'}
};
Object.keys(noteCopy).forEach(lang=>Object.assign(translations[lang],noteCopy[lang]));
Object.assign(translations.en,{notePreviousLabel:'Previous note page',noteNextLabel:'Next note page'});
Object.assign(translations.he,{notePreviousLabel:'העמוד הקודם בפתק',noteNextLabel:'העמוד הבא בפתק'});
Object.assign(translations.ar,{notePreviousLabel:'الصفحة السابقة بالورقة',noteNextLabel:'الصفحة الجايّة بالورقة'});
Object.assign(translations.en,{noteHeading:'Your next steps.',noteQuote:'A clear day starts with one small step.',noteCount:'Tasks left',noteTime:'Estimated time left',noteCategories:'Categories'});
Object.assign(translations.he,{noteHeading:'הצעדים הבאים שלך.',noteQuote:'יום מסודר מתחיל בצעד קטן אחד.',noteCount:'משימות שנותרו',noteTime:'זמן משוער שנותר',noteCategories:'קטגוריות'});
Object.assign(translations.ar,{noteHeading:'خطواتك الجايّة.',noteQuote:'يوم مرتّب ببدأ بخطوة صغيرة.',noteCount:'مهام ضلّت',noteTime:'الوقت المتبقي المقدّر',noteCategories:'فئات'});
Object.assign(translations.en,{noteShortcut:'My picture note'});
Object.assign(translations.he,{noteShortcut:'הפתק שלי · תמונה להורדה'});
Object.assign(translations.ar,{noteShortcut:'ورقتي · صورة للتنزيل'});
Object.assign(translations.en,{notePhoneSave:'Save / share on phone',noteSaveError:'Saving did not work here. Open this page in Safari or Chrome and try Download PNG.'});
Object.assign(translations.he,{notePhoneSave:'שמירה או שיתוף בטלפון',noteSaveError:'השמירה לא הצליחה כאן. פתח את הדף ב־Safari או Chrome ונסה להוריד PNG.'});
Object.assign(translations.ar,{notePhoneSave:'احفظ أو شارك من التلفون',noteSaveError:'ما زبط الحفظ هون. افتح الصفحة بمتصفح Safari أو Chrome وجرّب تنزيل PNG.'});
let noteCanvas=null, noteItems=[], noteIndex=0;
function noteLines(ctx,text,maxWidth) {
  const words=String(text).trim().split(/\s+/),lines=[];let line='';
  for(const word of words){
    const candidate=line?`${line} ${word}`:word;
    if(ctx.measureText(candidate).width<=maxWidth){line=candidate;continue;}
    if(line)lines.push(line);line='';
    for(const char of word){if(line&&ctx.measureText(line+char).width>maxWidth){lines.push(line);line='';}line+=char;}
  }
  if(line)lines.push(line);return lines;
}
function noteText(ctx,lines,x,y,lineHeight){lines.forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight));}
async function renderTaskNote() {
  const t=translations[currentLanguage],rtl=currentLanguage!=='en';
  try {
    if(document.fonts)await document.fonts.ready;
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas unavailable');
    canvas.width=1080;ctx.font='600 32px system-ui, sans-serif';
    const items=noteItems.slice(noteIndex*8,noteIndex*8+8);
    const rows=items.map(item=>({item,lines:noteLines(ctx,item.name,760)}));
    const heights=rows.map(row=>Math.max(132,row.lines.length*44+82));
    const bodyHeight=heights.reduce((n,h)=>n+h,0);
    ctx.font='500 30px system-ui, sans-serif';const quote=noteLines(ctx,t.noteQuote,860);
    canvas.height=500+Math.max(150,bodyHeight)+quote.length*44+220;
    // Avoid canvas sizes that cannot be exported reliably by browsers.
    if(canvas.height>16000)throw new Error('Note too tall');
    const ink='#303647',muted='#818598';
    ctx.fillStyle='#f4f3f7';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fffefd';ctx.beginPath();ctx.roundRect(32,32,1016,canvas.height-64,30);ctx.fill();
    ctx.fillStyle='#a99bbc';ctx.fillRect(80,80,46,5);
    ctx.direction='ltr';ctx.textAlign='left';ctx.fillStyle=ink;ctx.font='800 34px system-ui, sans-serif';ctx.fillText('SPARE.',80,138);
    ctx.textAlign='right';ctx.font='400 21px system-ui, sans-serif';ctx.fillStyle=muted;ctx.fillText(`${noteIndex+1} / ${Math.max(1,Math.ceil(noteItems.length/8))}`,1000,138);
    ctx.direction=rtl?'rtl':'ltr';ctx.textAlign=rtl?'right':'left';const x=rtl?1000:80;
    const date=new Date(plan?.start||Date.now());ctx.font='400 24px system-ui, sans-serif';ctx.fillStyle=muted;ctx.fillText(date.toLocaleDateString(currentLanguage,{weekday:'long',day:'numeric',month:'long',year:'numeric'}),x,205);
    ctx.font='700 52px system-ui, sans-serif';ctx.fillStyle=ink;ctx.fillText(t.noteHeading,x,279);
    ctx.fillStyle='#f2eff7';ctx.beginPath();ctx.roundRect(80,320,920,122,18);ctx.fill();
    const stats=[{label:t.noteCount,value:String(noteItems.length)},{label:t.noteTime,value:formatDuration(noteItems.reduce((total,item)=>total+item.remaining,0))},{label:t.noteCategories,value:String(new Set(noteItems.map(taskCategory)).size)}];
    stats.forEach((stat,index)=>{
      const center=80+(rtl?2-index:index)*920/3+920/6;
      ctx.textAlign='center';ctx.fillStyle=muted;ctx.font='400 19px system-ui, sans-serif';ctx.fillText(stat.label,center,359);
      ctx.fillStyle=ink;ctx.font='600 25px system-ui, sans-serif';
      const lines=noteLines(ctx,stat.value,270);noteText(ctx,lines,center,399,29);
    });
    ctx.textAlign=rtl?'right':'left';let y=490;
    const categoryColors={work:'#a89abc',study:'#94a5bd',personal:'#c1a0ac',home:'#c4af93',other:'#b2afbd'};
    if(!rows.length){ctx.font='500 32px system-ui, sans-serif';noteText(ctx,noteLines(ctx,t.noteEmpty,820),x,y+50,48);y+=150;}
    rows.forEach((row,i)=>{
      ctx.strokeStyle='#d2ccd9';ctx.lineWidth=2;ctx.beginPath();ctx.arc(rtl?976:104,y+36,15,0,Math.PI*2);ctx.stroke();
      ctx.font='600 32px system-ui, sans-serif';ctx.fillStyle=ink;noteText(ctx,row.lines,rtl?924:156,y+45,44);
      ctx.font='400 22px system-ui, sans-serif';ctx.fillStyle=muted;ctx.fillText(`${categoryLabel(taskCategory(row.item))} · ${formatDuration(row.item.remaining)}`,rtl?924:156,y+45+row.lines.length*44);
      ctx.fillStyle=categoryColors[taskCategory(row.item)];ctx.beginPath();ctx.arc(rtl?112:968,y+36,5,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#eceaf0';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(80,y+heights[i]-15);ctx.lineTo(1000,y+heights[i]-15);ctx.stroke();
      y+=heights[i];
    });
    ctx.fillStyle='#f5f2f8';ctx.beginPath();ctx.roundRect(80,y+40,920,quote.length*44+55,16);ctx.fill();
    ctx.textAlign='center';ctx.font='500 30px system-ui, sans-serif';ctx.fillStyle='#776689';noteText(ctx,quote,540,y+87,44);
    ctx.direction='ltr';ctx.textAlign='center';ctx.font='400 17px system-ui, sans-serif';ctx.fillStyle='#a0a1ae';ctx.fillText('SPARE / A LITTLE CLARITY FOR YOUR DAY',540,canvas.height-75);
    noteCanvas=canvas;byId('taskNoteImage').src=canvas.toDataURL('image/png');byId('taskNoteImage').alt=t.noteAlt;
    byId('notePage').textContent=`${noteIndex+1} / ${Math.max(1,Math.ceil(noteItems.length/8))}`;
    byId('notePrevious').disabled=noteIndex===0;byId('noteNext').disabled=(noteIndex+1)*8>=noteItems.length;
    byId('taskNotePreview').classList.remove('hidden');byId('taskNoteStatus').textContent='';
  }catch{byId('taskNoteStatus').textContent=t.noteError;byId('taskNotePreview').classList.remove('hidden');noteCanvas=null;}
}
function refreshTaskNote() {
  noteItems=tasks.filter(task=>task.remaining>0).map(task=>({...task}));noteIndex=0;return renderTaskNote();
}
byId('makeTaskNote').addEventListener('click',refreshTaskNote);
async function openTaskNote() {
  showWorkspace('plan');
  await refreshTaskNote();
  byId('finishNoteCard').scrollIntoView({behavior:'smooth',block:'start'});
}
byId('notePrevious').addEventListener('click',()=>{if(noteIndex>0){noteIndex--;renderTaskNote();}});
byId('noteNext').addEventListener('click',()=>{if((noteIndex+1)*8<noteItems.length){noteIndex++;renderTaskNote();}});
function downloadTaskNote() {
  if(!noteCanvas)return;
  noteCanvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`SPARE-note-${localDateKey(new Date(plan?.start||Date.now()))}-${noteIndex+1}.png`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);},'image/png');
}
byId('downloadTaskNote').addEventListener('click',downloadTaskNote);
byId('phoneSaveNote').addEventListener('click',async()=>{
  if(!noteCanvas)return;
  try {
    const blob=await new Promise(resolve=>noteCanvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('No image');
    const file=new File([blob],`SPARE-note-${noteIndex+1}.png`,{type:'image/png'});
    if(navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:'SPARE'});else downloadTaskNote();
  }catch(error){if(error.name!=='AbortError')byId('taskNoteStatus').textContent=translations[currentLanguage].noteSaveError;}
});
changeLanguage(currentLanguage);
