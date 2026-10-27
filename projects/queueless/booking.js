// Online appointments: the customer booking screen and the owner's live appointments board (Supabase).
const $ = (id) => document.getElementById(id);
const START = new URLSearchParams(window.QL_START ?? location.search);
const MY_KEY = 'queueless-my-bookings';
const ME_KEY = 'queueless-customer';
const DAYS_AHEAD = 14;
const BIZ_COLS = 'id,name,phone,slot_minutes,hours,timezone';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const T = {
 en:{bookKicker:'BOOK AN APPOINTMENT',chooseBiz:'Where would you like to book?',chooseBizSub:'Choose a business, then pick a free day and time.',search:'Search businesses…',noBiz:'No businesses are taking online bookings yet.',bookHere:'Book →',myBookings:'Your upcoming bookings',loading:'Loading…',back:'Back',step1:'Choose a day',step2:'Choose a time',step3:'Your details',free:'Free',taken:'Taken',noSlots:'No free times on this day. Please try another day.',name:'Full name',phone:'Phone number',note:'Note for the business (optional)',notePh:'Anything they should know?',confirm:'Confirm booking',pickSlot:'Choose a day and a time above.',selected:'Your appointment',booked:'You’re booked!',bookedSub:'Your appointment is confirmed. Keep this page to check its status at any time.',cancelledTitle:'Appointment cancelled',cancelledSub:'This appointment is no longer active.',where:'Business',who:'Name',noteL:'Note',status:'Status',copyLink:'Copy my booking link',cancel:'Cancel appointment',cancelAsk:'Cancel this appointment?',cancelled:'Your appointment was cancelled.',another:'Book another appointment',st_booked:'Confirmed',st_arrived:'Checked in',st_done:'Completed',st_cancelled:'Cancelled',st_no_show:'Missed',errTaken:'Sorry — this time was just taken. Please choose another one.',errName:'Please enter your name.',errPhone:'Please enter a valid phone number.',errTime:'This time is no longer available.',errClosed:'The business is closed at this time.',errTooMany:'You already have 3 upcoming bookings with this business.',errGeneric:'Something went wrong. Please try again.',errSetup:'Online booking is not set up yet. Run supabase-setup.sql in Supabase first.',notFound:'This booking could not be found.',linkCopied:'Link copied.',copyFailed:'Could not copy the link.',call:'Call',openToday:'Open today',closedToday:'Closed today',
  apKicker:'APPOINTMENTS',apTitle:'Your day, booked.',apDesc:'Customers book online, and every booking appears here instantly.',bookingLink:'Your customer booking link',copy:'Copy link',openPage:'Open booking page ↗',today:'Today',bookedCount:'Booked',bookedSub2:'appointments this day',freeCount:'Free slots',freeSub:'still available this day',nextUp:'Next appointment',nextNone:'No upcoming bookings',now:'NOW',inProgress:'Happening now',freeSlot:'Free',arrived:'Arrived',done:'Done',noShow:'No-show',cancelAppt:'Cancel',cancelApptAsk:'Cancel this customer’s appointment?',closedDay:'Closed on this day. Change your hours on the right.',hoursTitle:'Hours & booking settings',slotLen:'Appointment length',minutes:'min',saveHours:'Save settings',hoursSaved:'Settings saved. Customers see the new times right away.',hoursInvalid:'Closing time must be after opening time.',setupTitle:'Open online booking',setupDesc:'Enter your business name and phone number. Customers will see them when they book.',bizName:'Business name',bizPhone:'Business phone',create:'Start taking bookings →',needAccount:'Online booking needs a connected business account so customers on other phones can book with you.',activate:'Sign in with phone number',newBooking:'New booking',live:'Live updates on'},
 he:{bookKicker:'קביעת תור',chooseBiz:'איפה קובעים תור?',chooseBizSub:'בוחרים עסק, ואז יום ושעה פנויים.',search:'חיפוש עסק…',noBiz:'עדיין אין עסקים שמקבלים הזמנות אונליין.',bookHere:'לקביעת תור ←',myBookings:'התורים הקרובים שלך',loading:'טוען…',back:'חזרה',step1:'בחירת יום',step2:'בחירת שעה',step3:'הפרטים שלך',free:'פנוי',taken:'תפוס',noSlots:'אין שעות פנויות ביום הזה. אפשר לנסות יום אחר.',name:'שם מלא',phone:'מספר טלפון',note:'הערה לעסק (לא חובה)',notePh:'משהו שחשוב שהעסק ידע?',confirm:'אישור התור',pickSlot:'בחרו יום ושעה למעלה.',selected:'התור שלך',booked:'התור נקבע!',bookedSub:'התור שלך אושר. שמרו את הדף הזה כדי לבדוק את הסטטוס בכל רגע.',cancelledTitle:'התור בוטל',cancelledSub:'התור הזה כבר לא פעיל.',where:'עסק',who:'שם',noteL:'הערה',status:'סטטוס',copyLink:'העתקת הקישור לתור שלי',cancel:'ביטול התור',cancelAsk:'לבטל את התור?',cancelled:'התור בוטל.',another:'קביעת תור נוסף',st_booked:'מאושר',st_arrived:'הגעת',st_done:'הסתיים',st_cancelled:'בוטל',st_no_show:'לא הגעת',errTaken:'מצטערים, השעה הזו נתפסה הרגע. בחרו שעה אחרת.',errName:'נא להזין שם.',errPhone:'נא להזין מספר טלפון תקין.',errTime:'השעה הזו כבר לא זמינה.',errClosed:'העסק סגור בשעה הזו.',errTooMany:'כבר יש לך 3 תורים עתידיים בעסק הזה.',errGeneric:'משהו השתבש. נסו שוב.',errSetup:'ההזמנות אונליין עדיין לא הוגדרו. יש להריץ קודם את supabase-setup.sql ב-Supabase.',notFound:'התור לא נמצא.',linkCopied:'הקישור הועתק.',copyFailed:'לא הצלחנו להעתיק את הקישור.',call:'התקשרות',openToday:'פתוח היום',closedToday:'סגור היום',
  apKicker:'הזמנות',apTitle:'היום שלך, מתוזמן.',apDesc:'לקוחות קובעים תור אונליין, וכל הזמנה מופיעה כאן מיד.',bookingLink:'הקישור להזמנת תורים ללקוחות',copy:'העתקת קישור',openPage:'פתיחת דף ההזמנה ↗',today:'היום',bookedCount:'תורים',bookedSub2:'נקבעו ליום הזה',freeCount:'שעות פנויות',freeSub:'עדיין פנויות ביום הזה',nextUp:'התור הבא',nextNone:'אין תורים קרובים',now:'עכשיו',inProgress:'מתרחש עכשיו',freeSlot:'פנוי',arrived:'הגיע/ה',done:'הסתיים',noShow:'לא הגיע/ה',cancelAppt:'ביטול',cancelApptAsk:'לבטל את התור של הלקוח?',closedDay:'העסק סגור ביום הזה. אפשר לשנות את השעות בצד.',hoursTitle:'שעות פעילות והגדרות הזמנה',slotLen:'משך כל תור',minutes:'דק׳',saveHours:'שמירת הגדרות',hoursSaved:'ההגדרות נשמרו. הלקוחות רואים את השעות החדשות מיד.',hoursInvalid:'שעת הסגירה חייבת להיות אחרי שעת הפתיחה.',setupTitle:'פתיחת הזמנות אונליין',setupDesc:'הזינו את שם העסק ומספר הטלפון. הלקוחות יראו אותם בזמן קביעת התור.',bizName:'שם העסק',bizPhone:'טלפון העסק',create:'מתחילים לקבל הזמנות ←',needAccount:'כדי שלקוחות מטלפונים אחרים יוכלו לקבוע אצלך תור, צריך חשבון עסקי מחובר.',activate:'כניסה עם מספר טלפון',newBooking:'הזמנה חדשה',live:'עדכונים חיים פעילים'},
 ar:{bookKicker:'حجز موعد',chooseBiz:'أين تريد أن تحجز؟',chooseBizSub:'اختر النشاط التجاري، ثم اختر يومًا ووقتًا متاحين.',search:'ابحث عن نشاط تجاري…',noBiz:'لا توجد أنشطة تجارية تستقبل الحجوزات عبر الإنترنت بعد.',bookHere:'احجز ←',myBookings:'حجوزاتك القادمة',loading:'جارٍ التحميل…',back:'رجوع',step1:'اختر اليوم',step2:'اختر الوقت',step3:'بياناتك',free:'متاح',taken:'محجوز',noSlots:'لا توجد أوقات متاحة في هذا اليوم. جرّب يومًا آخر.',name:'الاسم الكامل',phone:'رقم الهاتف',note:'ملاحظة للنشاط التجاري (اختياري)',notePh:'هل هناك ما يجب أن يعرفوه؟',confirm:'تأكيد الحجز',pickSlot:'اختر يومًا ووقتًا في الأعلى.',selected:'موعدك',booked:'تم حجز موعدك!',bookedSub:'تم تأكيد موعدك. احتفظ بهذه الصفحة لمتابعة حالته في أي وقت.',cancelledTitle:'تم إلغاء الموعد',cancelledSub:'هذا الموعد لم يعد فعّالًا.',where:'النشاط التجاري',who:'الاسم',noteL:'ملاحظة',status:'الحالة',copyLink:'نسخ رابط حجزي',cancel:'إلغاء الموعد',cancelAsk:'هل تريد إلغاء هذا الموعد؟',cancelled:'تم إلغاء موعدك.',another:'حجز موعد آخر',st_booked:'مؤكَّد',st_arrived:'تم الحضور',st_done:'مكتمل',st_cancelled:'ملغى',st_no_show:'لم يحضر',errTaken:'عذرًا، تم حجز هذا الوقت للتو. يرجى اختيار وقت آخر.',errName:'يرجى إدخال اسمك.',errPhone:'يرجى إدخال رقم هاتف صحيح.',errTime:'هذا الوقت لم يعد متاحًا.',errClosed:'النشاط التجاري مغلق في هذا الوقت.',errTooMany:'لديك بالفعل 3 حجوزات قادمة لدى هذا النشاط التجاري.',errGeneric:'حدث خطأ ما. يرجى المحاولة مرة أخرى.',errSetup:'لم يتم إعداد الحجز عبر الإنترنت بعد. شغّل الملف supabase-setup.sql في Supabase أولًا.',notFound:'تعذّر العثور على هذا الحجز.',linkCopied:'تم نسخ الرابط.',copyFailed:'تعذّر نسخ الرابط.',call:'اتصال',openToday:'مفتوح اليوم',closedToday:'مغلق اليوم',
  apKicker:'المواعيد',apTitle:'يومك، منظَّم بالكامل.',apDesc:'يحجز الزبائن عبر الإنترنت، ويظهر كل حجز هنا فورًا.',bookingLink:'رابط الحجز لزبائنك',copy:'نسخ الرابط',openPage:'فتح صفحة الحجز ↗',today:'اليوم',bookedCount:'المواعيد',bookedSub2:'محجوزة في هذا اليوم',freeCount:'الأوقات المتاحة',freeSub:'ما زالت متاحة في هذا اليوم',nextUp:'الموعد التالي',nextNone:'لا توجد مواعيد قادمة',now:'الآن',inProgress:'يجري الآن',freeSlot:'متاح',arrived:'حضر',done:'انتهى',noShow:'لم يحضر',cancelAppt:'إلغاء',cancelApptAsk:'هل تريد إلغاء موعد هذا الزبون؟',closedDay:'النشاط مغلق في هذا اليوم. يمكنك تغيير ساعات العمل في الجانب.',hoursTitle:'ساعات العمل وإعدادات الحجز',slotLen:'مدة الموعد',minutes:'دقيقة',saveHours:'حفظ الإعدادات',hoursSaved:'تم حفظ الإعدادات. يرى الزبائن الأوقات الجديدة فورًا.',hoursInvalid:'يجب أن يكون وقت الإغلاق بعد وقت الفتح.',setupTitle:'تفعيل الحجز عبر الإنترنت',setupDesc:'أدخل اسم نشاطك التجاري ورقم الهاتف. سيراهما الزبائن عند الحجز.',bizName:'اسم النشاط التجاري',bizPhone:'هاتف النشاط التجاري',create:'ابدأ باستقبال الحجوزات ←',needAccount:'يتطلب الحجز عبر الإنترنت حساب نشاط تجاري متصلًا، حتى يتمكن الزبائن من الحجز من هواتفهم.',activate:'الدخول برقم الهاتف',newBooking:'حجز جديد',live:'التحديثات المباشرة مفعّلة'}
};
const LOCALE = { en: 'en-GB', he: 'he-IL', ar: 'ar-u-nu-latn' };
const getLang = () => { const l = localStorage.getItem('queueless-language'); return ['en', 'he', 'ar'].includes(l) ? l : 'en'; };
let lang = getLang();
const tx = (k) => T[lang]?.[k] ?? T.en[k] ?? k;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const backLabel = () => (lang === 'en' ? '← ' : '→ ') + tx('back');

const ready = new Promise((resolve) => { if (window.QL_READY) resolve(); else document.addEventListener('ql-ready', () => resolve(), { once: true }); });
const client = () => window.QL_SUPABASE || null;
const session = () => window.QL_SESSION || null;
// Owners who signed in with phone + PIN use token RPCs instead of a Supabase Auth session.
const ownerToken = () => (session() ? null : window.QL_OWNER_TOKEN || null);
const OWNER_COLS = 'id,owner_id,name,phone,slot_minutes,hours,timezone';
async function ownerCall(fn, args = {}) {
 const res = await client().rpc(fn, { p_token: ownerToken(), ...args });
 if (res.error && /NOT_SIGNED_IN/.test(res.error.message || '')) document.dispatchEvent(new CustomEvent('ql-owner-expired'));
 return res;
}

function toast(message) {
 const el = $('toast'); el.textContent = message; el.classList.add('show');
 clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3400);
}
function errText(e) {
 const m = `${e?.message || ''} ${e?.details || ''}`;
 const codes = [['SLOT_TAKEN', 'errTaken'], ['appointments_slot_unique', 'errTaken'], ['INVALID_NAME', 'errName'], ['INVALID_PHONE', 'errPhone'], ['INVALID_TIME', 'errTime'], ['CLOSED', 'errClosed'], ['TOO_MANY', 'errTooMany']];
 for (const [code, key] of codes) if (m.includes(code)) return tx(key);
 if (/does not exist|schema cache|Could not find/i.test(m)) return tx('errSetup');
 return e?.message || tx('errGeneric');
}
const validPhone = (p) => /^[0-9+() .-]{5,30}$/.test(p) && p.replace(/\D/g, '').length >= 7;

// ---- Time zone helpers: slots are generated in the business's own time zone. ----
function parts(date, tz) {
 const o = {};
 new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  .formatToParts(date).forEach((p) => { o[p.type] = p.value; });
 return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, s: +o.second };
}
function zoned(y, m, d, minutes, tz) {
 const guess = Date.UTC(y, m - 1, d, 0, minutes);
 let t = guess;
 for (let i = 0; i < 3; i++) { const p = parts(new Date(t), tz); t = guess - (Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - t); }
 return new Date(t);
}
const mkDay = (y, m, d) => { const u = new Date(Date.UTC(y, m - 1, d)); return { y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate(), wd: u.getUTCDay() }; };
const todayIn = (tz) => { const p = parts(new Date(), tz); return mkDay(p.y, p.m, p.d); };
const shiftDay = (day, n) => mkDay(day.y, day.m, day.d + n);
const dayKey = (day) => `${day.y}-${String(day.m).padStart(2, '0')}-${String(day.d).padStart(2, '0')}`;
const toMin = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + m; };
const hoursFor = (biz, wd) => { const h = biz.hours?.[String(wd)]; return Array.isArray(h) && h.length === 2 ? h : null; };
function slotsFor(biz, day) {
 const h = hoursFor(biz, day.wd); if (!h) return [];
 const open = toMin(h[0]), close = toMin(h[1]), len = biz.slot_minutes || 30, out = [];
 for (let t = open; t + len <= close; t += len) out.push(zoned(day.y, day.m, day.d, t, biz.timezone));
 return out;
}
const dayStart = (biz, day) => zoned(day.y, day.m, day.d, 0, biz.timezone);
const fmt = (date, tz, opts) => new Intl.DateTimeFormat(LOCALE[lang], { timeZone: tz, ...opts }).format(date);
const fmtTime = (date, tz) => fmt(date, tz, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const fmtDay = (date, tz) => fmt(date, tz, { weekday: 'long', day: 'numeric', month: 'long' });
const noonOf = (biz, day) => zoned(day.y, day.m, day.d, 720, biz.timezone);
const weekdayName = (wd, style = 'long') => new Intl.DateTimeFormat(LOCALE[lang], { weekday: style, timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + wd)));

// =====================================================================
// Customer booking screen
// =====================================================================
const layer = document.createElement('div');
layer.id = 'bookLayer';
layer.className = 'book-layer hidden';
layer.innerHTML = `<div class="book-shell"><header class="book-top"><button type="button" class="book-back" id="bkBack"></button><div class="book-brand"><span class="book-logo">Q<i>.</i></span>QUEUELESS</div><div class="book-lang"><button type="button" data-bk-lang="en">EN</button><button type="button" data-bk-lang="he">עב</button><button type="button" data-bk-lang="ar">عر</button></div></header><main class="book-main" id="bkMain"></main></div>`;
document.body.appendChild(layer);

const C = { view: null, arg: null, biz: null, list: [], days: [], day: null, slot: null, busy: [], busyErr: null, query: '', poll: null };
const paint = (html) => { $('bkMain').innerHTML = html; };
function setUrl(key, value) { window.QL_NAV.go(`?${key}${value ? `=${encodeURIComponent(value)}` : ''}`); }
function openLayer(view, arg) {
 clearInterval(C.poll); C.poll = null; C.view = view; C.arg = arg;
 layer.classList.remove('hidden'); layer.dir = lang === 'en' ? 'ltr' : 'rtl'; layer.lang = lang;
 document.documentElement.lang = lang; document.documentElement.dir = layer.dir;
 $('bkBack').textContent = backLabel();
 layer.querySelectorAll('[data-bk-lang]').forEach((b) => b.classList.toggle('active', b.dataset.bkLang === lang));
 layer.scrollTo?.(0, 0);
}
function closeLayer(navigate = true) {
 clearInterval(C.poll); C.poll = null; C.view = null;
 layer.classList.add('hidden');
 if (navigate) window.QL_NAV.go();
}
const myBookings = () => { try { return JSON.parse(localStorage.getItem(MY_KEY) || '[]').filter((id) => UUID.test(id)); } catch { return []; } };
const rememberBooking = (id) => localStorage.setItem(MY_KEY, JSON.stringify([id, ...myBookings().filter((x) => x !== id)].slice(0, 10)));

async function showList() {
 openLayer('list'); setUrl('book');
 paint(`<section class="bk-head"><span class="eyebrow dark">${tx('bookKicker')}</span><h1>${tx('chooseBiz')}</h1><p>${tx('chooseBizSub')}</p></section><div id="bkMine"></div><input class="bk-search" id="bkSearch" type="search" placeholder="${esc(tx('search'))}" value="${esc(C.query)}" autocomplete="off"><div class="bk-list" id="bkList"><p class="bk-muted">${tx('loading')}</p></div>`);
 $('bkSearch').addEventListener('input', (e) => { C.query = e.target.value; drawList(); });
 await ready;
 if (C.view !== 'list') return;
 const c = client();
 if (!c) { $('bkList').innerHTML = `<p class="bk-error">${tx('errSetup')}</p>`; return; }
 const { data, error } = await c.from('businesses').select(BIZ_COLS).order('name');
 if (C.view !== 'list') return;
 if (error) { $('bkList').innerHTML = `<p class="bk-error">${esc(errText(error))}</p>`; return; }
 C.list = data || []; drawList(); drawMine();
}
function drawList() {
 const box = $('bkList'); if (!box) return;
 const q = C.query.trim().toLowerCase();
 const items = C.list.filter((b) => !q || b.name.toLowerCase().includes(q));
 if (!items.length) { box.innerHTML = `<p class="bk-muted">${tx('noBiz')}</p>`; return; }
 box.innerHTML = items.map((b) => {
  const h = hoursFor(b, todayIn(b.timezone).wd);
  return `<button type="button" class="bk-biz" data-biz="${esc(b.id)}"><span class="bk-avatar">${esc(b.name.trim().charAt(0).toUpperCase())}</span><span class="bk-biz-text"><strong>${esc(b.name)}</strong><small>${h ? `${tx('openToday')} · <bdi>${esc(h[0])}–${esc(h[1])}</bdi>` : tx('closedToday')}${b.phone ? ` · <bdi>${esc(b.phone)}</bdi>` : ''}</small></span><span class="bk-go">${tx('bookHere')}</span></button>`;
 }).join('');
 box.querySelectorAll('[data-biz]').forEach((el) => el.addEventListener('click', () => showBusiness(el.dataset.biz)));
}
async function drawMine() {
 const ids = myBookings().slice(0, 5), c = client(), box = $('bkMine');
 if (!ids.length || !c || !box) return;
 const rows = (await Promise.all(ids.map((id) => c.rpc('get_booking', { p_id: id }).then((r) => r.data?.[0]).catch(() => null))))
  .filter((r) => r && r.status !== 'cancelled' && Date.parse(r.ends_at) > Date.now());
 if (C.view !== 'list' || !rows.length) return;
 box.innerHTML = `<div class="bk-mine"><h3>${tx('myBookings')}</h3>${rows.map((r) => `<button type="button" class="bk-mine-row" data-booking="${esc(r.id)}"><strong>${esc(r.business_name)}</strong><span>${esc(fmtDay(new Date(r.starts_at), r.timezone))} · <bdi>${esc(fmtTime(new Date(r.starts_at), r.timezone))}</bdi></span><em class="ap-chip st-${esc(r.status)}">${tx('st_' + r.status)}</em></button>`).join('')}</div>`;
 box.querySelectorAll('[data-booking]').forEach((el) => el.addEventListener('click', () => showBooking(el.dataset.booking)));
}

async function showBusiness(id) {
 openLayer('business', id); setUrl('book', id); C.slot = null;
 paint(`<p class="bk-muted">${tx('loading')}</p>`);
 await ready;
 if (C.view !== 'business' || C.arg !== id) return;
 const c = client();
 if (!c) { paint(`<p class="bk-error">${tx('errSetup')}</p>`); return; }
 let biz = C.list.find((b) => b.id === id);
 if (!biz && UUID.test(id)) {
  const { data, error } = await c.from('businesses').select(BIZ_COLS).eq('id', id).maybeSingle();
  if (error) { paint(`<p class="bk-error">${esc(errText(error))}</p>`); return; }
  biz = data;
 }
 if (C.view !== 'business' || C.arg !== id) return;
 if (!biz) { paint(`<p class="bk-error">${tx('notFound')}</p>`); return; }
 C.biz = biz;
 C.days = Array.from({ length: DAYS_AHEAD }, (_, i) => shiftDay(todayIn(biz.timezone), i));
 const me = (() => { try { return JSON.parse(localStorage.getItem(ME_KEY) || '{}'); } catch { return {}; } })();
 paint(`<section class="bk-head bk-biz-head"><span class="bk-avatar big">${esc(biz.name.trim().charAt(0).toUpperCase())}</span><div><span class="eyebrow dark">${tx('bookKicker')}</span><h1>${esc(biz.name)}</h1>${biz.phone ? `<a class="bk-phone" href="tel:${esc(biz.phone)}">☏ <bdi>${esc(biz.phone)}</bdi></a>` : ''}</div></section>
 <div class="bk-card"><div class="bk-step"><b>1</b>${tx('step1')}</div><div class="bk-days" id="bkDays"></div>
 <div class="bk-step"><b>2</b>${tx('step2')}<span class="bk-legend"><i class="lg-free"></i>${tx('free')}<i class="lg-taken"></i>${tx('taken')}</span></div><div class="bk-slots" id="bkSlots"><p class="bk-muted">${tx('loading')}</p></div></div>
 <form id="bkForm" class="bk-card bk-form" novalidate><div class="bk-step"><b>3</b>${tx('step3')}</div><div class="bk-summary" id="bkSummary"></div>
 <div class="bk-fields"><label>${tx('name')}<input id="bkName" maxlength="80" autocomplete="name" required value="${esc(me.name || '')}"></label><label>${tx('phone')}<input id="bkPhone" type="tel" maxlength="30" autocomplete="tel" inputmode="tel" dir="ltr" required value="${esc(me.phone || '')}"></label></div>
 <label>${tx('note')}<textarea id="bkNote" maxlength="500" rows="3" placeholder="${esc(tx('notePh'))}"></textarea></label>
 <p class="bk-error" id="bkError" role="alert"></p><button class="btn btn-primary bk-submit" id="bkSubmit" type="submit">${tx('confirm')} <span>↗</span></button></form>`);
 await loadBusy();
 if (C.view !== 'business') return;
 const now = Date.now();
 C.day = C.days.find((d) => slotsFor(biz, d).some((s) => s.getTime() > now && !isBusy(s))) || C.days[0];
 drawDays(); drawSlots();
 $('bkForm').addEventListener('submit', submitBooking);
 C.poll = setInterval(async () => { await loadBusy(); drawSlots(); }, 20000);
}
async function loadBusy() {
 const biz = C.biz, last = C.days[C.days.length - 1];
 const { data, error } = await client().rpc('busy_slots', { p_business: biz.id, p_from: new Date().toISOString(), p_to: dayStart(biz, shiftDay(last, 1)).toISOString() });
 C.busyErr = error ? errText(error) : null;
 if (!error) C.busy = (data || []).map((r) => [Date.parse(r.starts_at), Date.parse(r.ends_at)]);
}
function isBusy(slot) {
 const s = slot.getTime(), e = s + (C.biz.slot_minutes || 30) * 60000;
 return C.busy.some(([bs, be]) => bs < e && be > s);
}
function drawDays() {
 const box = $('bkDays'); if (!box) return;
 const now = Date.now(), biz = C.biz;
 box.innerHTML = C.days.map((d) => {
  const open = slotsFor(biz, d).some((s) => s.getTime() > now), noon = noonOf(biz, d);
  return `<button type="button" class="bk-day${dayKey(d) === dayKey(C.day) ? ' active' : ''}" data-day="${dayKey(d)}" ${open ? '' : 'disabled'}><small>${esc(fmt(noon, biz.timezone, { weekday: 'short' }))}</small><strong>${d.d}</strong><small>${esc(fmt(noon, biz.timezone, { month: 'short' }))}</small></button>`;
 }).join('');
 box.querySelectorAll('[data-day]').forEach((el) => el.addEventListener('click', () => {
  C.day = C.days.find((d) => dayKey(d) === el.dataset.day); C.slot = null; drawDays(); drawSlots();
 }));
}
function drawSlots() {
 const box = $('bkSlots'); if (!box || !C.day) return;
 if (C.busyErr) { box.innerHTML = `<p class="bk-error">${esc(C.busyErr)}</p>`; drawSummary(); return; }
 const now = Date.now(), biz = C.biz, slots = slotsFor(biz, C.day);
 if (C.slot && (C.slot <= now || isBusy(new Date(C.slot)))) C.slot = null;
 const anyFree = slots.some((s) => s.getTime() > now && !isBusy(s));
 box.innerHTML = (anyFree ? '' : `<p class="bk-muted bk-span">${tx('noSlots')}</p>`) + slots.map((s) => {
  const past = s.getTime() <= now, busy = !past && isBusy(s);
  return `<button type="button" class="bk-slot${busy ? ' taken' : ''}${past ? ' past' : ''}${C.slot === s.getTime() ? ' active' : ''}" data-slot="${s.getTime()}" ${past || busy ? 'disabled' : ''}><bdi>${esc(fmtTime(s, biz.timezone))}</bdi>${busy ? `<small>${tx('taken')}</small>` : ''}</button>`;
 }).join('');
 box.querySelectorAll('[data-slot]').forEach((el) => el.addEventListener('click', () => {
  C.slot = Number(el.dataset.slot); drawSlots(); $('bkForm')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
 }));
 drawSummary();
}
function drawSummary() {
 const box = $('bkSummary'); if (!box) return;
 const tz = C.biz.timezone;
 box.innerHTML = C.slot
  ? `<span>${tx('selected')}</span><strong>${esc(fmtDay(new Date(C.slot), tz))} · <bdi>${esc(fmtTime(new Date(C.slot), tz))}</bdi></strong>`
  : `<span class="bk-muted">${tx('pickSlot')}</span>`;
 $('bkSubmit').disabled = !C.slot;
}
async function submitBooking(e) {
 e.preventDefault();
 const name = $('bkName').value.trim(), phone = $('bkPhone').value.trim(), note = $('bkNote').value.trim(), err = $('bkError');
 err.textContent = '';
 if (!C.slot) { err.textContent = tx('pickSlot'); return; }
 if (!name) { err.textContent = tx('errName'); $('bkName').focus(); return; }
 if (!validPhone(phone)) { err.textContent = tx('errPhone'); $('bkPhone').focus(); return; }
 const btn = $('bkSubmit'); btn.disabled = true;
 const { data, error } = await client().rpc('book_appointment', { p_business: C.biz.id, p_start: new Date(C.slot).toISOString(), p_name: name, p_phone: phone, p_note: note || null });
 if (error) {
  err.textContent = errText(error); btn.disabled = false;
  if (/SLOT_TAKEN|slot_unique|INVALID_TIME/.test(error.message || '')) { await loadBusy(); drawSlots(); }
  return;
 }
 localStorage.setItem(ME_KEY, JSON.stringify({ name, phone }));
 rememberBooking(data);
 showBooking(data);
}

async function showBooking(id) {
 openLayer('booking', id); setUrl('booking', id);
 paint(`<p class="bk-muted">${tx('loading')}</p>`);
 await ready;
 if (C.view !== 'booking' || C.arg !== id) return;
 const c = client();
 if (!c) { paint(`<p class="bk-error">${tx('errSetup')}</p>`); return; }
 const load = async () => {
  if (!UUID.test(id)) { paint(`<p class="bk-error">${tx('notFound')}</p>`); return; }
  const { data, error } = await c.rpc('get_booking', { p_id: id });
  if (C.view !== 'booking' || C.arg !== id) return;
  if (error) { paint(`<p class="bk-error">${esc(errText(error))}</p>`); return; }
  const r = data?.[0];
  if (!r) { paint(`<p class="bk-error">${tx('notFound')}</p>`); return; }
  rememberBooking(r.id);
  const start = new Date(r.starts_at), off = r.status === 'cancelled';
  const canCancel = r.status === 'booked' && start.getTime() > Date.now();
  paint(`<div class="bk-ticket${off ? ' off' : ''}"><div class="bk-ticket-top"><span class="bk-check">${off ? '×' : '✓'}</span><h1>${tx(off ? 'cancelledTitle' : 'booked')}</h1><p>${tx(off ? 'cancelledSub' : 'bookedSub')}</p></div>
  <div class="bk-ticket-body"><div class="bk-big-time"><bdi>${esc(fmtTime(start, r.timezone))}</bdi></div><div class="bk-big-day">${esc(fmtDay(start, r.timezone))}</div><div class="bk-perf"></div>
  <dl><div><dt>${tx('where')}</dt><dd>${esc(r.business_name)}</dd></div><div><dt>${tx('who')}</dt><dd>${esc(r.customer_name)}</dd></div>${r.note ? `<div><dt>${tx('noteL')}</dt><dd>${esc(r.note)}</dd></div>` : ''}<div><dt>${tx('status')}</dt><dd><span class="ap-chip st-${esc(r.status)}">${tx('st_' + r.status)}</span></dd></div></dl></div>
  <div class="bk-actions"><button type="button" class="btn btn-dark" id="bkCopy">${tx('copyLink')}</button>${r.business_phone ? `<a class="btn btn-outline" href="tel:${esc(r.business_phone)}">☏ ${tx('call')}</a>` : ''}${canCancel ? `<button type="button" class="btn btn-outline bk-danger" id="bkCancel">${tx('cancel')}</button>` : ''}<button type="button" class="btn btn-primary" id="bkAnother">${tx('another')}</button></div></div>`);
  $('bkCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(`${location.origin}${location.pathname}?booking=${r.id}`); toast(tx('linkCopied')); } catch { toast(tx('copyFailed')); } });
  $('bkAnother').addEventListener('click', () => showBusiness(r.business_id));
  $('bkCancel')?.addEventListener('click', async () => {
   if (!confirm(tx('cancelAsk'))) return;
   const res = await c.rpc('cancel_booking', { p_id: r.id });
   if (res.error) toast(errText(res.error)); else { toast(tx('cancelled')); load(); }
  });
 };
 await load();
 if (C.view === 'booking' && C.arg === id) C.poll = setInterval(load, 30000);
}

$('bkBack').addEventListener('click', () => {
 if (C.view === 'list') closeLayer(); else showList();
});
layer.querySelectorAll('[data-bk-lang]').forEach((b) => b.addEventListener('click', () => {
 localStorage.setItem('queueless-language', b.dataset.bkLang);
 document.querySelector(`.lang-switch [data-lang="${b.dataset.bkLang}"]`)?.click();
}));
function rerenderCustomer() {
 if (C.view === 'list') showList();
 else if (C.view === 'business') showBusiness(C.arg);
 else if (C.view === 'booking') showBooking(C.arg);
}

// =====================================================================
// Owner appointments board
// =====================================================================
const O = { uid: undefined, biz: null, loaded: false, err: null, day: null, appts: [], next: null, channel: null, timer: null, since: null, seen: new Set() };
const root = () => $('apptRoot');
const OWNER_STATUS = { arrived: 'arrived', done: 'done', no_show: 'noShow' };
const bookingUrl = () => `${location.origin}${location.pathname}?book=${O.biz.id}`;

async function ownerSync() {
 const tok = ownerToken(), uid = session()?.user?.id || null;
 const ident = tok ? `t:${tok}` : uid ? `u:${uid}` : null;
 if (ident === O.uid && O.loaded) { renderOwner(); return; }
 O.uid = ident; O.biz = null; O.loaded = false; O.err = null; O.appts = []; unsubscribe();
 renderOwner();
 if (!ident) { O.loaded = true; renderOwner(); return; }
 if (!client()) { O.loaded = true; O.err = tx('errSetup'); renderOwner(); return; }
 const { data, error } = tok
  ? await ownerCall('owner_business').then((r) => ({ data: r.data?.[0] || null, error: r.error }))
  : await client().from('businesses').select(OWNER_COLS).eq('owner_id', uid).maybeSingle();
 if (O.uid !== ident) return;
 O.loaded = true; O.err = error ? errText(error) : null; O.biz = data || null;
 if (O.biz) { O.day = todayIn(O.biz.timezone); subscribe(); }
 renderOwner();
 if (O.biz) loadAppts();
}
function renderOwner() {
 const el = root(); if (!el) return;
 const head = `<div class="page-head"><div><span class="eyebrow dark">${tx('apKicker')}</span><h1>${tx('apTitle')}</h1><p>${tx('apDesc')}</p></div>${O.biz ? `<div class="ap-head-actions"><button type="button" class="btn btn-outline" id="apCopy">${tx('copy')}</button><a class="btn btn-primary" id="apOpen" href="${esc(bookingUrl())}" target="_blank" rel="noopener">${tx('openPage')}</a></div>` : ''}</div>`;
 if (!O.loaded && O.uid) { el.innerHTML = `${head}<div class="panel ap-empty"><p class="bk-muted">${tx('loading')}</p></div>`; return; }
 if (!O.uid) {
  el.innerHTML = `${head}<div class="panel ap-empty"><div class="ap-empty-icon">◫</div><p>${tx('needAccount')}</p>${client() ? `<button type="button" class="btn btn-primary" id="apActivate">${tx('activate')} <span>↗</span></button>` : `<p class="bk-error">${tx('errSetup')}</p>`}</div>`;
  $('apActivate')?.addEventListener('click', () => document.dispatchEvent(new CustomEvent('ql-owner-phone')));
  return;
 }
 if (O.err) { el.innerHTML = `${head}<div class="panel ap-empty"><p class="bk-error">${esc(O.err)}</p></div>`; return; }
 if (!O.biz) { renderSetup(el, head); return; }
 const biz = O.biz;
 el.innerHTML = `${head}
 <div class="panel ap-link"><div><span>${tx('bookingLink')}</span><code dir="ltr">${esc(bookingUrl())}</code></div><span class="ap-live"><span class="live-dot"></span>${tx('live')}</span></div>
 <div class="stats ap-stats"><div class="stat"><div class="stat-icon peach">◫</div><span>${tx('bookedCount')}</span><strong id="apBooked">0</strong><small>${tx('bookedSub2')}</small></div><div class="stat"><div class="stat-icon mint">✓</div><span>${tx('freeCount')}</span><strong id="apFree">0</strong><small>${tx('freeSub')}</small></div><div class="stat ap-next"><div class="stat-icon lavender">◷</div><span>${tx('nextUp')}</span><strong id="apNext">—</strong><small id="apNextSub">${tx('nextNone')}</small></div></div>
 <div class="ap-grid"><div class="panel ap-day"><div class="ap-day-head"><button type="button" class="ap-nav" id="apPrev" aria-label="previous">${lang === 'en' ? '‹' : '›'}</button><div class="ap-day-title"><h3 id="apDayLabel"></h3><button type="button" class="text-link" id="apToday">${tx('today')}</button></div><button type="button" class="ap-nav" id="apNextDay" aria-label="next">${lang === 'en' ? '›' : '‹'}</button></div><div id="apTimeline" class="ap-timeline"></div></div>
 <form class="panel ap-hours" id="apHours" novalidate><h3>${tx('hoursTitle')}</h3>
 <label>${tx('bizName')}<input id="apName" maxlength="80" required value="${esc(biz.name)}"></label><label>${tx('bizPhone')}<input id="apPhone" type="tel" maxlength="30" dir="ltr" value="${esc(biz.phone || '')}"></label>
 <label>${tx('slotLen')}<select id="apSlotLen">${[10, 15, 20, 30, 45, 60, 90, 120].map((m) => `<option value="${m}" ${m === biz.slot_minutes ? 'selected' : ''}>${m} ${tx('minutes')}</option>`).join('')}</select></label>
 <div class="ap-week">${[0, 1, 2, 3, 4, 5, 6].map((wd) => { const h = hoursFor(biz, wd); return `<div class="ap-wd"><label class="ap-wd-name"><input type="checkbox" data-open="${wd}" ${h ? 'checked' : ''}>${esc(weekdayName(wd))}</label><input type="time" data-from="${wd}" value="${esc(h ? h[0] : '09:00')}" ${h ? '' : 'disabled'}><span>–</span><input type="time" data-to="${wd}" value="${esc(h ? h[1] : '17:00')}" ${h ? '' : 'disabled'}></div>`; }).join('')}</div>
 <p class="bk-error" id="apHoursErr"></p><button type="submit" class="btn btn-dark">${tx('saveHours')}</button></form></div>`;
 $('apCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(bookingUrl()); toast(tx('linkCopied')); } catch { toast(tx('copyFailed')); } });
 $('apPrev').addEventListener('click', () => { O.day = shiftDay(O.day, -1); loadAppts(); });
 $('apNextDay').addEventListener('click', () => { O.day = shiftDay(O.day, 1); loadAppts(); });
 $('apToday').addEventListener('click', () => { O.day = todayIn(biz.timezone); loadAppts(); });
 el.querySelectorAll('[data-open]').forEach((cb) => cb.addEventListener('change', () => {
  el.querySelectorAll(`[data-from="${cb.dataset.open}"],[data-to="${cb.dataset.open}"]`).forEach((i) => { i.disabled = !cb.checked; });
 }));
 $('apHours').addEventListener('submit', saveHours);
 drawTimeline();
}
function renderSetup(el, head) {
 let localName = '';
 try { localName = JSON.parse(localStorage.getItem('queueless-v1-state') || '{}').name || ''; } catch {}
 el.innerHTML = `${head}<form class="panel ap-setup" id="apSetup" novalidate><div class="ap-empty-icon">✳</div><h3>${tx('setupTitle')}</h3><p>${tx('setupDesc')}</p><label>${tx('bizName')}<input id="apNewName" maxlength="80" required value="${esc(localName)}"></label><label>${tx('bizPhone')}<input id="apNewPhone" type="tel" maxlength="30" dir="ltr" required></label><p class="bk-error" id="apSetupErr"></p><button type="submit" class="btn btn-primary">${tx('create')}</button></form>`;
 $('apSetup').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $('apNewName').value.trim(), phone = $('apNewPhone').value.trim(), err = $('apSetupErr');
  if (!name) { err.textContent = tx('errName'); return; }
  if (!validPhone(phone)) { err.textContent = tx('errPhone'); return; }
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem';
  const { data, error } = await client().from('businesses').insert({ name, phone, timezone }).select(OWNER_COLS).single();
  if (error) { err.textContent = errText(error); return; }
  O.biz = data; O.day = todayIn(data.timezone); subscribe(); renderOwner(); loadAppts();
 });
}
async function loadAppts() {
 if (!O.biz) return;
 const biz = O.biz, day = O.day;
 const from = dayStart(biz, day).toISOString(), to = dayStart(biz, shiftDay(day, 1)).toISOString();
 const [list, next] = ownerToken() ? await Promise.all([
  ownerCall('owner_appointments', { p_from: from, p_to: to }),
  ownerCall('owner_next_appointment')
 ]) : await Promise.all([
  client().from('appointments').select('*').eq('business_id', biz.id).gte('starts_at', from).lt('starts_at', to).order('starts_at'),
  client().from('appointments').select('starts_at,customer_name').eq('business_id', biz.id).in('status', ['booked', 'arrived']).gt('ends_at', new Date().toISOString()).order('starts_at').limit(1)
 ]);
 if (O.biz !== biz || dayKey(O.day) !== dayKey(day)) return;
 if (list.error) { const tl = $('apTimeline'); if (tl) tl.innerHTML = `<p class="bk-error">${esc(errText(list.error))}</p>`; return; }
 O.appts = list.data || []; O.next = next.data?.[0] || null;
 drawTimeline();
}
function drawTimeline() {
 const box = $('apTimeline'); if (!box || !O.biz) return;
 const biz = O.biz, tz = biz.timezone, len = (biz.slot_minutes || 30) * 60000, now = Date.now();
 const isToday = dayKey(O.day) === dayKey(todayIn(tz));
 $('apDayLabel').textContent = fmtDay(noonOf(biz, O.day), tz);
 $('apToday').hidden = isToday;
 const active = O.appts.filter((a) => a.status !== 'cancelled');
 const rows = new Map();
 slotsFor(biz, O.day).forEach((s) => rows.set(s.getTime(), { start: s.getTime(), end: s.getTime() + len, appt: null }));
 active.forEach((a) => { const s = Date.parse(a.starts_at); rows.set(s, { start: s, end: Date.parse(a.ends_at), appt: a }); });
 const list = [...rows.values()].sort((a, b) => a.start - b.start);
 const free = list.filter((r) => !r.appt && r.start > now).length;
 $('apBooked').textContent = active.length;
 $('apFree').textContent = free;
 if (O.next) { const d = new Date(O.next.starts_at); $('apNext').innerHTML = `<bdi>${esc(fmtTime(d, tz))}</bdi>`; $('apNextSub').textContent = `${O.next.customer_name} · ${fmt(d, tz, { weekday: 'short', day: 'numeric', month: 'short' })}`; }
 else { $('apNext').textContent = '—'; $('apNextSub').textContent = tx('nextNone'); }
 if (!list.length) { box.innerHTML = `<p class="bk-muted ap-closed">${tx('closedDay')}</p>`; return; }
 const btn = (id, status, label, cls = '') => `<button type="button" class="ap-act ${cls}" data-id="${esc(id)}" data-status="${status}">${label}</button>`;
 box.innerHTML = list.map((r) => {
  const nowRow = r.start <= now && now < r.end, past = r.end <= now, a = r.appt;
  const cls = `ap-row${a ? ' booked' : ' free'}${nowRow ? ' now' : ''}${past ? ' past' : ''}${a ? ' st-row-' + a.status : ''}`;
  const time = `<div class="ap-time"><bdi>${esc(fmtTime(new Date(r.start), tz))}</bdi><small><bdi>${esc(fmtTime(new Date(r.end), tz))}</bdi></small></div>`;
  const nowTag = nowRow ? `<span class="ap-now"><span class="live-dot"></span>${tx(a ? 'inProgress' : 'now')}</span>` : '';
  if (!a) return `<div class="${cls}">${time}<div class="ap-body"><span class="ap-free">${tx('freeSlot')}</span>${nowTag}</div></div>`;
  const actions = a.status === 'booked'
   ? btn(a.id, 'arrived', tx('arrived'), 'go') + btn(a.id, 'done', tx('done')) + btn(a.id, 'no_show', tx('noShow')) + btn(a.id, 'cancelled', tx('cancelAppt'), 'warn')
   : a.status === 'arrived' ? btn(a.id, 'done', tx('done'), 'go') + btn(a.id, 'no_show', tx('noShow')) : '';
  return `<div class="${cls}">${time}<div class="ap-body"><div class="ap-who"><strong>${esc(a.customer_name)}</strong><a href="tel:${esc(a.customer_phone)}" dir="ltr">☏ ${esc(a.customer_phone)}</a><span class="ap-chip st-${esc(a.status)}">${tx(OWNER_STATUS[a.status] || 'st_' + a.status)}</span>${nowTag}</div>${a.note ? `<p class="ap-note">${esc(a.note)}</p>` : ''}${actions ? `<div class="ap-actions">${actions}</div>` : ''}</div></div>`;
 }).join('');
 box.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => setStatus(b.dataset.id, b.dataset.status)));
}
async function setStatus(id, status) {
 if (status === 'cancelled' && !confirm(tx('cancelApptAsk'))) return;
 const { error } = ownerToken()
  ? await ownerCall('owner_set_status', { p_id: id, p_status: status })
  : await client().from('appointments').update({ status }).eq('id', id);
 if (error) toast(errText(error)); else loadAppts();
}
async function saveHours(e) {
 e.preventDefault();
 const el = root(), err = $('apHoursErr'), hours = {};
 for (let wd = 0; wd < 7; wd++) {
  const open = el.querySelector(`[data-open="${wd}"]`).checked, from = el.querySelector(`[data-from="${wd}"]`).value, to = el.querySelector(`[data-to="${wd}"]`).value;
  if (open && (!from || !to || toMin(to) <= toMin(from))) { err.textContent = `${weekdayName(wd)}: ${tx('hoursInvalid')}`; return; }
  hours[wd] = open ? [from, to] : null;
 }
 const name = $('apName').value.trim(), phone = $('apPhone').value.trim();
 if (!name) { err.textContent = tx('errName'); return; }
 if (phone && !validPhone(phone)) { err.textContent = tx('errPhone'); return; }
 err.textContent = '';
 const slot_minutes = Number($('apSlotLen').value);
 const { data, error } = ownerToken()
  ? await ownerCall('owner_update_business', { p_name: name, p_phone: phone || null, p_hours: hours, p_slot_minutes: slot_minutes }).then((r) => ({ data: r.data?.[0] || null, error: r.error }))
  : await client().from('businesses').update({ name, phone: phone || null, hours, slot_minutes }).eq('id', O.biz.id).select(OWNER_COLS).single();
 if (error) { err.textContent = errText(error); return; }
 O.biz = data; toast(tx('hoursSaved')); renderOwner(); loadAppts();
}
// Toasts once for each booking created after the board was opened.
function notifyNew(a) {
 if (!a || O.seen.has(a.id) || Date.parse(a.created_at) < O.since || a.status !== 'booked') return;
 O.seen.add(a.id);
 const d = new Date(a.starts_at);
 toast(`${tx('newBooking')}: ${a.customer_name} · ${fmt(d, O.biz.timezone, { weekday: 'short', day: 'numeric', month: 'short' })} ${fmtTime(d, O.biz.timezone)}`);
}
function subscribe() {
 unsubscribe();
 const biz = O.biz, c = client();
 O.since = Date.now(); O.seen = new Set();
 // Phone owners have no Auth session, so realtime RLS would hide rows from them: poll more often instead.
 if (ownerToken()) {
  O.timer = setInterval(async () => {
   if (document.visibilityState !== 'visible') return;
   const r = await ownerCall('owner_new_bookings', { p_since: new Date(O.since).toISOString() });
   if (O.biz === biz) (r.data || []).forEach(notifyNew);
   loadAppts();
  }, 10000);
  return;
 }
 O.channel = c.channel(`ql-appointments-${biz.id}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `business_id=eq.${biz.id}` }, (payload) => {
   if (payload.eventType === 'INSERT' && payload.new) notifyNew(payload.new);
   loadAppts();
  })
  .subscribe();
 // Polling backs up realtime and keeps the "now" marker moving.
 O.timer = setInterval(() => { if (document.visibilityState === 'visible') loadAppts(); }, 30000);
}
function unsubscribe() {
 if (O.channel) { client()?.removeChannel(O.channel); O.channel = null; }
 clearInterval(O.timer); O.timer = null;
}

// =====================================================================
// Wiring
// =====================================================================
document.addEventListener('click', (e) => {
 if (!e.target.closest('[data-lang],[data-auth-lang],[data-bk-lang]')) return;
 setTimeout(() => {
  const next = getLang(); if (next === lang) return;
  lang = next; rerenderCustomer(); renderOwner();
 }, 0);
});
document.addEventListener('ql-open-booking', () => showList());
document.addEventListener('ql-navigate', () => {
 const params = new URLSearchParams(location.search);
 if (params.has('booking')) showBooking(params.get('booking') || '');
 else if (params.has('book')) {
  const id = params.get('book');
  if (id) showBusiness(id); else showList();
 } else closeLayer(false);
});
document.addEventListener('ql-auth', () => { ready.then(ownerSync); });
ready.then(ownerSync);
renderOwner();
if (START.has('booking')) showBooking(START.get('booking') || '');
else if (START.has('book')) { const id = START.get('book'); if (id) showBusiness(id); else showList(); }
