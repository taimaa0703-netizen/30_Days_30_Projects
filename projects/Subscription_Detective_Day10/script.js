'use strict';
const KEY='subscription-detective-v1';
const $=id=>document.getElementById(id);
const CATEGORIES=['Entertainment','Productivity','Software','Fitness','Shopping','Other'];
const COLORS={Entertainment:'#5568c9',Productivity:'#25a98c',Software:'#3185c4',Fitness:'#38a886',Shopping:'#42a8be',Other:'#c39445'};
const translations={
  he:{
    'Language':'שפה','English':'אנגלית','YOUR MONEY, UNDER THE MAGNIFYING GLASS':'הכסף שלך, תחת זכוכית המגדלת','Saved on this device':'נשמר במכשיר הזה','Add subscription':'הוספת מנוי','SUBSCRIPTION':'מנויים','DETECTIVE.':'בלש.','DAY 10':'יום 10','30 PROJECTS':'30 פרויקטים','Main navigation':'ניווט ראשי','Overview':'סקירה כללית','Subscriptions':'מנויים','Renewal calendar':'יומן חידושים','Savings lab':'מעבדת חיסכון',"THE DETECTIVE'S NOTE":'הערת הבלש','Small monthly charges have a way of becoming big annual numbers.':'חיובים חודשיים קטנים הופכים בקלות לסכומים שנתיים גדולים.','All 30 projects':'כל 30 הפרויקטים','THE CASE OF THE RECURRING CHARGES':'תיק החיובים החוזרים','Where does your':'לאן הולך','money go?':'הכסף שלך?','Find the subscriptions hiding in plain sight. Track, investigate, and take back control.':'גלו את המנויים הנסתרים. עקבו, בדקו וקחו בחזרה את השליטה.','Track a subscription':'מעקב אחר מנוי','01 / THE BIG PICTURE':'01 / התמונה הגדולה','Your financial snapshot':'תמונת מצב פיננסית','Subscription totals':'סיכום מנויים','MONTHLY SPEND':'הוצאה חודשית','Normalized monthly cost':'עלות חודשית ממוצעת','YEARLY SPEND':'הוצאה שנתית','What those charges add up to':'כמה החיובים האלה מצטברים','ACTIVE SUBSCRIPTIONS':'מנויים פעילים','Recurring commitments':'התחייבויות חוזרות','NEXT RENEWAL':'החידוש הבא','No upcoming renewals':'אין חידושים קרובים','YOUR SPENDING MIX':'תמהיל ההוצאות שלך','Where it all goes':'לאן הכול הולך','Monthly equivalent':'שווה ערך חודשי',"DETECTIVE'S INSIGHT ✦":'תובנת הבלש ✦','Every subscription tells a story.':'לכל מנוי יש סיפור.','Add your first subscription to uncover where your money goes.':'הוסיפו את המנוי הראשון כדי לגלות לאן הכסף שלכם הולך.','Investigate subscriptions →':'בדיקת המנויים ←','02 / THE SUSPECT LIST':'02 / רשימת החשודים','Your subscriptions':'המנויים שלך','Load demo data':'טעינת נתוני הדגמה','Add new':'הוספת מנוי','Search subscriptions':'חיפוש מנויים','⌕  Search subscriptions...':'⌕  חיפוש מנויים...','Filter by category':'סינון לפי קטגוריה','All categories':'כל הקטגוריות','Entertainment':'בידור','Productivity':'פרודוקטיביות','Software':'תוכנה','Fitness':'כושר','Shopping':'קניות','Other':'אחר','SUBSCRIPTION':'מנוי','PRICE':'מחיר','BILLING':'חיוב','NEXT RENEWAL':'החידוש הבא','ACTIONS':'פעולות','No subscriptions found':'לא נמצאו מנויים','Add one to start your investigation, or try the demo.':'הוסיפו מנוי כדי להתחיל בבדיקה, או נסו את ההדגמה.','03 / MARK YOUR CALENDAR':'03 / סמנו ביומן','Upcoming renewals':'חידושים קרובים','Previous month':'החודש הקודם','Next month':'החודש הבא','Today':'היום','COMING UP NEXT':'הבאים בתור','Reminders are shown here while you visit the site. This version does not send background notifications.':'התזכורות מוצגות כאן בזמן הביקור באתר. גרסה זו אינה שולחת התראות ברקע.','04 / THE SAVINGS LAB':'04 / מעבדת החיסכון','What if you canceled?':'מה אם תבטלו?','Select subscriptions to simulate canceling them. Nothing is actually canceled.':'בחרו מנויים כדי לדמות את ביטולם. שום מנוי לא יבוטל בפועל.','Add subscriptions to explore how much you could save.':'הוסיפו מנויים כדי לבדוק כמה אפשר לחסוך.','POTENTIAL YEARLY SAVINGS':'חיסכון שנתי אפשרי',"That's ":'זה ',' every month you could keep.':' בכל חודש שיוכל להישאר אצלכם.','New monthly spend':'הוצאה חודשית חדשה','Subscriptions selected':'מנויים שנבחרו','✦ SUBSCRIPTION DETECTIVE · DAY 10 / 30':'✦ בלש המנויים · יום 10 / 30','Clear my saved data':'מחיקת הנתונים השמורים שלי','Private by design: data stays in this browser. Not connected to any bank or subscription provider.':'הפרטיות מובנית: הנתונים נשארים בדפדפן הזה ואינם מחוברים לבנק או לספק מנויים.','THE CASE FILE':'תיק המקרה','Add a subscription':'הוספת מנוי','Close':'סגירה','Subscription name':'שם המנוי','Amount (₪)':'סכום (₪)','Billing cycle':'מחזור חיוב','Monthly':'חודשי','Yearly':'שנתי','Category':'קטגוריה','Next renewal':'החידוש הבא','Last used (optional)':'שימוש אחרון (לא חובה)','Color':'צבע','Burgundy':'בורדו','Gold':'זהב','Sage':'מרווה','Lavender':'לבנדר','Blue':'כחול','Renewals are estimated using the billing cycle you enter. No payment or account information is needed.':'מועדי החידוש מחושבים לפי מחזור החיוב שתזינו. אין צורך בפרטי תשלום או חשבון.','Cancel':'ביטול','Save subscription':'שמירת המנוי','e.g. Spotify Premium':'למשל Spotify Premium','Search subscriptions...':'חיפוש מנויים...','Mon':'ב׳','Tue':'ג׳','Wed':'ד׳','Thu':'ה׳','Fri':'ו׳','Sat':'ש׳','Sun':'א׳','Edit':'עריכה','Delete':'מחיקה','No upcoming renewals yet.':'אין עדיין חידושים קרובים.','Today':'היום','day':'יום','days':'ימים','Add subscriptions to see your spending by category.':'הוסיפו מנויים כדי לראות את ההוצאות לפי קטגוריה.','Every subscription tells a story.':'לכל מנוי יש סיפור.','Edit subscription':'עריכת מנוי','Please enter a valid name, amount, and renewal date.':'נא להזין שם, סכום ותאריך חידוש תקינים.','Last used date cannot be in the future.':'תאריך השימוש האחרון לא יכול להיות בעתיד.','Subscription updated.':'המנוי עודכן.','Subscription added.':'המנוי נוסף.','Add sample subscriptions to your existing list?':'להוסיף מנויי דוגמה לרשימה הקיימת?','Demo subscriptions added. Edit or delete them anytime.':'מנויי ההדגמה נוספו. אפשר לערוך או למחוק אותם בכל עת.','Permanently delete all subscriptions saved in this browser?':'למחוק לצמיתות את כל המנויים השמורים בדפדפן הזה?','All local data cleared.':'כל הנתונים המקומיים נמחקו.','Subscription deleted.':'המנוי נמחק.','Could not save: browser storage may be disabled.':'לא ניתן לשמור: ייתכן שאחסון הדפדפן מושבת.','Delete {name}?':'למחוק את {name}?','In {count} day':'בעוד {count} יום','In {count} days':'בעוד {count} ימים','Add your first subscription to uncover where your money goes.':'הוסיפו את המנוי הראשון כדי לגלות לאן הכסף שלכם הולך.','Add subscriptions to explore how much you could save.':'הוסיפו מנויים כדי לבדוק כמה אפשר לחסוך.','{count} subscription worth a second look.':'מנוי אחד שווה בדיקה נוספת.','{count} subscriptions worth a second look.':'{count} מנויים ששווה לבדוק שוב.','You marked {count} subscription as unused for 30+ days. Could you save on one of them?':'סימנתם מנוי אחד כלא בשימוש במשך יותר מ־30 יום. אולי אפשר לחסוך באחד מהם?','You marked {count} subscriptions as unused for 30+ days. Could you save on one of them?':'סימנתם {count} מנויים כלא בשימוש במשך יותר מ־30 יום. אולי אפשר לחסוך באחד מהם?','{amount} a year. That\'s the real number.':'{amount} בשנה. זה הסכום האמיתי.','Your {count} subscription costs {amount} per month. Visit the savings lab to explore alternatives.':'המנוי שלך עולה {amount} בחודש. עברו למעבדת החיסכון כדי לבדוק חלופות.','Your {count} subscriptions cost {amount} per month. Visit the savings lab to explore alternatives.':'{count} המנויים שלך עולים {amount} בחודש. עברו למעבדת החיסכון כדי לבדוק חלופות.','Add subscriptions to see your spending by category.':'הוסיפו מנויים כדי לראות את ההוצאות לפי קטגוריה.','{count} day':'{count} יום','{count} days':'{count} ימים','Could not save: browser storage may be disabled.':'לא ניתן לשמור: ייתכן שאחסון הדפדפן מושבת.'
  },
  ar:{
    'Language':'اللغة','English':'الإنجليزية','YOUR MONEY, UNDER THE MAGNIFYING GLASS':'أموالك تحت العدسة المكبرة','Saved on this device':'محفوظ على هذا الجهاز','Add subscription':'إضافة اشتراك','SUBSCRIPTION':'اشتراك','DETECTIVE.':'المحقق.','DAY 10':'اليوم 10','30 PROJECTS':'30 مشروعًا','Main navigation':'التنقل الرئيسي','Overview':'نظرة عامة','Subscriptions':'الاشتراكات','Renewal calendar':'تقويم التجديد','Savings lab':'مختبر التوفير',"THE DETECTIVE'S NOTE":'ملاحظة المحقق','Small monthly charges have a way of becoming big annual numbers.':'الرسوم الشهرية الصغيرة قد تتحول إلى مبالغ سنوية كبيرة.','All 30 projects':'كل المشاريع الثلاثين','THE CASE OF THE RECURRING CHARGES':'قضية الرسوم المتكررة','Where does your':'أين تذهب','money go?':'أموالك؟','Find the subscriptions hiding in plain sight. Track, investigate, and take back control.':'اكتشف الاشتراكات المختبئة أمامك. تابعها وتحقق منها واستعد السيطرة.','Track a subscription':'تتبّع اشتراكًا','01 / THE BIG PICTURE':'01 / الصورة الكبيرة','Your financial snapshot':'ملخصك المالي','Subscription totals':'إجمالي الاشتراكات','MONTHLY SPEND':'الإنفاق الشهري','Normalized monthly cost':'التكلفة الشهرية المحسوبة','YEARLY SPEND':'الإنفاق السنوي','What those charges add up to':'مجموع هذه الرسوم','ACTIVE SUBSCRIPTIONS':'الاشتراكات النشطة','Recurring commitments':'الالتزامات المتكررة','NEXT RENEWAL':'التجديد التالي','No upcoming renewals':'لا توجد تجديدات قادمة','YOUR SPENDING MIX':'توزيع إنفاقك','Where it all goes':'أين يذهب كل ذلك','Monthly equivalent':'المكافئ الشهري',"DETECTIVE'S INSIGHT ✦":'رؤية المحقق ✦','Every subscription tells a story.':'لكل اشتراك قصة.','Add your first subscription to uncover where your money goes.':'أضف اشتراكك الأول لتكتشف أين تذهب أموالك.','Investigate subscriptions →':'تحقق من الاشتراكات ←','02 / THE SUSPECT LIST':'02 / قائمة المشتبه بهم','Your subscriptions':'اشتراكاتك','Load demo data':'تحميل بيانات تجريبية','Add new':'إضافة جديد','Search subscriptions':'البحث عن اشتراكات','⌕  Search subscriptions...':'⌕  ابحث عن اشتراكات...','Filter by category':'التصفية حسب الفئة','All categories':'كل الفئات','Entertainment':'ترفيه','Productivity':'إنتاجية','Software':'برامج','Fitness':'لياقة','Shopping':'تسوق','Other':'أخرى','SUBSCRIPTION':'الاشتراك','PRICE':'السعر','BILLING':'الفوترة','NEXT RENEWAL':'التجديد التالي','ACTIONS':'الإجراءات','No subscriptions found':'لم يتم العثور على اشتراكات','Add one to start your investigation, or try the demo.':'أضف اشتراكًا لبدء التحقيق أو جرّب البيانات التجريبية.','03 / MARK YOUR CALENDAR':'03 / دوّن في تقويمك','Upcoming renewals':'التجديدات القادمة','Previous month':'الشهر السابق','Next month':'الشهر التالي','Today':'اليوم','COMING UP NEXT':'التالي قريبًا','Reminders are shown here while you visit the site. This version does not send background notifications.':'تظهر التذكيرات هنا أثناء زيارتك للموقع. لا ترسل هذه النسخة إشعارات في الخلفية.','04 / THE SAVINGS LAB':'04 / مختبر التوفير','What if you canceled?':'ماذا لو ألغيت؟','Select subscriptions to simulate canceling them. Nothing is actually canceled.':'حدد الاشتراكات لمحاكاة إلغائها. لن يتم إلغاء أي شيء فعليًا.','Add subscriptions to explore how much you could save.':'أضف اشتراكات لمعرفة مقدار ما يمكنك توفيره.','POTENTIAL YEARLY SAVINGS':'التوفير السنوي المحتمل',"That's ":'هذا ',' every month you could keep.':' كل شهر يمكنك الاحتفاظ به.','New monthly spend':'الإنفاق الشهري الجديد','Subscriptions selected':'الاشتراكات المحددة','✦ SUBSCRIPTION DETECTIVE · DAY 10 / 30':'✦ محقق الاشتراكات · اليوم 10 / 30','Clear my saved data':'مسح بياناتي المحفوظة','Private by design: data stays in this browser. Not connected to any bank or subscription provider.':'الخصوصية أساس التصميم: تبقى البيانات في هذا المتصفح ولا تتصل بأي بنك أو مزود اشتراكات.','THE CASE FILE':'ملف القضية','Add a subscription':'إضافة اشتراك','Close':'إغلاق','Subscription name':'اسم الاشتراك','Amount (₪)':'المبلغ (₪)','Billing cycle':'دورة الفوترة','Monthly':'شهري','Yearly':'سنوي','Category':'الفئة','Next renewal':'التجديد التالي','Last used (optional)':'آخر استخدام (اختياري)','Color':'اللون','Burgundy':'عنابي','Gold':'ذهبي','Sage':'أخضر مريمي','Lavender':'لافندر','Blue':'أزرق','Renewals are estimated using the billing cycle you enter. No payment or account information is needed.':'يتم تقدير التجديدات وفق دورة الفوترة التي تدخلها. لا حاجة لمعلومات الدفع أو الحساب.','Cancel':'إلغاء','Save subscription':'حفظ الاشتراك','e.g. Spotify Premium':'مثال: Spotify Premium','Edit':'تعديل','Delete':'حذف','No upcoming renewals yet.':'لا توجد تجديدات قادمة حتى الآن.','Mon':'الإثنين','Tue':'الثلاثاء','Wed':'الأربعاء','Thu':'الخميس','Fri':'الجمعة','Sat':'السبت','Sun':'الأحد','day':'يوم','days':'أيام','Edit subscription':'تعديل الاشتراك','Please enter a valid name, amount, and renewal date.':'يرجى إدخال اسم ومبلغ وتاريخ تجديد صالح.','Last used date cannot be in the future.':'لا يمكن أن يكون تاريخ آخر استخدام في المستقبل.','Subscription updated.':'تم تحديث الاشتراك.','Subscription added.':'تمت إضافة الاشتراك.','Add sample subscriptions to your existing list?':'هل تريد إضافة اشتراكات تجريبية إلى قائمتك الحالية؟','Demo subscriptions added. Edit or delete them anytime.':'تمت إضافة اشتراكات تجريبية. يمكنك تعديلها أو حذفها في أي وقت.','Permanently delete all subscriptions saved in this browser?':'هل تريد حذف جميع الاشتراكات المحفوظة في هذا المتصفح نهائيًا؟','All local data cleared.':'تم مسح جميع البيانات المحلية.','Subscription deleted.':'تم حذف الاشتراك.','Could not save: browser storage may be disabled.':'تعذر الحفظ: قد يكون تخزين المتصفح معطلًا.','Delete {name}?':'هل تريد حذف {name}؟','In {count} day':'خلال يوم واحد ({count})','In {count} days':'خلال {count} أيام','{count} subscription worth a second look.':'اشتراك واحد يستحق إعادة النظر.','{count} subscriptions worth a second look.':'{count} اشتراكات تستحق إعادة النظر.','You marked {count} subscription as unused for 30+ days. Could you save on one of them?':'حددت اشتراكًا واحدًا على أنه غير مستخدم لأكثر من 30 يومًا. هل يمكنك التوفير في أحدها؟','You marked {count} subscriptions as unused for 30+ days. Could you save on one of them?':'حددت {count} اشتراكات على أنها غير مستخدمة لأكثر من 30 يومًا. هل يمكنك التوفير في أحدها؟','{amount} a year. That\'s the real number.':'{amount} سنويًا. هذا هو المبلغ الحقيقي.','Your {count} subscription costs {amount} per month. Visit the savings lab to explore alternatives.':'يكلف اشتراكك {amount} شهريًا. انتقل إلى مختبر التوفير لاستكشاف البدائل.','Your {count} subscriptions cost {amount} per month. Visit the savings lab to explore alternatives.':'تكلف اشتراكاتك وعددها {count} مبلغ {amount} شهريًا. انتقل إلى مختبر التوفير لاستكشاف البدائل.','Add subscriptions to see your spending by category.':'أضف اشتراكات لرؤية إنفاقك حسب الفئة.','{count} day':'{count} يوم','{count} days':'{count} أيام'
  }
};
Object.assign(translations.ar,{
  'Language':'اللغة',
  'English':'الإنجليزية',
  'YOUR MONEY, UNDER THE MAGNIFYING GLASS':'أموالك تحت المجهر',
  'Saved on this device':'محفوظة على هذا الجهاز',
  'SUBSCRIPTION':'كاشف',
  'DETECTIVE.':'الاشتراكات',
  'Investigate subscriptions':'راجع اشتراكاتك',
  'DAY 10':'اليوم ١٠',
  '30 PROJECTS':'٣٠ مشروعًا',
  'Overview':'الرئيسية',
  'Subscriptions':'اشتراكاتي',
  'Renewal calendar':'مواعيد التجديد',
  'Savings lab':'مساحة التوفير',
  "THE DETECTIVE'S NOTE":'من ملاحظات الخبير',
  'Small monthly charges have a way of becoming big annual numbers.':'الاشتراكات الصغيرة قد تتحول إلى مبالغ سنوية كبيرة.',
  'All 30 projects':'العودة إلى المشاريع الثلاثين',
  'THE CASE OF THE RECURRING CHARGES':'ملف الاشتراكات المتجددة',
  'Where does your':'إلى أين تذهب',
  'money go?':'أموالك؟',
  'Find the subscriptions hiding in plain sight. Track, investigate, and take back control.':'اكتشف اشتراكاتك، وتابع تكلفتها، واتخذ قراراتك المالية بثقة.',
  'Track a subscription':'إضافة اشتراك',
  '01 / THE BIG PICTURE':'٠١ / لمحة مالية',
  'Your financial snapshot':'ملخصك المالي',
  'Subscription totals':'ملخص الاشتراكات',
  'MONTHLY SPEND':'إجمالي الإنفاق الشهري',
  'Normalized monthly cost':'التكلفة الشهرية الفعلية',
  'YEARLY SPEND':'إجمالي الإنفاق السنوي',
  'What those charges add up to':'ما تدفعه على مدار العام',
  'ACTIVE SUBSCRIPTIONS':'الاشتراكات النشطة',
  'Recurring commitments':'التزاماتك المتجددة',
  'NEXT RENEWAL':'موعد التجديد القادم',
  'No upcoming renewals':'لا توجد تجديدات قريبة',
  'YOUR SPENDING MIX':'توزيع الإنفاق',
  'Where it all goes':'كيف يتوزع إنفاقك',
  'Monthly equivalent':'التكلفة الشهرية',
  "DETECTIVE'S INSIGHT ✦":'نظرة على اشتراكاتك ✦',
  'Every subscription tells a story.':'كل اشتراك يستحق المراجعة.',
  'Add your first subscription to uncover where your money goes.':'أضف اشتراكك الأول لتبدأ بمتابعة مصروفاتك.',
  'Investigate subscriptions →':'استعرض اشتراكاتك ←',
  '02 / THE SUSPECT LIST':'٠٢ / اشتراكاتك',
  'Your subscriptions':'إدارة الاشتراكات',
  'Load demo data':'عرض بيانات تجريبية',
  'Add new':'إضافة اشتراك',
  'Search subscriptions':'ابحث في الاشتراكات',
  '⌕  Search subscriptions...':'⌕  ابحث عن اشتراك...',
  'Filter by category':'التصفية حسب الفئة',
  'All categories':'كل الفئات',
  'Entertainment':'ترفيه',
  'Productivity':'إنتاجية',
  'Software':'برامج',
  'Fitness':'رياضة ولياقة',
  'Shopping':'تسوّق',
  'Other':'أخرى',
  'SUBSCRIPTION':'الاشتراك',
  'PRICE':'التكلفة',
  'BILLING':'دورة الدفع',
  'NEXT RENEWAL':'التجديد القادم',
  'ACTIONS':'إجراءات',
  'No subscriptions found':'لا توجد اشتراكات مطابقة',
  'Add one to start your investigation, or try the demo.':'أضف اشتراكًا جديدًا أو جرّب البيانات التوضيحية.',
  '03 / MARK YOUR CALENDAR':'٠٣ / مواعيد التجديد',
  'Upcoming renewals':'التجديدات القادمة',
  'Previous month':'الشهر السابق',
  'Next month':'الشهر التالي',
  'Today':'اليوم',
  'COMING UP NEXT':'أقرب التجديدات',
  'Reminders are shown here while you visit the site. This version does not send background notifications.':'تظهر مواعيد التجديد هنا أثناء استخدام الموقع. لا ترسل هذه النسخة إشعارات خارج المتصفح.',
  '04 / THE SAVINGS LAB':'٠٤ / خطتك للتوفير',
  'What if you canceled?':'كم ستوفّر إذا ألغيت؟',
  'Select subscriptions to simulate canceling them. Nothing is actually canceled.':'اختر الاشتراكات لحساب التوفير المحتمل. لن يُلغى أي اشتراك فعليًا.',
  'Add subscriptions to explore how much you could save.':'أضف اشتراكاتك لتقدير فرص التوفير.',
  'POTENTIAL YEARLY SAVINGS':'التوفير السنوي المتوقع',
  "That's":'يمكنك توفير',
  'every month you could keep.':'شهريًا والاحتفاظ بهذا المبلغ.',
  'New monthly spend':'الإنفاق الشهري بعد الإلغاء',
  'Subscriptions selected':'الاشتراكات المحددة',
  '✦ SUBSCRIPTION DETECTIVE · DAY 10 / 30':'✦ كاشف الاشتراكات · اليوم ١٠ من ٣٠',
  'Clear my saved data':'حذف بياناتي المحفوظة',
  'Private by design: data stays in this browser. Not connected to any bank or subscription provider.':'خصوصيتك أولويتنا: تُحفظ بياناتك في هذا المتصفح فقط، ولا نصل إلى حساباتك البنكية أو مزوّدي الخدمة.',
  'THE CASE FILE':'تفاصيل الاشتراك',
  'Add a subscription':'إضافة اشتراك',
  'Close':'إغلاق',
  'Subscription name':'اسم الاشتراك',
  'Amount (₪)':'المبلغ (₪)',
  'Billing cycle':'دورة الدفع',
  'Monthly':'شهري',
  'Yearly':'سنوي',
  'Category':'الفئة',
  'Next renewal':'موعد التجديد',
  'Last used (optional)':'آخر استخدام (اختياري)',
  'Color':'اللون',
  'Burgundy':'عنابي',
  'Gold':'ذهبي',
  'Sage':'أخضر هادئ',
  'Lavender':'بنفسجي',
  'Blue':'أزرق',
  'Renewals are estimated using the billing cycle you enter. No payment or account information is needed.':'نقدّر موعد التجديد وفق دورة الدفع التي تحددها. لا نطلب أي بيانات دفع أو معلومات حساب.',
  'Cancel':'إلغاء',
  'Save subscription':'حفظ الاشتراك',
  'e.g. Spotify Premium':'مثال: Spotify Premium',
  'Edit':'تعديل',
  'Delete':'حذف',
  'No upcoming renewals yet.':'لا توجد تجديدات قادمة.',
  'Mon':'الاثنين',
  'Tue':'الثلاثاء',
  'Wed':'الأربعاء',
  'Thu':'الخميس',
  'Fri':'الجمعة',
  'Sat':'السبت',
  'Sun':'الأحد',
  'Edit subscription':'تعديل الاشتراك',
  'Please enter a valid name, amount, and renewal date.':'تحقّق من إدخال اسم الاشتراك والمبلغ وموعد التجديد.',
  'Last used date cannot be in the future.':'يجب ألا يكون تاريخ آخر استخدام في المستقبل.',
  'Subscription updated.':'تم تحديث الاشتراك بنجاح.',
  'Subscription added.':'تمت إضافة الاشتراك بنجاح.',
  'Add sample subscriptions to your existing list?':'هل تريد إضافة اشتراكات تجريبية إلى قائمتك الحالية؟',
  'Demo subscriptions added. Edit or delete them anytime.':'أُضيفت الاشتراكات التجريبية. يمكنك تعديلها أو حذفها متى شئت.',
  'Permanently delete all subscriptions saved in this browser?':'هل تريد حذف جميع الاشتراكات المحفوظة في هذا المتصفح نهائيًا؟',
  'All local data cleared.':'تم حذف جميع البيانات المحفوظة.',
  'Subscription deleted.':'تم حذف الاشتراك.',
  'Could not save: browser storage may be disabled.':'تعذّر الحفظ. تحقّق من إعدادات التخزين في المتصفح.',
  'Delete {name}?':'هل تريد حذف «{name}»؟',
  'In {count} day':'خلال {count} يوم',
  'In {count} days':'خلال {count} أيام',
  '{count} subscription worth a second look.':'لديك اشتراك واحد يستحق المراجعة.',
  '{count} subscriptions worth a second look.':'لديك {count} اشتراكات تستحق المراجعة.',
  'You marked {count} subscription as unused for 30+ days. Could you save on one of them?':'لم تستخدم اشتراكًا واحدًا منذ أكثر من ٣٠ يومًا. راجعه فقد تتمكن من التوفير.',
  'You marked {count} subscriptions as unused for 30+ days. Could you save on one of them?':'لم تستخدم {count} اشتراكات منذ أكثر من ٣٠ يومًا. راجعها فقد تتمكن من التوفير.',
  "{amount} a year. That's the real number.":'إنفاقك السنوي {amount}. هذا هو المبلغ الفعلي.',
  'Your {count} subscription costs {amount} per month. Visit the savings lab to explore alternatives.':'تبلغ تكلفة اشتراكك {amount} شهريًا. استكشف خيارات التوفير المتاحة.',
  'Your {count} subscriptions cost {amount} per month. Visit the savings lab to explore alternatives.':'تبلغ تكلفة اشتراكاتك {amount} شهريًا. استكشف خيارات التوفير المتاحة.',
  'Add subscriptions to see your spending by category.':'أضف اشتراكاتك لعرض الإنفاق حسب الفئة.',
  'Add subscriptions to explore how much you could save.':'أضف اشتراكاتك لتقدير فرص التوفير.',
  'Subscription Detective | Day 10':'كاشف الاشتراكات | اليوم ١٠',
  'Subscription Detective — track recurring payments, renewal dates, and potential savings.':'تابع اشتراكاتك ومواعيد تجديدها واكتشف فرص التوفير.'
});
Object.assign(translations.he,{
  'Export backup':'ייצוא גיבוי',
  'Import backup':'ייבוא גיבוי',
  'Remind me before renewal':'תזכורת לפני החידוש',
  'No reminder':'ללא תזכורת',
  'On renewal day':'ביום החידוש',
  '1 day before':'יום אחד לפני',
  '3 days before':'3 ימים לפני',
  '7 days before':'7 ימים לפני',
  'Browser notifications are sent while this site is open.':'התראות דפדפן נשלחות כשהאתר פתוח.',
  'Reminders work while this site is open. Browser notifications require permission.':'תזכורות פועלות כשהאתר פתוח. להתראות דפדפן נדרשת הרשאה.',
  'Enable browser notifications':'הפעלת התראות דפדפן',
  'Notifications enabled':'ההתראות מופעלות',
  'Notifications are blocked. In-site reminders still work.':'ההתראות חסומות. תזכורות באתר עדיין פועלות.',
  'Browser notifications are unavailable. In-site reminders still work.':'התראות דפדפן אינן זמינות. תזכורות באתר עדיין פועלות.',
  'Allow notifications in your browser to enable them.':'יש לאפשר התראות בדפדפן כדי להפעיל אותן.',
  'No subscriptions to export.':'אין מנויים לייצוא.',
  'Backup exported.':'הגיבוי יוצא בהצלחה.',
  'Could not export backup.':'לא ניתן לייצא את הגיבוי.',
  'Choose a valid Subscription Detective backup file.':'יש לבחור קובץ גיבוי תקין של Subscription Detective.',
  'This backup is invalid or contains unsupported data.':'קובץ הגיבוי אינו תקין או מכיל נתונים שאינם נתמכים.',
  'Importing this backup will replace your current subscriptions. Continue?':'ייבוא הגיבוי יחליף את המנויים הנוכחיים. להמשיך?',
  'Backup imported successfully.':'הגיבוי יובא בהצלחה.',
  'Could not import backup: browser storage may be disabled.':'לא ניתן לייבא את הגיבוי: ייתכן שאחסון הדפדפן מושבת.',
  'Could not read backup file.':'לא ניתן לקרוא את קובץ הגיבוי.',
  '{name} renews today.':'המנוי {name} מתחדש היום.',
  '{name} renews in {count} day.':'המנוי {name} מתחדש בעוד יום.',
  '{name} renews in {count} days.':'המנוי {name} מתחדש בעוד {count} ימים.',
  'Subscription renewal reminder':'תזכורת לחידוש מנוי'
});
Object.assign(translations.ar,{
  'Export backup':'تصدير نسخة احتياطية',
  'Import backup':'استيراد نسخة احتياطية',
  'Remind me before renewal':'ذكّرني قبل التجديد',
  'No reminder':'بلا تذكير',
  'On renewal day':'في يوم التجديد',
  '1 day before':'قبل يوم واحد',
  '3 days before':'قبل ٣ أيام',
  '7 days before':'قبل ٧ أيام',
  'Browser notifications are sent while this site is open.':'تعمل إشعارات المتصفح أثناء فتح الموقع.',
  'Reminders work while this site is open. Browser notifications require permission.':'تعمل التذكيرات عند فتح الموقع. تتطلب إشعارات المتصفح إذنًا.',
  'Enable browser notifications':'تفعيل إشعارات المتصفح',
  'Notifications enabled':'الإشعارات مفعّلة',
  'Notifications are blocked. In-site reminders still work.':'الإشعارات محظورة. تظل التذكيرات داخل الموقع تعمل.',
  'Browser notifications are unavailable. In-site reminders still work.':'إشعارات المتصفح غير متاحة. تظل التذكيرات داخل الموقع تعمل.',
  'Allow notifications in your browser to enable them.':'اسمح بالإشعارات في المتصفح لتفعيلها.',
  'No subscriptions to export.':'لا توجد اشتراكات لتصديرها.',
  'Backup exported.':'تم تصدير النسخة الاحتياطية.',
  'Could not export backup.':'تعذّر تصدير النسخة الاحتياطية.',
  'Choose a valid Subscription Detective backup file.':'اختر ملفًا صالحًا للنسخة الاحتياطية من مدير الاشتراكات.',
  'This backup is invalid or contains unsupported data.':'النسخة الاحتياطية غير صالحة أو تحتوي على بيانات غير مدعومة.',
  'Importing this backup will replace your current subscriptions. Continue?':'سيؤدي استيراد النسخة الاحتياطية إلى استبدال اشتراكاتك الحالية. هل تريد المتابعة؟',
  'Backup imported successfully.':'تم استيراد النسخة الاحتياطية بنجاح.',
  'Could not import backup: browser storage may be disabled.':'تعذّر الاستيراد. تحقّق من إعدادات التخزين في المتصفح.',
  'Could not read backup file.':'تعذّرت قراءة ملف النسخة الاحتياطية.',
  '{name} renews today.':'يتجدد اشتراك {name} اليوم.',
  '{name} renews in {count} day.':'يتجدد اشتراك {name} بعد يوم واحد.',
  '{name} renews in {count} days.':'يتجدد اشتراك {name} بعد {count} أيام.',
  'Subscription renewal reminder':'تذكير بتجديد الاشتراك'
});
Object.assign(translations.ar,{
  'Language':'اللغة',
  'English':'الإنجليزية',
  'YOUR MONEY, UNDER THE MAGNIFYING GLASS':'أموالك تحت السيطرة',
  'Saved on this device':'بياناتك محفوظة على هذا الجهاز',
  'SUBSCRIPTION':'مدير',
  'DETECTIVE.':'الاشتراكات',
  'DAY 10':'اليوم ١٠',
  '30 PROJECTS':'٣٠ مشروعًا',
  'Overview':'الملخص المالي',
  'Subscriptions':'الاشتراكات',
  'Renewal calendar':'مواعيد التجديد',
  'Savings lab':'خطة التوفير',
  "THE DETECTIVE'S NOTE":'نصيحة مالية',
  'Small monthly charges have a way of becoming big annual numbers.':'قد تبدو الاشتراكات بسيطة شهريًا، لكنها تتراكم لتصبح مبلغًا كبيرًا كل عام.',
  'All 30 projects':'العودة إلى جميع المشاريع',
  'THE CASE OF THE RECURRING CHARGES':'تحكّم باشتراكاتك المتجددة',
  'Where does your':'هل تعرف أين تذهب',
  'money go?':'أموالك؟',
  'Find the subscriptions hiding in plain sight. Track, investigate, and take back control.':'اجمع اشتراكاتك في مكان واحد، وتابع تكلفتها ومواعيد تجديدها بكل وضوح.',
  'Track a subscription':'أضف اشتراكًا',
  '01 / THE BIG PICTURE':'٠١ / ملخصك المالي',
  'Your financial snapshot':'صورة واضحة عن إنفاقك',
  'Subscription totals':'ملخص الاشتراكات',
  'MONTHLY SPEND':'الإنفاق الشهري',
  'Normalized monthly cost':'إجمالي التكلفة الشهرية',
  'YEARLY SPEND':'الإنفاق السنوي',
  'What those charges add up to':'إجمالي ما تدفعه خلال العام',
  'ACTIVE SUBSCRIPTIONS':'الاشتراكات النشطة',
  'Recurring commitments':'الاشتراكات التي تتابعها',
  'NEXT RENEWAL':'أقرب موعد للتجديد',
  'No upcoming renewals':'لا توجد تجديدات قريبة',
  'YOUR SPENDING MIX':'تفصيل إنفاقك',
  'Where it all goes':'إلى أين تذهب أموالك؟',
  'Monthly equivalent':'المعدل الشهري',
  "DETECTIVE'S INSIGHT ✦":'نظرة على إنفاقك ✦',
  'Every subscription tells a story.':'خطوة صغيرة نحو إنفاق أوضح.',
  'Add your first subscription to uncover where your money goes.':'أضف اشتراكك الأول لتتعرف على مصروفاتك الشهرية.',
  'Investigate subscriptions':'راجع اشتراكاتك',
  'Investigate subscriptions →':'راجع اشتراكاتك',
  '02 / THE SUSPECT LIST':'٠٢ / إدارة الاشتراكات',
  'Your subscriptions':'اشتراكاتك في مكان واحد',
  'Load demo data':'تجربة بيانات توضيحية',
  'Add new':'إضافة اشتراك',
  'Search subscriptions':'البحث في الاشتراكات',
  '⌕  Search subscriptions...':'⌕  ابحث عن اشتراك...',
  'Filter by category':'التصفية حسب الفئة',
  'All categories':'كل الفئات',
  'Entertainment':'ترفيه',
  'Productivity':'إنتاجية',
  'Software':'برامج وخدمات رقمية',
  'Fitness':'رياضة ولياقة',
  'Shopping':'تسوّق',
  'Other':'أخرى',
  'SUBSCRIPTION':'الاشتراك',
  'PRICE':'التكلفة',
  'BILLING':'دورة الدفع',
  'NEXT RENEWAL':'موعد التجديد',
  'ACTIONS':'إجراءات',
  'No subscriptions found':'لم نعثر على اشتراكات',
  'Add one to start your investigation, or try the demo.':'أضف اشتراكًا للبدء، أو استعرض البيانات التوضيحية.',
  '03 / MARK YOUR CALENDAR':'٠٣ / نظّم مواعيدك',
  'Upcoming renewals':'التجديدات القادمة',
  'Previous month':'الشهر السابق',
  'Next month':'الشهر التالي',
  'Today':'اليوم',
  'COMING UP NEXT':'التجديدات التالية',
  'Reminders are shown here while you visit the site. This version does not send background notifications.':'تظهر مواعيد التجديد هنا عند زيارة الموقع. لا ترسل هذه النسخة إشعارات في الخلفية.',
  '04 / THE SAVINGS LAB':'٠٤ / مساحة التوفير',
  'What if you canceled?':'كم يمكنك توفيره؟',
  'Select subscriptions to simulate canceling them. Nothing is actually canceled.':'اختر الاشتراكات لحساب التوفير المحتمل؛ لن يُلغى أي اشتراك فعليًا.',
  'Add subscriptions to explore how much you could save.':'أضف اشتراكاتك لتقدير ما يمكنك توفيره.',
  'POTENTIAL YEARLY SAVINGS':'التوفير السنوي المحتمل',
  "That's":'يمكنك توفير',
  'every month you could keep.':'شهريًا والاحتفاظ بهذا المبلغ.',
  'New monthly spend':'إنفاقك الشهري بعد الإلغاء',
  'Subscriptions selected':'عدد الاشتراكات المحددة',
  '✦ SUBSCRIPTION DETECTIVE · DAY 10 / 30':'✦ مدير الاشتراكات · اليوم ١٠ من ٣٠',
  'Clear my saved data':'حذف بياناتي المحفوظة',
  'Private by design: data stays in this browser. Not connected to any bank or subscription provider.':'خصوصيتك محفوظة: تبقى بياناتك في هذا المتصفح، ولا يتصل الموقع بحسابك البنكي أو بمزوّدي الخدمة.',
  'THE CASE FILE':'تفاصيل الاشتراك',
  'Add a subscription':'إضافة اشتراك',
  'Close':'إغلاق',
  'Subscription name':'اسم الاشتراك',
  'Amount (₪)':'المبلغ (₪)',
  'Billing cycle':'دورة الدفع',
  'Monthly':'شهري',
  'Yearly':'سنوي',
  'Category':'الفئة',
  'Next renewal':'موعد التجديد',
  'Last used (optional)':'تاريخ آخر استخدام (اختياري)',
  'Color':'اللون',
  'Burgundy':'خمري',
  'Gold':'ذهبي',
  'Sage':'أخضر هادئ',
  'Lavender':'بنفسجي',
  'Blue':'أزرق',
  'Renewals are estimated using the billing cycle you enter. No payment or account information is needed.':'يُقدّر موعد التجديد حسب دورة الدفع التي تختارها. لا حاجة إلى إدخال معلومات الدفع أو الحساب.',
  'Cancel':'إلغاء',
  'Save subscription':'حفظ الاشتراك',
  'e.g. Spotify Premium':'مثال: Spotify Premium',
  'Edit':'تعديل',
  'Delete':'حذف',
  'No upcoming renewals yet.':'لا توجد تجديدات قريبة.',
  'Mon':'الاثنين',
  'Tue':'الثلاثاء',
  'Wed':'الأربعاء',
  'Thu':'الخميس',
  'Fri':'الجمعة',
  'Sat':'السبت',
  'Sun':'الأحد',
  'Edit subscription':'تعديل الاشتراك',
  'Please enter a valid name, amount, and renewal date.':'أدخل اسم الاشتراك والمبلغ وموعد التجديد بشكل صحيح.',
  'Last used date cannot be in the future.':'لا يمكن أن يكون تاريخ آخر استخدام في المستقبل.',
  'Subscription updated.':'تم تحديث الاشتراك.',
  'Subscription added.':'تمت إضافة الاشتراك.',
  'Add sample subscriptions to your existing list?':'هل تريد إضافة اشتراكات توضيحية إلى قائمتك الحالية؟',
  'Demo subscriptions added. Edit or delete them anytime.':'أُضيفت الاشتراكات التوضيحية. يمكنك تعديلها أو حذفها متى شئت.',
  'Permanently delete all subscriptions saved in this browser?':'هل تريد حذف جميع الاشتراكات المحفوظة في هذا المتصفح نهائيًا؟',
  'All local data cleared.':'تم حذف جميع البيانات المحفوظة.',
  'Subscription deleted.':'تم حذف الاشتراك.',
  'Could not save: browser storage may be disabled.':'تعذّر الحفظ. تحقّق من إعدادات التخزين في المتصفح.',
  'Delete {name}?':'هل تريد حذف «{name}»؟',
  'In {count} day':'خلال {count} يوم',
  'In {count} days':'خلال {count} أيام',
  '{count} subscription worth a second look.':'لديك اشتراك واحد يستحق المراجعة.',
  '{count} subscriptions worth a second look.':'لديك {count} اشتراكات تستحق المراجعة.',
  'You marked {count} subscription as unused for 30+ days. Could you save on one of them?':'مرّ أكثر من ٣٠ يومًا على استخدام أحد اشتراكاتك. قد تتمكن من التوفير بمراجعته.',
  'You marked {count} subscriptions as unused for 30+ days. Could you save on one of them?':'مرّ أكثر من ٣٠ يومًا على استخدام {count} من اشتراكاتك. قد تتمكن من التوفير بمراجعتها.',
  "{amount} a year. That's the real number.":'إجمالي إنفاقك السنوي {amount}.',
  'Your {count} subscription costs {amount} per month. Visit the savings lab to explore alternatives.':'تبلغ تكلفة اشتراكك {amount} شهريًا. راجع خيارات التوفير لمعرفة البدائل.',
  'Your {count} subscriptions cost {amount} per month. Visit the savings lab to explore alternatives.':'تبلغ تكلفة اشتراكاتك {amount} شهريًا. راجع خيارات التوفير لمعرفة البدائل.',
  'Add subscriptions to see your spending by category.':'أضف اشتراكاتك لعرض الإنفاق حسب الفئة.',
  'Add subscriptions to explore how much you could save.':'أضف اشتراكاتك لتقدير فرص التوفير.',
  'Subscription Detective | Day 10':'مدير الاشتراكات | اليوم ١٠',
  'Subscription Detective — track recurring payments, renewal dates, and potential savings.':'تابع اشتراكاتك ومواعيد تجديدها، واكتشف فرص التوفير.'
});
let language='en';
const textOriginals=new WeakMap(),attributeOriginals=new WeakMap();
const latinizeDigits=value=>String(value).replace(/[٠-٩]/g,digit=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
function t(text,values={}){const dictionary=translations[language]||{};let source=text.trim(),prefix='',suffix='';const leading=source.match(/^([+←→✳●◈▤▦✧⌕]\s*)/u);if(leading){prefix=leading[1];source=source.slice(leading[1].length)}const trailing=source.match(/\s*([↗→←])$/u);if(trailing){suffix=` ${language==='ar'||language==='he'?(trailing[1]==='→'?'←':trailing[1]):trailing[1]}`;source=source.slice(0,trailing.index).trimEnd()}const match=Object.entries(dictionary).find(([key])=>key.trim()===source);let result=dictionary[source]??(match&&match[1])??source;if(language!=='en'&&result===source&&source.startsWith('+ '))result=`+ ${t(source.slice(2))}`;result=result.replace(/\{(\w+)\}/g,(_,key)=>{const value=values[key]??`{${key}}`;const localized=language==='ar'&&typeof value==='number'?value.toLocaleString('ar-u-nu-latn',{useGrouping:false}):value;return language==='ar'?`\u2068${localized}\u2069`:localized});const translated=`${prefix}${result}${suffix}`;return language==='ar'?latinizeDigits(translated):translated}
function translatePage(){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(!node.nodeValue.trim()||['SCRIPT','STYLE'].includes(node.parentElement.tagName))continue;
    if(!textOriginals.has(node))textOriginals.set(node,node.nodeValue);
    const original=textOriginals.get(node),leading=original.match(/^\s*/)[0],trailing=original.match(/\s*$/)[0],value=original.trim();
    node.nodeValue=leading+t(value)+trailing;
  }
  document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(element=>{
    let originals=attributeOriginals.get(element);
    if(!originals){originals={};attributeOriginals.set(element,originals)}
    for(const attribute of ['placeholder','aria-label','title']){
      if(!element.hasAttribute(attribute))continue;
      if(!(attribute in originals))originals[attribute]=element.getAttribute(attribute);
      element.setAttribute(attribute,t(originals[attribute]));
    }
  });
  if(language==='ar'){
    const brand=document.querySelector('.brand > span:last-child');
    if(brand){brand.childNodes[0].nodeValue='كاشف';brand.querySelector('strong').textContent='الاشتراكات'}
  }
}
function setLanguage(value){
  language=['he','ar'].includes(value)?value:'en';
  document.documentElement.lang=language;
  document.documentElement.dir='ltr';
  document.documentElement.dataset.language=language;
  document.body.dir='ltr';
  document.title=t('Subscription Detective | Day 10');
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content=t('Subscription Detective — track recurring payments, renewal dates, and potential savings.');
  translatePage();
  render();
  translatePage();
}
const money=n=>'₪'+Number(n||0).toLocaleString(language==='ar'?'ar-IL-u-nu-latn':language==='he'?'he-IL':'en-IL',{minimumFractionDigits:0,maximumFractionDigits:2});
const pad=n=>String(n).padStart(2,'0');
const dateKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseDate=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d,12)};
const isDateKey=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(parseDate(value).getTime())&&dateKey(parseDate(value))===value;
const formatDate=d=>d.toLocaleDateString(language==='he'?'he-IL':language==='ar'?'ar-u-nu-latn':'en-GB',{day:'numeric',month:'short',year:'numeric'});
const daysBetween=(a,b)=>Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000);
const monthly=s=>s.amount/(s.cycle==='yearly'?12:1);
const safe=(v)=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const addMonths=(date,n,anchor)=>{const d=new Date(date.getFullYear(),date.getMonth()+n,1,12);d.setDate(Math.min(anchor,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d};
const addYears=(date,n,anchorMonth,anchorDay)=>{const y=date.getFullYear()+n;return new Date(y,anchorMonth,Math.min(anchorDay,new Date(y,anchorMonth+1,0).getDate()),12)};
function nextDate(s,from=new Date()){
  let d=parseDate(s.date);if(Number.isNaN(d.getTime()))return null;
  const start=new Date(from.getFullYear(),from.getMonth(),from.getDate(),12);
  if(d>=start)return d;
  const anchorDay=d.getDate(),anchorMonth=d.getMonth();
  if(s.cycle==='yearly'){
    let years=start.getFullYear()-d.getFullYear();d=addYears(d,years,anchorMonth,anchorDay);
    if(d<start)d=addYears(d,1,anchorMonth,anchorDay);
  }else{
    const diff=(start.getFullYear()-d.getFullYear())*12+start.getMonth()-d.getMonth();
    d=addMonths(d,diff,anchorDay);if(d<start)d=addMonths(d,1,anchorDay);
  }
  return d;
}
function occurrenceInMonth(s,year,month){
  const start=parseDate(s.date);if(Number.isNaN(start.getTime()))return null;
  if(s.cycle==='yearly'){
    if(month!==start.getMonth()||year<start.getFullYear())return null;
    return addYears(start,year-start.getFullYear(),start.getMonth(),start.getDate());
  }
  const diff=(year-start.getFullYear())*12+month-start.getMonth();
  if(diff<0)return null;
  return addMonths(start,diff,start.getDate());
}
let subscriptions=[];try{const data=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(data))subscriptions=data.filter(s=>s&&typeof s.name==='string'&&Number.isFinite(Number(s.amount))&&Number(s.amount)>0&&isDateKey(s.date)).map(s=>({...s,reminderDays:['off',0,1,3,7].includes(s.reminderDays)?s.reminderDays:3}));}catch(e){console.warn('Saved subscriptions could not be loaded',e)}
let selected=new Set(),calendarOffset=0,toastTimer;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(subscriptions));return true}catch(e){console.warn('Subscriptions could not be saved',e);notify('Could not save: browser storage may be disabled.');return false}}
function notify(message){const toast=$('toast');toast.textContent=t(message);toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3200)}
const REMINDER_KEY=`${KEY}:shown-reminders`,sessionReminders=new Set();
function updateNotificationStatus(){
 const button=$('enableNotifications'),status=$('notificationStatus');
 if(!('Notification'in window)||!window.isSecureContext){button.disabled=true;status.textContent='Browser notifications are unavailable. In-site reminders still work.';return}
 if(Notification.permission==='granted'){button.disabled=true;button.textContent='Notifications enabled';status.textContent='Browser notifications are sent while this site is open.';return}
 if(Notification.permission==='denied'){button.disabled=true;status.textContent='Notifications are blocked. In-site reminders still work.';return}
 button.disabled=false;status.textContent='';
}
function checkRenewalReminders(){
 const today=new Date(),due=[];
 for(const subscription of subscriptions){
  if(subscription.reminderDays==='off')continue;
  const renewal=nextDate(subscription,today);if(!renewal)continue;
  const days=daysBetween(today,renewal),remindOn=Number(subscription.reminderDays);
  if(days!==remindOn)continue;
  const reminderId=`${subscription.id}:${dateKey(renewal)}`;
  if(sessionReminders.has(reminderId))continue;
  let shown=[];try{const stored=JSON.parse(localStorage.getItem(REMINDER_KEY)||'[]');if(Array.isArray(stored))shown=stored.filter(value=>typeof value==='string')}catch(e){console.warn('Saved reminder history could not be loaded',e)}
  if(shown.includes(reminderId))continue;
  sessionReminders.add(reminderId);shown.push(reminderId);
  try{localStorage.setItem(REMINDER_KEY,JSON.stringify(shown.slice(-200)))}catch(e){console.warn('Reminder history could not be saved',e)}
  const message=days===0?t('{name} renews today.',{name:subscription.name}):t(days===1?'{name} renews in {count} day.':'{name} renews in {count} days.',{name:subscription.name,count:days});
  if('Notification'in window&&window.isSecureContext&&Notification.permission==='granted'){
   try{const notification=new Notification(t('Subscription renewal reminder'),{body:message,tag:reminderId});notification.onclick=()=>{window.focus();notification.close()}}
   catch(e){console.warn('Browser renewal notification could not be displayed',e)}
  }
  due.push(message);
 }
 if(due.length)notify(due[0]);
}
function exportBackup(){
 if(!subscriptions.length){notify('No subscriptions to export.');return}
 try{
  const backup={format:'subscription-detective-backup',version:1,exportedAt:new Date().toISOString(),subscriptions};
  const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'})),link=document.createElement('a');
  link.href=url;link.download=`subscription-detective-backup-${dateKey(new Date())}.json`;document.body.append(link);link.click();setTimeout(()=>link.remove(),100);setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Backup exported.');
 }catch(e){console.error('Backup export failed',e);notify('Could not export backup.')}
}
function validateBackup(backup){
 if(!backup||backup.format!=='subscription-detective-backup'||backup.version!==1||!Array.isArray(backup.subscriptions)||backup.subscriptions.length>5000)return null;
 const ids=new Set(),clean=[];
 for(const item of backup.subscriptions){
  if(!item||typeof item.id!=='string'||!item.id||item.id.length>100||ids.has(item.id)||typeof item.name!=='string'||!item.name.trim()||item.name.length>50||!Number.isFinite(Number(item.amount))||Number(item.amount)<=0||Number(item.amount)>1000000||!['monthly','yearly'].includes(item.cycle)||!CATEGORIES.includes(item.category)||!isDateKey(item.date)||(item.lastUsed&&!isDateKey(item.lastUsed))||(item.color&&!/^#[0-9a-fA-F]{6}$/.test(item.color))||(item.reminderDays!==undefined&&!['off',0,1,3,7].includes(item.reminderDays)))return null;
  ids.add(item.id);clean.push({...item,name:item.name.trim(),amount:Number(item.amount),color:item.color||COLORS[item.category],lastUsed:item.lastUsed||'',reminderDays:item.reminderDays??3});
 }
 return clean;
}
async function importBackup(file){
 if(!file)return;
 if(file.size>2*1024*1024){notify('This backup is invalid or contains unsupported data.');return}
 try{
  const parsed=JSON.parse(await file.text()),restored=validateBackup(parsed);
  if(!restored){notify('This backup is invalid or contains unsupported data.');return}
  if(!confirm(t('Importing this backup will replace your current subscriptions. Continue?')))return;
  try{localStorage.setItem(KEY,JSON.stringify(restored))}catch(e){console.warn('Imported subscriptions could not be saved',e);notify('Could not import backup: browser storage may be disabled.');return}
  subscriptions=restored;selected.clear();sessionReminders.clear();render();notify('Backup imported successfully.');checkRenewalReminders();
 }catch(e){console.warn('Backup file could not be read',e);notify('Could not read backup file.')}
}
function totals(){return subscriptions.reduce((a,s)=>a+monthly(s),0)}
function renderStats(){const total=totals();$('monthlyTotal').textContent=money(total);$('yearlyTotal').textContent=money(total*12);$('activeCount').textContent=language==='ar'?latinizeDigits(Number(subscriptions.length).toLocaleString('ar')):Number(subscriptions.length).toLocaleString(language==='he'?'he-IL':'en');
 const upcoming=subscriptions.map(s=>({s,d:nextDate(s)})).filter(x=>x.d).sort((a,b)=>a.d-b.d)[0];
 $('nextRenewal').textContent=upcoming?formatDate(upcoming.d):'—';$('nextRenewalName').textContent=upcoming?upcoming.s.name:t('No upcoming renewals');
 $('todayLabel').textContent=new Date().toLocaleDateString(language==='he'?'he-IL':language==='ar'?'ar-u-nu-latn':'en-GB',{month:'long',year:'numeric'});
 const breakdown=CATEGORIES.map(cat=>({cat,sum:subscriptions.filter(s=>s.category===cat).reduce((a,s)=>a+monthly(s),0)})).filter(x=>x.sum>0).sort((a,b)=>b.sum-a.sum);
 $('categoryBreakdown').innerHTML=breakdown.length?breakdown.map(({cat,sum})=>`<div class="breakdown-row"><div class="breakdown-label"><strong>${safe(t(cat))}</strong><span>${money(sum)} ${language==='he'?'לחודש':language==='ar'?'شهريًا':'/ mo'}</span></div><div class="track"><div class="fill" style="width:${total?100*sum/total:0}%;background:${COLORS[cat]}"></div></div></div>`).join(''):'<p class="muted">Add subscriptions to see your spending by category.</p>';
 const now=new Date(),stale=subscriptions.filter(s=>s.lastUsed&&daysBetween(parseDate(s.lastUsed),now)>=30);
 if(stale.length){$('insightTitle').textContent=t(stale.length===1?'{count} subscription worth a second look.':'{count} subscriptions worth a second look.',{count:stale.length});$('insightText').textContent=t(stale.length===1?'You marked {count} subscription as unused for 30+ days. Could you save on one of them?':'You marked {count} subscriptions as unused for 30+ days. Could you save on one of them?',{count:stale.length})}
 else if(subscriptions.length){$('insightTitle').textContent=t("{amount} a year. That's the real number.",{amount:money(total*12)});$('insightText').textContent=t(subscriptions.length===1?'Your {count} subscription costs {amount} per month. Visit the savings lab to explore alternatives.':'Your {count} subscriptions cost {amount} per month. Visit the savings lab to explore alternatives.',{count:subscriptions.length,amount:money(total)})}
 else{$('insightTitle').textContent=t('Every subscription tells a story.');$('insightText').textContent=t('Add your first subscription to uncover where your money goes.')}
 translatePage();
}
function renderTable(){const search=$('searchInput').value.toLowerCase().trim(),filter=$('categoryFilter').value;
 const rows=subscriptions.filter(s=>(filter==='all'||s.category===filter)&&(`${s.name} ${s.category}`).toLowerCase().includes(search)).sort((a,b)=>nextDate(a)-nextDate(b));
 $('subscriptionsBody').innerHTML=rows.map(s=>{const d=nextDate(s),days=daysBetween(new Date(),d);return `<tr><td><div class="sub-identity"><div class="sub-avatar" style="background:${/^#[0-9a-fA-F]{6}$/.test(s.color)?s.color:COLORS.Other}">${safe(s.name[0].toUpperCase())}</div><div><strong>${safe(s.name)}</strong><small>${safe(t(s.category))}</small></div></div></td><td><strong>${money(s.amount)}</strong></td><td><span class="pill">${t(s.cycle==='yearly'?'Yearly':'Monthly')}</span></td><td class="${days<=7?'soon':''}">${formatDate(d)}${days<=7?`<small style="display:block">${days===0?t('Today'):t(days===1?'In {count} day':'In {count} days',{count:days})}</small>`:''}</td><td><button class="action-btn" data-edit="${safe(s.id)}">${t('Edit')}</button><button class="action-btn delete" data-delete="${safe(s.id)}">${t('Delete')}</button></td></tr>`}).join('');
 $('emptyState').hidden=rows.length>0;translatePage();
}
function renderCalendar(){const now=new Date(),target=new Date(now.getFullYear(),now.getMonth()+calendarOffset,1,12);const y=target.getFullYear(),m=target.getMonth();$('calendarTitle').textContent=target.toLocaleDateString(language==='he'?'he-IL':language==='ar'?'ar-u-nu-latn':'en-GB',{month:'long',year:'numeric'});
 const first=(target.getDay()+6)%7,days=new Date(y,m+1,0).getDate();let html=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="day-name">${d}</div>`).join('');
 for(let cell=0;cell<42;cell++){const num=cell-first+1;if(num<1||num>days){html+='<div class="day outside"></div>';continue}
 const items=subscriptions.filter(s=>{const d=occurrenceInMonth(s,y,m);return d&&d.getDate()===num});const today=y===now.getFullYear()&&m===now.getMonth()&&num===now.getDate();
 html+=`<div class="day ${today?'today':''} ${items.length?'has-renewal':''}" title="${safe(items.map(s=>s.name).join(', '))}">${num}<div>${items.map(()=>'<span class="dot"></span>').join('')}</div></div>`;
 }$('calendarGrid').innerHTML=html;
 const next=subscriptions.map(s=>({s,d:nextDate(s)})).filter(x=>x.d).sort((a,b)=>a.d-b.d).slice(0,5);
 $('renewalList').innerHTML=next.length?next.map(({s,d})=>`<div class="renewal-entry"><div><strong>${safe(s.name)}</strong><small>${formatDate(d)}</small></div><span class="price">${money(s.amount)}</span></div>`).join(''):'<p class="muted">No upcoming renewals yet.</p>';translatePage();
}
function renderSavings(){selected=new Set([...selected].filter(id=>subscriptions.some(s=>s.id===id)));
 $('savingsOptions').innerHTML=subscriptions.length?subscriptions.map(s=>`<div class="save-option"><label><input type="checkbox" data-save="${safe(s.id)}" ${selected.has(s.id)?'checked':''}/><span>${safe(s.name)}</span></label><small>${money(monthly(s))} ${language==='he'?'לחודש':language==='ar'?'شهريًا':'/ mo'}</small></div>`).join(''):'<p class="muted">Add subscriptions to explore how much you could save.</p>';
 const savings=subscriptions.filter(s=>selected.has(s.id)).reduce((a,s)=>a+monthly(s),0);$('savingsYear').textContent=money(savings*12);$('savingsMonth').textContent=money(savings);$('newMonthly').textContent=money(totals()-savings);$('selectedCount').textContent=selected.size;translatePage();
}
function render(){renderStats();renderTable();renderCalendar();renderSavings();updateNotificationStatus();translatePage()}
function openForm(id){$('subscriptionForm').reset();$('editId').value='';$('subDate').value=dateKey(new Date());$('subColor').value='#8c4765';$('subReminder').value='3';$('dialogTitle').textContent=t('Add a subscription');
 if(id){const s=subscriptions.find(x=>x.id===id);if(!s)return;$('editId').value=s.id;$('subName').value=s.name;$('subAmount').value=s.amount;$('subCycle').value=s.cycle;$('subCategory').value=s.category;$('subDate').value=s.date;$('subLastUsed').value=s.lastUsed||'';$('subColor').value=s.color;$('subReminder').value=String(s.reminderDays??3);$('dialogTitle').textContent=t('Edit subscription')}
 $('subscriptionDialog').showModal();$('subName').focus();}
function saveForm(e){e.preventDefault();const name=$('subName').value.trim(),amount=Number($('subAmount').value),date=$('subDate').value,lastUsed=$('subLastUsed').value;
 if(!name||!Number.isFinite(amount)||amount<=0||amount>1000000||!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parseDate(date).getTime())){notify('Please enter a valid name, amount, and renewal date.');return}
 if(lastUsed&&parseDate(lastUsed)>new Date()){notify('Last used date cannot be in the future.');return}
 const id=$('editId').value||((typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():`${Date.now()}-${Math.random()}`);
 const reminderValue=$('subReminder').value,s={id,name,amount,cycle:$('subCycle').value,category:$('subCategory').value,date,lastUsed,color:$('subColor').value,reminderDays:reminderValue==='off'?'off':Number(reminderValue)};
 const i=subscriptions.findIndex(x=>x.id===id);if(i>=0)subscriptions[i]=s;else subscriptions.push(s);
 persist();render();$('subscriptionDialog').close();notify(i>=0?'Subscription updated.':'Subscription added.');checkRenewalReminders();}
function demo(){if(subscriptions.length&&!confirm('Add sample subscriptions to your existing list?'))return;
 const now=new Date();const examples=[['Netflix',54.9,'monthly','Entertainment',5],['Spotify',21.9,'monthly','Entertainment',12],['ChatGPT',79,'monthly','Productivity',19],['Canva',399,'yearly','Software',28],['Gym Membership',149,'monthly','Fitness',3]];
 for(const [name,amount,cycle,category,days] of examples){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+days,12);subscriptions.push({id:(typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():`${Date.now()}-${Math.random()}`,name,amount,cycle,category,date:dateKey(d),lastUsed:'',color:COLORS[category],reminderDays:3})}
 persist();render();notify('Demo subscriptions added. Edit or delete them anytime.');}
for(const id of ['addTop','addHero','addList','emptyAdd'])$(id).addEventListener('click',()=>openForm());
$('closeDialog').addEventListener('click',()=>$('subscriptionDialog').close());$('cancelDialog').addEventListener('click',()=>$('subscriptionDialog').close());$('subscriptionForm').addEventListener('submit',saveForm);
$('subscriptionDialog').addEventListener('click',e=>{if(e.target===$('subscriptionDialog'))$('subscriptionDialog').close()});
$('subscriptionsBody').addEventListener('click',e=>{const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');if(edit)openForm(edit.dataset.edit);if(del){const s=subscriptions.find(x=>x.id===del.dataset.delete);if(s&&confirm(t('Delete {name}?',{name:s.name}))){subscriptions=subscriptions.filter(x=>x.id!==s.id);persist();render();notify('Subscription deleted.')}}});
$('savingsOptions').addEventListener('change',e=>{if(!e.target.matches('[data-save]'))return;e.target.checked?selected.add(e.target.dataset.save):selected.delete(e.target.dataset.save);renderSavings()});
$('searchInput').addEventListener('input',renderTable);$('categoryFilter').addEventListener('change',renderTable);
$('prevMonth').addEventListener('click',()=>{calendarOffset--;renderCalendar()});$('nextMonth').addEventListener('click',()=>{calendarOffset++;renderCalendar()});$('thisMonth').addEventListener('click',()=>{calendarOffset=0;renderCalendar()});
$('loadDemo').addEventListener('click',demo);$('insightAction').addEventListener('click',()=>{$('subscriptions').scrollIntoView({behavior:'smooth'})});
$('exportData').addEventListener('click',exportBackup);
$('importData').addEventListener('click',()=>$('importFile').click());
$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';await importBackup(file)});
$('enableNotifications').addEventListener('click',async()=>{
 if(!('Notification'in window)||!window.isSecureContext){updateNotificationStatus();return}
 try{await Notification.requestPermission();updateNotificationStatus();translatePage();if(Notification.permission==='granted')checkRenewalReminders()}
 catch(e){console.warn('Browser notification permission could not be requested',e);notify('Allow notifications in your browser to enable them.')}
});
$('clearAll').addEventListener('click',()=>{if(!confirm(t('Permanently delete all subscriptions saved in this browser?')))return;subscriptions=[];selected.clear();persist();render();notify('All local data cleared.')});
document.querySelectorAll('[data-nav]').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('[data-nav]').forEach(n=>n.classList.remove('active'));a.classList.add('active')}));
$('languageSelect').addEventListener('change',e=>setLanguage(e.target.value));
render();
checkRenewalReminders();
setInterval(checkRenewalReminders,60_000);
