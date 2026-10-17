/* CLASSVERSE teacher accounts UI: Clerk sign-in, profile, My Games, drafts, published, favorites, editor and community library.
   Only the PUBLIC Clerk publishable key is read from /api/config. All secrets stay on the server. */
(function () {
'use strict';
const T = {
  en: {
    signIn: 'Sign in', signUp: 'Sign up', signOut: 'Sign out', manageAccount: 'Manage account', profile: 'Teacher profile', myGames: 'My games', community: 'Community library', newGame: 'New game',
    tabAll: 'All my games', tabDraft: 'Drafts', tabPublished: 'Published', tabFavorites: 'Favorites',
    gateTitle: 'Sign in to open Teacher Studio', gateText: 'Teacher Studio is for signed-in teachers. Sign in with Google or your email to create, save and host games. Students never need an account.',
    gateLoading: 'Connecting to the sign-in service…', gateFailed: 'The sign-in service could not be loaded. Check your connection and try again.', gateOr: 'New here?',
    setupTitle: 'Accounts and saved games are not configured yet', setupText: 'This server is missing the settings below, so sign-in and saved games are switched off. Nothing is simulated.', setupMissing: 'Missing settings',
    step1: 'Clerk: create an application at dashboard.clerk.com, enable the Email and Google sign-in methods, then copy the Publishable key and the Secret key from the API keys page.',
    step2: 'Neon: create a project at console.neon.tech and copy its PostgreSQL connection string.',
    step3: 'Local: copy .env.example to .env, fill in the three values, then run: node --env-file=.env server.js',
    step4: 'Render: add the same three variables under Environment for the service and redeploy. Never put secret keys in front-end files or commit them to Git.',
    loading: 'Loading…', memberSince: 'Member since', email: 'Email', role: 'Role', roleTeacher: 'Teacher', roleAdmin: 'Administrator', stats: 'My library',
    recent: 'Recent live sessions', noSessions: 'No live sessions saved yet.', participants: 'Participants', avgScore: 'Average score', room: 'Room',
    emptyAll: 'No games yet. Create your first game!', emptyDraft: 'No drafts. Drafts are games you have not published yet.', emptyPublished: 'Nothing published yet.', emptyFavorites: 'No favorites yet. Open the community library and tap ☆ on a game.', noResults: 'No games found.',
    search: 'Search games', searchGo: 'Search', by: 'By {name}', questionsN: '{n} questions', edit: 'Edit', del: 'Delete', duplicate: 'Duplicate', host: 'Host live', publish: 'Publish', unpublish: 'Back to draft',
    copyLink: 'Copy share link', linkCopied: 'Share link copied.', favAdd: 'Add to favorites', favRemove: 'Remove from favorites', deleted: 'Game deleted.', saved: 'Saved.', duplicated: 'A private draft copy was added to My games.', deleteConfirm: 'Delete “{title}” permanently? This cannot be undone.',
    statusDraft: 'Draft', statusPublished: 'Published', visPrivate: 'Private', visUnlisted: 'Unlisted', visPublic: 'Public', you: 'You',
    editorNew: 'Create a game', editorEdit: 'Edit game', fTitle: 'Game title', fDescription: 'Short description', fObjectives: 'Learning objectives', fSubject: 'Subject', fTopic: 'Topic', anySubject: '— No subject —', anyTopic: '— No topic —',
    fGradeFrom: 'From grade', fGradeTo: 'To grade', fDifficulty: 'Difficulty', easy: 'Easy', medium: 'Medium', hard: 'Hard', fLanguage: 'Question language', langEn: 'English', langHe: 'Hebrew', langAr: 'Arabic',
    fVisibility: 'Who can open this game?', visPrivateD: 'Private — only you.', visUnlistedD: 'Unlisted — anyone with the share link.', visPublicD: 'Public — listed in the community library.',
    visHint: 'Unlisted and public games can be opened by others only after you publish them.', questions: 'Questions', addQuestion: 'Add a question', removeQuestion: 'Remove', qPrompt: 'Question', qOption: 'Answer {n}', qCorrect: 'Correct answer',
    saveDraft: 'Save as draft', savePublish: 'Save and publish', cancel: 'Cancel', back: 'Back',
    sharedTitle: 'Shared game', hostThis: 'Host this game', signInToHost: 'Sign in to host this game', copyToMine: 'Copy to my games', owner: 'Created by', gradesLabel: 'Grades {from}–{to}',
    errors: { unauthorized: 'Please sign in again.', forbidden: 'You are not allowed to change this game.', notFound: 'This game was not found or is not available to you.', titleRequired: 'Enter a game title.', subjectInvalid: 'Choose a valid subject.', topicInvalid: 'Choose a topic that belongs to the subject.', tooManyQuestions: 'A game can have up to 50 questions.', questionInvalid: 'Each question needs text and 2–4 different answers, with one marked correct.', publishNeedsQuestions: 'Add at least one question before publishing.', visibilityInvalid: 'Choose who can open the game.', dbNotConfigured: 'The database is not configured on this server.', authNotConfigured: 'Teacher sign-in is not configured on this server.', serverError: 'Something went wrong on the server. Please try again.', gameEmpty: 'This game has no questions yet.', networkError: 'Could not reach the server.' }
  },
  he: {
    signIn: 'כניסה', signUp: 'הרשמה', signOut: 'יציאה', manageAccount: 'ניהול החשבון', profile: 'פרופיל מורה', myGames: 'המשחקים שלי', community: 'ספריית הקהילה', newGame: 'משחק חדש',
    tabAll: 'כל המשחקים שלי', tabDraft: 'טיוטות', tabPublished: 'מפורסמים', tabFavorites: 'מועדפים',
    gateTitle: 'צריך להתחבר כדי לפתוח את מרחב המורים', gateText: 'מרחב המורים מיועד למורים מחוברים. אפשר להתחבר עם Google או עם אימייל כדי ליצור, לשמור ולהפעיל משחקים. תלמידים לא צריכים חשבון.',
    gateLoading: 'מתחברים לשירות ההתחברות…', gateFailed: 'לא הצלחנו לטעון את שירות ההתחברות. בדקו את החיבור ונסו שוב.', gateOr: 'חדשים כאן?',
    setupTitle: 'חשבונות ושמירת משחקים עדיין לא הוגדרו', setupText: 'בשרת הזה חסרות ההגדרות שלהלן, ולכן ההתחברות ושמירת המשחקים כבויות. שום דבר לא מדומה.', setupMissing: 'הגדרות חסרות',
    step1: 'Clerk: יוצרים אפליקציה ב־dashboard.clerk.com, מפעילים את שיטות הכניסה Email ו־Google, ומעתיקים את Publishable key ואת Secret key מעמוד ה־API keys.',
    step2: 'Neon: יוצרים פרויקט ב־console.neon.tech ומעתיקים את מחרוזת החיבור של PostgreSQL.',
    step3: 'מקומית: מעתיקים את .env.example ל־.env, ממלאים את שלושת הערכים, ומריצים: node --env-file=.env server.js',
    step4: 'Render: מוסיפים את אותם שלושה משתנים תחת Environment של השירות ופורסים מחדש. לעולם לא שמים מפתחות סודיים בקבצי צד לקוח ולא מעלים אותם ל־Git.',
    loading: 'טוענים…', memberSince: 'חבר/ה מאז', email: 'אימייל', role: 'תפקיד', roleTeacher: 'מורה', roleAdmin: 'מנהל/ת', stats: 'הספרייה שלי',
    recent: 'מפגשים חיים אחרונים', noSessions: 'עוד לא נשמרו מפגשים חיים.', participants: 'משתתפים', avgScore: 'ציון ממוצע', room: 'חדר',
    emptyAll: 'עוד אין משחקים. יוצרים את המשחק הראשון!', emptyDraft: 'אין טיוטות. טיוטות הן משחקים שעוד לא פורסמו.', emptyPublished: 'עוד לא פורסם דבר.', emptyFavorites: 'אין עדיין מועדפים. פותחים את ספריית הקהילה ולוחצים על ☆ במשחק.', noResults: 'לא נמצאו משחקים.',
    search: 'חיפוש משחקים', searchGo: 'חיפוש', by: 'מאת {name}', questionsN: '{n} שאלות', edit: 'עריכה', del: 'מחיקה', duplicate: 'שכפול', host: 'הפעלה חיה', publish: 'פרסום', unpublish: 'חזרה לטיוטה',
    copyLink: 'העתקת קישור שיתוף', linkCopied: 'קישור השיתוף הועתק.', favAdd: 'הוספה למועדפים', favRemove: 'הסרה מהמועדפים', deleted: 'המשחק נמחק.', saved: 'נשמר.', duplicated: 'עותק פרטי בטיוטה נוסף למשחקים שלי.', deleteConfirm: 'למחוק את “{title}” לצמיתות? אי אפשר לבטל.',
    statusDraft: 'טיוטה', statusPublished: 'מפורסם', visPrivate: 'פרטי', visUnlisted: 'לא רשום', visPublic: 'ציבורי', you: 'אתם',
    editorNew: 'יצירת משחק', editorEdit: 'עריכת משחק', fTitle: 'שם המשחק', fDescription: 'תיאור קצר', fObjectives: 'מטרות למידה', fSubject: 'מקצוע', fTopic: 'נושא', anySubject: '— ללא מקצוע —', anyTopic: '— ללא נושא —',
    fGradeFrom: 'מכיתה', fGradeTo: 'עד כיתה', fDifficulty: 'רמת קושי', easy: 'קל', medium: 'בינוני', hard: 'קשה', fLanguage: 'שפת השאלות', langEn: 'אנגלית', langHe: 'עברית', langAr: 'ערבית',
    fVisibility: 'מי יכול לפתוח את המשחק?', visPrivateD: 'פרטי — רק אתם.', visUnlistedD: 'לא רשום — כל מי שיש לו את קישור השיתוף.', visPublicD: 'ציבורי — מופיע בספריית הקהילה.',
    visHint: 'משחקים לא רשומים וציבוריים ייפתחו לאחרים רק אחרי שתפרסמו אותם.', questions: 'שאלות', addQuestion: 'הוספת שאלה', removeQuestion: 'הסרה', qPrompt: 'שאלה', qOption: 'תשובה {n}', qCorrect: 'התשובה הנכונה',
    saveDraft: 'שמירה כטיוטה', savePublish: 'שמירה ופרסום', cancel: 'ביטול', back: 'חזרה',
    sharedTitle: 'משחק משותף', hostThis: 'הפעלת המשחק', signInToHost: 'מתחברים כדי להפעיל את המשחק', copyToMine: 'העתקה למשחקים שלי', owner: 'נוצר על ידי', gradesLabel: 'כיתות {from}–{to}',
    errors: { unauthorized: 'צריך להתחבר מחדש.', forbidden: 'אין לכם הרשאה לשנות את המשחק הזה.', notFound: 'המשחק לא נמצא או שאינו זמין לכם.', titleRequired: 'הזינו שם למשחק.', subjectInvalid: 'בחרו מקצוע תקין.', topicInvalid: 'בחרו נושא ששייך למקצוע.', tooManyQuestions: 'אפשר עד 50 שאלות במשחק.', questionInvalid: 'לכל שאלה צריך טקסט ו־2 עד 4 תשובות שונות, עם תשובה נכונה אחת.', publishNeedsQuestions: 'הוסיפו לפחות שאלה אחת לפני הפרסום.', visibilityInvalid: 'בחרו מי יכול לפתוח את המשחק.', dbNotConfigured: 'מסד הנתונים לא מוגדר בשרת הזה.', authNotConfigured: 'התחברות מורים לא מוגדרת בשרת הזה.', serverError: 'משהו השתבש בשרת. נסו שוב.', gameEmpty: 'במשחק הזה עדיין אין שאלות.', networkError: 'אי אפשר להגיע לשרת.' }
  },
  ar: {
    signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب', signOut: 'تسجيل الخروج', manageAccount: 'إدارة الحساب', profile: 'ملف المعلّم', myGames: 'ألعابي', community: 'مكتبة المجتمع', newGame: 'لعبة جديدة',
    tabAll: 'كل ألعابي', tabDraft: 'المسودات', tabPublished: 'المنشورة', tabFavorites: 'المفضلة',
    gateTitle: 'سجّلوا الدخول لفتح استوديو المعلم', gateText: 'استوديو المعلم مخصص للمعلمين المسجّلين. سجّلوا الدخول عبر Google أو البريد الإلكتروني لإنشاء الألعاب وحفظها وتشغيلها. الطلاب لا يحتاجون إلى حساب.',
    gateLoading: 'جارٍ الاتصال بخدمة تسجيل الدخول…', gateFailed: 'تعذّر تحميل خدمة تسجيل الدخول. تحققوا من الاتصال وحاولوا مجدداً.', gateOr: 'جدد هنا؟',
    setupTitle: 'الحسابات وحفظ الألعاب غير مُعدّة بعد', setupText: 'تنقص هذا الخادم الإعدادات التالية، لذلك تسجيل الدخول وحفظ الألعاب متوقفان. لا شيء هنا مُحاكى.', setupMissing: 'إعدادات ناقصة',
    step1: 'Clerk: أنشئوا تطبيقاً في dashboard.clerk.com، فعّلوا طريقتي الدخول Email وGoogle، ثم انسخوا Publishable key وSecret key من صفحة API keys.',
    step2: 'Neon: أنشئوا مشروعاً في console.neon.tech وانسخوا سلسلة اتصال PostgreSQL.',
    step3: 'محلياً: انسخوا .env.example إلى .env، واملؤوا القيم الثلاث، ثم شغّلوا: node --env-file=.env server.js',
    step4: 'Render: أضيفوا المتغيرات الثلاثة نفسها ضمن Environment للخدمة وأعيدوا النشر. لا تضعوا المفاتيح السرية أبداً في ملفات الواجهة ولا ترفعوها إلى Git.',
    loading: 'جارٍ التحميل…', memberSince: 'عضو منذ', email: 'البريد الإلكتروني', role: 'الدور', roleTeacher: 'معلّم/ة', roleAdmin: 'مسؤول/ة', stats: 'مكتبتي',
    recent: 'آخر الجلسات المباشرة', noSessions: 'لا توجد جلسات مباشرة محفوظة بعد.', participants: 'المشاركون', avgScore: 'متوسط النقاط', room: 'الغرفة',
    emptyAll: 'لا توجد ألعاب بعد. أنشئوا لعبتكم الأولى!', emptyDraft: 'لا توجد مسودات. المسودات هي ألعاب لم تُنشر بعد.', emptyPublished: 'لم يُنشر شيء بعد.', emptyFavorites: 'لا توجد مفضلات بعد. افتحوا مكتبة المجتمع واضغطوا ☆ على لعبة.', noResults: 'لم يتم العثور على ألعاب.',
    search: 'ابحثوا عن ألعاب', searchGo: 'بحث', by: 'بواسطة {name}', questionsN: '{n} أسئلة', edit: 'تعديل', del: 'حذف', duplicate: 'تكرار', host: 'تشغيل مباشر', publish: 'نشر', unpublish: 'إعادة إلى مسودة',
    copyLink: 'نسخ رابط المشاركة', linkCopied: 'تم نسخ رابط المشاركة.', favAdd: 'إضافة إلى المفضلة', favRemove: 'إزالة من المفضلة', deleted: 'تم حذف اللعبة.', saved: 'تم الحفظ.', duplicated: 'أُضيفت نسخة خاصة كمسودة إلى ألعابي.', deleteConfirm: 'هل تريدون حذف «{title}» نهائياً؟ لا يمكن التراجع.',
    statusDraft: 'مسودة', statusPublished: 'منشورة', visPrivate: 'خاصة', visUnlisted: 'غير مدرجة', visPublic: 'عامة', you: 'أنتم',
    editorNew: 'إنشاء لعبة', editorEdit: 'تعديل اللعبة', fTitle: 'عنوان اللعبة', fDescription: 'وصف قصير', fObjectives: 'الأهداف التعليمية', fSubject: 'المادة', fTopic: 'الموضوع', anySubject: '— بلا مادة —', anyTopic: '— بلا موضوع —',
    fGradeFrom: 'من الصف', fGradeTo: 'إلى الصف', fDifficulty: 'مستوى الصعوبة', easy: 'سهل', medium: 'متوسط', hard: 'صعب', fLanguage: 'لغة الأسئلة', langEn: 'الإنجليزية', langHe: 'العبرية', langAr: 'العربية',
    fVisibility: 'من يمكنه فتح اللعبة؟', visPrivateD: 'خاصة — أنتم فقط.', visUnlistedD: 'غير مدرجة — أي شخص لديه رابط المشاركة.', visPublicD: 'عامة — تظهر في مكتبة المجتمع.',
    visHint: 'الألعاب غير المدرجة والعامة لا يفتحها الآخرون إلا بعد نشرها.', questions: 'الأسئلة', addQuestion: 'إضافة سؤال', removeQuestion: 'إزالة', qPrompt: 'السؤال', qOption: 'الإجابة {n}', qCorrect: 'الإجابة الصحيحة',
    saveDraft: 'حفظ كمسودة', savePublish: 'حفظ ونشر', cancel: 'إلغاء', back: 'رجوع',
    sharedTitle: 'لعبة مشتركة', hostThis: 'تشغيل هذه اللعبة', signInToHost: 'سجّلوا الدخول لتشغيل هذه اللعبة', copyToMine: 'نسخ إلى ألعابي', owner: 'أنشأها', gradesLabel: 'الصفوف {from}–{to}',
    errors: { unauthorized: 'يرجى تسجيل الدخول مجدداً.', forbidden: 'ليس لديكم صلاحية تعديل هذه اللعبة.', notFound: 'لم يتم العثور على اللعبة أو أنها غير متاحة لكم.', titleRequired: 'أدخلوا عنوان اللعبة.', subjectInvalid: 'اختاروا مادة صالحة.', topicInvalid: 'اختاروا موضوعاً ينتمي إلى المادة.', tooManyQuestions: 'يمكن أن تحتوي اللعبة على 50 سؤالاً كحد أقصى.', questionInvalid: 'كل سؤال يحتاج إلى نص و2–4 إجابات مختلفة مع إجابة صحيحة واحدة.', publishNeedsQuestions: 'أضيفوا سؤالاً واحداً على الأقل قبل النشر.', visibilityInvalid: 'اختاروا من يمكنه فتح اللعبة.', dbNotConfigured: 'قاعدة البيانات غير مُعدّة على هذا الخادم.', authNotConfigured: 'تسجيل دخول المعلمين غير مُعدّ على هذا الخادم.', serverError: 'حدث خطأ في الخادم. حاولوا مجدداً.', gameEmpty: 'لا توجد أسئلة في هذه اللعبة بعد.', networkError: 'تعذّر الوصول إلى الخادم.' }
  }
};

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const A = { ctx: null, cfg: null, clerkState: 'idle', user: null, me: null, view: 'games', tab: 'all', games: [], favorites: [], favIds: new Set(), community: [], search: '', sessions: [], taxonomy: { subjects: [], topics: [] }, edit: null, shared: null, busy: false, after: null };
const lang = () => A.ctx?.state.lang || localStorage.getItem('classverse_lang') || 'he';
const tr = (key, values = {}) => String((T[lang()] || T.en)[key] ?? T.en[key] ?? key).replace(/\{(\w+)\}/g, (m, k) => values[k] ?? m);
const errText = (key, l = lang()) => (T[l]?.errors || T.en.errors)[key] || T.en.errors[key] || null;
const when = v => { try { return new Date(v).toLocaleDateString(lang()); } catch { return ''; } };
const btn = (label, action, cls = 'btn secondary small') => `<button class="${cls}" data-action="acct:${esc(action)}">${label}</button>`;
const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

async function token() { try { return window.Clerk?.session ? await window.Clerk.session.getToken() : null; } catch { return null; } }
async function call(path, { method = 'GET', body } = {}) {
  const headers = {}; const t = await token();
  if (t) headers.authorization = `Bearer ${t}`;
  if (body) headers['content-type'] = 'application/json';
  try {
    const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, data } : { ok: false, error: data.error || 'serverError' };
  } catch { return { ok: false, error: 'networkError' }; }
}
const fail = r => A.ctx.toast(errText(r.error) || errText('serverError'));

/* ---- Clerk (public key only) ---- */
async function localization(l) {
  const file = { he: 'he', ar: 'ar' }[l]; if (!file) return undefined;
  try { const m = await import(`/vendor/clerk-${file}.mjs`); return m.heIL || m.arSA; } catch { return undefined; }
}
async function loadClerk() {
  const { clerkPublishableKey: key, clerkHost: host } = A.cfg || {};
  if (!key || !host) return;
  A.clerkState = 'loading'; A.ctx.rerender();
  try {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://${host}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`; s.async = true; s.crossOrigin = 'anonymous';
      s.setAttribute('data-clerk-publishable-key', key); s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
    });
    await window.Clerk.load({ localization: await localization(lang()) });
    window.Clerk.addListener(() => syncUser());
    A.clerkState = 'ready'; await syncUser();
  } catch { A.clerkState = 'failed'; A.ctx.rerender(); }
}
async function syncUser() {
  const u = window.Clerk?.user || null;
  if (!u) {
    const wasIn = !!A.user; A.user = null; A.me = null; A.games = []; A.favorites = []; A.favIds = new Set(); A.sessions = []; A.edit = null;
    if (wasIn && A.ctx.state.page === 'acct' && A.view !== 'community' && A.view !== 'shared') A.ctx.state.page = 'home';
    return A.ctx.rerender();
  }
  A.user = { name: u.fullName || u.primaryEmailAddress?.emailAddress || '', email: u.primaryEmailAddress?.emailAddress || '', imageUrl: u.imageUrl || '' };
  const me = await call('/me'); if (me.ok) A.me = me.data.user;
  const favs = await call('/favorites'); if (favs.ok) { A.favorites = favs.data.games; A.favIds = new Set(favs.data.games.map(g => g.id)); }
  const after = A.after; A.after = null; if (after) after();
  A.ctx.rerender();
}
function languageChanged() { localization(lang()).then(loc => { try { window.Clerk?.__internal_updateProps?.({ localization: loc }); } catch { /* optional */ } }); }

/* ---- data loading ---- */
async function loadTaxonomy() { if (A.taxonomy.subjects.length) return; const r = await call('/subjects'); if (r.ok) A.taxonomy = r.data; }
async function loadGames() { const r = await call('/games/mine'); if (r.ok) A.games = r.data.games; else fail(r); A.ctx.rerender(); }
async function loadCommunity() { const r = await call(`/games/public?q=${encodeURIComponent(A.search)}`); if (r.ok) A.community = r.data.games; else fail(r); A.ctx.rerender(); }
async function loadProfile() { const [g, s] = await Promise.all([call('/games/mine'), call('/sessions')]); if (g.ok) A.games = g.data.games; if (s.ok) A.sessions = s.data.sessions; A.ctx.rerender(); }
function go(view) {
  A.view = view; A.ctx.state.page = 'acct'; A.ctx.rerender();
  if (view === 'games') { loadTaxonomy(); loadGames(); }
  if (view === 'community') { loadTaxonomy(); loadCommunity(); }
  if (view === 'profile') loadProfile();
}
const studioOpen = () => !!A.cfg && (A.cfg.auth ? !!A.user : A.cfg.anonymousTeacher);
// Called by the main app before showing Teacher Studio. Returns true when access was blocked.
function guard(resume) {
  if (studioOpen()) return false;
  A.after = resume || null; A.view = 'gate'; A.ctx.state.page = 'acct'; A.ctx.rerender();
  return true;
}
function requireSignIn(resume) { if (A.user) return false; A.after = resume || null; A.view = 'gate'; A.ctx.state.page = 'acct'; A.ctx.rerender(); return true; }

/* ---- rendering ---- */
const subjectName = id => { const s = A.taxonomy.subjects.find(x => x.id === id); return s ? `${s.icon || ''} ${s[`name_${lang()}`] || s.name_en}`.trim() : ''; };
const topicName = id => { const t = A.taxonomy.topics.find(x => x.id === id); return t ? t[`name_${lang()}`] || t.name_en : ''; };
const visLabel = v => tr({ private: 'visPrivate', unlisted: 'visUnlisted', public: 'visPublic' }[v]);

function navHtml() {
  const community = `<button class="nav-link" data-action="acct:go:community">${tr('community')}</button>`;
  if (A.user) return `${community}<button class="nav-link" data-action="acct:go:games">${tr('myGames')}</button><button class="nav-link ac-profile-link" data-action="acct:go:profile">${A.user.imageUrl ? `<img class="ac-avatar-sm" src="${esc(A.user.imageUrl)}" alt="" width="22" height="22">` : '👤'} ${esc(A.user.name || tr('profile'))}</button><button class="nav-link" data-action="acct:signOut">${tr('signOut')}</button>`;
  return `${community}<button class="nav-link" data-action="acct:signIn">${tr('signIn')}</button><button class="nav-link ac-signup" data-action="acct:signUp">${tr('signUp')}</button>`;
}

function setupGuide() {
  const missing = [];
  if (!A.cfg?.auth) missing.push('CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY');
  if (!A.cfg?.database) missing.push('DATABASE_URL');
  return `<div class="card ac-setup"><h1>🔧 ${tr('setupTitle')}</h1><p>${tr('setupText')}</p><h2>${tr('setupMissing')}</h2><ul class="ac-missing">${missing.map(m => `<li><code dir="ltr">${m}</code></li>`).join('')}</ul><ol>${['step1', 'step2', 'step3', 'step4'].map(k => `<li>${esc(tr(k))}</li>`).join('')}</ol></div>`;
}
function gatePage() {
  if (!A.cfg) return `<div class="card center"><p>${tr('loading')}</p></div>`;
  if (!A.cfg.auth || !A.cfg.database) return setupGuide();
  const status = A.clerkState === 'loading' || A.clerkState === 'idle' ? `<p class="muted" role="status">${tr('gateLoading')}</p>` : A.clerkState === 'failed' ? `<p class="notice" role="alert">${tr('gateFailed')}</p>` : '';
  const ready = A.clerkState === 'ready';
  return `<div class="card center ac-gate"><div class="emoji" aria-hidden="true">🔐</div><h1>${tr('gateTitle')}</h1><p>${tr('gateText')}</p>${status}<div class="actions ac-center"><button class="btn primary-action" data-action="acct:signIn" ${ready ? '' : 'disabled'}>${tr('signIn')}</button></div><p class="muted">${tr('gateOr')} <button class="text-link" data-action="acct:signUp" ${ready ? '' : 'disabled'}>${tr('signUp')}</button></p></div>`;
}

function gameCard(g, { mine }) {
  const owner = g.isOwner;
  const badges = owner ? `<span class="ac-badge ac-${g.status}">${tr(g.status === 'published' ? 'statusPublished' : 'statusDraft')}</span><span class="ac-badge ac-vis-${g.visibility}">${visLabel(g.visibility)}</span>` : '';
  const meta = [subjectName(g.subjectId), topicName(g.topicId)].filter(Boolean).join(' · ');
  const shareable = owner && g.status === 'published' && g.visibility !== 'private';
  const fav = A.favIds.has(g.id);
  const actions = [
    owner ? btn(tr('edit'), `edit:${g.id}`) : '',
    g.questionCount ? btn(tr('host'), `host:${g.id}`, 'btn primary-action small') : '',
    owner ? btn(g.status === 'published' ? tr('unpublish') : tr('publish'), `${g.status === 'published' ? 'unpublish' : 'publish'}:${g.id}`) : '',
    shareable || (!owner && g.status === 'published') ? btn(tr('copyLink'), `copy:${g.id}`) : '',
    A.user ? btn(tr('duplicate'), `dup:${g.id}`) : '',
    A.user ? `<button class="btn secondary small ac-fav ${fav ? 'on' : ''}" aria-pressed="${fav}" aria-label="${esc(fav ? tr('favRemove') : tr('favAdd'))}" data-action="acct:fav:${esc(g.id)}">${fav ? '★' : '☆'}</button>` : '',
    owner ? btn(tr('del'), `del:${g.id}`, 'btn danger small') : ''
  ].join('');
  return `<article class="card ac-game"><div class="ac-badges">${badges}<span class="ac-badge">${esc({ en: 'EN', he: 'עב', ar: 'عر' }[g.language] || g.language)}</span></div><h3 dir="auto">${esc(g.title)}</h3>${g.description ? `<p dir="auto">${esc(g.description)}</p>` : ''}${meta ? `<p class="muted">${esc(meta)}</p>` : ''}<p class="muted ac-meta"><span>❓ ${tr('questionsN', { n: g.questionCount ?? 0 })}</span><span>${tr('gradesLabel', { from: g.gradeFrom, to: g.gradeTo })}</span>${!owner && g.creator ? `<span>${tr('by', { name: esc(g.creator) })}</span>` : ''}</p><div class="actions">${actions}</div></article>`;
}
function gamesPage() {
  const tabs = [['all', 'tabAll'], ['draft', 'tabDraft'], ['published', 'tabPublished'], ['favorites', 'tabFavorites']];
  const list = A.tab === 'favorites' ? A.favorites : A.games.filter(g => A.tab === 'all' || g.status === A.tab);
  const empty = { all: 'emptyAll', draft: 'emptyDraft', published: 'emptyPublished', favorites: 'emptyFavorites' }[A.tab];
  const counts = { all: A.games.length, draft: A.games.filter(g => g.status === 'draft').length, published: A.games.filter(g => g.status === 'published').length, favorites: A.favorites.length };
  return `<div class="section-head"><div><h1>🎮 ${tr('myGames')}</h1></div>${btn(`＋ ${tr('newGame')}`, 'new', 'btn primary-action')}</div>
    <div class="ac-tabs" role="tablist">${tabs.map(([id, key]) => `<button role="tab" aria-selected="${A.tab === id}" class="ac-tab ${A.tab === id ? 'active' : ''}" data-action="acct:tab:${id}">${tr(key)} <bdi dir="ltr">${counts[id]}</bdi></button>`).join('')}</div>
    ${list.length ? `<div class="ac-grid">${list.map(g => gameCard(g, { mine: true })).join('')}</div>` : `<div class="card center"><p class="muted">${tr(empty)}</p></div>`}`;
}
function communityPage() {
  return `<div class="section-head"><div><h1>🌍 ${tr('community')}</h1></div></div>
    <form class="ac-search" data-acct-form="search" onsubmit="return false"><label class="visually-hidden" for="ac-q">${tr('search')}</label><input class="input" id="ac-q" value="${esc(A.search)}" placeholder="${esc(tr('search'))}" maxlength="60">${btn(tr('searchGo'), 'search', 'btn primary-action')}</form>
    ${A.community.length ? `<div class="ac-grid">${A.community.map(g => gameCard(g, { mine: false })).join('')}</div>` : `<div class="card center"><p class="muted">${tr('noResults')}</p></div>`}`;
}
function profilePage() {
  const u = A.user, me = A.me; if (!u || !me) return `<div class="card center"><p>${tr('loading')}</p></div>`;
  const sessions = A.sessions.length ? `<div class="ac-table-wrap"><table class="ac-table"><thead><tr><th>${tr('room')}</th><th>${tr('myGames')}</th><th>${tr('participants')}</th><th>${tr('avgScore')}</th><th></th></tr></thead><tbody>${A.sessions.map(s => `<tr><td dir="ltr">${esc(s.roomCode)}</td><td dir="auto">${esc(s.title)}</td><td dir="ltr">${s.participants}</td><td dir="ltr">${s.averageScore}</td><td>${when(s.startedAt)}</td></tr>`).join('')}</tbody></table></div>` : `<p class="muted">${tr('noSessions')}</p>`;
  const n = f => A.games.filter(f).length;
  return `<div class="section-head"><h1>👤 ${tr('profile')}</h1></div>
    <div class="card ac-profile"><div class="ac-who">${u.imageUrl ? `<img class="ac-avatar" src="${esc(u.imageUrl)}" alt="" width="72" height="72">` : '<span class="ac-avatar ac-avatar-ph" aria-hidden="true">👤</span>'}<div><h2 dir="auto">${esc(me.name || u.name)}</h2><p class="muted"><span>${tr('email')}: <bdi dir="ltr">${esc(me.email || u.email)}</bdi></span><br><span>${tr('role')}: ${tr(me.role === 'admin' ? 'roleAdmin' : 'roleTeacher')}</span><br><span>${tr('memberSince')}: ${when(me.createdAt)}</span></p><div class="actions">${btn(tr('manageAccount'), 'manage')}${btn(tr('signOut'), 'signOut')}</div></div></div></div>
    <div class="card"><h2>${tr('stats')}</h2><div class="ac-stats"><div><strong dir="ltr">${A.games.length}</strong><span>${tr('tabAll')}</span></div><div><strong dir="ltr">${n(g => g.status === 'draft')}</strong><span>${tr('tabDraft')}</span></div><div><strong dir="ltr">${n(g => g.status === 'published')}</strong><span>${tr('tabPublished')}</span></div><div><strong dir="ltr">${A.favorites.length}</strong><span>${tr('tabFavorites')}</span></div></div></div>
    <div class="card"><h2>${tr('recent')}</h2>${sessions}</div>`;
}

const blankQuestion = () => ({ prompt: '', options: ['', '', '', ''], correctIndex: 0 });
function editorPage() {
  const e = A.edit; if (!e) return '';
  const subjects = A.taxonomy.subjects, topics = A.taxonomy.topics.filter(t => t.subject_id === e.subjectId);
  const opt = (v, label, cur) => `<option value="${esc(v)}" ${String(cur) === String(v) ? 'selected' : ''}>${esc(label)}</option>`;
  const questions = e.questions.map((q, i) => `<fieldset class="card ac-q"><legend>${tr('questions')} <bdi dir="ltr">${i + 1}</bdi></legend>
    <div class="field"><label for="ed-q-${i}-p">${tr('qPrompt')}</label><input class="input" id="ed-q-${i}-p" maxlength="240" dir="auto" value="${esc(q.prompt)}"></div>
    ${q.options.map((o, j) => `<div class="field"><label for="ed-q-${i}-o${j}">${tr('qOption', { n: j + 1 })}</label><input class="input" id="ed-q-${i}-o${j}" maxlength="90" dir="auto" value="${esc(o)}"></div>`).join('')}
    <div class="field"><label for="ed-q-${i}-c">${tr('qCorrect')}</label><select class="select" id="ed-q-${i}-c" dir="ltr">${[0, 1, 2, 3].map(j => opt(j, String(j + 1), q.correctIndex)).join('')}</select></div>${btn(tr('removeQuestion'), `delQ:${i}`, 'btn danger small')}</fieldset>`).join('');
  return `<div class="section-head"><div><h1>✏️ ${tr(e.id ? 'editorEdit' : 'editorNew')}</h1></div>${btn(`← ${tr('back')}`, 'cancel')}</div>
    <div class="card stack ac-form">
      <div class="field"><label for="ed-title">${tr('fTitle')}</label><input class="input" id="ed-title" maxlength="90" dir="auto" value="${esc(e.title)}"></div>
      <div class="field"><label for="ed-desc">${tr('fDescription')}</label><input class="input" id="ed-desc" maxlength="300" dir="auto" value="${esc(e.description)}"></div>
      <div class="field"><label for="ed-obj">${tr('fObjectives')}</label><input class="input" id="ed-obj" maxlength="400" dir="auto" value="${esc(e.objectives)}"></div>
      <div class="ac-row"><div class="field"><label for="ed-subject">${tr('fSubject')}</label><select class="select" id="ed-subject"><option value="">${esc(tr('anySubject'))}</option>${subjects.map(s => opt(s.id, `${s.icon || ''} ${s[`name_${lang()}`] || s.name_en}`, e.subjectId)).join('')}</select></div>
      <div class="field"><label for="ed-topic">${tr('fTopic')}</label><select class="select" id="ed-topic"><option value="">${esc(tr('anyTopic'))}</option>${topics.map(t => opt(t.id, t[`name_${lang()}`] || t.name_en, e.topicId)).join('')}</select></div></div>
      <div class="ac-row"><div class="field"><label for="ed-gf">${tr('fGradeFrom')}</label><select class="select" id="ed-gf" dir="ltr">${GRADES.map(g => opt(g, g, e.gradeFrom)).join('')}</select></div>
      <div class="field"><label for="ed-gt">${tr('fGradeTo')}</label><select class="select" id="ed-gt" dir="ltr">${GRADES.map(g => opt(g, g, e.gradeTo)).join('')}</select></div>
      <div class="field"><label for="ed-diff">${tr('fDifficulty')}</label><select class="select" id="ed-diff">${['easy', 'medium', 'hard'].map(d => opt(d, tr(d), e.difficulty)).join('')}</select></div>
      <div class="field"><label for="ed-lang">${tr('fLanguage')}</label><select class="select" id="ed-lang">${[['en', 'langEn'], ['he', 'langHe'], ['ar', 'langAr']].map(([v, k]) => opt(v, tr(k), e.language)).join('')}</select></div></div>
      <fieldset class="ac-vis"><legend>${tr('fVisibility')}</legend>${[['private', 'visPrivate', 'visPrivateD'], ['unlisted', 'visUnlisted', 'visUnlistedD'], ['public', 'visPublic', 'visPublicD']].map(([v, k, d]) => `<label class="ac-radio"><input type="radio" name="ed-vis" value="${v}" ${e.visibility === v ? 'checked' : ''}> <strong>${tr(k)}</strong> <span class="muted">${tr(d)}</span></label>`).join('')}<p class="muted">${tr('visHint')}</p></fieldset>
    </div>
    <h2>${tr('questions')} <bdi dir="ltr">(${e.questions.length})</bdi></h2>${questions}<div class="actions">${btn(`＋ ${tr('addQuestion')}`, 'addQ')}</div>
    <div class="actions ac-save">${btn(tr('saveDraft'), 'save:draft', 'btn secondary')}${btn(tr('savePublish'), 'save:published', 'btn primary-action')}</div>`;
}
function sharedPage() {
  const s = A.shared; if (!s) return `<div class="card center"><p>${tr('loading')}</p></div>`;
  if (s.error) return `<div class="card center"><h1>🔎</h1><p>${esc(errText(s.error) || '')}</p>${btn(tr('community'), 'go:community', 'btn secondary')}</div>`;
  const g = s.game;
  return `<div class="section-head"><div><p class="game-subject">${tr('sharedTitle')}</p><h1 dir="auto">${esc(g.title)}</h1></div></div><div class="card"><p dir="auto">${esc(g.description)}</p><p class="muted ac-meta"><span>❓ ${tr('questionsN', { n: g.questionCount })}</span><span>${tr('gradesLabel', { from: g.gradeFrom, to: g.gradeTo })}</span>${g.creator ? `<span>${tr('owner')} ${esc(g.creator)}</span>` : ''}</p>${g.objectives ? `<p dir="auto">🎯 ${esc(g.objectives)}</p>` : ''}<div class="actions">${A.user ? `${btn(tr('hostThis'), `host:${g.id}`, 'btn primary-action')}${btn(tr('copyToMine'), `dup:${g.id}`)}<button class="btn secondary small ac-fav ${s.favorite ? 'on' : ''}" aria-label="${esc(s.favorite ? tr('favRemove') : tr('favAdd'))}" data-action="acct:fav:${esc(g.id)}">${s.favorite ? '★' : '☆'}</button>` : btn(tr('signInToHost'), `signInHost:${g.id}`, 'btn primary-action')}</div></div>`;
}
function render() {
  const pages = { gate: gatePage, games: gamesPage, community: communityPage, profile: profilePage, editor: editorPage, shared: sharedPage };
  if (A.cfg && !A.cfg.database) return `<main class="ac-page">${setupGuide()}</main>`;
  if (['games', 'profile', 'editor'].includes(A.view) && !A.user) return `<main class="ac-page">${gatePage()}</main>`;
  return `<main class="ac-page">${(pages[A.view] || gatePage)()}</main>`;
}

/* ---- actions ---- */
function collect() {
  const e = A.edit; if (!e || !document.getElementById('ed-title')) return;
  const val = id => document.getElementById(id)?.value ?? '';
  Object.assign(e, { title: val('ed-title'), description: val('ed-desc'), objectives: val('ed-obj'), subjectId: val('ed-subject'), topicId: val('ed-topic'), gradeFrom: Number(val('ed-gf')) || 1, gradeTo: Number(val('ed-gt')) || 12, difficulty: val('ed-diff'), language: val('ed-lang'), visibility: document.querySelector('input[name="ed-vis"]:checked')?.value || 'private' });
  e.questions = e.questions.map((q, i) => ({ prompt: val(`ed-q-${i}-p`), options: [0, 1, 2, 3].map(j => val(`ed-q-${i}-o${j}`)), correctIndex: Number(val(`ed-q-${i}-c`)) || 0 }));
}
function openEditor(game, questions) {
  A.edit = game
    ? { id: game.id, title: game.title, description: game.description, objectives: game.objectives, subjectId: game.subjectId || '', topicId: game.topicId || '', gradeFrom: game.gradeFrom, gradeTo: game.gradeTo, difficulty: game.difficulty, language: game.language, visibility: game.visibility, questions: questions.map(q => ({ prompt: q.prompt, options: [...q.options, '', '', '', ''].slice(0, 4), correctIndex: q.correctIndex })) }
    : { id: null, title: '', description: '', objectives: '', subjectId: '', topicId: '', gradeFrom: 1, gradeTo: 12, difficulty: 'medium', language: lang(), visibility: 'private', questions: [blankQuestion()] };
  loadTaxonomy().then(() => A.ctx.rerender());
  A.view = 'editor'; A.ctx.state.page = 'acct'; A.ctx.rerender();
}
function payload(status) {
  const e = A.edit;
  const questions = e.questions.filter(q => q.prompt.trim() || q.options.some(o => o.trim())).map(q => {
    const kept = q.options.map((o, i) => ({ o: o.trim(), i })).filter(x => x.o);
    return { prompt: q.prompt, options: kept.map(x => x.o), correctIndex: Math.max(0, kept.findIndex(x => x.i === q.correctIndex)) };
  });
  return { title: e.title, description: e.description, objectives: e.objectives, subjectId: e.subjectId || null, topicId: e.topicId || null, gradeFrom: e.gradeFrom, gradeTo: Math.max(e.gradeFrom, e.gradeTo), difficulty: e.difficulty, language: e.language, visibility: e.visibility, status, questions };
}
const gameUrl = id => `${location.origin}/?game=${encodeURIComponent(id)}`;
const findGame = id => [...A.games, ...A.favorites, ...A.community, ...(A.shared?.game ? [A.shared.game] : [])].find(g => g.id === id);

async function toggleFavorite(id) {
  const on = A.favIds.has(id);
  const r = await call(`/games/${id}/favorite`, { method: on ? 'DELETE' : 'PUT' }); if (!r.ok) return fail(r);
  const f = await call('/favorites'); if (f.ok) { A.favorites = f.data.games; A.favIds = new Set(f.data.games.map(g => g.id)); }
  if (A.shared?.game?.id === id) A.shared.favorite = !on;
  A.ctx.rerender();
}
function hostGame(id) {
  const g = findGame(id); if (!g) return;
  if (requireSignIn(() => hostGame(id))) return;
  A.ctx.state.dbGame = { id: g.id, title: g.title };
  A.ctx.state.avatar = 'space'; A.ctx.state.page = 'teacherForm'; A.ctx.rerender();
}

function handle(action) {
  if (!action.startsWith('acct:')) return false;
  const [, cmd, arg, arg2] = action.split(':');
  const id = arg;
  const run = async () => {
    switch (cmd) {
      case 'signIn': if (A.clerkState === 'ready') window.Clerk.openSignIn({}); else go('gate'); break;
      case 'signUp': if (A.clerkState === 'ready') window.Clerk.openSignUp({}); else go('gate'); break;
      case 'signInHost': A.after = () => hostGame(id); if (A.clerkState === 'ready') window.Clerk.openSignIn({}); else go('gate'); break;
      case 'signOut': await window.Clerk?.signOut(); A.ctx.state.page = 'home'; A.ctx.rerender(); break;
      case 'manage': window.Clerk?.openUserProfile(); break;
      case 'go': if (arg === 'games' || arg === 'profile') { if (requireSignIn(() => go(arg))) return; } go(arg); break;
      case 'tab': A.tab = arg; if (arg === 'favorites') { const f = await call('/favorites'); if (f.ok) A.favorites = f.data.games; } A.ctx.rerender(); break;
      case 'new': await loadTaxonomy(); openEditor(null); break;
      case 'edit': { const r = await call(`/games/${id}`); if (!r.ok) return fail(r); await loadTaxonomy(); openEditor(r.data.game, r.data.questions); break; }
      case 'addQ': collect(); if (A.edit.questions.length < 50) A.edit.questions.push(blankQuestion()); A.ctx.rerender(); break;
      case 'delQ': collect(); A.edit.questions.splice(Number(arg), 1); A.ctx.rerender(); break;
      case 'cancel': go('games'); break;
      case 'save': {
        collect(); const status = arg;
        const r = A.edit.id ? await call(`/games/${A.edit.id}`, { method: 'PUT', body: payload(status) }) : await call('/games', { method: 'POST', body: payload(status) });
        if (!r.ok) return fail(r);
        A.ctx.toast(tr('saved')); go('games'); break;
      }
      case 'publish': case 'unpublish': {
        const g = findGame(id); if (!g) return;
        const r = await call(`/games/${id}/visibility`, { method: 'PATCH', body: { visibility: g.visibility, status: cmd === 'publish' ? 'published' : 'draft' } });
        if (!r.ok) return fail(r); A.ctx.toast(tr('saved')); await loadGames(); break;
      }
      case 'del': { const g = findGame(id); if (!g || !window.confirm(tr('deleteConfirm', { title: g.title }))) return; const r = await call(`/games/${id}`, { method: 'DELETE' }); if (!r.ok) return fail(r); A.ctx.toast(tr('deleted')); await loadGames(); const f = await call('/favorites'); if (f.ok) { A.favorites = f.data.games; A.favIds = new Set(f.data.games.map(x => x.id)); } A.ctx.rerender(); break; }
      case 'dup': { const r = await call(`/games/${id}/duplicate`, { method: 'POST' }); if (!r.ok) return fail(r); A.ctx.toast(tr('duplicated')); break; }
      case 'fav': await toggleFavorite(id); break;
      case 'copy': try { await navigator.clipboard.writeText(gameUrl(id)); A.ctx.toast(tr('linkCopied')); } catch { A.ctx.toast(gameUrl(id)); } break;
      case 'host': hostGame(id); break;
      case 'search': A.search = document.getElementById('ac-q')?.value || ''; await loadCommunity(); break;
      default: return;
    }
  };
  run().catch(() => A.ctx.toast(errText('serverError')));
  return true;
}

async function openShared(id) {
  A.view = 'shared'; A.shared = null; A.ctx.state.page = 'acct'; A.ctx.rerender();
  await loadTaxonomy();
  const r = await call(`/games/${encodeURIComponent(id)}`);
  A.shared = r.ok ? { game: r.data.game, favorite: r.data.favorite } : { error: r.error };
  A.ctx.rerender();
}

async function init(ctx) {
  A.ctx = ctx;
  document.addEventListener('change', e => { if (e.target.id === 'ed-subject' && A.edit) { collect(); A.edit.topicId = ''; ctx.rerender(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ac-q') { e.preventDefault(); handle('acct:search'); } });
  try { const r = await fetch('/api/config'); A.cfg = r.ok ? await r.json() : { auth: false, database: false, anonymousTeacher: false }; } catch { A.cfg = { auth: false, database: false, anonymousTeacher: false }; }
  const shared = new URLSearchParams(location.search).get('game');
  if (shared) openShared(shared); else ctx.rerender();
  await loadClerk();
}

window.CLASSVERSE_ACCOUNT = { init, render, navHtml, handle, guard, studioOpen, token, languageChanged, collect, error: (key, l) => errText(key, l), get signedIn() { return !!A.user; } };
})();
