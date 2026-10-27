// Supabase email/password authentication; leaves the original queue UI intact.
const $ = (id) => document.getElementById(id);
const copy = {
 en:{google:'Continue with Google',orGoogle:'OR CONTINUE WITH',kicker:'BUSINESS PORTAL',login:'We’re happy to see you!',signup:'Your next chapter.',reset:'Reset your password.',loginSub:'Book an appointment with ease.',signupSub:'Create your business account and verify your email.',resetSub:'Enter your email to receive a reset link.',email:'Email address',pass:'Password',signin:'Sign in',register:'Create account',send:'Send reset link',switchSignup:'New here? Create an account',switchLogin:'Already have an account? Sign in',forgot:'Forgot password?',guest:'Continue without email ↗',guestAccount:'Using QUEUELESS without email. Queue data is saved on this device only.',missing:'Set your Supabase URL and publishable key in supabase-config.js to activate business login.',verify:'Check your inbox and confirm your email before signing in.',resetSent:'If this email is registered, a recovery message will arrive shortly.',signed:'Signed in successfully.',signout:'Sign out',account:'Your account',loading:'Connecting securely…',notReady:'Business sign-in has not been configured yet.',error:'Please try again.',recovery:'Choose a new password',recoverySub:'Enter a new password for your account.',savePassword:'Save new password',passwordSaved:'Password updated. You can now use your account.',rolesKicker:'WELCOME',rolesTitle:'Who is joining us?',rolesSub:'Choose how you would like to use QUEUELESS.',customerTitle:"I'm a customer",customerDesc:'Book an appointment at a business',ownerTitle:"I'm the business owner",ownerDesc:'Dashboard, queue, hours and bookings',back:'Back',phoneKicker:'NO EMAIL NEEDED',phoneTitle:'Sign in with your phone',phoneSub:'First time? We’ll open your business. Next time, use the same phone number and PIN.',bizName:'Business name',phoneL:'Phone number',pinL:'PIN (4–8 digits)',phoneHint:'The business name is only needed the first time. Keep your PIN private — it protects your customers’ details.',enter:'Enter',phoneAccount:'Signed in with phone',errPhone:'Please enter a valid phone number.',errPin:'The PIN must be 4–8 digits.',errName:'Please enter your business name (needed the first time only).',wrongPin:'Wrong PIN for this phone number.',locked:'Too many wrong attempts. Please try again in 15 minutes.',needSql:'Phone sign-in is not set up yet. Run supabase-setup.sql in Supabase first.'},
 he:{google:'המשך עם Google',orGoogle:'או המשך באמצעות',kicker:'כניסה לעסקים',login:'שמחים לראות אותך!',signup:'מתחילים משהו חדש.',reset:'איפוס סיסמה',loginSub:'מזמינים תור בקלות.',signupSub:'יוצרים חשבון עסקי ומאמתים את כתובת המייל.',resetSub:'נשלח קישור לאיפוס הסיסמה למייל.',email:'כתובת מייל',pass:'סיסמה',signin:'כניסה',register:'יצירת חשבון',send:'שליחת קישור',switchSignup:'אין לך חשבון? להרשמה',switchLogin:'כבר יש חשבון? להתחברות',forgot:'שכחת סיסמה?',guest:'כניסה ללא אימייל ↗',guestAccount:'נכנסת ללא אימייל. נתוני התור נשמרים במכשיר הזה בלבד.',missing:'כדי להפעיל כניסה לעסקים, יש להגדיר את כתובת Supabase והמפתח הציבורי בקובץ supabase-config.js.',verify:'יש לבדוק את המייל ולאשר את החשבון לפני התחברות.',resetSent:'אם הכתובת רשומה, יישלח אליה מייל לאיפוס סיסמה.',signed:'התחברת בהצלחה.',signout:'התנתקות',account:'החשבון שלך',loading:'מתחברים באופן מאובטח…',notReady:'הכניסה לעסקים טרם הוגדרה.',error:'יש לנסות שוב.',recovery:'סיסמה חדשה',recoverySub:'יש להזין סיסמה חדשה לחשבון.',savePassword:'שמירת סיסמה',passwordSaved:'הסיסמה עודכנה.',rolesKicker:'ברוכים הבאים',rolesTitle:'איך נכנסים היום?',rolesSub:'בחרו איך תרצו להשתמש ב-QUEUELESS.',customerTitle:'אני לקוח/ה',customerDesc:'קביעת תור בעסק',ownerTitle:'אני בעל/ת העסק',ownerDesc:'לוח בקרה, תורים, שעות פעילות והזמנות',back:'חזרה',phoneKicker:'בלי מייל',phoneTitle:'כניסה עם מספר טלפון',phoneSub:'בפעם הראשונה נפתח לך עסק חדש. בפעמים הבאות נכנסים עם אותו מספר טלפון ואותו קוד.',bizName:'שם העסק',phoneL:'מספר טלפון',pinL:'קוד סודי (4–8 ספרות)',phoneHint:'שם העסק נדרש רק בפעם הראשונה. שמרו את הקוד בסוד — הוא מגן על פרטי הלקוחות שלכם.',enter:'כניסה',phoneAccount:'מחובר/ת עם מספר טלפון',errPhone:'נא להזין מספר טלפון תקין.',errPin:'הקוד חייב להכיל 4–8 ספרות.',errName:'נא להזין את שם העסק (נדרש רק בפעם הראשונה).',wrongPin:'הקוד שגוי עבור מספר הטלפון הזה.',locked:'יותר מדי ניסיונות שגויים. נסו שוב בעוד 15 דקות.',needSql:'הכניסה עם טלפון עדיין לא הוגדרה. יש להריץ קודם את supabase-setup.sql ב-Supabase.'},
 ar:{google:'المتابعة باستخدام Google',orGoogle:'أو المتابعة باستخدام',kicker:'بوابة أصحاب الأعمال',login:'يسعدنا أن نراك!',signup:'لنبدأ معًا',reset:'إعادة تعيين كلمة المرور',loginSub:'احجز موعدك بكل سهولة.',signupSub:'أنشئ حسابًا لنشاطك التجاري وأكّد بريدك الإلكتروني.',resetSub:'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور.',email:'البريد الإلكتروني',pass:'كلمة المرور',signin:'تسجيل الدخول',register:'إنشاء حساب',send:'إرسال رابط إعادة التعيين',switchSignup:'ليس لديك حساب؟ أنشئ حسابًا',switchLogin:'لديك حساب بالفعل؟ سجّل الدخول',forgot:'هل نسيت كلمة المرور؟',guest:'الدخول دون بريد إلكتروني ↗',guestAccount:'أنت تستخدم QUEUELESS دون بريد إلكتروني. تُحفظ بيانات قائمة الانتظار على هذا الجهاز فقط.',missing:'لتفعيل دخول أصحاب الأعمال، أضف عنوان مشروع Supabase ومفتاح النشر إلى الملف supabase-config.js.',verify:'تحقّق من بريدك الإلكتروني وأكّد حسابك قبل تسجيل الدخول.',resetSent:'إذا كان هذا البريد مسجّلًا، فستصلك رسالة لاستعادة كلمة المرور.',signed:'تم تسجيل الدخول بنجاح.',signout:'تسجيل الخروج',account:'حسابك',loading:'جارٍ الاتصال بأمان…',notReady:'لم يتم إعداد تسجيل دخول أصحاب الأعمال بعد.',error:'يرجى المحاولة مرة أخرى.',recovery:'اختيار كلمة مرور جديدة',recoverySub:'أدخل كلمة مرور جديدة لحسابك.',savePassword:'حفظ كلمة المرور الجديدة',passwordSaved:'تم تحديث كلمة المرور. يمكنك الآن استخدام حسابك.',rolesKicker:'أهلًا بك',rolesTitle:'كيف تريد الدخول اليوم؟',rolesSub:'اختر طريقة استخدامك لـ QUEUELESS.',customerTitle:'أنا زبون',customerDesc:'احجز موعدًا لدى نشاط تجاري',ownerTitle:'أنا صاحب النشاط التجاري',ownerDesc:'لوحة التحكم، والدور، وساعات العمل، والحجوزات',back:'رجوع',phoneKicker:'دون بريد إلكتروني',phoneTitle:'الدخول برقم الهاتف',phoneSub:'في المرة الأولى سننشئ نشاطك التجاري، وفي المرات التالية ادخل بنفس رقم الهاتف والرمز السري.',bizName:'اسم النشاط التجاري',phoneL:'رقم الهاتف',pinL:'الرمز السري (4–8 أرقام)',phoneHint:'اسم النشاط التجاري مطلوب في المرة الأولى فقط. احتفظ بالرمز السري لنفسك، فهو يحمي بيانات زبائنك.',enter:'دخول',phoneAccount:'تم تسجيل الدخول برقم الهاتف',errPhone:'يرجى إدخال رقم هاتف صحيح.',errPin:'يجب أن يتكوّن الرمز السري من 4 إلى 8 أرقام.',errName:'يرجى إدخال اسم النشاط التجاري (مطلوب في المرة الأولى فقط).',wrongPin:'الرمز السري غير صحيح لرقم الهاتف هذا.',locked:'محاولات خاطئة كثيرة. يرجى المحاولة مرة أخرى بعد 15 دقيقة.',needSql:'لم يتم إعداد الدخول برقم الهاتف بعد. شغّل الملف supabase-setup.sql في Supabase أولًا.'}
};
let lang=['en','he','ar'].includes(localStorage.getItem('queueless-language'))?localStorage.getItem('queueless-language'):'en',mode='login',stage='roles',client=null,session=null,ready=false;
const tx=(k)=>copy[lang]?.[k]||copy.en[k];
const GUEST_KEY='queueless-no-email-access';const noEmail=()=>localStorage.getItem(GUEST_KEY)==='1';
// Phone + PIN owners keep a server-issued session token (see phone_owner_enter in supabase-setup.sql).
const OWNER_KEY='queueless-owner';const phoneOwner=()=>{try{const o=JSON.parse(localStorage.getItem(OWNER_KEY)||'null');return o&&typeof o.token==='string'?o:null;}catch{return null;}};let openedInside=false;
const visitor=()=>new URLSearchParams(location.search).get('view')==='guest';
const showVisitor=()=>{document.querySelector('[data-view="guest"]').click();$('authLayer').classList.add('hidden');};
const setStatus=(message,bad=false)=>{const el=$('authStatus');el.textContent=message;el.classList.toggle('error',bad);};
function setMode(next){mode=next;$('authTitle').textContent=tx(next==='signup'?'signup':next==='reset'?'reset':next==='recovery'?'recovery':'login');$('authSubtitle').textContent=tx(next==='signup'?'signupSub':next==='reset'?'resetSub':next==='recovery'?'recoverySub':'loginSub');$('authKicker').textContent=tx('kicker');$('authEmailLabel').textContent=tx('email');$('authPasswordLabel').textContent=tx('pass');$('authSubmit').innerHTML=(tx(next==='signup'?'register':next==='reset'?'send':next==='recovery'?'savePassword':'signin'))+' <span>↗</span>';$('authToggle').textContent=tx(next==='login'?'switchSignup':'switchLogin');$('authReset').textContent=tx('forgot');$('authReset').hidden=next==='reset'||next==='recovery';$('authToggle').hidden=next==='recovery';$('authGuest').textContent=tx('guest');$('authGoogleLabel').textContent=tx('google');$('authDividerLabel').textContent=tx('orGoogle');$('authSocial').hidden=next==='reset'||next==='recovery';$('authPassword').parentElement.querySelector('#authPassword').required=next!=='reset';$('authPassword').style.display=next==='reset'?'none':'';$('authPasswordLabel').style.display=next==='reset'?'none':'';$('authEmail').required=next!=='recovery';$('authEmail').style.display=next==='recovery'?'none':'';$('authEmailLabel').style.display=next==='recovery'?'none':'';$('authPassword').autocomplete=next==='signup'?'new-password':next==='recovery'?'new-password':'current-password';$('authSetupNote').textContent=ready?'':tx('missing');$('accountHeading').textContent=tx('account');$('authSignOut').textContent=tx('signout');setStatus('');applyStage();}
function applyStage(){const roles=stage==='roles',phone=stage==='phone';$('authRoles').hidden=!roles;$('authOwner').hidden=roles;$('authForm').hidden=phone;$('authGuest').hidden=phone;$('authPhoneForm').hidden=!phone;if(phone)$('authSocial').hidden=true;document.querySelectorAll('.auth-links,.auth-links+.auth-divider').forEach(el=>{el.hidden=phone;});if(roles){$('authKicker').textContent=tx('rolesKicker');$('authTitle').textContent=tx('rolesTitle');$('authSubtitle').textContent=tx('rolesSub');}if(phone){$('authKicker').textContent=tx('phoneKicker');$('authTitle').textContent=tx('phoneTitle');$('authSubtitle').textContent=tx('phoneSub');}$('authBizNameLabel').textContent=tx('bizName');$('authPhoneLabel').textContent=tx('phoneL');$('authPinLabel').textContent=tx('pinL');$('authPhoneHint').textContent=tx('phoneHint');$('authPhoneSubmit').innerHTML=tx('enter')+' <span>↗</span>';$('roleCustomerTitle').textContent=tx('customerTitle');$('roleCustomerDesc').textContent=tx('customerDesc');$('roleOwnerTitle').textContent=tx('ownerTitle');$('roleOwnerDesc').textContent=tx('ownerDesc');$('authBack').textContent=(lang==='en'?'← ':'→ ')+tx('back');}
// Shares the Supabase client and session with booking.js.
function publish(){window.QL_SUPABASE=client;window.QL_SESSION=session;window.QL_OWNER_TOKEN=session?null:(phoneOwner()?.token||null);document.dispatchEvent(new CustomEvent('ql-auth'));}
function markReady(){if(window.QL_READY)return;window.QL_READY=true;document.dispatchEvent(new CustomEvent('ql-ready'));}
function access(){publish();const isGuest=visitor();const owner=phoneOwner();const allow=!!session||noEmail()||!!owner;
 $('authLayer').classList.toggle('hidden',isGuest||allow);
 document.body.classList.toggle('guest-only',!allow);
 document.querySelectorAll('[data-view], [data-jump]').forEach(el=>{const destination=el.dataset.view||el.dataset.jump;el.hidden=!allow&&destination!=='guest';});
 $('accountButton').hidden=!allow;
 if(!allow&&isGuest){showVisitor();}
 else if(!allow){$('authLayer').classList.remove('hidden');}
 else {$('authLayer').classList.add('hidden');$('accountEmail').textContent=session?.user?.email||(owner?`${tx('phoneAccount')}: ${owner.name||''} · ${owner.phone||''}`:tx('guestAccount'));}
}
// No secret is required: Supabase publishable keys are designed for browsers.
async function boot(){const cfg=window.QUEUELESS_SUPABASE||{};const u=(cfg.url||'').trim(),k=(cfg.publishableKey||'').trim();ready=/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(u)&&k.length>15;
 setMode(mode);access();if(!ready){markReady();return;}
 try{const sdk=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');client=sdk.createClient(u,k,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 client.auth.onAuthStateChange((event,s)=>{session=s;if(event==='PASSWORD_RECOVERY'){session=null;stage='owner';setMode('recovery');$('authLayer').classList.remove('hidden');}else access();});
 const {data,error}=await client.auth.getSession();if(error)throw error;session=data.session;access();}catch(e){ready=false;setMode(mode);setStatus(e.message||tx('error'),true);access();}finally{markReady();}}
function navigateAuth(nextStage, nextMode='login'){
 stage=nextStage;setMode(nextMode);
 window.QL_NAV.go(stage==='roles'?'':`?auth=${stage}&mode=${mode}`);
}
function restoreAuth(){
 const params=new URLSearchParams(location.search);
 stage=['owner','phone'].includes(params.get('auth'))?params.get('auth'):'roles';
 const requested=params.get('mode');
 setMode(['login','signup','reset'].includes(requested)?requested:'login');
 access();
 if(params.has('auth'))$('authLayer').classList.remove('hidden');
}
document.addEventListener('ql-navigate',restoreAuth);
$('authToggle').addEventListener('click',()=>navigateAuth('owner',mode==='login'?'signup':'login'));
$('authReset').addEventListener('click',()=>navigateAuth('owner','reset'));
$('roleOwner').addEventListener('click',()=>navigateAuth('owner'));
$('authBack').addEventListener('click',()=>{if(stage==='phone'&&openedInside){openedInside=false;navigateAuth('roles');access();return;}navigateAuth(stage==='phone'?'owner':'roles');});
function openPhone(){navigateAuth('phone');$('authLayer').classList.remove('hidden');setTimeout(()=>$('authPhone').focus(),0);}
document.addEventListener('ql-owner-phone',()=>{openedInside=true;openPhone();});
document.addEventListener('ql-owner-expired',()=>{localStorage.removeItem(OWNER_KEY);access();});
$('roleCustomer').addEventListener('click',()=>document.dispatchEvent(new CustomEvent('ql-open-booking')));
// Owners without email sign in with phone + PIN; without Supabase the app falls back to this device only.
$('authGuest').addEventListener('click',()=>{if(client){openedInside=false;openPhone();return;}
 localStorage.setItem(GUEST_KEY,'1');history.replaceState(null,'',location.pathname);access();document.querySelector('[data-view="overview"]').click();});
function phoneError(err){const m=`${err?.message||''} ${err?.details||''}`;
 const codes=[['INVALID_PHONE','errPhone'],['INVALID_PIN','errPin'],['INVALID_NAME','errName'],['WRONG_PIN','wrongPin'],['LOCKED','locked'],['TRY_AGAIN','error']];
 for(const [code,key] of codes)if(m.includes(code))return tx(key);
 if(/does not exist|schema cache|Could not find/i.test(m))return tx('needSql');
 return err?.message||tx('error');}
$('authPhoneForm').addEventListener('submit',async(e)=>{e.preventDefault();if(!client){setStatus(tx('notReady'),true);return;}
 const name=$('authBizName').value.trim(),phone=$('authPhone').value.trim(),pin=$('authPin').value.trim(),btn=$('authPhoneSubmit');
 if(!/^[0-9+() .-]{5,30}$/.test(phone)||phone.replace(/\D/g,'').length<7){setStatus(tx('errPhone'),true);return;}
 if(!/^[0-9]{4,8}$/.test(pin)){setStatus(tx('errPin'),true);return;}
 btn.disabled=true;setStatus(tx('loading'));
 try{const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Jerusalem';
  const {data,error}=await client.rpc('phone_owner_enter',{p_name:name,p_phone:phone,p_pin:pin,p_timezone:tz});
  if(error)throw error;if(!data?.token)throw new Error(data?.error||'TRY_AGAIN');
  localStorage.setItem(OWNER_KEY,JSON.stringify({token:data.token,name:data.name,phone:data.phone}));localStorage.removeItem(GUEST_KEY);
  $('authPin').value='';setStatus('');stage='roles';openedInside=false;setMode('login');history.replaceState(null,'',location.pathname);access();document.querySelector('[data-view="appointments"]').click();
 }catch(err){setStatus(phoneError(err),true);}finally{btn.disabled=false;}});
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
 else {session=res.data.session;window.QL_NAV.go('?view=overview',true);access();setStatus(tx('signed'));}
 }catch(err){setStatus(err.message||tx('error'),true)}finally{submit.disabled=false;}}
);
$('accountButton').addEventListener('click',()=>{if(session||noEmail()||phoneOwner())$('accountModal').classList.remove('hidden')});
$('accountClose').addEventListener('click',()=>$('accountModal').classList.add('hidden'));
$('authSignOut').addEventListener('click',async()=>{localStorage.removeItem(GUEST_KEY);const owner=phoneOwner();if(owner){localStorage.removeItem(OWNER_KEY);if(client)client.rpc('owner_sign_out',{p_token:owner.token}).then(()=>{},()=>{});}if(client&&session)await client.auth.signOut();session=null;$('accountModal').classList.add('hidden');history.replaceState(null,'',location.pathname);document.querySelector('[data-view="overview"]').click();access();});
document.querySelectorAll('[data-auth-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.authLang;localStorage.setItem('queueless-language',lang);document.querySelector(`[data-lang="${lang}"]`).click();setMode(mode);}));
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;setMode(mode)}));
// Require a verified Supabase session before navigating to business screens.
document.addEventListener('click',e=>{const b=e.target.closest('[data-view],[data-jump]');if(b&&!session&&!noEmail()&&!phoneOwner()&&(b.dataset.view||b.dataset.jump)!=='guest'){e.preventDefault();e.stopImmediatePropagation();access();}},true);
restoreAuth();
boot();
