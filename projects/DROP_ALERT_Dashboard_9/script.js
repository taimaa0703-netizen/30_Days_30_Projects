const $ = id => document.getElementById(id);
const state = { port:null, reader:null, reading:false, buffer:'', samples:[], threshold:40, lastLeak:null };
const canvas = $('chart');
const ctx = canvas.getContext('2d');
const translations = {
  en: {
    disconnected:'● Disconnected', connected:'● Connected', connectArduino:'Connect Arduino', disconnect:'Disconnect',
    liveMonitoringCenter:'LIVE MONITORING CENTER', everyDropMatters:'Every drop matters', introDescription:'Detect the danger. Sound the alarm. Stop the damage.',
    waterSensorReading:'WATER SENSOR READING', connectArduinoStart:'Connect your Arduino to start', systemStatus:'SYSTEM STATUS', awaitingData:'AWAITING DATA',
    noSensorReadings:'No sensor readings yet', alertSystem:'ALERT SYSTEM', standby:'STANDBY', buzzerMelody:'Arduino buzzer controls the melody',
    sensorActivity:'Sensor activity', last60Samples:'Live readings · last 60 samples', waiting:'WAITING', live:'LIVE',
    chartAriaLabel:'Live water sensor chart', dry:'0 — dry', maximumReading:'1023 — maximum reading',
    detectionSettings:'Detection settings', thresholdDescription:'Match this threshold to the value in your Arduino sketch.',
    leakThreshold:'Leak threshold', sliderNotice:'⚠️ This slider changes <b>dashboard alerts only</b>. To change when the physical buzzer plays, update <code>WET_THRESHOLD</code> in Arduino IDE and upload again.',
    latestEvent:'Latest event', noEvents:'No events yet', clearChart:'Clear chart', waitingConnection:'Waiting for connection',
    receivingSerial:'Receiving serial data', sensorDry:'Sensor reading: dry / zero', receivingData:'Receiving live sensor data',
    leakDetected:'LEAK DETECTED', safe:'SAFE', thresholdReached:'Water level reached dashboard threshold', belowThreshold:'Water level below dashboard threshold',
    birthday:'⚠️ WATER DETECTED!', armed:'ARMED', eventLeak:'🚨 Leak detected', eventSafe:'✅ Returned to safe', chartCleared:'Chart cleared',
    webSerialError:'Web Serial requires Chrome or Edge on desktop, using localhost or HTTPS.', connectionFailed:'Connection failed: ',
    closeArduino:'\nClose Arduino Serial Monitor and retry.'
  },
  ar: {
    disconnected:'● غير متصل', connected:'● متصل', connectArduino:'توصيل Arduino', disconnect:'فصل الاتصال',
    liveMonitoringCenter:'LIVE MONITORING CENTER', everyDropMatters:'Every drop matters', introDescription:'Detect the danger. Sound the alarm. Stop the damage.',
    waterSensorReading:'قراءة مستشعر المياه', connectArduinoStart:'وصّل Arduino للبدء', systemStatus:'حالة النظام', awaitingData:'في انتظار البيانات',
    noSensorReadings:'لا توجد قراءات للمستشعر بعد', alertSystem:'نظام التنبيه', standby:'في وضع الاستعداد', buzzerMelody:'جرس Arduino يتحكم باللحن',
    sensorActivity:'نشاط المستشعر', last60Samples:'قراءات مباشرة · آخر 60 عينة', waiting:'في الانتظار', live:'مباشر',
    chartAriaLabel:'مخطط مستشعر المياه المباشر', dry:'0 — جاف', maximumReading:'1023 — القراءة القصوى',
    detectionSettings:'إعدادات الكشف', thresholdDescription:'طابق هذا الحد مع القيمة الموجودة في برنامج Arduino.',
    leakThreshold:'حد التسريب', sliderNotice:'⚠️ يغيّر هذا المنزلق <b>تنبيهات لوحة التحكم فقط</b>. لتغيير وقت تشغيل الجرس الفعلي، حدّث <code>WET_THRESHOLD</code> في Arduino IDE ثم ارفع البرنامج مرة أخرى.',
    latestEvent:'آخر حدث', noEvents:'لا توجد أحداث بعد', clearChart:'مسح المخطط', waitingConnection:'في انتظار الاتصال',
    receivingSerial:'استقبال بيانات تسلسلية', sensorDry:'قراءة المستشعر: جاف / صفر', receivingData:'استقبال بيانات المستشعر مباشرة',
    leakDetected:'تم اكتشاف تسريب', safe:'آمن', thresholdReached:'وصل مستوى المياه إلى حد لوحة التحكم', belowThreshold:'مستوى المياه أقل من حد لوحة التحكم',
    birthday:'⚠️ WATER DETECTED!', armed:'مفعّل', eventLeak:'🚨 تم اكتشاف تسريب', eventSafe:'✅ عاد إلى الوضع الآمن', chartCleared:'تم مسح المخطط',
    webSerialError:'يتطلب Web Serial متصفح Chrome أو Edge على جهاز كمبيوتر، باستخدام localhost أو HTTPS.', connectionFailed:'فشل الاتصال: ',
    closeArduino:'\nأغلق شاشة Arduino التسلسلية وحاول مرة أخرى.'
  },
  he: {
    disconnected:'● מנותק', connected:'● מחובר', connectArduino:'חבר Arduino', disconnect:'נתק',
    liveMonitoringCenter:'LIVE MONITORING CENTER', everyDropMatters:'Every drop matters', introDescription:'Detect the danger. Sound the alarm. Stop the damage.',
    waterSensorReading:'קריאת חיישן מים', connectArduinoStart:'חבר את ה־Arduino כדי להתחיל', systemStatus:'מצב המערכת', awaitingData:'ממתין לנתונים',
    noSensorReadings:'עדיין אין קריאות חיישן', alertSystem:'מערכת התראות', standby:'בהמתנה', buzzerMelody:'הזמזם של Arduino שולט במנגינה',
    sensorActivity:'פעילות החיישן', last60Samples:'קריאות בזמן אמת · 60 הדגימות האחרונות', waiting:'ממתין', live:'חי',
    chartAriaLabel:'תרשים חיישן מים בזמן אמת', dry:'0 — יבש', maximumReading:'1023 — קריאה מרבית',
    detectionSettings:'הגדרות זיהוי', thresholdDescription:'התאם את הסף לערך שבסקיצת ה־Arduino שלך.',
    leakThreshold:'סף דליפה', sliderNotice:'⚠️ המחוון הזה משנה <b>רק את התראות הדשבורד</b>. כדי לשנות מתי הזמזם הפיזי מופעל, עדכן את <code>WET_THRESHOLD</code> ב־Arduino IDE והעלה שוב.',
    latestEvent:'האירוע האחרון', noEvents:'אין אירועים עדיין', clearChart:'נקה תרשים', waitingConnection:'ממתין לחיבור',
    receivingSerial:'מקבל נתונים טוריים', sensorDry:'קריאת חיישן: יבש / אפס', receivingData:'מקבל נתוני חיישן בזמן אמת',
    leakDetected:'זוהתה דליפה', safe:'תקין', thresholdReached:'מפלס המים הגיע לסף הדשבורד', belowThreshold:'מפלס המים מתחת לסף הדשבורד',
    birthday:'⚠️ WATER DETECTED!', armed:'מופעל', eventLeak:'🚨 זוהתה דליפה', eventSafe:'✅ חזר למצב תקין', chartCleared:'התרשים נוקה',
    webSerialError:'Web Serial דורש Chrome או Edge במחשב שולחני, באמצעות localhost או HTTPS.', connectionFailed:'החיבור נכשל: ',
    closeArduino:'\nסגור את Serial Monitor של Arduino ונסה שוב.'
  }
};
let language = localStorage.getItem('drop-alert-language') || 'en';
function t(key){return translations[language][key] || translations.en[key] || key}
function applyLanguage(nextLanguage){
  language=translations[nextLanguage]?nextLanguage:'en';
  localStorage.setItem('drop-alert-language',language);
  document.documentElement.lang=language;
  document.documentElement.dir='ltr';
  document.querySelectorAll('[data-i18n]').forEach(element=>{
    const value=t(element.dataset.i18n);
    if(element.classList.contains('notice'))element.innerHTML=value;else element.textContent=value;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(element=>element.setAttribute('aria-label',t(element.dataset.i18nAria)));
  document.querySelectorAll('.language-btn').forEach(button=>button.classList.toggle('active',button.dataset.language===language));
  if(state.port)setConnected(true);else setConnected(false);
  if(state.samples.length)updateStatusOnly(state.samples.at(-1).value);
}

function drawChart(){
  const rect=canvas.getBoundingClientRect();
  const ratio=window.devicePixelRatio||1;
  canvas.width=Math.max(1,Math.round(rect.width*ratio));
  canvas.height=Math.max(1,Math.round(rect.height*ratio));
  ctx.setTransform(ratio,0,0,ratio,0,0);
  const w=rect.width,h=rect.height,pad=12;
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle='#30445a';ctx.lineWidth=1;ctx.setLineDash([4,6]);
  for(let i=0;i<5;i++){let y=pad+(h-2*pad)*i/4;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  ctx.setLineDash([]);
  const values=state.samples;
  if(!values.length)return;
  const maxY=Math.max(100,state.threshold*2,...values.map(v=>v.value));
  const x=i=>pad+(w-2*pad)*(i/59);
  const y=v=>h-pad-(h-2*pad)*v/maxY;
  ctx.beginPath();values.forEach((p,i)=>{const xx=x(60-values.length+i),yy=y(p.value);i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});
  ctx.strokeStyle='#70ccff';ctx.lineWidth=3;ctx.lineJoin='round';ctx.stroke();
  const last=values.at(-1);ctx.fillStyle=last.value>=state.threshold?'#ff808e':'#70ccff';ctx.beginPath();ctx.arc(x(59),y(last.value),4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ff808e88';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(0,y(state.threshold));ctx.lineTo(w,y(state.threshold));ctx.stroke();ctx.setLineDash([]);
}
function updateReading(value){
  $('waterValue').textContent=value;
  $('waterBar').style.width=(value/1023*100)+'%';
  $('readingHint').textContent=value===0?t('sensorDry'):t('receivingData');
  const leak=value>=state.threshold;
  $('status').textContent=leak?t('leakDetected'):t('safe');
  $('status').className='status '+(leak?'leak':'safe');
  $('statusDetail').textContent=leak?t('thresholdReached'):t('belowThreshold');
  $('alertState').textContent=leak?t('birthday'):t('armed');
  $('alertState').className='alert-state '+(leak?'alarm':'');
  if(state.lastLeak!==leak){$('lastEvent').textContent=(leak?t('eventLeak'):t('eventSafe'))+' · '+new Date().toLocaleTimeString();state.lastLeak=leak}
  state.samples.push({value});if(state.samples.length>60)state.samples.shift();drawChart();
}
function handleLine(line){const match=line.match(/Water:\s*(\d+)/i);if(!match)return;const n=Number(match[1]);if(n>=0&&n<=1023)updateReading(n)}
function setConnected(connected){$('connectionBadge').textContent=connected?t('connected'):t('disconnected');$('connectionBadge').className='connection'+(connected?' connected':'');$('connectBtn').disabled=connected;$('disconnectBtn').disabled=!connected;$('liveTag').textContent=connected?t('live'):t('waiting');$('liveTag').className='live-tag'+(connected?' active':'');$('footerStatus').textContent=connected?t('receivingSerial'):t('waitingConnection')}
async function connect(){
  if(!('serial' in navigator)){alert(t('webSerialError'));return}
  try{
    const port=await navigator.serial.requestPort();
    await port.open({baudRate:9600});state.port=port;state.reading=true;state.buffer='';setConnected(true);
    readLoop(port);
  }catch(err){if(err.name!=='NotFoundError')alert(t('connectionFailed')+err.message+t('closeArduino'))}
}
async function readLoop(port){
  const decoder=new TextDecoder();
  try{
    while(state.reading&&port.readable){
      const reader=port.readable.getReader();state.reader=reader;
      try{
        while(state.reading){const {value,done}=await reader.read();if(done)break;
          state.buffer+=decoder.decode(value,{stream:true});
          const lines=state.buffer.split(/\r?\n/);state.buffer=lines.pop()||'';
          for(const line of lines)handleLine(line);
        }
      }finally{reader.releaseLock();state.reader=null}
      break;
    }
  }catch(err){console.error(err);$('footerStatus').textContent=t('connectionFailed')+t('receivingSerial').toLowerCase()}
  finally{state.reading=false;try{await port.close()}catch(e){console.warn(e)}if(state.port===port)state.port=null;setConnected(false)}
}
async function disconnect(){state.reading=false;if(state.reader){try{await state.reader.cancel()}catch(e){console.warn(e)}}}
$('connectBtn').addEventListener('click',connect);
$('disconnectBtn').addEventListener('click',disconnect);
$('threshold').addEventListener('input',e=>{state.threshold=Number(e.target.value);$('thresholdLabel').textContent=state.threshold;if(state.samples.length)updateStatusOnly(state.samples.at(-1).value);drawChart()});
function updateStatusOnly(v){const leak=v>=state.threshold;$('status').textContent=leak?t('leakDetected'):t('safe');$('status').className='status '+(leak?'leak':'safe');$('statusDetail').textContent=leak?t('thresholdReached'):t('belowThreshold');$('alertState').textContent=leak?t('birthday'):t('armed');$('alertState').className='alert-state '+(leak?'alarm':'');state.lastLeak=leak}
$('clearBtn').addEventListener('click',()=>{state.samples=[];state.lastLeak=null;$('lastEvent').textContent=t('chartCleared');drawChart()});
document.querySelectorAll('.language-btn').forEach(button=>button.addEventListener('click',()=>applyLanguage(button.dataset.language)));
window.addEventListener('resize',drawChart);
setInterval(()=>$('clock').textContent=new Date().toLocaleTimeString(),1000);
$('clock').textContent=new Date().toLocaleTimeString();drawChart();
applyLanguage(language);
