'use strict';
const hebrewCopy = Object.fromEntries(`
Opening Google sign-in…|פותח את הכניסה עם Google…
Supabase sign-in needs the project publishable key.|כדי להפעיל כניסה עם Google, יש להגדיר את המפתח הציבורי של פרויקט Supabase.
Google sign-in is not available yet. Please contact the workspace owner.|הכניסה עם Google עדיין אינה זמינה. יש לפנות למנהל סביבת העבודה.
The sign-in service is unavailable. Please try again later.|שירות ההתחברות אינו זמין כעת. יש לנסות שוב מאוחר יותר.
Sign in with Google to continue.|יש להיכנס עם Google כדי להמשיך.
Welcome to ADPULSE|ברוכים הבאים ל־ADPULSE
Your performance intelligence starts here.|הדרך לתובנות מדויקות מתחילה כאן.
Sign in to your workspace|כניסה לסביבת העבודה שלך
Continue with Google|המשך עם Google
Secure sign-in · No password needed|כניסה מאובטחת · ללא צורך בסיסמה
PROJECT 07 / 30 · ADPULSE|פרויקט 07 / 30 · ADPULSE
Sign out|התנתקות
Sign-out failed. Try again.|ההתנתקות נכשלה. יש לנסות שוב.
Checking sign-in…|בודק את מצב ההתחברות…
Google sign-in needs a one-time setup. Follow SIGNIN.md to enable it.|נדרשת הגדרה חד־פעמית של הכניסה עם Google. הוראות ההפעלה נמצאות בקובץ SIGNIN.md.
Google sign-in failed or was cancelled. Please try again.|הכניסה עם Google נכשלה או בוטלה. יש לנסות שוב.
Start the ADPULSE server to sign in with Google.|יש להפעיל את שרת ADPULSE כדי להיכנס עם Google.
Connections|חיבורים
Written report|דוח מילולי
PPC PERFORMANCE REPORT|דוח ביצועי PPC
Print / save as PDF|הדפסה / שמירה כ־PDF
Copy as text|העתקה כטקסט
Copied ✓|הועתק ✓
Copy failed|ההעתקה נכשלה
ADVERTISING CONNECTIONS|חיבור לפלטפורמות פרסום
Connect your|מחברים את
advertising accounts.|חשבונות הפרסום שלך.
Import campaign performance from Meta, Google or TikTok into your dashboard.|ייבוא ביצועי קמפיינים מ־Meta, מ־Google או מ־TikTok ישירות ללוח הבקרה.
One account at a time. Each successful import replaces the current dataset with the last 30 completed days.|חשבון אחד בכל פעם. כל ייבוא מוצלח מחליף את הנתונים הנוכחיים בנתוני 30 הימים המלאים האחרונים.
Check service|בדיקת זמינות השרת
Local setup instructions|הוראות הפעלה מקומית
Start the Node server, then configure API access for the platform you want to connect.|יש להפעיל את שרת Node ולהגדיר הרשאות API לפלטפורמה שברצונך לחבר.
Copy .env.example to .env and add your authorized platform credentials on the server.|יש להעתיק את ‎.env.example לקובץ ‎.env ולהוסיף בו הרשאות גישה מאושרות לפלטפורמה.
Run this command from the ADPULSE folder, then open the local address below.|יש להריץ את הפקודה מתיקיית ADPULSE ולפתוח את הכתובת המקומית המופיעה למטה.
Read-only reporting. Credentials stay on the server. Removing a dashboard connection does not revoke platform access.|החיבור משמש לקריאת דוחות בלבד. הרשאות הגישה נשארות בשרת. הסרת חיבור מלוח הבקרה אינה מבטלת את ההרשאה בפלטפורמה.
Facebook and Instagram campaigns|קמפיינים ב־Facebook וב־Instagram
Search, Display and YouTube campaigns|קמפיינים ברשת החיפוש, ברשת המדיה וב־YouTube
TikTok advertising campaigns|קמפיינים לפרסום ב־TikTok
Connected|מחובר
Ready to connect|מוכן לחיבור
Setup required|נדרשת הגדרה
Advertising account ID|מזהה חשבון הפרסום
Refresh campaign data|רענון נתוני הקמפיינים
Connect & import|חיבור וייבוא
View setup instructions|הצגת הוראות ההגדרה
Last imported|ייבוא אחרון
Remove connection from dashboard|הסרת החיבור מלוח הבקרה
Local connection service is available.|שרת החיבורים המקומי זמין.
Start the local connection service to enable imports.|יש להפעיל את שרת החיבורים המקומי כדי לייבא נתונים.
Importing campaign data…|מייבא נתוני קמפיינים…
Connection failed. Check account access and server configuration.|החיבור נכשל. יש לבדוק את הרשאות החשבון ואת הגדרות השרת.
No campaign data was returned for the last 30 days.|לא התקבלו נתוני קמפיינים עבור 30 הימים האחרונים.
Account currency could not be verified.|לא ניתן היה לאמת את מטבע החשבון.
Connection verified. Campaign data imported.|החיבור אומת. נתוני הקמפיינים יובאו בהצלחה.
Import timed out. Please try again.|תם הזמן המוקצב לייבוא. יש לנסות שוב.
LIVE ACCOUNT DATA|נתונים מחשבון פרסום
Connected account|חשבון מחובר
CSV / DEMO MODE|מצב CSV / הדגמה
Read-only platform imports|ייבוא דוחות מהפלטפורמה לקריאה בלבד
Enter a valid advertising account ID.|יש להזין מזהה חשבון פרסום תקין.
Google Ads customer IDs must contain 10 digits.|מזהה חשבון Google Ads חייב להכיל 10 ספרות.
An import is already running. Please wait.|פעולת ייבוא כבר מתבצעת. יש להמתין.
Reload the page and try again.|יש לרענן את העמוד ולנסות שוב.
Server credentials are not configured for this platform.|הרשאות הגישה לפלטפורמה זו לא הוגדרו בשרת.
Platform request failed or timed out. Please try again.|הפנייה לפלטפורמה נכשלה או ארכה זמן רב מדי. יש לנסות שוב.
The advertising platform returned an invalid response.|התקבלה תשובה לא תקינה מפלטפורמת הפרסום.
The advertising platform returned invalid metrics.|פלטפורמת הפרסום החזירה ערכי מדדים לא תקינים.
The advertising platform returned invalid pagination.|פלטפורמת הפרסום החזירה מידע לא תקין על עמודי הדוח.
Invalid API version in server configuration.|גרסת ה־API בהגדרות השרת אינה תקינה.
Invalid metric mapping in server configuration.|הגדרת מיפוי המדדים בשרת אינה תקינה.
Configured conversion or revenue metric is unavailable. Check the server mapping.|מדד ההמרות או ההכנסות שהוגדר אינו זמין. יש לבדוק את מיפוי המדדים בשרת.
Import failed. Check server configuration and try again.|הייבוא נכשל. יש לבדוק את הגדרות השרת ולנסות שוב.
Baseline comparison|השוואה לתקופת הבסיס
reporting days|ימי דיווח
INTELLIGENCE PLATFORM|פלטפורמת ניתוח ביצועים
Acme Workspace|סביבת העבודה של Acme
Demo environment|סביבת הדגמה
WORKSPACE|סביבת העבודה
Workspace|סביבת העבודה
Overview|סקירה כללית
Intelligence alerts|התראות ותובנות
Campaign explorer|ניתוח קמפיינים
Data studio|מרכז הנתונים
✦ INSIGHT ENGINE|✦ מנוע התובנות
Clarity over complexity.|תמונה ברורה. החלטות מדויקות.
Every alert includes evidence and a suggested next step.|כל התראה כוללת נתונים תומכים והמלצה להמשך הבדיקה.
ADPULSE / BUILD 01 · DEMO|ADPULSE / גרסה 01 · הדגמה
Toggle menu|פתיחה וסגירה של התפריט
DEMO DATA|נתוני הדגמה
IMPORTED DATA|נתונים מיובאים
Export filtered campaigns as CSV|ייצוא הקמפיינים המסוננים לקובץ CSV
Export CSV|ייצוא CSV
PERFORMANCE COMMAND CENTER|מרכז הבקרה לביצועי הקמפיינים
Good morning,|בוקר טוב,
strategist.|הגיע הזמן לתובנות.
Here's what your campaign data is telling you today.|אלה התובנות שעולות היום מנתוני הקמפיינים שלך.
Last 7 days|7 הימים האחרונים
Last 14 days|14 הימים האחרונים
Last 30 days|30 הימים האחרונים
+ Import data|+ ייבוא נתונים
You're exploring ADPULSE with illustrative demo data. Upload a CSV to analyze your own campaign metrics.|התצוגה מבוססת על נתוני הדגמה להמחשה. ניתן להעלות קובץ CSV כדי לנתח את ביצועי הקמפיינים שלך.
Import CSV →|ייבוא CSV ←
Performance snapshot|תמונת מצב של הביצועים
Reporting period|תקופת הדיווח
PERFORMANCE TRENDS|מגמות ביצועים
Spend & conversions|הוצאה והמרות
Daily performance|ביצועים יומיים
Daily spend and conversions chart|תרשים הוצאה והמרות לפי יום
ACCOUNT HEALTH|מצב החשבון
Pulse check|בדיקת מצב
● MONITORED|● במעקב
HEALTH SCORE|מדד מצב החשבון
Health score is an illustrative heuristic, not a platform-certified metric.|מדד מצב החשבון מבוסס על כללי הערכה להמחשה ואינו מדד רשמי של פלטפורמת הפרסום.
WHAT NEEDS YOUR ATTENTION|נושאים הדורשים תשומת לב
Priority intelligence|תובנות בעדיפות גבוהה
View all alerts ↗|לכל ההתראות ↖
Campaign performance|ביצועי קמפיינים
Explore campaigns ↗|לניתוח הקמפיינים ↖
CAMPAIGN|קמפיין
CHANNEL|ערוץ פרסום
SPEND|הוצאה
CONVERSIONS|המרות
CPA|עלות להמרה (CPA)
ROAS|החזר על הוצאות פרסום (ROAS)
STATUS|סטטוס
INTELLIGENCE ENGINE|מנוע התובנות
Signals,|מזהים חריגות,
not noise.|מתמקדים בעיקר.
Evidence-backed anomalies, prioritized by potential impact.|חריגות הנתמכות בנתונים, מדורגות לפי ההשפעה האפשרית שלהן.
All signals|כל ההתראות
Critical|קריטי
Warning|אזהרה
Info|מידע
critical|קריטי
warning|אזהרה
info|מידע
CAMPAIGN EXPLORER|ניתוח קמפיינים
Every campaign.|כל הקמפיינים.
One clear view.|תמונה אחת ברורה.
Compare performance and investigate individual campaigns.|השוואת ביצועים וניתוח מעמיק של כל קמפיין.
⇩ Export CSV|⇩ ייצוא CSV
⌕ Search campaigns...|⌕ חיפוש קמפיינים...
Search campaigns|חיפוש קמפיינים
Filter channel|סינון לפי ערוץ פרסום
All channels|כל ערוצי הפרסום
CLICKS|קליקים
CTR|שיעור הקלקה (CTR)
DETAILS|פרטים
Select a campaign to inspect its daily metrics.|יש לבחור קמפיין להצגת הביצועים היומיים שלו.
DATA STUDIO|מרכז הנתונים
Bring your|מנתחים את
own data.|הנתונים שלך.
Import campaign-level daily metrics and turn them into actionable insights.|ייבוא נתונים יומיים ברמת הקמפיין והפקת תובנות שאפשר לפעול לפיהן.
Import a campaign CSV|ייבוא נתוני קמפיינים מקובץ CSV
Drop a file here or browse your computer. Analysis happens locally in your browser.|אפשר לגרור לכאן קובץ או לבחור אותו מהמחשב. הניתוח מתבצע מקומית בדפדפן.
Choose a CSV file|בחירת קובץ CSV
or drag and drop it here · Max 5 MB|או גרירה לכאן · עד 5 MB
⇩ Download sample CSV|⇩ הורדת קובץ CSV לדוגמה
IMPORT SPECIFICATION|דרישות הייבוא
Expected columns|העמודות הנדרשות
One row per campaign per day. Column names are case-insensitive; a few common aliases are supported.|שורה אחת לכל קמפיין בכל יום. שמות העמודות אינם תלויים באותיות גדולות או קטנות; נתמכים גם כמה שמות חלופיים נפוצים.
Campaign name|שם הקמפיין
Meta / Google / TikTok / Other|Meta / Google / TikTok / אחר
Nonnegative amount|סכום שאינו שלילי
Nonnegative integer|מספר שלם שאינו שלילי
Nonnegative number|מספר שאינו שלילי
ⓘ CSV imports stay on this device and are not sent to a server. Data is kept in the current browser session.|ⓘ הנתונים המיובאים נשארים במכשיר ואינם נשלחים לשרת. הם נשמרים במשך ההפעלה הנוכחית בדפדפן.
DATA QUALITY|איכות הנתונים
Current dataset|מערך הנתונים הנוכחי
Restore demo data ↺|שחזור נתוני ההדגמה ↺
© ADPULSE. Designed for decisions, not dashboards.|© ADPULSE. מנתונים להחלטות מדויקות.
DEMO MVP · No live integrations|גרסת הדגמה ראשונית · ללא חיבורים פעילים
Total spend|סך ההוצאה
Conversions|המרות
Avg. CPA|עלות ממוצעת להמרה
Spend (₪)|הוצאה (₪)
No baseline|אין נתוני בסיס להשוואה
All clear in the current detection rules. Keep monitoring your data.|לא זוהו חריגות לפי כללי הזיהוי הנוכחיים. מומלץ להמשיך לעקוב אחר הנתונים.
● Active|● פעיל
No data available|אין נתונים זמינים
Chart unavailable offline. Other analytics still work.|התרשים אינו זמין ללא חיבור לרשת. יתר הניתוחים עדיין זמינים.
CPA spike detected|זוהתה עלייה חדה בעלות להמרה
Conversion volume dropped|ירידה בהיקף ההמרות
Spend acceleration|עלייה בקצב ההוצאה
CTR softened|ירידה בשיעור ההקלקה
Check changes in conversion rate and landing-page experience.|בדיקת שינויים בשיעור ההמרה ובחוויית השימוש בדף הנחיתה.
Review audience, placements and creative changes.|בחינת שינויים בקהלים, במיקומי הפרסום ובקריאייטיב.
Verify tracking events before changing budgets.|אימות אירועי המעקב לפני שינוי התקציבים.
Check whether clicks and conversion rate declined together.|בדיקה אם מספר הקליקים ושיעור ההמרה ירדו במקביל.
Inspect forms, checkout and analytics events.|בדיקת טפסים, תהליך התשלום ואירועי המדידה.
Compare traffic mix and recent creative changes.|השוואת תמהיל התנועה והשינויים האחרונים בקריאייטיב.
Confirm campaign budgets and delivery settings.|אימות תקציבי הקמפיינים והגדרות הצגת המודעות.
Check whether increased spend produced proportional conversions.|בדיקה אם העלייה בהוצאה הובילה לעלייה מקבילה בהמרות.
Review pacing against monthly targets.|בחינת קצב ניצול התקציב ביחס ליעדים החודשיים.
Review ad frequency and creative fatigue.|בדיקת תדירות החשיפה וסימנים לשחיקת הקריאייטיב.
Check placement and audience changes.|בדיקת שינויים במיקומי הפרסום ובקהלים.
Compare impressions, clicks and downstream conversions.|השוואת החשיפות, הקליקים וההמרות בהמשך המשפך.
View evidence & next steps ↓|נתונים תומכים והצעדים הבאים ↓
Hide details ↑|הסתרת הפרטים ↑
WHAT THE DATA SHOWS|מה עולה מהנתונים
RECOMMENDED CHECKS|בדיקות מומלצות
Possible explanations require validation; these signals do not prove causation.|יש לאמת את ההסברים האפשריים; ההתראות אינן מוכיחות קשר סיבתי.
No signals match this filter.|אין התראות התואמות לסינון שנבחר.
Inspect ↗|ניתוח מפורט ↖
No matching campaigns|לא נמצאו קמפיינים התואמים לחיפוש
Campaign not found in selected period.|הקמפיין לא נמצא בתקופה שנבחרה.
CAMPAIGN DEEP DIVE|ניתוח מעמיק של הקמפיין
DAILY PERFORMANCE · LATEST FIRST|ביצועים יומיים · מהעדכני למוקדם
DATE|תאריך
DATA ROWS|שורות נתונים
CAMPAIGNS|קמפיינים
REPORTING DAYS|ימי דיווח
DATA SOURCE|מקור הנתונים
EARLIEST DATE|התאריך המוקדם ביותר
LATEST DATE|התאריך העדכני ביותר
Demo|הדגמה
Imported|ייבוא
CSV has an unclosed quoted field.|בקובץ CSV נמצא שדה עם מירכאות שלא נסגרו.
CSV must include a header and at least one data row.|קובץ CSV חייב לכלול שורת כותרות ולפחות שורת נתונים אחת.
Limit: 50,000 rows per import.|ניתן לייבא עד 50,000 שורות בכל פעולה.
No valid data rows.|לא נמצאו שורות נתונים תקינות.
File exceeds 5 MB.|גודל הקובץ חורג מ־5 MB.
Demo dataset restored.|נתוני ההדגמה שוחזרו.
ADPULSE — Performance Intelligence|ADPULSE — ניתוח ביצועים ותובנות
Main navigation|ניווט ראשי
Language|שפת הממשק
`.trim().split('\n').map(row => row.split('|')));
let uiLanguage = 'en';
try { uiLanguage = localStorage.getItem('adpulseLanguage') === 'he' ? 'he' : 'en'; } catch {}
const normalizeCopy = text => text.trim().replace(/\s+/g, ' ');
function t(text) {
  if (uiLanguage !== 'he') return text;
  if (hebrewCopy[normalizeCopy(text)]) return hebrewCopy[normalizeCopy(text)];
  const rules = [
    [/^Last (\d+) days$/, n => `${n} הימים האחרונים`],
    [/^(.*)% vs previous$/, n => `${n}% לעומת התקופה הקודמת`],
    [/^(\d+) signals detected$/, n => `זוהו ${n} התראות`],
    [/^Cost per acquisition rose (.*)% compared with the baseline window\.$/, n => `העלות להמרה עלתה ב־${n}% ביחס לתקופת הבסיס.`],
    [/^Current CPA (.*) vs baseline (.*)\. Current spend (.*)\.$/, (a,b,c) => `עלות נוכחית להמרה: ${a}, לעומת ${b} בתקופת הבסיס. הוצאה נוכחית: ${c}.`],
    [/^Average daily conversions declined (.*)% versus the baseline\.$/, n => `ממוצע ההמרות היומי ירד ב־${n}% ביחס לתקופת הבסיס.`],
    [/^Current (.*) conversions\/day vs baseline (.*)\.$/, (a,b) => `ממוצע נוכחי: ${a} המרות ביום, לעומת ${b} בתקופת הבסיס.`],
    [/^Daily ad spend increased (.*)% compared with the baseline\.$/, n => `ההוצאה היומית על פרסום עלתה ב־${n}% ביחס לתקופת הבסיס.`],
    [/^Current (.*)\/day vs baseline (.*)\/day\.$/, (a,b) => `הוצאה נוכחית: ${a} ביום, לעומת ${b} ביום בתקופת הבסיס.`],
    [/^Click-through rate declined (.*)% versus the baseline\.$/, n => `שיעור ההקלקה ירד ב־${n}% ביחס לתקופת הבסיס.`],
    [/^Current CTR (.*) vs baseline (.*)\.$/, (a,b) => `שיעור הקלקה נוכחי: ${a}, לעומת ${b} בתקופת הבסיס.`],
    [/^Missing required column: (.*)$/, n => `חסרה עמודה נדרשת: ${n}`],
    [/^Row (\d+): invalid date$/, n => `שורה ${n}: תאריך לא תקין`],
    [/^Row (\d+): missing campaign or channel$/, n => `שורה ${n}: חסר שם קמפיין או ערוץ פרסום`],
    [/^Row (\d+): invalid metric$/, n => `שורה ${n}: ערך מדד לא תקין`],
    [/^(\d+) invalid row\(s\)\. (.*)\. Fix and retry\.$/, (n, details) => `${n} שורות לא תקינות. ${details}. יש לתקן ולנסות שוב.`],
    [/^✓ Imported (\d+) rows across (\d+) reporting days\. Analysis updated\.$/, (n,d) => `✓ יובאו ${n} שורות עבור ${d} ימי דיווח. הניתוח עודכן.`],
    [/^Import failed: (.*)$/, message => `הייבוא נכשל: ${message}`]
  ];
  for (const [pattern, translate] of rules) { const match = text.match(pattern); if (match) return translate(...match.slice(1)); }
  return text;
}
const staticCopy = [];
function initLanguage() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, original = normalizeCopy(node.textContent);
    if (hebrewCopy[original] || /^\d+ signals detected$/.test(original)) staticCopy.push({node, original, prefix:node.textContent.match(/^\s*/)[0], suffix:node.textContent.match(/\s*$/)[0]});
  }
  document.querySelectorAll('[placeholder], [aria-label], [title]').forEach(node => {
    for (const attribute of ['placeholder','aria-label','title']) {
      const original = node.getAttribute(attribute);
      if (original && hebrewCopy[normalizeCopy(original)]) staticCopy.push({node, original, attribute});
    }
  });
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  applyLanguage();
}
function applyLanguage() {
  document.documentElement.lang = uiLanguage;
  document.documentElement.dir = 'ltr';
  document.title = t('ADPULSE — Performance Intelligence');
  staticCopy.forEach(({node,original,attribute,prefix,suffix}) => {
    if (attribute) node.setAttribute(attribute,t(original));
    else node.textContent = prefix + t(original) + suffix;
  });
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === uiLanguage)));
}
function setLanguage(next) {
  uiLanguage = next;
  try { localStorage.setItem('adpulseLanguage', next); } catch {}
  applyLanguage();
  renderAll();
  if (typeof renderConnections === 'function') renderConnections();
  const view = document.querySelector('.view.active').id.replace('view-', '');
  document.querySelector('#breadcrumb').textContent = t({overview:'Overview',alerts:'Intelligence alerts',campaigns:'Campaign explorer',data:'Data studio',connections:'Connections',report:'Written report'}[view]);
  document.querySelector('#importStatus').textContent = '';
}
