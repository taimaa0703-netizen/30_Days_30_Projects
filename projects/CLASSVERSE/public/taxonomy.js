/* CLASSVERSE educational taxonomy: levels, grades, subjects, topics, game types, and real games.
   Plain data plus pure filter functions. Works in the browser (window.CLASSVERSE_TAXONOMY) and Node (require).
   The shape maps 1:1 to future database tables: levels, subjects, topics, game_types, games. */
(function (root) {
'use strict';

// Unified grade scale: 1-6 elementary, 7-9 middle, 10-12 high, 13-16 undergraduate years 1-4, 17 graduate.
const LEVELS = [
  { id: 'elementary', from: 1, to: 6, icon: '🎒', name: { en: 'Elementary School', he: 'בית ספר יסודי', ar: 'المرحلة الابتدائية' } },
  { id: 'middle', from: 7, to: 9, icon: '📘', name: { en: 'Middle School', he: 'חטיבת ביניים', ar: 'المرحلة الإعدادية' } },
  { id: 'high', from: 10, to: 12, icon: '🎓', name: { en: 'High School', he: 'חטיבה עליונה', ar: 'المرحلة الثانوية' } },
  { id: 'higher', from: 13, to: 17, icon: '🏛️', name: { en: 'Post-secondary & Higher Education', he: 'לימודים על־תיכוניים והשכלה גבוהה', ar: 'ما بعد الثانوية والتعليم العالي' } }
];
const HE_GRADES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב'];
const AR_GRADES = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];
const gradeLabel = (grade, lang) => {
  if (grade >= 1 && grade <= 12) {
    if (lang === 'he') return `כיתה ${HE_GRADES[grade - 1]}`;
    if (lang === 'ar') return `الصف ${AR_GRADES[grade - 1]}`;
    return `Grade ${grade}`;
  }
  if (grade >= 13 && grade <= 16) {
    const year = grade - 12;
    if (lang === 'he') return `שנה ${year} (תואר ראשון)`;
    if (lang === 'ar') return `السنة ${year} (بكالوريوس)`;
    return `Year ${year} (undergraduate)`;
  }
  if (grade === 17) return lang === 'he' ? 'תארים מתקדמים' : lang === 'ar' ? 'الدراسات العليا' : 'Graduate studies';
  return String(grade);
};
const GRADES = Array.from({ length: 17 }, (_, i) => i + 1);
const levelOfGrade = grade => (LEVELS.find(l => grade >= l.from && grade <= l.to) || {}).id;

const DIFFICULTIES = [
  { id: 'easy', icon: '🌱', name: { en: 'Easy', he: 'קל', ar: 'سهل' } },
  { id: 'medium', icon: '🌿', name: { en: 'Medium', he: 'בינוני', ar: 'متوسط' } },
  { id: 'hard', icon: '🌳', name: { en: 'Challenging', he: 'מאתגר', ar: 'صعب' } }
];
const LANGUAGES = [
  { id: 'en', name: { en: 'English', he: 'אנגלית', ar: 'الإنجليزية' } },
  { id: 'he', name: { en: 'Hebrew', he: 'עברית', ar: 'العبرية' } },
  { id: 'ar', name: { en: 'Arabic', he: 'ערבית', ar: 'العربية' } }
];

// ids match adventure.js GAME_TYPES; `playable` marks what can be hosted live today.
const GAME_TYPES = [
  { id: 'quiz', icon: '❓', playable: true, name: { en: 'Multiple-choice quiz', he: 'חידון רב־ברירה', ar: 'اختبار اختيار من متعدد' } },
  { id: 'equation', icon: '➗', name: { en: 'Equation solving', he: 'פתרון משוואות', ar: 'حل المعادلات' } },
  { id: 'calculation', icon: '🧮', name: { en: 'Quick calculation', he: 'חישוב מהיר', ar: 'حساب سريع' } },
  { id: 'numberPuzzle', icon: '🔢', name: { en: 'Number puzzle', he: 'חידת מספרים', ar: 'ألغاز الأعداد' } },
  { id: 'spelling', icon: '🔤', name: { en: 'Spelling', he: 'איות', ar: 'الإملاء' } },
  { id: 'wordMatch', icon: '🔗', name: { en: 'Word matching', he: 'התאמת מילים', ar: 'مطابقة الكلمات' } },
  { id: 'sentenceBuild', icon: '🧩', name: { en: 'Sentence building', he: 'בניית משפטים', ar: 'بناء الجمل' } },
  { id: 'classification', icon: '🗂️', name: { en: 'Classification', he: 'מיון וסיווג', ar: 'التصنيف' } },
  { id: 'process', icon: '🔁', name: { en: 'Process sequencing', he: 'סידור תהליכים', ar: 'ترتيب العمليات' } },
  { id: 'concept', icon: '💡', name: { en: 'Concept check', he: 'בדיקת מושגים', ar: 'اختبار المفاهيم' } },
  { id: 'timeline', icon: '⏳', name: { en: 'Timeline ordering', he: 'סידור ציר זמן', ar: 'ترتيب الخط الزمني' } },
  { id: 'eventMatch', icon: '📜', name: { en: 'Event matching', he: 'התאמת אירועים', ar: 'مطابقة الأحداث' } },
  { id: 'historyQuiz', icon: '🏺', name: { en: 'History quiz', he: 'חידון היסטורי', ar: 'اختبار تاريخي' } },
  { id: 'logicPuzzle', icon: '🧠', name: { en: 'Logic puzzle', he: 'חידת היגיון', ar: 'لغز منطقي' } },
  { id: 'algorithm', icon: '🧭', name: { en: 'Algorithm ordering', he: 'סידור אלגוריתם', ar: 'ترتيب الخوارزمية' } },
  { id: 'debugging', icon: '🐞', name: { en: 'Debugging', he: 'איתור באגים', ar: 'تصحيح الأخطاء' } }
];

const GROUPS = [
  { id: 'lang', name: { en: 'Languages & Literature', he: 'שפות וספרות', ar: 'اللغات والأدب' } },
  { id: 'stem', name: { en: 'Math & Sciences', he: 'מתמטיקה ומדעים', ar: 'الرياضيات والعلوم' } },
  { id: 'tech', name: { en: 'Computing & Technology', he: 'מחשוב וטכנולוגיה', ar: 'الحوسبة والتكنولوجيا' } },
  { id: 'social', name: { en: 'Humanities & Society', he: 'מדעי הרוח והחברה', ar: 'العلوم الإنسانية والمجتمع' } },
  { id: 'business', name: { en: 'Economics & Business', he: 'כלכלה ועסקים', ar: 'الاقتصاد والأعمال' } },
  { id: 'creative', name: { en: 'Arts & Music', he: 'אמנות ומוזיקה', ar: 'الفنون والموسيقى' } },
  { id: 'life', name: { en: 'Health & Life', he: 'בריאות וחיים', ar: 'الصحة والحياة' } }
];

// Topic tuple: [id, fromGrade, toGrade, difficulties (e=easy m=medium h=hard), name, learning objective]
const T = (id, from, to, d, name, objective) => ({ id, from, to, difficulty: [...d].map(c => ({ e: 'easy', m: 'medium', h: 'hard' })[c]), name: { en: name[0], he: name[1], ar: name[2] }, objective: { en: objective[0], he: objective[1], ar: objective[2] } });
// Subject: id, group, icon, tint, language restriction (null = any), name, suggested game types, topics
const S = (id, group, icon, tint, lang, name, types, topics) => ({ id, group, icon, tint, custom: false, languages: lang, name: { en: name[0], he: name[1], ar: name[2] }, gameTypes: types, topics: topics.map(t => ({ ...t, id: `${id}.${t.id}`, subject: id })) });

const SUBJECTS = [
  S('math', 'stem', '🔢', 'orange', null, ['Mathematics', 'מתמטיקה', 'الرياضيات'], ['calculation', 'equation', 'numberPuzzle', 'quiz'], [
    T('multiplication', 2, 6, 'em', ['Multiplication & division', 'כפל וחילוק', 'الضرب والقسمة'], ['Recall multiplication facts and solve word problems with them.', 'שליפת עובדות כפל ופתרון בעיות מילוליות באמצעותן.', 'استرجاع جدول الضرب وحل مسائل كلامية باستخدامه.']),
    T('fractions', 3, 7, 'emh', ['Fractions & decimals', 'שברים ומספרים עשרוניים', 'الكسور والأعداد العشرية'], ['Compare, convert, and operate with fractions and decimals.', 'השוואה, המרה וביצוע פעולות בשברים ובמספרים עשרוניים.', 'المقارنة بين الكسور والأعداد العشرية وتحويلها وإجراء العمليات عليها.']),
    T('geometry', 3, 9, 'emh', ['Geometry & measurement', 'גאומטריה ומדידה', 'الهندسة والقياس'], ['Calculate perimeter, area, and angles of common shapes.', 'חישוב היקף, שטח וזוויות של צורות נפוצות.', 'حساب المحيط والمساحة والزوايا للأشكال الشائعة.']),
    T('algebra', 7, 12, 'mh', ['Algebra & equations', 'אלגברה ומשוואות', 'الجبر والمعادلات'], ['Solve linear and quadratic equations and model situations with them.', 'פתרון משוואות לינאריות וריבועיות ומידול מצבים באמצעותן.', 'حل المعادلات الخطية والتربيعية ونمذجة المواقف بها.']),
    T('calculus', 11, 17, 'h', ['Calculus', 'חשבון דיפרנציאלי ואינטגרלי', 'التفاضل والتكامل'], ['Differentiate and integrate functions and interpret the results.', 'גזירה ואינטגרציה של פונקציות ופרשנות התוצאות.', 'اشتقاق الدوال وتكاملها وتفسير النتائج.'])
  ]),
  S('arabic', 'lang', '🌙', 'teal', 'ar', ['Arabic Language', 'ערבית', 'اللغة العربية'], ['spelling', 'wordMatch', 'sentenceBuild', 'quiz'], [
    T('reading', 1, 6, 'em', ['Reading & vocabulary', 'קריאה ואוצר מילים', 'القراءة والمفردات'], ['Read fluently and grow everyday and academic vocabulary.', 'קריאה שוטפת והרחבת אוצר מילים יומיומי ואקדמי.', 'القراءة بطلاقة وتنمية المفردات اليومية والأكاديمية.']),
    T('grammar', 4, 12, 'emh', ['Grammar & morphology', 'דקדוק ותחביר', 'النحو والصرف'], ['Analyse sentence structure and apply grammatical rules correctly.', 'ניתוח מבנה המשפט והחלת כללי דקדוק נכונה.', 'تحليل بنية الجملة وتطبيق القواعد النحوية تطبيقًا صحيحًا.']),
    T('writing', 5, 12, 'mh', ['Writing & expression', 'כתיבה וביטוי', 'الكتابة والتعبير'], ['Write organised texts for different purposes and audiences.', 'כתיבת טקסטים מאורגנים למטרות ולקהלים שונים.', 'كتابة نصوص منظمة لأغراض وجمهور مختلفين.'])
  ]),
  S('hebrew', 'lang', '📖', 'violet', 'he', ['Hebrew Language', 'עברית', 'اللغة العبرية'], ['spelling', 'wordMatch', 'sentenceBuild', 'quiz'], [
    T('reading', 1, 6, 'em', ['Reading & vocabulary', 'קריאה ואוצר מילים', 'القراءة والمفردات'], ['Read fluently and build a rich Hebrew vocabulary.', 'קריאה שוטפת ובניית אוצר מילים עשיר בעברית.', 'القراءة بطلاقة وبناء مخزون غني من المفردات العبرية.']),
    T('grammar', 4, 12, 'emh', ['Grammar & roots', 'דקדוק ושורשים', 'القواعد والجذور'], ['Identify roots, verb patterns, and sentence parts.', 'זיהוי שורשים, בניינים וחלקי משפט.', 'تحديد الجذور وأوزان الأفعال وأجزاء الجملة.']),
    T('writing', 5, 12, 'mh', ['Writing & expression', 'כתיבה והבעה', 'الكتابة والتعبير'], ['Compose clear, well-structured texts.', 'כתיבת טקסטים בהירים ומובנים היטב.', 'تأليف نصوص واضحة ومحكمة البناء.'])
  ]),
  S('english', 'lang', '🔤', 'pink', 'en', ['English Language', 'אנגלית', 'اللغة الإنجليزية'], ['spelling', 'wordMatch', 'sentenceBuild', 'quiz'], [
    T('vocabulary', 1, 9, 'emh', ['Vocabulary', 'אוצר מילים', 'المفردات'], ['Learn and use new words in context, including opposites and word families.', 'לימוד מילים חדשות ושימוש בהן בהקשר, כולל הפכים ומשפחות מילים.', 'تعلّم مفردات جديدة واستخدامها في سياقها، ومنها الأضداد وعائلات الكلمات.']),
    T('grammar', 3, 12, 'emh', ['Grammar & parts of speech', 'דקדוק וחלקי דיבר', 'القواعد وأقسام الكلام'], ['Identify parts of speech and form plurals, tenses, and sentences correctly.', 'זיהוי חלקי דיבר ויצירת ריבוי, זמנים ומשפטים נכונים.', 'تحديد أقسام الكلام وتكوين الجمع والأزمنة والجمل بصورة صحيحة.']),
    T('academic', 11, 17, 'mh', ['Academic English', 'אנגלית אקדמית', 'الإنجليزية الأكاديمية'], ['Read academic texts and write structured arguments.', 'קריאת טקסטים אקדמיים וכתיבת טיעונים מובנים.', 'قراءة نصوص أكاديمية وكتابة حجج منظمة.'])
  ]),
  S('languages', 'lang', '🌍', 'gold', null, ['Other Languages', 'שפות נוספות', 'لغات أخرى'], ['wordMatch', 'spelling', 'sentenceBuild', 'quiz'], [
    T('basics', 3, 9, 'em', ['Greetings & everyday phrases', 'ברכות וביטויים יומיומיים', 'التحيات والعبارات اليومية'], ['Use common phrases to greet, introduce yourself, and ask simple questions.', 'שימוש בביטויים נפוצים לברכה, הצגה עצמית ושאלות פשוטות.', 'استخدام عبارات شائعة للتحية والتعريف بالنفس وطرح أسئلة بسيطة.']),
    T('grammar', 6, 12, 'mh', ['Grammar in context', 'דקדוק בהקשר', 'القواعد في السياق'], ['Apply basic grammar of a foreign language in short texts.', 'יישום דקדוק בסיסי של שפה זרה בטקסטים קצרים.', 'تطبيق القواعد الأساسية للغة أجنبية في نصوص قصيرة.']),
    T('culture', 8, 17, 'mh', ['Language & culture', 'שפה ותרבות', 'اللغة والثقافة'], ['Connect language use to the culture and history of its speakers.', 'קישור בין השימוש בשפה לתרבות ולהיסטוריה של דובריה.', 'ربط استخدام اللغة بثقافة متحدثيها وتاريخهم.'])
  ]),
  S('literature', 'lang', '📚', 'violet', null, ['Literature', 'ספרות', 'الأدب'], ['quiz', 'concept', 'sentenceBuild'], [
    T('stories', 1, 6, 'em', ['Stories & characters', 'סיפורים ודמויות', 'القصص والشخصيات'], ['Retell a story and describe characters and their motives.', 'סיפור מחדש של עלילה ותיאור דמויות ומניעיהן.', 'إعادة سرد قصة ووصف الشخصيات ودوافعها.']),
    T('poetry', 6, 12, 'mh', ['Poetry & figurative language', 'שירה ולשון ציורית', 'الشعر واللغة المجازية'], ['Interpret metaphor, imagery, and rhythm in poems.', 'פירוש מטפורות, דימויים וקצב בשירים.', 'تفسير الاستعارة والصور الفنية والإيقاع في القصائد.']),
    T('analysis', 10, 17, 'h', ['Literary analysis', 'ניתוח ספרותי', 'التحليل الأدبي'], ['Support a literary interpretation with evidence from the text.', 'ביסוס פרשנות ספרותית בראיות מן הטקסט.', 'دعم التفسير الأدبي بأدلة من النص.'])
  ]),
  S('science', 'stem', '🧪', 'teal', null, ['Science', 'מדעים', 'العلوم'], ['concept', 'classification', 'process', 'quiz'], [
    T('earth-space', 3, 8, 'em', ['Earth & space', 'כדור הארץ והחלל', 'الأرض والفضاء'], ['Describe the solar system, planets, and the Sun’s role.', 'תיאור מערכת השמש, כוכבי הלכת ותפקיד השמש.', 'وصف النظام الشمسي والكواكب ودور الشمس.']),
    T('living-things', 1, 6, 'em', ['Living things & the human body', 'יצורים חיים וגוף האדם', 'الكائنات الحية وجسم الإنسان'], ['Classify living things and describe how the body and plants function.', 'סיווג יצורים חיים ותיאור אופן פעולת הגוף והצמחים.', 'تصنيف الكائنات الحية ووصف عمل الجسم والنباتات.']),
    T('matter-energy', 4, 9, 'emh', ['Matter & energy', 'חומרים ואנרגיה', 'المادة والطاقة'], ['Explain states of matter, boiling and melting, and energy transfer.', 'הסבר מצבי צבירה, רתיחה והתכה והעברת אנרגיה.', 'شرح حالات المادة والغليان والانصهار وانتقال الطاقة.']),
    T('scientific-method', 5, 9, 'mh', ['Scientific method', 'השיטה המדעית', 'المنهج العلمي'], ['Design a fair test and draw conclusions from data.', 'תכנון ניסוי הוגן והסקת מסקנות מנתונים.', 'تصميم تجربة عادلة واستخلاص النتائج من البيانات.'])
  ]),
  S('biology', 'stem', '🧬', 'teal', null, ['Biology', 'ביולוגיה', 'الأحياء'], ['concept', 'classification', 'process', 'quiz'], [
    T('cells', 7, 17, 'mh', ['Cells & organelles', 'תאים ואברונים', 'الخلايا والعضيات'], ['Compare plant and animal cells and explain organelle functions.', 'השוואה בין תאי צמח ובעל חיים והסבר תפקידי האברונים.', 'المقارنة بين الخلايا النباتية والحيوانية وشرح وظائف العضيات.']),
    T('genetics', 9, 17, 'mh', ['Genetics & heredity', 'גנטיקה ותורשה', 'علم الوراثة'], ['Predict inheritance patterns with Punnett squares.', 'חיזוי דפוסי תורשה באמצעות לוחות פונט.', 'التنبؤ بأنماط الوراثة باستخدام مربعات بانيت.']),
    T('ecosystems', 5, 12, 'emh', ['Ecosystems & evolution', 'מערכות אקולוגיות ואבולוציה', 'النظم البيئية والتطور'], ['Trace energy flow in food webs and explain natural selection.', 'מעקב אחר זרימת אנרגיה ברשתות מזון והסבר הברירה הטבעית.', 'تتبّع انتقال الطاقة في الشبكات الغذائية وشرح الانتخاب الطبيعي.'])
  ]),
  S('chemistry', 'stem', '⚗️', 'orange', null, ['Chemistry', 'כימיה', 'الكيمياء'], ['classification', 'concept', 'process', 'quiz'], [
    T('atoms', 8, 17, 'mh', ['Atoms & the periodic table', 'אטומים וטבלה מחזורית', 'الذرات والجدول الدوري'], ['Relate an element’s position in the periodic table to its properties.', 'קישור בין מיקום יסוד בטבלה המחזורית לתכונותיו.', 'ربط موقع العنصر في الجدول الدوري بخصائصه.']),
    T('reactions', 9, 17, 'mh', ['Chemical reactions', 'תגובות כימיות', 'التفاعلات الكيميائية'], ['Balance chemical equations and classify reaction types.', 'איזון משוואות כימיות וסיווג סוגי תגובות.', 'موازنة المعادلات الكيميائية وتصنيف أنواع التفاعلات.']),
    T('organic', 12, 17, 'h', ['Organic chemistry', 'כימיה אורגנית', 'الكيمياء العضوية'], ['Name organic compounds and predict functional-group behaviour.', 'מתן שמות לתרכובות אורגניות וחיזוי התנהגות קבוצות פונקציונליות.', 'تسمية المركبات العضوية والتنبؤ بسلوك المجموعات الوظيفية.'])
  ]),
  S('physics', 'stem', '⚛️', 'violet', null, ['Physics', 'פיזיקה', 'الفيزياء'], ['equation', 'calculation', 'concept', 'quiz'], [
    T('motion', 8, 17, 'mh', ['Motion & forces', 'תנועה וכוחות', 'الحركة والقوى'], ['Apply Newton’s laws to predict motion.', 'יישום חוקי ניוטון לחיזוי תנועה.', 'تطبيق قوانين نيوتن للتنبؤ بالحركة.']),
    T('electricity', 8, 17, 'mh', ['Electricity & magnetism', 'חשמל ומגנטיות', 'الكهرباء والمغناطيسية'], ['Analyse simple circuits using voltage, current, and resistance.', 'ניתוח מעגלים פשוטים באמצעות מתח, זרם והתנגדות.', 'تحليل دوائر بسيطة باستخدام الجهد والتيار والمقاومة.']),
    T('waves', 9, 17, 'mh', ['Waves, light & sound', 'גלים, אור וקול', 'الموجات والضوء والصوت'], ['Describe wave properties and how light and sound behave.', 'תיאור תכונות גלים והתנהגות אור וקול.', 'وصف خصائص الموجات وسلوك الضوء والصوت.'])
  ]),
  S('geography', 'social', '🗺️', 'teal', null, ['Geography', 'גאוגרפיה', 'الجغرافيا'], ['quiz', 'classification', 'wordMatch'], [
    T('maps', 2, 8, 'em', ['Maps & directions', 'מפות וכיוונים', 'الخرائط والاتجاهات'], ['Read maps, scales, and coordinates.', 'קריאת מפות, קנה מידה וקואורדינטות.', 'قراءة الخرائط ومقاييس الرسم والإحداثيات.']),
    T('countries', 3, 9, 'em', ['Countries & capitals', 'מדינות וערי בירה', 'الدول والعواصم'], ['Locate countries and capitals and describe their regions.', 'איתור מדינות וערי בירה ותיאור האזורים שלהן.', 'تحديد مواقع الدول وعواصمها ووصف مناطقها.']),
    T('human-geo', 9, 17, 'mh', ['Population & urbanisation', 'אוכלוסייה ועיור', 'السكان والتحضّر'], ['Explain migration, urban growth, and resource use.', 'הסבר הגירה, צמיחה עירונית ושימוש במשאבים.', 'شرح الهجرة والنمو الحضري واستخدام الموارد.'])
  ]),
  S('history', 'social', '🏺', 'gold', null, ['History', 'היסטוריה', 'التاريخ'], ['timeline', 'eventMatch', 'historyQuiz', 'quiz'], [
    T('ancient', 4, 9, 'em', ['Ancient civilizations', 'תרבויות עתיקות', 'الحضارات القديمة'], ['Describe ancient civilizations, their places, and achievements.', 'תיאור תרבויות עתיקות, מקומותיהן והישגיהן.', 'وصف الحضارات القديمة وأماكنها وإنجازاتها.']),
    T('discoveries', 5, 10, 'mh', ['Inventions & milestones', 'המצאות ואבני דרך', 'الاختراعات والمحطات الكبرى'], ['Place inventions and milestones, such as printing and space travel, in time.', 'מיקום המצאות ואבני דרך, כמו הדפוס וטיסות החלל, בזמן.', 'وضع الاختراعات والمحطات الكبرى، كالطباعة وارتياد الفضاء، في سياقها الزمني.']),
    T('modern', 9, 17, 'mh', ['Modern history', 'ההיסטוריה המודרנית', 'التاريخ الحديث'], ['Analyse causes and consequences of major modern events.', 'ניתוח סיבות ותוצאות של אירועים מודרניים מרכזיים.', 'تحليل أسباب الأحداث الحديثة الكبرى ونتائجها.'])
  ]),
  S('civics', 'social', '🏛️', 'orange', null, ['Civics', 'אזרחות', 'التربية المدنية'], ['quiz', 'concept', 'classification'], [
    T('rights', 3, 9, 'em', ['Rights & responsibilities', 'זכויות וחובות', 'الحقوق والواجبات'], ['Explain the rights and responsibilities of members of a community.', 'הסבר זכויותיהם וחובותיהם של חברי קהילה.', 'شرح حقوق أفراد المجتمع وواجباتهم.']),
    T('government', 7, 12, 'mh', ['Government & democracy', 'ממשל ודמוקרטיה', 'الحكم والديمقراطية'], ['Compare branches of government and democratic processes.', 'השוואה בין רשויות השלטון והליכים דמוקרטיים.', 'المقارنة بين سلطات الحكم والعمليات الديمقراطية.']),
    T('law', 11, 17, 'h', ['Law & public policy', 'משפט ומדיניות ציבורית', 'القانون والسياسات العامة'], ['Evaluate how laws and policies affect society.', 'הערכת השפעת חוקים ומדיניות על החברה.', 'تقييم أثر القوانين والسياسات في المجتمع.'])
  ]),
  S('cs', 'tech', '💻', 'violet', null, ['Computer Science', 'מדעי המחשב', 'علوم الحاسوب'], ['logicPuzzle', 'algorithm', 'debugging', 'quiz'], [
    T('algorithms', 5, 17, 'emh', ['Algorithms & logic', 'אלגוריתמים והיגיון', 'الخوارزميات والمنطق'], ['Order steps into a correct algorithm and trace its result.', 'סידור צעדים לאלגוריתם נכון ומעקב אחר תוצאתו.', 'ترتيب الخطوات في خوارزمية صحيحة وتتبّع نتيجتها.']),
    T('data', 7, 17, 'mh', ['Data & binary', 'נתונים ובינארי', 'البيانات والنظام الثنائي'], ['Represent numbers and text in binary.', 'ייצוג מספרים וטקסט בבינארי.', 'تمثيل الأعداد والنصوص بالنظام الثنائي.']),
    T('networks', 9, 17, 'mh', ['Networks & security', 'רשתות ואבטחה', 'الشبكات والأمان'], ['Explain how data travels and how to stay safe online.', 'הסבר כיצד מידע עובר ברשת וכיצד לשמור על ביטחון באינטרנט.', 'شرح كيفية انتقال البيانات وكيفية الحفاظ على الأمان عبر الإنترنت.'])
  ]),
  S('programming', 'tech', '⌨️', 'teal', null, ['Programming', 'תכנות', 'البرمجة'], ['debugging', 'algorithm', 'logicPuzzle', 'quiz'], [
    T('visual', 3, 8, 'em', ['Visual & block coding', 'תכנות חזותי ובלוקים', 'البرمجة المرئية بالكتل'], ['Build simple programs with sequences, loops, and events.', 'בניית תוכניות פשוטות עם רצפים, לולאות ואירועים.', 'بناء برامج بسيطة باستخدام التسلسل والحلقات والأحداث.']),
    T('fundamentals', 8, 17, 'mh', ['Variables, loops & functions', 'משתנים, לולאות ופונקציות', 'المتغيرات والحلقات والدوال'], ['Write and trace code that uses variables, conditions, loops, and functions.', 'כתיבה ומעקב אחר קוד עם משתנים, תנאים, לולאות ופונקציות.', 'كتابة شيفرة تستخدم المتغيرات والشروط والحلقات والدوال وتتبّعها.']),
    T('debugging', 9, 17, 'mh', ['Debugging & testing', 'איתור באגים ובדיקות', 'تصحيح الأخطاء والاختبار'], ['Find and fix errors using systematic tests.', 'מציאת שגיאות ותיקונן באמצעות בדיקות שיטתיות.', 'اكتشاف الأخطاء وإصلاحها باختبارات منهجية.'])
  ]),
  S('technology', 'tech', '🔧', 'orange', null, ['Technology', 'טכנולוגיה', 'التكنولوجيا'], ['quiz', 'classification', 'process'], [
    T('digital-literacy', 2, 9, 'em', ['Digital literacy', 'אוריינות דיגיטלית', 'الثقافة الرقمية'], ['Use digital tools responsibly and evaluate online sources.', 'שימוש אחראי בכלים דיגיטליים והערכת מקורות באינטרנט.', 'استخدام الأدوات الرقمية بمسؤولية وتقييم المصادر على الإنترنت.']),
    T('design', 5, 12, 'mh', ['Design & engineering', 'עיצוב והנדסה', 'التصميم والهندسة'], ['Follow the design process from problem to prototype.', 'ביצוע תהליך עיצוב מבעיה ועד אב־טיפוס.', 'اتباع عملية التصميم من المشكلة إلى النموذج الأولي.']),
    T('emerging', 10, 17, 'mh', ['Emerging technologies', 'טכנולוגיות מתפתחות', 'التقنيات الناشئة'], ['Discuss benefits and risks of AI and automation.', 'דיון ביתרונות ובסיכונים של בינה מלאכותית ואוטומציה.', 'مناقشة فوائد الذكاء الاصطناعي والأتمتة ومخاطرها.'])
  ]),
  S('statistics', 'stem', '📊', 'teal', null, ['Statistics', 'סטטיסטיקה', 'الإحصاء'], ['calculation', 'concept', 'classification', 'quiz'], [
    T('data-display', 4, 9, 'em', ['Charts & data displays', 'תרשימים והצגת נתונים', 'الرسوم البيانية وعرض البيانات'], ['Read and build bar charts, line graphs, and tables.', 'קריאה ובניית תרשימי עמודות, גרפים וטבלאות.', 'قراءة الأعمدة البيانية والخطوط والجداول وإنشاؤها.']),
    T('probability', 7, 12, 'mh', ['Probability', 'הסתברות', 'الاحتمالات'], ['Compute the probability of simple and compound events.', 'חישוב הסתברות של מאורעות פשוטים ומורכבים.', 'حساب احتمال الحوادث البسيطة والمركبة.']),
    T('inference', 12, 17, 'h', ['Statistical inference', 'היסק סטטיסטי', 'الاستدلال الإحصائي'], ['Interpret confidence intervals and hypothesis tests.', 'פרשנות רווחי סמך ובדיקות השערות.', 'تفسير فترات الثقة واختبارات الفرضيات.'])
  ]),
  S('economics', 'business', '💹', 'gold', null, ['Economics', 'כלכלה', 'الاقتصاد'], ['concept', 'classification', 'quiz'], [
    T('basics', 6, 10, 'em', ['Needs, wants & choices', 'צרכים, רצונות ובחירות', 'الحاجات والرغبات والخيارات'], ['Explain scarcity and the trade-offs behind choices.', 'הסבר מחסור וויתורים העומדים מאחורי בחירות.', 'شرح الندرة والمفاضلات التي تقف وراء الخيارات.']),
    T('markets', 10, 17, 'mh', ['Supply, demand & markets', 'היצע, ביקוש ושווקים', 'العرض والطلب والأسواق'], ['Predict how price changes when supply or demand shifts.', 'חיזוי שינוי מחירים כשההיצע או הביקוש משתנים.', 'التنبؤ بتغيّر السعر عند تحوّل العرض أو الطلب.']),
    T('macro', 12, 17, 'h', ['Macroeconomics', 'מקרו־כלכלה', 'الاقتصاد الكلي'], ['Interpret inflation, growth, and unemployment indicators.', 'פרשנות מדדי אינפלציה, צמיחה ואבטלה.', 'تفسير مؤشرات التضخم والنمو والبطالة.'])
  ]),
  S('business', 'business', '💼', 'orange', null, ['Business', 'עסקים', 'إدارة الأعمال'], ['concept', 'classification', 'process', 'quiz'], [
    T('entrepreneurship', 8, 17, 'em', ['Entrepreneurship', 'יזמות', 'ريادة الأعمال'], ['Turn an idea into a simple business plan.', 'הפיכת רעיון לתוכנית עסקית פשוטה.', 'تحويل فكرة إلى خطة عمل مبسطة.']),
    T('finance', 10, 17, 'mh', ['Accounting & finance', 'חשבונאות ומימון', 'المحاسبة والتمويل'], ['Read basic financial statements and compute profit.', 'קריאת דוחות כספיים בסיסיים וחישוב רווח.', 'قراءة القوائم المالية الأساسية وحساب الربح.']),
    T('management', 12, 17, 'mh', ['Management & teamwork', 'ניהול ועבודת צוות', 'الإدارة والعمل الجماعي'], ['Compare leadership styles and team processes.', 'השוואה בין סגנונות מנהיגות לתהליכי צוות.', 'المقارنة بين أساليب القيادة وعمليات الفريق.'])
  ]),
  S('marketing', 'business', '📣', 'pink', null, ['Marketing', 'שיווק', 'التسويق'], ['concept', 'classification', 'quiz'], [
    T('basics', 10, 17, 'em', ['Marketing mix (4Ps)', 'תמהיל השיווק (4P)', 'المزيج التسويقي (4Ps)'], ['Apply product, price, place, and promotion to a case.', 'יישום מוצר, מחיר, מקום וקידום על מקרה בוחן.', 'تطبيق المنتج والسعر والمكان والترويج على حالة دراسية.']),
    T('consumer', 11, 17, 'mh', ['Consumer behaviour', 'התנהגות צרכנים', 'سلوك المستهلك'], ['Explain what influences buying decisions.', 'הסבר הגורמים המשפיעים על החלטות רכישה.', 'شرح العوامل المؤثرة في قرارات الشراء.']),
    T('digital', 12, 17, 'mh', ['Digital marketing', 'שיווק דיגיטלי', 'التسويق الرقمي'], ['Evaluate campaigns using reach and conversion metrics.', 'הערכת קמפיינים באמצעות מדדי חשיפה והמרה.', 'تقييم الحملات باستخدام مقاييس الوصول والتحويل.'])
  ]),
  S('psychology', 'social', '🧠', 'violet', null, ['Psychology', 'פסיכולוגיה', 'علم النفس'], ['concept', 'classification', 'quiz'], [
    T('emotions', 5, 10, 'em', ['Emotions & empathy', 'רגשות ואמפתיה', 'المشاعر والتعاطف'], ['Name emotions and respond to others with empathy.', 'מתן שמות לרגשות ותגובה אמפתית לאחרים.', 'تسمية المشاعر والاستجابة للآخرين بتعاطف.']),
    T('learning-memory', 10, 17, 'mh', ['Learning & memory', 'למידה וזיכרון', 'التعلّم والذاكرة'], ['Compare memory systems and effective study strategies.', 'השוואה בין מערכות זיכרון ואסטרטגיות למידה יעילות.', 'المقارنة بين أنظمة الذاكرة واستراتيجيات الدراسة الفعّالة.']),
    T('research', 12, 17, 'h', ['Research methods', 'שיטות מחקר', 'مناهج البحث'], ['Evaluate study designs and spot bias.', 'הערכת תכנוני מחקר וזיהוי הטיות.', 'تقييم تصاميم الدراسات واكتشاف التحيّز.'])
  ]),
  S('health', 'life', '🩺', 'pink', null, ['Health Sciences', 'מדעי הבריאות', 'العلوم الصحية'], ['classification', 'process', 'concept', 'quiz'], [
    T('nutrition', 1, 9, 'em', ['Nutrition & healthy habits', 'תזונה והרגלים בריאים', 'التغذية والعادات الصحية'], ['Plan balanced meals and explain healthy habits.', 'תכנון ארוחות מאוזנות והסבר הרגלים בריאים.', 'تخطيط وجبات متوازنة وشرح العادات الصحية.']),
    T('body-systems', 7, 17, 'mh', ['Body systems', 'מערכות הגוף', 'أجهزة الجسم'], ['Describe how organ systems work together.', 'תיאור אופן שיתוף הפעולה בין מערכות האיברים.', 'وصف كيفية تعاون أجهزة الجسم معًا.']),
    T('first-aid', 9, 17, 'mh', ['First aid & public health', 'עזרה ראשונה ובריאות הציבור', 'الإسعافات الأولية والصحة العامة'], ['Sequence basic first-aid steps and explain disease prevention.', 'סידור צעדי עזרה ראשונה בסיסיים והסבר מניעת מחלות.', 'ترتيب خطوات الإسعاف الأولي وشرح الوقاية من الأمراض.'])
  ]),
  S('arts', 'creative', '🎨', 'pink', null, ['Arts', 'אמנות', 'الفنون'], ['quiz', 'classification', 'eventMatch'], [
    T('elements', 1, 8, 'em', ['Colour, line & shape', 'צבע, קו וצורה', 'اللون والخط والشكل'], ['Identify the elements of art in an image.', 'זיהוי יסודות האמנות בתמונה.', 'تحديد عناصر الفن في العمل الفني.']),
    T('art-history', 7, 17, 'mh', ['Art movements & artists', 'זרמים ואמנים באמנות', 'المدارس الفنية والفنانون'], ['Match artworks to movements and periods.', 'התאמת יצירות לזרמים ולתקופות.', 'مطابقة الأعمال الفنية بالمدارس والعصور.']),
    T('critique', 9, 17, 'mh', ['Visual analysis & critique', 'ניתוח חזותי וביקורת', 'التحليل البصري والنقد'], ['Describe, interpret, and evaluate a work of art.', 'תיאור, פרשנות והערכה של יצירת אמנות.', 'وصف عمل فني وتفسيره وتقييمه.'])
  ]),
  S('music', 'creative', '🎵', 'violet', null, ['Music', 'מוזיקה', 'الموسيقى'], ['quiz', 'classification', 'concept'], [
    T('rhythm', 1, 6, 'em', ['Rhythm & beat', 'קצב ופעמה', 'الإيقاع والنبض'], ['Keep a steady beat and read simple rhythms.', 'שמירה על פעמה קבועה וקריאת קצבים פשוטים.', 'الحفاظ على نبض ثابت وقراءة إيقاعات بسيطة.']),
    T('notation', 4, 12, 'emh', ['Notes & notation', 'תווים וכתיבה מוזיקלית', 'النوتات والتدوين الموسيقي'], ['Read notes, scales, and key signatures.', 'קריאת תווים, סולמות וסימני מפתח.', 'قراءة النوتات والسلالم وعلامات المفتاح.']),
    T('theory', 10, 17, 'mh', ['Harmony & music history', 'הרמוניה והיסטוריה של המוזיקה', 'الهارموني وتاريخ الموسيقى'], ['Identify chords and place works in historical periods.', 'זיהוי אקורדים ושיוך יצירות לתקופות היסטוריות.', 'تمييز الأوتار ووضع الأعمال في عصورها التاريخية.'])
  ]),
  S('environment', 'life', '🌱', 'teal', null, ['Environmental Studies', 'לימודי סביבה', 'الدراسات البيئية'], ['classification', 'process', 'concept', 'quiz'], [
    T('recycling', 1, 8, 'em', ['Recycling & waste', 'מחזור ופסולת', 'إعادة التدوير والنفايات'], ['Sort waste correctly and explain why recycling matters.', 'מיון פסולת נכון והסבר חשיבות המחזור.', 'فرز النفايات بصورة صحيحة وشرح أهمية إعادة التدوير.']),
    T('climate', 7, 17, 'mh', ['Climate & energy', 'אקלים ואנרגיה', 'المناخ والطاقة'], ['Explain the greenhouse effect and compare energy sources.', 'הסבר אפקט החממה והשוואה בין מקורות אנרגיה.', 'شرح ظاهرة الاحتباس الحراري والمقارنة بين مصادر الطاقة.']),
    T('sustainability', 10, 17, 'mh', ['Sustainability', 'קיימות', 'الاستدامة'], ['Evaluate actions against sustainability goals.', 'הערכת פעולות לפי יעדי קיימות.', 'تقييم الإجراءات في ضوء أهداف الاستدامة.'])
  ]),
  S('lifeskills', 'life', '🌟', 'gold', null, ['Life Skills', 'מיומנויות חיים', 'المهارات الحياتية'], ['quiz', 'classification', 'process'], [
    T('communication', 1, 9, 'em', ['Communication & teamwork', 'תקשורת ועבודת צוות', 'التواصل والعمل الجماعي'], ['Listen actively and work well in a group.', 'הקשבה פעילה ועבודה טובה בקבוצה.', 'الإصغاء الفعّال والعمل الجيد ضمن مجموعة.']),
    T('money', 5, 17, 'emh', ['Money & budgeting', 'כסף ותקציב', 'المال والميزانية'], ['Plan a simple budget and compare saving and spending.', 'תכנון תקציב פשוט והשוואה בין חיסכון והוצאה.', 'وضع ميزانية بسيطة والمقارنة بين الادخار والإنفاق.']),
    T('study-skills', 8, 17, 'mh', ['Study & career skills', 'מיומנויות למידה וקריירה', 'مهارات الدراسة والمسار المهني'], ['Set goals, manage time, and prepare for the next step.', 'הצבת יעדים, ניהול זמן והכנה לצעד הבא.', 'وضع الأهداف وإدارة الوقت والاستعداد للخطوة التالية.'])
  ])
];

// Real, playable games only (their questions live in server.js). Each references subject topics by id.
const GAMES = [
  { id: 'space', subject: 'science', topics: ['science.earth-space'], from: 3, to: 6, difficulty: 'easy', types: ['quiz'], language: 'en', questions: 3 },
  { id: 'science', subject: 'science', topics: ['science.living-things', 'science.matter-energy'], from: 4, to: 8, difficulty: 'medium', types: ['quiz'], language: 'en', questions: 3 },
  { id: 'math', subject: 'math', topics: ['math.multiplication', 'math.fractions', 'math.geometry'], from: 4, to: 6, difficulty: 'medium', types: ['quiz'], language: 'en', questions: 3 },
  { id: 'language', subject: 'english', topics: ['english.vocabulary', 'english.grammar'], from: 3, to: 6, difficulty: 'easy', types: ['quiz'], language: 'en', questions: 3 },
  { id: 'history', subject: 'history', topics: ['history.ancient', 'history.discoveries'], from: 5, to: 8, difficulty: 'medium', types: ['quiz'], language: 'en', questions: 3 }
];

const overlaps = (aFrom, aTo, bFrom, bTo) => aFrom <= bTo && bFrom <= aTo;
const levelRange = id => LEVELS.find(l => l.id === id);

// Custom subjects are validated and normalised the same way as built-in ones.
const cleanText = (value, max) => String(value ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
function normalizeCustomSubject(input, existingIds = []) {
  const name = cleanText(input?.name, 60);
  if (name.length < 2) return { ok: false, error: 'nameRequired' };
  const from = Math.min(17, Math.max(1, parseInt(input?.from, 10) || 1));
  const to = Math.min(17, Math.max(from, parseInt(input?.to, 10) || 17));
  let id = 'custom-' + (name.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 24) || 'subject');
  let n = 2; const base = id;
  while (existingIds.includes(id)) id = `${base}-${n++}`;
  const topicNames = String(input?.topics ?? '').split(/[\n,;]+/).map(t => cleanText(t, 60)).filter(Boolean).slice(0, 12);
  const same = text => ({ en: text, he: text, ar: text });
  const objective = cleanText(input?.objective, 200);
  return {
    ok: true,
    subject: {
      id, group: 'custom', icon: cleanText(input?.icon, 4) || '⭐', tint: 'gold', custom: true, languages: null, name: same(name),
      gameTypes: ['quiz'],
      topics: (topicNames.length ? topicNames : [name]).map((t, i) => ({ id: `${id}.t${i + 1}`, subject: id, from, to, difficulty: ['easy', 'medium', 'hard'], name: same(t), objective: same(objective || t) }))
    }
  };
}

// Pure filter helpers (shared by the UI, tests, and a future API/database query layer).
function subjectMatches(subject, f) {
  if (f.subject && subject.id !== f.subject) return false;
  if (f.language && subject.languages && !subject.languages.includes(f.language)) return false;
  return subject.topics.some(t => topicMatches(t, f));
}
function topicMatches(topic, f) {
  if (f.topic && topic.id !== f.topic) return false;
  if (f.grade) { if (f.grade < topic.from || f.grade > topic.to) return false; }
  else if (f.level) { const l = levelRange(f.level); if (!l || !overlaps(topic.from, topic.to, l.from, l.to)) return false; }
  if (f.difficulty && !topic.difficulty.includes(f.difficulty)) return false;
  return true;
}
function gameMatches(game, f) {
  if (f.subject && game.subject !== f.subject) return false;
  if (f.topic && !game.topics.includes(f.topic)) return false;
  if (f.language && game.language !== f.language) return false;
  if (f.difficulty && game.difficulty !== f.difficulty) return false;
  if (f.type && !game.types.includes(f.type)) return false;
  if (f.grade) { if (f.grade < game.from || f.grade > game.to) return false; }
  else if (f.level) { const l = levelRange(f.level); if (!l || !overlaps(game.from, game.to, l.from, l.to)) return false; }
  return true;
}
function search(subjects, games, f = {}) {
  const typeFilter = f.type;
  const subs = subjects
    .filter(s => subjectMatches(s, f) && (!typeFilter || s.gameTypes.includes(typeFilter)))
    .map(s => ({ subject: s, topics: s.topics.filter(t => topicMatches(t, f)) }));
  return { subjects: subs, games: games.filter(g => gameMatches(g, f)) };
}

root.CLASSVERSE_TAXONOMY = Object.freeze({
  LEVELS, GRADES, GROUPS, DIFFICULTIES, LANGUAGES, GAME_TYPES, SUBJECTS, GAMES,
  gradeLabel, levelOfGrade, normalizeCustomSubject, search, subjectMatches, topicMatches, gameMatches
});
if (typeof module !== 'undefined' && module.exports) module.exports = root.CLASSVERSE_TAXONOMY;
})(typeof window !== 'undefined' ? window : globalThis);
