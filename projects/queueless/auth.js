// Supabase email/password authentication; leaves the original queue UI intact.
const $ = (id) => document.getElementById(id);
const copy = {
 en:{google:'Continue with Google',orGoogle:'OR CONTINUE WITH',kicker:'BUSINESS PORTAL',login:'Welcome back.',signup:'Your next chapter.',reset:'Reset your password.',loginSub:'Sign in to keep your queue moving.',signupSub:'Create your business account and verify your email.',resetSub:'Enter your email to receive a reset link.',email:'Email address',pass:'Password',signin:'Sign in',register:'Create account',send:'Send reset link',switchSignup:'New here? Create an account',switchLogin:'Already have an account? Sign in',forgot:'Forgot password?',guest:'Continue without email ↗',guestAccount:'Using QUEUELESS without email. Queue data is saved on this device only.',missing:'Set your Supabase URL and publishable key in supabase-config.js to activate business login.',verify:'Check your inbox and confirm your email before signing in.',resetSent:'If this email is registered, a recovery message will arrive shortly.',signed:'Signed in successfully.',signout:'Sign out',account:'Your account',loading:'Connecting securely…',notReady:'Business sign-in has not been configured yet.',error:'Please try again.',recovery:'Choose a new password',recoverySub:'Enter a new password for your account.',savePassword:'Save new password',passwordSaved:'Password updated. You can now use your account.'},
 he:{google:'המשך עם Google',orGoogle:'או המשך באמצעות',kicker:'כניסה לעסקים',login:'טוב שחזרת.',signup:'מתחילים משהו חדש.',reset:'איפוס סיסמה',loginSub:'מתחברים וממשיכים לנהל את התור.',signupSub:'יוצרים חשבון עסקי ומאמתים את כתובת המייל.',resetSub:'נשלח קישור לאיפוס הסיסמה למייל.',email:'כתובת מייל',pass:'סיסמה',signin:'כניסה',register:'יצירת חשבון',send:'שליחת קישור',switchSignup:'אין לך חשבון? להרשמה',switchLogin:'כבר יש חשבון? להתחברות',forgot:'שכחת סיסמה?',guest:'כניסה ללא אימייל ↗',guestAccount:'נכנסת ללא אימייל. נתוני התור נשמרים במכשיר הזה בלבד.',missing:'כדי להפעיל כניסה לעסקים, יש להגדיר את כתובת Supabase והמפתח הציבורי בקובץ supabase-config.js.',verify:'יש לבדוק את המייל ולאשר את החשבון לפני התחברות.',resetSent:'אם הכתובת רשומה, יישלח אליה מייל לאיפוס סיסמה.',signed:'התחברת בהצלחה.',signout:'התנתקות',account:'החשבון שלך',loading:'מתחברים באופן מאובטח…',notReady:'הכניסה לעסקים טרם הוגדרה.',error:'יש לנסות שוב.',recovery:'סיסמה חדשה',recoverySub:'יש להזין סיסמה חדשה לחשבון.',savePassword:'שמירת סיסמה',passwordSaved:'הסיסמה עודכנה.'},
 ar:{google:'المتابعة باستخدام Google',orGoogle:'أو المتابعة باستخدام',kicker:'بوابة أصحاب الأعمال',login:'مرحبًا بعودتك',signup:'لنبدأ معًا',reset:'إعادة تعيين كلمة المرور',loginSub:'سجّل الدخول لمتابعة إدارة قائمة الانتظار.',signupSub:'أنشئ حسابًا لنشاطك التجاري وأكّد بريدك الإلكتروني.',resetSub:'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور.',email:'البريد الإلكتروني',pass:'كلمة المرور',signin:'تسجيل الدخول',register:'إنشاء حساب',send:'إرسال رابط إعادة التعيين',switchSignup:'ليس لديك حساب؟ أنشئ حسابًا',switchLogin:'لديك حساب بالفعل؟ سجّل الدخول',forgot:'هل نسيت كلمة المرور؟',guest:'الدخول دون بريد إلكتروني ↗',guestAccount:'أنت تستخدم QUEUELESS دون بريد إلكتروني. تُحفظ بيانات قائمة الانتظار على هذا الجهاز فقط.',missing:'لتفعيل دخول أصحاب الأعمال، أضف عنوان مشروع Supabase ومفتاح النشر إلى الملف supabase-config.js.',verify:'تحقّق من بريدك الإلكتروني وأكّد حسابك قبل تسجيل الدخول.',resetSent:'إذا كان هذا البريد مسجّلًا، فستصلك رسالة لاستعادة كلمة المرور.',signed:'تم تسجيل الدخول بنجاح.',signout:'تسجيل الخروج',account:'حسابك',loading:'جارٍ الاتصال بأمان…',notReady:'لم يتم إعداد تسجيل دخول أصحاب الأعمال بعد.',error:'يرجى المحاولة مرة أخرى.',recovery:'اختيار كلمة مرور جديدة',recoverySub:'أدخل كلمة مرور جديدة لحسابك.',savePassword:'حفظ كلمة المرور الجديدة',passwordSaved:'تم تحديث كلمة المرور. يمكنك الآن استخدام حسابك.'}
};
let lang=['en','he','ar'].includes(localStorage.getItem('queueless-language'))?localStorage.getItem('queueless-language'):'en',mode='login',client=null,session=null,ready=false;
const tx=(k)=>copy[lang]?.[k]||copy.en[k];
const GUEST_KEY='queueless-no-email-access';const noEmail=()=>localStorage.getItem(GUEST_KEY)==='1';
const visitor=()=>new URLSearchParams(location.search).get('view')==='guest';
const showVisitor=()=>{document.querySelector('[data-view="guest"]').click();$('authLayer').classList.add('hidden');};
const setStatus=(message,bad=false)=>{const el=$('authStatus');el.textContent=message;el.classList.toggle('error',bad);};
function setMode(next){mode=next;$('authTitle').textContent=tx(next==='signup'?'signup':next==='reset'?'reset':next==='recovery'?'recovery':'login');$('authSubtitle').textContent=tx(next==='signup'?'signupSub':next==='reset'?'resetSub':next==='recovery'?'recoverySub':'loginSub');$('authKicker').textContent=tx('kicker');$('authEmailLabel').textContent=tx('email');$('authPasswordLabel').textContent=tx('pass');$('authSubmit').innerHTML=(tx(next==='signup'?'register':next==='reset'?'send':next==='recovery'?'savePassword':'signin'))+' <span>↗</span>';$('authToggle').textContent=tx(next==='login'?'switchSignup':'switchLogin');$('authReset').textContent=tx('forgot');$('authReset').hidden=next==='reset'||next==='recovery';$('authToggle').hidden=next==='recovery';$('authGuest').textContent=tx('guest');$('authGoogleLabel').textContent=tx('google');$('authDividerLabel').textContent=tx('orGoogle');$('authSocial').hidden=next==='reset'||next==='recovery';$('authPassword').parentElement.querySelector('#authPassword').required=next!=='reset';$('authPassword').style.display=next==='reset'?'none':'';$('authPasswordLabel').style.display=next==='reset'?'none':'';$('authEmail').required=next!=='recovery';$('authEmail').style.display=next==='recovery'?'none':'';$('authEmailLabel').style.display=next==='recovery'?'none':'';$('authPassword').autocomplete=next==='signup'?'new-password':next==='recovery'?'new-password':'current-password';$('authSetupNote').textContent=ready?'':tx('missing');$('accountHeading').textContent=tx('account');$('authSignOut').textContent=tx('signout');setStatus('');}
function access(){const isGuest=visitor();const allow=!!session||noEmail();
 $('authLayer').classList.toggle('hidden',isGuest||allow);
 document.body.classList.toggle('guest-only',!allow);
 document.querySelectorAll('[data-view], [data-jump]').forEach(el=>{const destination=el.dataset.view||el.dataset.jump;el.hidden=!allow&&destination!=='guest';});
 $('accountButton').hidden=!allow;
 if(!allow&&isGuest){showVisitor();}
 else if(!allow){$('authLayer').classList.remove('hidden');}
 else {$('authLayer').classList.add('hidden');$('accountEmail').textContent=session?.user?.email||tx('guestAccount');}
}
// No secret is required: Supabase publishable keys are designed for browsers.
async function boot(){const cfg=window.QUEUELESS_SUPABASE||{};const u=(cfg.url||'').trim(),k=(cfg.publishableKey||'').trim();ready=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(u)&&k.length>15;
 setMode(mode);access();if(!ready)return;
 try{const sdk=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');client=sdk.createClient(u,k,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((event,s)=>{session=s;if(event==='PASSWORD_RECOVERY'){session=null;setMode('recovery');$('authLayer').classList.remove('hidden');}else access();});
 const {data,error}=await client.auth.getSession();if(error)throw error;session=data.session;access();}catch(e){ready=false;setMode(mode);setStatus(e.message||tx('error'),true);access();}}
$('authToggle').addEventListener('click',()=>setMode(mode==='login'?'signup':'login'));
$('authReset').addEventListener('click',()=>setMode('reset'));
$('authGuest').addEventListener('click',()=>{localStorage.setItem(GUEST_KEY,'1');history.replaceState(null,'',location.pathname);access();document.querySelector('[data-view="overview"]').click();});
$('authGoogle').addEventListener('click',async()=>{
 if(!client){setStatus(tx('notReady'),true);return;}
 const button=$('authGoogle');button.disabled=true;setStatus(tx('loading'));
 try{
  const {error}=await client.auth.signInWithOAuth({
   provider:'google',
   options:{redirectTo:location.origin+location.pathname}
  });
  if(error)throw error;
 }catch(err){setStatus(err.message||tx('error'),true);button.disabled=false;}
});
$('authForm').addEventListener('submit',async(e)=>{e.preventDefault();if(!client){setStatus(tx('notReady'),true);return;}const email=$('authEmail').value.trim(),password=$('authPassword').value,submit=$('authSubmit');submit.disabled=true;setStatus(tx('loading'));
 try{let res;if(mode==='signup')res=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname}});
 else if(mode==='login')res=await client.auth.signInWithPassword({email,password});
 else if(mode==='reset')res=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
 else res=await client.auth.updateUser({password});
 if(res.error)throw res.error;
 if(mode==='signup'){if(res.data?.session){await client.auth.signOut();session=null;}setStatus(tx('verify'));}
 else if(mode==='reset')setStatus(tx('resetSent'));
 else if(mode==='recovery'){setStatus(tx('passwordSaved'));setMode('login');}
 else {session=res.data.session;access();setStatus(tx('signed'));}
 }catch(err){setStatus(err.message||tx('error'),true)}finally{submit.disabled=false;}}
);
$('accountButton').addEventListener('click',()=>{if(session||noEmail())$('accountModal').classList.remove('hidden')});
$('accountClose').addEventListener('click',()=>$('accountModal').classList.add('hidden'));
$('authSignOut').addEventListener('click',async()=>{localStorage.removeItem(GUEST_KEY);if(client&&session)await client.auth.signOut();session=null;$('accountModal').classList.add('hidden');history.replaceState(null,'',location.pathname);document.querySelector('[data-view="overview"]').click();access();});
document.querySelectorAll('[data-auth-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.authLang;localStorage.setItem('queueless-language',lang);document.querySelector(`[data-lang="${lang}"]`).click();setMode(mode);}));
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;setMode(mode)}));
// Require a verified Supabase session before navigating to business screens.
document.addEventListener('click',e=>{const b=e.target.closest('[data-view],[data-jump]');if(b&&!session&&!noEmail()&&(b.dataset.view||b.dataset.jump)!=='guest'){e.preventDefault();e.stopImmediatePropagation();access();}},true);
boot();
