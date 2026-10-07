// =====================================================
// KEEP. — DAY 05 / 30
// script.js
// =====================================================


// =====================================================
// SUPABASE
// =====================================================

const { createClient } = supabase;

const db = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


// =====================================================
// APP STATE
// =====================================================

let currentUser = null;
let isGuest = false;

let selectedCategory = "food";
let currentDate = new Date();

let monthData = null;
let fixedExpenses = [];
let expenses = [];
let editingExpenseId = null;
let receiptPreviewURL = null;
let keepRoute = null;
let restoringNavigation = false;

const actionLabels = {
  en: { home: "Back to 30 Projects", editMonth: "Edit month", edit: "Edit", editExpense: "Edit expense", save: "Save changes" },
  he: { home: "חזרה ל־30 הפרויקטים", editMonth: "עריכת החודש", edit: "עריכה", editExpense: "עריכת הוצאה", save: "שמירת שינויים" },
  ar: { home: "العودة إلى المشاريع الـ30", editMonth: "تعديل الشهر", edit: "تعديل", editExpense: "تعديل المصروف", save: "حفظ التغييرات" }
};

const receiptLabels = {
  en: { scan: "PHOTO RECEIPT", hint: "Enter the amount from the receipt. The photo is for reference only and will not be saved.", invalid: "Choose an image of your receipt.", failed: "Unable to open this image. Try a JPG or PNG photo.", alt: "Receipt preview" },
  he: { scan: "צילום קבלה", hint: "הזינו את הסכום שמופיע בקבלה. התמונה מיועדת לעיון בלבד ולא תישמר.", invalid: "בחרו תמונה של הקבלה.", failed: "לא ניתן לפתוח את התמונה. נסו תמונה בפורמט JPG או PNG.", alt: "תצוגה מקדימה של הקבלה" },
  ar: { scan: "تصوير فاتورة", hint: "أدخل المبلغ الموجود في الفاتورة. الصورة للعرض فقط ولن يتم حفظها.", invalid: "اختار صورة الفاتورة.", failed: "تعذر فتح الصورة. جرب صورة JPG أو PNG.", alt: "معاينة الفاتورة" }
};

const receiptAttachmentLabels = {
  en: { title: "Receipt (optional)", upload: "Choose image" },
  he: { title: "קבלה (לא חובה)", upload: "בחירת תמונה" },
  ar: { title: "الفاتورة (اختياري)", upload: "اختار صورة" }
};


// =====================================================
// HELPERS
// =====================================================

const $ = (id) =>
  document.getElementById(id);


const money = (number) => {
  const value =
    Number(number) || 0;

  return `₪${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};


const keyOf = (date) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  return `${year}-${month}`;
};


const getCurrentPageURL = () => {
  return `${window.location.origin}${window.location.pathname}`;
};

// Browser history tracks screens only; Back never reverses saved data.
function initializeKeepHistory() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  const month = params.get("month");
  keepRoute = {
    month: /^\d{4}-(0[1-9]|1[0-2])$/.test(month || "") ? month : keyOf(new Date()),
    view: ["month", "year", "edit"].includes(params.get("view")) ? params.get("view") : "month",
    modal: params.get("expense") || null
  };
  const [year, index] = keepRoute.month.split("-").map(Number);
  currentDate = new Date(year, index - 1, 1);
  recordKeepRoute({}, true);
}

function recordKeepRoute(changes, replace = false) {
  const next = { ...keepRoute, ...changes };
  if (!replace && JSON.stringify(next) === JSON.stringify(keepRoute)) return;
  keepRoute = next;
  const params = new URLSearchParams({ month: next.month, view: next.view });
  if (next.modal) params.set("expense", next.modal);
  window.history[replace ? "replaceState" : "pushState"](
    { ...window.history.state, keep: next }, "", `#${params}`
  );
}

async function navigateKeep(changes) {
  recordKeepRoute(changes);
  await restoreKeepRoute();
}

async function changeMonth(offset) {
  await navigateKeep({
    month: keyOf(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)),
    modal: null
  });
}

async function restoreKeepRoute() {
  if (!keepRoute || (!isGuest && !currentUser)) return;
  restoringNavigation = true;
  try {
    const [year, month] = keepRoute.month.split("-").map(Number);
    currentDate = new Date(year, month - 1, 1);
    closeModal();
    await loadMonth();
    const yearly = keepRoute.view === "year";
    $("yearView")?.classList.toggle("hidden", !yearly);
    $("monthView")?.classList.toggle("hidden", yearly);
    $("yearViewBtn")?.classList.toggle("active", yearly);
    $("monthViewBtn")?.classList.toggle("active", !yearly);
    if (yearly) await renderYear();
    if (keepRoute.view === "edit") {
      $("dashboard")?.classList.add("hidden");
      $("setupCard")?.classList.remove("hidden");
      renderFixed();
    }
    if (keepRoute.modal === "new") openModal(false);
    else if (keepRoute.modal) editExpense(keepRoute.modal);
  } finally {
    restoringNavigation = false;
  }
}

window.addEventListener("popstate", () => {
  initializeKeepHistory();
  restoreKeepRoute().catch(error => console.error("Navigation error:", error));
});


// =====================================================
// TRANSLATIONS
// =====================================================

const T = {

  // =========================
  // ENGLISH
  // =========================

  en: {

    authHook:
      "Your money has a memory now. 👀",

    googleLogin:
      "Continue with Google",

    guestLogin:
      "Continue without account",

    guestNote:
      "Want to keep your data? Sign in with Google and it stays with you ✨",

    or:
      "OR",

    hero:
      "Does your salary have a plan… or does it spend itself? 👀",

    heroSub:
      "KEEP. does the math with you. 💸",

    month:
      "Month",

    year:
      "Your year",

    incomeLabel:
      "FIRST THINGS FIRST",

    incomeTitle:
      "How much came in? 💸",

    salaryLabel:
      "My salary",

    fixedLabel:
      "THE UNAVOIDABLE STUFF 🥲",

    fixedTitle:
      "What takes its share every month?",

    fixedPlaceholder:
      "Car, rent, phone...",

    saveLabel:
      "A LITTLE FOR FUTURE YOU ✨",

    saveTitle:
      "How much are we putting aside?",

    saveMonth:
      "SAVE MY MONTH",

    yoursToKeep:
      "THIS IS YOURS 🤭",

    safeToday:
      "AVAILABLE TODAY",

    daysLeft:
      "days left",

    salary:
      "Came in",

    fixed:
      "Had to go",

    spent:
      "Spent",

    saving:
      "Keeping safe",

    monthCheck:
      "OKAY BUT...",

    whereMoney:
      "Where did the salary go? 👀",

    used:
      "Gone so far",

    addExpense:
      "I SPENT AGAIN 😭",

    scanReceipt:
      "SCAN RECEIPT",

    forecast:
      "IF SPENDING STAYS LIKE THIS...",

    smartSaving:
      "CAN WE KEEP A LITTLE MORE? 👀",

    keepMore:
      "Tiny changes. More money left.",

    recent:
      "THE RECEIPTS 👀",

    expenses:
      "Recent spending",

    newExpense:
      "OKAY, WHAT HAPPENED? 😭",

    whatBought:
      "What did we buy?",

    category:
      "Pick a category",

    food:
      "Food",

    coffee:
      "Coffee",

    shopping:
      "Shopping",

    transport:
      "Transport",

    fun:
      "Fun",

    study:
      "Study",

    other:
      "Other",

    notePlaceholder:
      "What was it? (optional)",

    saveExpense:
      "YEP, ADD IT",

    yourYear:
      "YOUR YEAR 👀",

    earned:
      "Earned",

    spentYear:
      "Spent",

    savedYear:
      "Planned savings"

  },


  // =========================
  // HEBREW
  // =========================

  he: {

    authHook:
      "עכשיו לכסף שלך יש זיכרון. 👀",

    googleLogin:
      "המשך עם Google",

    guestLogin:
      "המשך ללא חשבון",

    guestNote:
      "רוצים שהמידע יישמר? התחברות עם Google תשמור אותו ✨",

    or:
      "או",

    hero:
      "למשכורת שלך יש תוכנית… או שהיא מבזבזת את עצמה? 👀",

    heroSub:
      "KEEP. עושה איתך את החשבון. 💸",

    month:
      "חודש",

    year:
      "השנה שלך",

    incomeLabel:
      "נתחיל מההתחלה",

    incomeTitle:
      "כמה נכנס החודש? 💸",

    salaryLabel:
      "המשכורת שלי",

    fixedLabel:
      "כל מה שלוקח את החלק שלו 🥲",

    fixedTitle:
      "מה יורד כל חודש?",

    fixedPlaceholder:
      "רכב, שכירות, טלפון...",

    saveLabel:
      "קצת לעתיד ✨",

    saveTitle:
      "כמה נשים בצד החודש?",

    saveMonth:
      "שמירת החודש",

    yoursToKeep:
      "זה מה שנשאר 🤭",

    safeToday:
      "זמין להיום",

    daysLeft:
      "ימים נשארו",

    salary:
      "נכנס",

    fixed:
      "היה חייב לרדת",

    spent:
      "הוצאות",

    saving:
      "שמרנו בצד",

    monthCheck:
      "אבל רגע...",

    whereMoney:
      "לאן המשכורת נעלמה? 👀",

    used:
      "הלך עד עכשיו",

    addExpense:
      "הוצאה חדשה 😭",

    scanReceipt:
      "סריקת קבלה",

    forecast:
      "אם הקצב יישאר ככה...",

    smartSaving:
      "אפשר להשאיר קצת יותר? 👀",

    keepMore:
      "שינויים קטנים, קצת יותר נשאר.",

    recent:
      "הקבלות מדברות 👀",

    expenses:
      "הוצאות אחרונות",

    newExpense:
      "טוב, מה קרה הפעם? 😭",

    whatBought:
      "על מה הוצאנו?",

    category:
      "בחירת קטגוריה",

    food:
      "אוכל",

    coffee:
      "קפה",

    shopping:
      "קניות",

    transport:
      "תחבורה",

    fun:
      "בילויים",

    study:
      "לימודים",

    other:
      "אחר",

    notePlaceholder:
      "מה זה היה? (לא חובה)",

    saveExpense:
      "כן, להוסיף",

    yourYear:
      "השנה שלך 👀",

    earned:
      "נכנס",

    spentYear:
      "הוצאות",

    savedYear:
      "חיסכון מתוכנן"

  },


  // =========================
  // ARABIC
  // =========================

  ar: {

    authHook:
      "هسا مصاريك صار إلها ذاكرة. 👀",

    googleLogin:
      "الدخول مع Google",

    guestLogin:
      "الدخول بدون حساب",

    guestNote:
      "بدك تضل معلوماتك محفوظة؟ الدخول مع Google بخليها تضل معك ✨",

    or:
      "أو",

    hero:
      "راتبك إله خطة… ولا بصرف حاله لحاله؟ 👀",

    heroSub:
      "KEEP. بحسبها معك. 💸",

    month:
      "الشهر",

    year:
      "سنتك",

    incomeLabel:
      "نبلّش من الأول",

    incomeTitle:
      "قديش دخل هالشهر؟ 💸",

    salaryLabel:
      "راتبي",

    fixedLabel:
      "الأشياء اللي بتاخد حصتها 🥲",

    fixedTitle:
      "شو بنزل كل شهر؟",

    fixedPlaceholder:
      "سيارة، إيجار، تلفون...",

    saveLabel:
      "شوي للمستقبل ✨",

    saveTitle:
      "قديش بدنا نخبي عجنب؟",

    saveMonth:
      "حفظ الشهر",

    yoursToKeep:
      "هذا اللي ضل 🤭",

    safeToday:
      "المتاح لليوم",

    daysLeft:
      "يوم ضايل",

    salary:
      "دخل",

    fixed:
      "كان لازم يروح",

    spent:
      "انصرف",

    saving:
      "خبّينا عجنب",

    monthCheck:
      "بس لحظة...",

    whereMoney:
      "وين راح الراتب؟ 👀",

    used:
      "راح لحد هسا",

    addExpense:
      " مصروف جديد ",



    forecast:
      "بضل الك لاخر الشهر بس:",

    smartSaving:
      "بنقدر نخلي شوي أكثر؟ 👀",

    keepMore:
      "تغييرات صغيرة، ومصاري أكثر بتضل.",

    recent:
      "الفواتير بتحكي 👀",

    expenses:
      "آخر المصاريف",

    newExpense:
      "طيب... شو صار هالمرة؟ 😭",

    whatBought:
      "شو اشترينا؟",

    category:
      "اختار الفئة",

    food:
      "أكل",

    coffee:
      "قهوة",

    shopping:
      "تسوّق",

    transport:
      "مواصلات",

    fun:
      "طلعات",

    study:
      "دراسة",

    other:
      "غيره",

    notePlaceholder:
      "شو كان؟ (مش ضروري)",

    saveExpense:
      "آه، ضيفه",

    yourYear:
      "سنتك 👀",

    earned:
      "دخل",

    spentYear:
      "انصرف",

    savedYear:
      "توفير مخطط"

  }

};


// =====================================================
// LANGUAGE
// =====================================================

let lang =
  localStorage.getItem("keepLanguage") ||
  "en";


function applyLang() {

  document.querySelectorAll("[data-action-label]").forEach(element => {
    element.textContent = (actionLabels[lang] || actionLabels.en)[element.dataset.actionLabel];
  });

  document.documentElement.lang =
    lang;

  document.documentElement.dir =
    lang === "en"
      ? "ltr"
      : "rtl";


  document
    .querySelectorAll("[data-i18n]")
    .forEach((element) => {

      const value =
        T[lang]?.[
          element.dataset.i18n
        ];

      if (value !== undefined) {
        element.textContent = value;
      }

    });


  document
    .querySelectorAll(
      "[data-placeholder]"
    )
    .forEach((element) => {

      element.placeholder =
        T[lang]?.[
          element.dataset.placeholder
        ] || "";

    });


  document
    .querySelectorAll(".lang-btn")
    .forEach((button) => {

      button.classList.toggle(
        "active",
        button.dataset.lang === lang
      );

    });


  renderMonthTitle();
  updateExpenseModalLabels();
  const receiptText = receiptLabels[lang] || receiptLabels.en;
  const attachmentText = receiptAttachmentLabels[lang] || receiptAttachmentLabels.en;
  if ($("receiptAttachmentTitle")) $("receiptAttachmentTitle").textContent = attachmentText.title;
  if ($("uploadReceiptLabel")) $("uploadReceiptLabel").textContent = attachmentText.upload;
  const scanLabel = document.querySelector('[data-i18n="scanReceipt"]');
  if (scanLabel) scanLabel.textContent = receiptText.scan;
  if ($("receiptHint")) $("receiptHint").textContent = receiptText.hint;
  if ($("receiptPreview")) $("receiptPreview").alt = receiptText.alt;


  if (monthData) {
    renderDashboard();
  }

}


// =====================================================
// LANGUAGE BUTTONS
// =====================================================

document
  .querySelectorAll(".lang-btn")
  .forEach((button) => {

    button.addEventListener(
      "click",
      async () => {

        lang =
          button.dataset.lang;

        localStorage.setItem(
          "keepLanguage",
          lang
        );

        applyLang();

        if (
          !$("yearView")
            ?.classList.contains("hidden")
        ) {
          await renderYear();
        }

      }
    );

  });


// =====================================================
// GOOGLE LOGIN
// =====================================================

async function googleLogin() {

  isGuest = false;

  localStorage.removeItem(
    "keepGuestMode"
  );


  const authMessage =
    $("authMessage");


  if (authMessage) {

    authMessage.textContent = "";
    authMessage.style.color = "";

  }


  const { error } =
    await db.auth.signInWithOAuth({

      provider: "google",

      options: {

        redirectTo:
          getCurrentPageURL()

      }

    });


  if (error) {

    console.error(
      "Google login error:",
      error
    );


    if (authMessage) {

      authMessage.textContent =
        lang === "ar"
          ? "صار إشي غلط بالدخول مع Google 👀"
          : lang === "he"
          ? "משהו השתבש בהתחברות עם Google 👀"
          : "Something went wrong with Google login 👀";

    }

  }

}


// =====================================================
// GUEST LOGIN
// =====================================================

async function guestLogin() {

  isGuest = true;
  currentUser = null;


  localStorage.setItem(
    "keepGuestMode",
    "true"
  );


  $("authScreen")
    ?.classList.add("hidden");


  $("appScreen")
    ?.classList.remove("hidden");


  $("logoutBtn")
    ?.classList.remove("hidden");


  await restoreKeepRoute();

}


// =====================================================
// USER SESSION
// =====================================================

async function bootUser(user) {

  if (!user) return;


  isGuest = false;

  localStorage.removeItem(
    "keepGuestMode"
  );


  currentUser = user;


  $("authScreen")
    ?.classList.add("hidden");


  $("appScreen")
    ?.classList.remove("hidden");


  $("logoutBtn")
    ?.classList.remove("hidden");


  await restoreKeepRoute();

}


// =====================================================
// MONTH TITLE
// =====================================================

function renderMonthTitle() {

  if (!$("monthTitle")) {
    return;
  }


  const locale =
    lang === "ar"
      ? "ar"
      : lang === "he"
      ? "he"
      : "en";


  $("monthTitle").textContent =
    new Intl.DateTimeFormat(
      locale,
      {
        month: "long",
        year: "numeric"
      }
    ).format(currentDate);

}
// =====================================================
// GUEST LOCAL STORAGE
// =====================================================

function guestStoreKey() {
  return "keepGuestData";
}


function readGuestStore() {

  try {

    return (
      JSON.parse(
        localStorage.getItem(
          guestStoreKey()
        )
      ) || {
        months: {},
        expenses: {}
      }
    );

  } catch (error) {

    console.error(
      "Guest storage read error:",
      error
    );

    return {
      months: {},
      expenses: {}
    };

  }

}


function writeGuestStore(store) {

  localStorage.setItem(
    guestStoreKey(),
    JSON.stringify(store)
  );

}


function guestMonthRecord(monthKey) {

  const store =
    readGuestStore();

  return (
    store.months?.[monthKey] ||
    null
  );

}


// =====================================================
// LOAD MONTH
// =====================================================

async function loadMonth() {

  renderMonthTitle();

  const monthKey =
    keyOf(currentDate);


  // =========================
  // GUEST
  // =========================

  if (isGuest) {

    const store =
      readGuestStore();


    const saved =
      store.months?.[monthKey] ||
      null;


    monthData = saved
      ? {
          id: monthKey,

          month_key:
            monthKey,

          salary:
            Number(
              saved.salary || 0
            ),

          savings_goal:
            Number(
              saved.savings_goal || 0
            )
        }
      : null;


    fixedExpenses =
      (
        saved?.fixed_expenses ||
        []
      ).map(
        (item) => ({
          ...item
        })
      );


    expenses =
      (
        store.expenses?.[
          monthKey
        ] || []
      ).map(
        (item) => ({
          ...item
        })
      );


    if (monthData) {

      if ($("salaryInput")) {
        $("salaryInput").value =
          monthData.salary ?? "";
      }


      if ($("savingsInput")) {
        $("savingsInput").value =
          monthData.savings_goal ??
          "";
      }


      showDashboard();

    } else {

      if ($("salaryInput")) {
        $("salaryInput").value = "";
      }


      if ($("savingsInput")) {
        $("savingsInput").value = "";
      }


      $("setupCard")
        ?.classList.remove(
          "hidden"
        );


      $("dashboard")
        ?.classList.add(
          "hidden"
        );


      await offerPreviousFixed();

    }


    renderFixed();

    return;

  }


  // =========================
  // GOOGLE USER
  // =========================

  if (!currentUser) {
    return;
  }


  const {
    data: month,
    error: monthError
  } =
    await db
      .from("months")
      .select("*")
      .eq(
        "user_id",
        currentUser.id
      )
      .eq(
        "month_key",
        monthKey
      )
      .maybeSingle();


  if (monthError) {

    console.error(
      "Load month error:",
      monthError
    );

    return;

  }


  monthData =
    month || null;


  const [
    fixedResult,
    expensesResult
  ] =
    await Promise.all([

      db
        .from(
          "fixed_expenses"
        )
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .eq(
          "month_key",
          monthKey
        )
        .order(
          "created_at",
          {
            ascending: true
          }
        ),

      db
        .from(
          "expenses"
        )
        .select("*")
        .eq(
          "user_id",
          currentUser.id
        )
        .eq(
          "month_key",
          monthKey
        )
        .order(
          "spent_at",
          {
            ascending: false
          }
        )

    ]);


  if (fixedResult.error) {

    console.error(
      "Load fixed expenses error:",
      fixedResult.error
    );

    return;

  }


  if (expensesResult.error) {

    console.error(
      "Load expenses error:",
      expensesResult.error
    );

    return;

  }


  fixedExpenses =
    fixedResult.data || [];


  expenses =
    expensesResult.data || [];


  if (monthData) {

    if ($("salaryInput")) {

      $("salaryInput").value =
        monthData.salary ?? "";

    }


    if ($("savingsInput")) {

      $("savingsInput").value =
        monthData.savings_goal ??
        "";

    }


    showDashboard();

  } else {

    if ($("salaryInput")) {
      $("salaryInput").value = "";
    }


    if ($("savingsInput")) {
      $("savingsInput").value = "";
    }


    $("setupCard")
      ?.classList.remove(
        "hidden"
      );


    $("dashboard")
      ?.classList.add(
        "hidden"
      );


    await offerPreviousFixed();

  }


  renderFixed();

}


// =====================================================
// COPY PREVIOUS MONTH FIXED EXPENSES
// =====================================================

async function offerPreviousFixed() {

  if (fixedExpenses.length) {
    return;
  }


  const previousDate =
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );


  const previousKey =
    keyOf(previousDate);


  // =========================
  // GUEST
  // =========================

  if (isGuest) {

    const previous =
      guestMonthRecord(
        previousKey
      );


    const data =
      previous?.fixed_expenses ||
      [];


    if (!data.length) {
      return;
    }


    const shouldCopy =
      confirm(

        lang === "ar"

          ? "شهر جديد ✨ ننسخ المصاريف الثابتة من الشهر الماضي؟"

          : lang === "he"

          ? "חודש חדש ✨ להעתיק את ההוצאות הקבועות מהחודש הקודם?"

          : "New month ✨ Copy last month's fixed expenses?"

      );


    if (!shouldCopy) {
      return;
    }


    fixedExpenses =
      data.map(
        (item) => ({

          id:
            crypto.randomUUID(),

          name:
            item.name,

          amount:
            Number(
              item.amount
            ),

          local: true

        })
      );


    renderFixed();

    return;

  }


  // =========================
  // GOOGLE USER
  // =========================

  if (!currentUser) {
    return;
  }


  const {
    data,
    error
  } =
    await db
      .from(
        "fixed_expenses"
      )
      .select(
        "name, amount"
      )
      .eq(
        "user_id",
        currentUser.id
      )
      .eq(
        "month_key",
        previousKey
      );


  if (error) {

    console.error(
      "Previous fixed expenses error:",
      error
    );

    return;

  }


  if (!data?.length) {
    return;
  }


  const shouldCopy =
    confirm(

      lang === "ar"

        ? "شهر جديد ✨ ننسخ المصاريف الثابتة من الشهر الماضي؟"

        : lang === "he"

        ? "חודש חדש ✨ להעתיק את ההוצאות הקבועות מהחודש הקודם?"

        : "New month ✨ Copy last month's fixed expenses?"

    );


  if (!shouldCopy) {
    return;
  }


  fixedExpenses =
    data.map(
      (item) => ({

        id:
          crypto.randomUUID(),

        name:
          item.name,

        amount:
          Number(
            item.amount
          ),

        local: true

      })
    );


  renderFixed();

}


// =====================================================
// FIXED EXPENSES
// =====================================================

function renderFixed() {

  if (!$("fixedList")) {
    return;
  }


  $("fixedList").innerHTML =
    fixedExpenses
      .map(
        (item) => {

          return `
            <div class="fixed-item">

              <span>
                ${esc(item.name)}
              </span>

              <span>

                <strong>
                  ${money(item.amount)}
                </strong>

                <button
                  class="delete-btn"
                  type="button"
                  onclick="removeFixed('${item.id}')"
                  aria-label="Delete"
                >
                  ×
                </button>

              </span>

            </div>
          `;

        }
      )
      .join("");

}


// =====================================================
// ADD FIXED EXPENSE
// =====================================================

function addFixed() {

  const name =
    $("fixedName")
      ?.value
      .trim() || "";


  const amount =
    Number(
      $("fixedAmount")
        ?.value || 0
    );


  if (
    !name ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return;
  }


  fixedExpenses.push({

    id:
      crypto.randomUUID(),

    name,

    amount,

    local: true

  });


  if ($("fixedName")) {
    $("fixedName").value = "";
  }


  if ($("fixedAmount")) {
    $("fixedAmount").value = "";
  }


  renderFixed();

}


// =====================================================
// REMOVE FIXED EXPENSE
// =====================================================

async function removeFixed(id) {

  const item =
    fixedExpenses.find(
      (expense) =>
        expense.id === id
    );


  // If this expense already exists
  // in Supabase, delete it there too.

  if (
    item &&
    !item.local &&
    !isGuest &&
    currentUser
  ) {

    const { error } =
      await db
        .from(
          "fixed_expenses"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .eq(
          "user_id",
          currentUser.id
        );


    if (error) {

      console.error(
        "Delete fixed expense error:",
        error
      );

      return;

    }

  }


  fixedExpenses =
    fixedExpenses.filter(
      (expense) =>
        expense.id !== id
    );


  // Guest month already saved:
  // update localStorage immediately.

  if (
    isGuest &&
    monthData
  ) {

    const monthKey =
      keyOf(currentDate);


    const store =
      readGuestStore();


    if (
      store.months?.[
        monthKey
      ]
    ) {

      store.months[
        monthKey
      ].fixed_expenses =
        fixedExpenses.map(
          (expense) => ({
            ...expense,
            local: false
          })
        );


      writeGuestStore(
        store
      );

    }

  }


  renderFixed();


  if (monthData) {
    renderDashboard();
  }

}


// =====================================================
// SAVE MONTH
// =====================================================

async function saveMonth() {

  if ($("setupMessage")) {
    $("setupMessage").textContent = "";
  }


  const salary =
    Number(
      $("salaryInput")
        ?.value || 0
    );


  const savings =
    Number(
      $("savingsInput")
        ?.value || 0
    );


  const monthKey =
    keyOf(currentDate);


  // =========================
  // VALIDATION
  // =========================

  if (!Number.isFinite(salary) || salary <= 0) {

    if ($("setupMessage")) {

      $("setupMessage").textContent =

        lang === "ar"

          ? "ضيف الراتب الشهري أول 👀"

          : lang === "he"

          ? "צריך להכניס קודם את המשכורת החודשית 👀"

          : "Add your monthly salary first 👀";

    }


    return;

  }


  // =========================
  // GUEST SAVE
  // =========================

  if (!Number.isFinite(savings) || savings < 0) {
    if ($("setupMessage")) {
      $("setupMessage").textContent =
        lang === "ar"
          ? "التوفير لازم يكون مبلغ صالح، صفر أو أكثر."
          : lang === "he"
          ? "החיסכון חייב להיות סכום תקין, אפס או יותר."
          : "Savings must be a valid amount, zero or more.";
    }
    return;
  }

  if (isGuest) {

    const store =
      readGuestStore();


    store.months ||= {};
    store.expenses ||= {};


    store.months[
      monthKey
    ] = {

      salary,

      savings_goal:
        savings,

      fixed_expenses:
        fixedExpenses.map(
          (item) => ({

            id:
              item.id ||
              crypto.randomUUID(),

            name:
              item.name,

            amount:
              Number(
                item.amount
              ),

            local:
              false

          })
        )

    };


    store.expenses[
      monthKey
    ] ||= [];


    writeGuestStore(
      store
    );


    await loadMonth();

    return;

  }


  // =========================
  // GOOGLE USER SAVE
  // =========================

  if (!currentUser) {
    return;
  }


  const {
    data: savedMonth,
    error: monthError
  } =
    await db
      .from("months")
      .upsert(

        {

          user_id:
            currentUser.id,

          month_key:
            monthKey,

          salary,

          savings_goal:
            savings

        },

        {

          onConflict:
            "user_id,month_key"

        }

      )
      .select()
      .single();


  if (monthError) {

    console.error(
      "Save month error:",
      monthError
    );


    if ($("setupMessage")) {

      $("setupMessage").textContent =
        monthError.message;

    }


    return;

  }


  // Remove old fixed expenses
  // before inserting the new list.

  const {
    error: deleteError
  } =
    await db
      .from(
        "fixed_expenses"
      )
      .delete()
      .eq(
        "user_id",
        currentUser.id
      )
      .eq(
        "month_key",
        monthKey
      );


  if (deleteError) {

    console.error(
      "Fixed expenses delete error:",
      deleteError
    );


    if ($("setupMessage")) {

      $("setupMessage").textContent =
        deleteError.message;

    }


    return;

  }


  if (
    fixedExpenses.length
  ) {

    const rows =
      fixedExpenses.map(
        (item) => ({

          user_id:
            currentUser.id,

          month_id:
            savedMonth.id,

          month_key:
            monthKey,

          name:
            item.name,

          amount:
            Number(
              item.amount
            )

        })
      );


    const {
      error: fixedError
    } =
      await db
        .from(
          "fixed_expenses"
        )
        .insert(rows);


    if (fixedError) {

      console.error(
        "Fixed expenses insert error:",
        fixedError
      );


      if ($("setupMessage")) {

        $("setupMessage").textContent =
          fixedError.message;

      }


      return;

    }

  }


  monthData =
    savedMonth;


  await loadMonth();

}


// =====================================================
// DASHBOARD
// =====================================================

function showDashboard() {

  if (!restoringNavigation && keepRoute?.view === "edit") recordKeepRoute({ view: "month", modal: null });

  $("setupCard")
    ?.classList.add(
      "hidden"
    );


  $("dashboard")
    ?.classList.remove(
      "hidden"
    );


  renderDashboard();

}


// =====================================================
// TOTALS
// =====================================================

function totals() {

  const fixed =
    fixedExpenses.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount
        ),
      0
    );


  const spent =
    expenses.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount
        ),
      0
    );


  const salary =
    Number(
      monthData?.salary ||
      0
    );


  const saving =
    Number(
      monthData
        ?.savings_goal ||
      0
    );


  const left =
    salary -
    fixed -
    spent -
    saving;


  return {

    fixed,

    spent,

    salary,

    saving,

    left

  };

}


// =====================================================
// DAYS LEFT
// =====================================================

function daysLeft() {

  const now =
    new Date();


  const sameMonth =
    now.getFullYear() ===
      currentDate.getFullYear() &&

    now.getMonth() ===
      currentDate.getMonth();


  const selectedMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (selectedMonth < thisMonth) return 0;


  const daysInMonth =
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();


  return (
    daysInMonth -
    (sameMonth ? now.getDate() : 1) +
    1
  );

}
// =====================================================
// RENDER DASHBOARD
// =====================================================

function renderDashboard() {

  if (!monthData) return;

  const {
    fixed,
    spent,
    salary,
    saving,
    left
  } = totals();


  const remainingDays = daysLeft();


  const daily =
    remainingDays > 0 ? Math.max(
      left / remainingDays,
      0
    ) : 0;


  if ($("leftAmount")) {
    $("leftAmount").textContent =
      money(left);
  }


  if ($("dailyAmount")) {
    $("dailyAmount").textContent =
      money(daily);
  }


  if ($("daysLeft")) {
    $("daysLeft").textContent =
      daysLeft();
  }


  if ($("salaryValue")) {
    $("salaryValue").textContent =
      money(salary);
  }


  if ($("fixedValue")) {
    $("fixedValue").textContent =
      money(fixed);
  }


  if ($("spentValue")) {
    $("spentValue").textContent =
      money(spent);
  }


  if ($("savingValue")) {
    $("savingValue").textContent =
      money(saving);
  }


  const used =
    fixed + spent + saving;


  const percent =
    salary > 0
      ? Math.max((used / salary) * 100, 0)
      : 0;


  if ($("monthPercent")) {
    $("monthPercent").textContent =
      `${Math.round(percent)}%`;
  }


  if ($("progressBar")) {
    $("progressBar").style.width =
      `${Math.min(percent, 100)}%`;
  }


  if ($("usedAmount")) {
    $("usedAmount").textContent =
      money(used);
  }


  renderMood(left, salary);

  renderForecast();

  renderTips();

  renderExpenses();
}


// =====================================================
// MONEY MOOD
// =====================================================

function renderMood(
  left,
  salary
) {

  if (!$("moneyMood")) return;


  let text = "";


  if (left < 0) {

    text =
      lang === "ar"
        ? "اووبسس... بدنا نحكي. 💀"
        : lang === "he"
        ? "אוקיי… צריך לדבר. 💀"
        : "Bestie… we need to talk. 💀";

  } else if (
    salary > 0 &&
    left < salary * 0.15
  ) {

    text =
      lang === "ar"
        ? "يمكن الـ little treat تستنى لبكرا 😭"
        : lang === "he"
        ? "אולי ה־little treat יחכה למחר 😭"
        : "Maybe the little treat can wait until tomorrow 😭";

  } else if (
    salary > 0 &&
    left < salary * 0.4
  ) {

    text =
      lang === "ar"
        ? "أمورنا تمام… بس خلي عينك عالمصروف 👀"
        : lang === "he"
        ? "המצב בסדר… רק לשים עין על ההוצאות 👀"
        : "We're okay… just keep an eye on the spending 👀";

  } else {

    text =
      lang === "ar"
        ? "أوكييي، في حدا هون بعرف يخلّي مصاري 😌"
        : lang === "he"
        ? "אוקייי, יש פה מישהו שיודע להשאיר כסף 😌"
        : "Okayyy, somebody knows how to keep money 😌";

  }


  $("moneyMood").textContent =
    text;
}


// =====================================================
// FORECAST
// =====================================================

function renderForecast() {

  if (!monthData) return;


  const {
    spent,
    fixed,
    salary,
    saving
  } = totals();


  const now =
    new Date();


  const sameMonth =
    now.getFullYear() ===
      currentDate.getFullYear() &&
    now.getMonth() ===
      currentDate.getMonth();


  let projectedSpent =
    spent;


  if (sameMonth) {

    const day =
      Math.max(
        now.getDate(),
        1
      );


    const daysInMonth =
      new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).getDate();


    projectedSpent =
      (spent / day) *
      daysInMonth;

  }


  const forecastLeft =
    salary -
    fixed -
    saving -
    projectedSpent;


  if ($("forecastAmount")) {

    $("forecastAmount").textContent =
      money(forecastLeft);

  }


  if ($("forecastText")) {
    $("forecastText").textContent = forecastLeft >= 0
      ? (lang === "ar"
          ? ""
          : lang === "he"
          ? "זה מה שצפוי להישאר בסוף החודש ✨"
          : "Expected to stay with you by the end of the month ✨")
      : (lang === "ar"
          ? "هيك الشهر ممكن يخلص بالسالب 👀"
          : lang === "he"
          ? "בקצב הזה החודש עלול להסתיים במינוס 👀"
          : "At this pace, the month may end in the red 👀");
  }

}


// =====================================================
// TIPS
// =====================================================

function renderTips() {
  renderSavingsTips();
}

// =====================================================
// ESCAPE HTML
// =====================================================

function esc(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


// =====================================================
// EXPENSE LIST
// =====================================================

function renderExpenses() {

  if (!$("expensesList")) {
    return;
  }


  if (expenseFilterMonth !== keyOf(currentDate)) expenseFilter = null;

  if (!expenses.length) {

    $("expensesList").innerHTML =
      `
        <div class="empty-state">
          ${
            lang === "ar"
              ? "لسا ما في مصاريف 👀"
              : lang === "he"
              ? "עדיין אין הוצאות 👀"
              : "No expenses yet 👀"
          }
        </div>
      `;

    return;

  }


  const filterHeading = expenseFilter ? `<div class="expense-filter-heading"><strong>${esc(T[lang]?.[expenseFilter] || expenseFilter)}</strong><button type="button" class="saving-view-btn" data-clear-expense-filter>${(savingsCopy[lang] || savingsCopy.en).all}</button></div>` : "";
  $("expensesList").innerHTML = filterHeading +
    expenses.filter(item => !expenseFilter || (item.category || "other") === expenseFilter)
      .map(
        (expense) => {

          const category =
            T[lang]?.[
              expense.category
            ] ||
            expense.category ||
            T[lang].other;


          return `
            <div class="expense-item">

              <div class="expense-info">

                <strong>
                  ${esc(category)}
                </strong>

                ${
                  expense.note
                    ? `<small>${esc(expense.note)}</small>`
                    : ""
                }

              </div>

              <div class="expense-side">

                <button type="button" class="edit-expense-btn" onclick="editExpense('${esc(expense.id)}')">
                  ${(actionLabels[lang] || actionLabels.en).edit}
                </button>

                <strong>
                  ${money(expense.amount)}
                </strong>

                <button
                  type="button"
                  class="delete-btn"
                  onclick="deleteExpense('${expense.id}')"
                >
                  ×
                </button>

              </div>

            </div>
          `;

        }
      )
      .join("");

}


// =====================================================
// EXPENSE MODAL
// =====================================================

function openModal(recordHistory = true) {

  clearReceiptPreview();

  editingExpenseId = null;
  if (recordHistory && !restoringNavigation) recordKeepRoute({ modal: "new" });
  updateExpenseModalLabels();

  if (!$("expenseModal")) {
    return;
  }


  $("expenseModal")
    .classList.remove(
      "hidden"
    );


  if ($("expenseAmount")) {
    $("expenseAmount").value = "";
  }


  if ($("expenseNote")) {
    $("expenseNote").value = "";
  }


  if ($("expenseMessage")) {
    $("expenseMessage").textContent = "";
  }


  selectedCategory =
    "food";


  document
    .querySelectorAll(
      ".category"
    )
    .forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.category ===
            selectedCategory
        );

      }
    );


  setTimeout(
    () =>
      $("expenseAmount")
        ?.focus(),
    100
  );

}


function closeModal() {

  clearReceiptPreview();

  if (!restoringNavigation && keepRoute?.modal) recordKeepRoute({ modal: null }, true);

  editingExpenseId = null;

  $("expenseModal")
    ?.classList.add(
      "hidden"
    );

}

function clearReceiptPreview() {
  if (receiptPreviewURL) URL.revokeObjectURL(receiptPreviewURL);
  receiptPreviewURL = null;
  $("receiptPreview")?.removeAttribute("src");
  $("receiptPreviewSection")?.classList.add("hidden");
}

$("scanReceiptBtn")?.addEventListener("click", () => {
  const input = $("receiptInput");
  if (!input) return;
  input.value = "";
  input.click();
});

$("uploadReceiptBtn")?.addEventListener("click", () => {
  const input = $("receiptUploadInput");
  if (!input) return;
  input.value = "";
  input.click();
});

function handleReceiptImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const labels = receiptLabels[lang] || receiptLabels.en;
  if ($("expenseModal").classList.contains("hidden")) openModal();
  else clearReceiptPreview();
  if (!file.type.startsWith("image/")) {
    $("expenseMessage").textContent = labels.invalid;
    return;
  }
  receiptPreviewURL = URL.createObjectURL(file);
  const preview = $("receiptPreview");
  preview.onerror = () => {
    clearReceiptPreview();
    $("expenseMessage").textContent = (receiptLabels[lang] || receiptLabels.en).failed;
  };
  preview.alt = labels.alt;
  preview.src = receiptPreviewURL;
  $("receiptHint").textContent = labels.hint;
  $("receiptPreviewSection").classList.remove("hidden");
}

$("receiptInput")?.addEventListener("change", handleReceiptImage);
$("receiptUploadInput")?.addEventListener("change", handleReceiptImage);

function updateExpenseModalLabels() {
  const labels = actionLabels[lang] || actionLabels.en;
  const heading = document.querySelector('[data-i18n="newExpense"]');
  const saveLabel = document.querySelector('[data-i18n="saveExpense"]');
  if (heading) heading.textContent = editingExpenseId ? labels.editExpense : T[lang].newExpense;
  if (saveLabel) saveLabel.textContent = editingExpenseId ? labels.save : T[lang].saveExpense;
}

function editExpense(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;
  openModal(false);
  if (!restoringNavigation) recordKeepRoute({ modal: id });
  editingExpenseId = id;
  $("expenseAmount").value = expense.amount;
  $("expenseNote").value = expense.note || "";
  selectedCategory = expense.category || "other";
  document.querySelectorAll(".category").forEach(button => {
    button.classList.toggle("active", button.dataset.category === selectedCategory);
  });
  updateExpenseModalLabels();
}


// =====================================================
// SAVE EXPENSE
// =====================================================

async function saveExpense() {

  if ($("expenseMessage")) {
    $("expenseMessage").textContent = "";
  }


  const amount =
    Number(
      $("expenseAmount")
        ?.value || 0
    );


  const note =
    $("expenseNote")
      ?.value
      .trim() || "";


  const monthKey =
    keyOf(currentDate);


  if (!Number.isFinite(amount) || amount <= 0) {

    if ($("expenseMessage")) {

      $("expenseMessage").textContent =

        lang === "ar"
          ? "ضيف المبلغ أول 👀"

          : lang === "he"
          ? "צריך להכניס קודם סכום 👀"

          : "Add an amount first 👀";

    }

    return;
  }


  if (!monthData) {

    if ($("expenseMessage")) {

      $("expenseMessage").textContent =

        lang === "ar"
          ? "لازم حفظ الشهر أول 👀"

          : lang === "he"
          ? "צריך לשמור קודם את החודש 👀"

          : "Save your month first 👀";

    }

    return;
  }


  // GUEST

  if (editingExpenseId) {
    const changes = { amount, category: selectedCategory, note };
    if (isGuest) {
      const store = readGuestStore();
      const rows = store.expenses?.[monthKey] || [];
      const existing = rows.find(item => item.id === editingExpenseId);
      if (!existing) return;
      Object.assign(existing, changes);
      writeGuestStore(store);
    } else {
      if (!currentUser) return;
      const { error } = await db.from("expenses")
        .update(changes)
        .eq("id", editingExpenseId)
        .eq("user_id", currentUser.id)
        .eq("month_key", monthKey);
      if (error) {
        console.error("Update expense error:", error);
        $("expenseMessage").textContent = error.message;
        return;
      }
    }
    closeModal();
    await loadMonth();
    return;
  }

  if (isGuest) {

    const store =
      readGuestStore();


    store.expenses ||= {};


    store.expenses[
      monthKey
    ] ||= [];


    store.expenses[
      monthKey
    ].unshift({

      id:
        crypto.randomUUID(),

      amount,

      category:
        selectedCategory,

      note,

      spent_at:
        new Date()
          .toISOString()
          .slice(0, 10),

      month_key:
        monthKey

    });


    writeGuestStore(
      store
    );


    closeModal();

    await loadMonth();

    return;

  }


  // GOOGLE USER

  if (!currentUser) {
    return;
  }


  const { error } =
    await db
      .from("expenses")
      .insert({

        user_id:
          currentUser.id,

        month_id:
          monthData.id,

        month_key:
          monthKey,

        amount,

        category:
          selectedCategory,

        note,

        spent_at:
          new Date()
            .toISOString()
            .slice(0, 10)

      });


  if (error) {

    console.error(
      "Save expense error:",
      error
    );


    if ($("expenseMessage")) {

      $("expenseMessage").textContent =
        error.message;

    }


    return;

  }


  closeModal();

  await loadMonth();

}


// =====================================================
// DELETE EXPENSE
// =====================================================

async function deleteExpense(id) {

  // GUEST

  if (isGuest) {

    const monthKey =
      keyOf(currentDate);


    const store =
      readGuestStore();


    store.expenses ||= {};


    store.expenses[
      monthKey
    ] =
      (
        store.expenses[
          monthKey
        ] || []
      ).filter(
        (expense) =>
          expense.id !== id
      );


    writeGuestStore(
      store
    );


    await loadMonth();

    return;

  }


  // GOOGLE USER

  if (!currentUser) {
    return;
  }


  const { error } =
    await db
      .from("expenses")
      .delete()
      .eq(
        "id",
        id
      )
      .eq(
        "user_id",
        currentUser.id
      );


  if (error) {

    console.error(
      "Delete expense error:",
      error
    );

    return;

  }


  await loadMonth();

}

// =====================================================
// MONTH NAVIGATION
// =====================================================

$("prevMonth")?.addEventListener("click", () => changeMonth(-1));
$("nextMonth")?.addEventListener("click", () => changeMonth(1));

// =====================================================
// AUTH BUTTONS
// =====================================================

$("googleLoginBtn")
  ?.addEventListener(
    "click",
    googleLogin
  );


$("guestLoginBtn")
  ?.addEventListener(
    "click",
    guestLogin
  );


// =====================================================
// FIXED EXPENSE BUTTONS
// =====================================================

$("addFixedBtn")
  ?.addEventListener(
    "click",
    addFixed
  );


$("fixedAmount")
  ?.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Enter"
      ) {

        event.preventDefault();

        addFixed();

      }

    }
  );


// =====================================================
// SAVE MONTH
// =====================================================

$("saveMonthBtn")
  ?.addEventListener(
    "click",
    saveMonth
  );


// =====================================================
// EDIT MONTH
// =====================================================

$("editMonthBtn")?.addEventListener("click", () => navigateKeep({ view: 'edit', modal: null }));

// =====================================================
// EXPENSE MODAL BUTTONS
// =====================================================

$("openExpenseBtn")
  ?.addEventListener(
    "click",
    openModal
  );


$("closeModalBtn")
  ?.addEventListener(
    "click",
    closeModal
  );


$("saveExpenseBtn")
  ?.addEventListener(
    "click",
    saveExpense
  );


$("expenseModal")
  ?.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        $("expenseModal")
      ) {

        closeModal();

      }

    }
  );


// =====================================================
// EXPENSE CATEGORIES
// =====================================================

document
  .querySelectorAll(
    ".category"
  )
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          selectedCategory =
            button.dataset.category ||
            "other";


          document
            .querySelectorAll(
              ".category"
            )
            .forEach(
              (item) =>
                item.classList.remove(
                  "active"
                )
            );


          button.classList.add(
            "active"
          );

        }
      );

    }
  );


// =====================================================
// LOGOUT
// =====================================================

$("logoutBtn")
  ?.addEventListener(
    "click",
    async () => {

      // GUEST

      if (isGuest) {

        isGuest = false;

        localStorage.removeItem(
          "keepGuestMode"
        );


        // IMPORTANT:
        // Guest data is NOT deleted.

        window.location.href =
          getCurrentPageURL();

        return;

      }


      // GOOGLE

      await db.auth.signOut();


      window.location.href =
        getCurrentPageURL();

    }
  );
// =====================================================
// RESET CURRENT MONTH
// =====================================================

async function resetCurrentMonth() {

  const monthKey = keyOf(currentDate);

  const confirmed = confirm(
    lang === "ar"
      ? "متأكدين بدنا نمسح كل معلومات هالشهر؟ 👀\nالراتب، التوفير وكل المصاريف رح ينمسحوا."
      : lang === "he"
      ? "למחוק את כל הנתונים של החודש הזה? 👀\nהמשכורת, החיסכון וכל ההוצאות יימחקו."
      : "Reset this month? 👀\nSalary, savings and all expenses for this month will be deleted."
  );

  if (!confirmed) return;


  // =========================
  // GUEST
  // =========================

  if (isGuest) {

    const store = readGuestStore();

    if (store.months) {
      delete store.months[monthKey];
    }

    if (store.expenses) {
      delete store.expenses[monthKey];
    }

    writeGuestStore(store);

    await loadMonth();

    return;
  }


  // =========================
  // GOOGLE USER
  // =========================

  if (!currentUser) return;

  try {

    // Delete variable expenses
    const { error: expensesError } =
      await db
        .from("expenses")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("month_key", monthKey);

    if (expensesError) {
      throw expensesError;
    }


    // Delete fixed expenses
    const { error: fixedError } =
      await db
        .from("fixed_expenses")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("month_key", monthKey);

    if (fixedError) {
      throw fixedError;
    }


    // Delete month itself
    const { error: monthError } =
      await db
        .from("months")
        .delete()
        .eq("user_id", currentUser.id)
        .eq("month_key", monthKey);

    if (monthError) {
      throw monthError;
    }


    await loadMonth();

  } catch (error) {

    console.error(
      "Reset month error:",
      error
    );

    alert(
      lang === "ar"
        ? "صار خطأ، ما انمسحت معلومات الشهر."
        : lang === "he"
        ? "הייתה שגיאה. נתוני החודש לא נמחקו."
        : "Something went wrong. The month wasn't reset."
    );

  }

}

// =====================================================
// INITIALIZE APP
// =====================================================

// Category budgets are local to this browser, scoped by account and month.
let expenseFilter = null;
let expenseFilterMonth = null;

const savingsCopy = {
  en: {
    empty: "Tap the purple button below to add your first expense 👇", start: "Add my first expense", next: "After a few expenses, you'll see your biggest spending category and can set a budget for it 👀", small: "Still a small sample. Add more expenses before deciding what to cut 👀",
    largest: "Largest spending category", share: "of recorded spending", idea: "An idea for next month", example: "If spending is similar, spending 10% less in this category would leave you with", extra: "extra. This is an example, not money already saved.",
    view: "View category expenses", all: "Show all expenses", budget: "Monthly category budget", save: "Save budget", remove: "Remove budget", left: "Left in this category", over: "Over category budget", local: "Saved in this browser for this month.", invalid: "Enter a valid budget greater than zero.", failed: "Could not save the budget. Check browser storage settings."
  },
  he: {
    empty: "לחצו על הכפתור הסגול כאן למטה כדי להוסיף את ההוצאה הראשונה 👇", start: "הוספת ההוצאה הראשונה", next: "אחרי כמה הוצאות, תראו באיזו קטגוריה הוצאתם הכי הרבה ותוכלו לקבוע לה תקציב 👀", small: "עדיין יש מעט נתונים. הוסיפו עוד הוצאות לפני שמחליטים מה לצמצם 👀",
    largest: "הקטגוריה עם הכי הרבה הוצאות", share: "מההוצאות שנרשמו", idea: "רעיון לחודש הבא", example: "אם ההוצאות יהיו דומות, הוצאה של 10% פחות בקטגוריה הזו תשאיר לכם", extra: "נוספים. זו דוגמה, לא כסף שכבר נחסך.",
    view: "הצגת הוצאות הקטגוריה", all: "הצגת כל ההוצאות", budget: "תקציב חודשי לקטגוריה", save: "שמירת התקציב", remove: "הסרת התקציב", left: "נשאר בתקציב הקטגוריה", over: "חריגה מתקציב הקטגוריה", local: "נשמר בדפדפן הזה לחודש הנבחר.", invalid: "הזינו תקציב תקין הגדול מאפס.", failed: "לא ניתן לשמור את התקציב. בדקו את הגדרות האחסון בדפדפן."
  },
  ar: {
    empty: "اكبس عالزر البنفسجي هون تحت وضيف أول مصروف 👇", start: "ضيف أول مصروف", next: "بعد كم مصروف، بتشوف أكثر فئة صرفت عليها وبتقدر تحدّد إلها ميزانية 👀", small: "لسا المصاريف قليلة — ضيف كمان قبل ما تقرر وين تقلّل 👀",
    largest: "أكبر فئة صرف هالشهر", share: "من المصاريف المسجّلة", idea: "فكرة للشهر الجاي", example: "إذا كان الصرف مشابه، صرف 10% أقل بهالفئة ممكن يخلّي معك", extra: "زيادة. هذا مثال، مش مصاري وفّرتها فعلياً.",
    view: "شوف مصاريف الفئة", all: "شوف كل المصاريف", budget: "ميزانية شهرية للفئة", save: "احفظ الميزانية", remove: "احذف الميزانية", left: "ضايل بميزانية الفئة", over: "تجاوزت ميزانية الفئة", local: "محفوظة بهالمتصفح للشهر المختار.", invalid: "ضيف ميزانية صحيحة أكبر من صفر.", failed: "ما قدرنا نحفظ الميزانية. افحص إعدادات التخزين بالمتصفح."
  }
};

function categoryBudgetKey() {
  return `keepCategoryBudgets:${isGuest ? "guest" : currentUser?.id}:${keyOf(currentDate)}`;
}

function readCategoryBudgets() {
  try {
    const value = JSON.parse(localStorage.getItem(categoryBudgetKey()) || "{}");
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

function renderSavingsTips() {
  const container = $("tipsContainer");
  if (!container) return;
  const copy = savingsCopy[lang] || savingsCopy.en;
  const categories = {};
  for (const expense of expenses) {
    const category = Object.hasOwn(T.en, expense.category) ? expense.category : "other";
    const amount = Number(expense.amount);
    if (Number.isFinite(amount) && amount > 0) categories[category] = (categories[category] || 0) + amount;
  }
  const biggest = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  if (!biggest) {
    container.innerHTML = `<div class="tip-card savings-start"><p>${copy.empty}</p><button type="button" class="add-expense-btn savings-start-btn" data-start-expense><span aria-hidden="true">＋</span><span>${copy.start}</span></button><p class="saving-tip-share">${copy.next}</p></div>`;
    return;
  }
  const [category, amount] = biggest;
  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  const categoryName = esc(T[lang]?.[category] || category);
  const budget = Number(readCategoryBudgets()[category]);
  const hasBudget = Number.isFinite(budget) && budget > 0;
  const remaining = budget - amount;
  container.innerHTML = `
    <article class="saving-tip">
      <div class="saving-tip-summary"><div><p class="eyebrow">${copy.largest}</p><h3>${categoryName}</h3></div><strong class="saving-tip-amount">${money(amount)}</strong></div>
      <p class="saving-tip-share">${Math.round(amount / total * 100)}% ${copy.share}</p>
      ${expenses.length < 5
        ? `<p class="saving-tip-note">${copy.small}</p>`
        : `<div class="saving-idea"><p class="eyebrow">${copy.idea}</p><p>${copy.example} <strong>${money(amount * 0.1)}</strong> ${copy.extra}</p></div>`}
      <div class="saving-tip-actions"><button type="button" class="add-expense-btn savings-add-btn" data-start-expense><span aria-hidden="true">＋</span><span>${T[lang].addExpense}</span></button><button type="button" class="saving-view-btn" data-view-category="${esc(category)}">${copy.view} ←</button></div>
      <form class="category-budget-form" data-budget-category="${esc(category)}">
        <label for="categoryBudgetInput">${copy.budget} · ${categoryName}</label>
        <div class="category-budget-row"><div class="small-money"><span>₪</span><input id="categoryBudgetInput" type="number" min="0.01" step="0.01" inputmode="decimal" required value="${hasBudget ? budget : ""}" placeholder="0"></div><button type="submit" class="saving-budget-btn">${copy.save}</button></div>
        <p class="saving-tip-share">${copy.local}</p>
        ${hasBudget ? `<div class="category-budget-status ${remaining < 0 ? "over-budget" : ""}" role="status"><span>${remaining < 0 ? copy.over : copy.left}</span><strong>${money(Math.abs(remaining))}</strong></div><div class="progress-track"><div class="progress-bar" style="width:${Math.min(amount / budget * 100, 100)}%"></div></div><button type="button" class="text-btn" data-remove-budget="${esc(category)}">${copy.remove}</button>` : ""}
        <p id="categoryBudgetMessage" class="message" role="status"></p>
      </form>
    </article>`;
}

function showCategoryExpenses(category) {
  expenseFilter = category;
  expenseFilterMonth = keyOf(currentDate);
  renderExpenses();
  $("expensesList")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

$("tipsContainer")?.addEventListener("click", event => {
  if (event.target.closest("[data-start-expense]")) {
    openModal();
    return;
  }
  const view = event.target.closest("[data-view-category]");
  if (view) showCategoryExpenses(view.dataset.viewCategory);
  const remove = event.target.closest("[data-remove-budget]");
  if (!remove) return;
  try {
    const budgets = readCategoryBudgets();
    delete budgets[remove.dataset.removeBudget];
    localStorage.setItem(categoryBudgetKey(), JSON.stringify(budgets));
    renderSavingsTips();
  } catch { $("categoryBudgetMessage").textContent = (savingsCopy[lang] || savingsCopy.en).failed; }
});

$("tipsContainer")?.addEventListener("submit", event => {
  const form = event.target.closest("[data-budget-category]");
  if (!form) return;
  event.preventDefault();
  const amount = Number($("categoryBudgetInput").value);
  const copy = savingsCopy[lang] || savingsCopy.en;
  if (!Number.isFinite(amount) || amount <= 0) {
    $("categoryBudgetMessage").textContent = copy.invalid;
    return;
  }
  try {
    const budgets = readCategoryBudgets();
    budgets[form.dataset.budgetCategory] = Math.round(amount * 100) / 100;
    localStorage.setItem(categoryBudgetKey(), JSON.stringify(budgets));
    renderSavingsTips();
  } catch { $("categoryBudgetMessage").textContent = copy.failed; }
});

$("expensesList")?.addEventListener("click", event => {
  if (event.target.closest("[data-clear-expense-filter]")) showCategoryExpenses(null);
});


async function initializeApp() {

  initializeKeepHistory();

  applyLang();


  // RETURNING GUEST

  if (
    localStorage.getItem(
      "keepGuestMode"
    ) === "true"
  ) {

    isGuest = true;
    currentUser = null;


    $("authScreen")
      ?.classList.add(
        "hidden"
      );


    $("appScreen")
      ?.classList.remove(
        "hidden"
      );


    $("logoutBtn")
      ?.classList.remove(
        "hidden"
      );


    await restoreKeepRoute();

    return;

  }


  // GOOGLE SESSION

  const {
    data,
    error
  } =
    await db.auth.getSession();


  if (error) {

    console.error(
      "Session error:",
      error
    );

    return;

  }


  if (
    data.session?.user
  ) {

    await bootUser(
      data.session.user
    );

    return;

  }


  // NO LOGIN YET

  $("authScreen")
    ?.classList.remove(
      "hidden"
    );


  $("appScreen")
    ?.classList.add(
      "hidden"
    );

}


// =====================================================
// AUTH STATE CHANGES
// =====================================================

db.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    if (
      session?.user &&
      !isGuest
    ) {

      await bootUser(
        session.user
      );

    }

  }
);


// =====================================================
// START
// =====================================================

window.addEventListener("DOMContentLoaded", initializeApp);

// =====================================================
// YEAR VIEW
// =====================================================

async function renderYear() {

  const year = currentDate.getFullYear();

  const from = `${year}-01`;
  const to = `${year}-12`;

  let months = [];
  let yearExpenses = [];
  let yearFixedExpenses = [];


  // =========================
  // GUEST
  // =========================

  if (isGuest) {

    const store = readGuestStore();

    yearFixedExpenses = Object.entries(store.months || {})
      .filter(([key]) => key >= from && key <= to)
      .flatMap(([, data]) => data.fixed_expenses || []);

    months = Object.entries(
      store.months || {}
    )
      .filter(([key]) =>
        key >= from && key <= to
      )
      .map(([monthKey, data]) => ({
        month_key: monthKey,
        salary: Number(data.salary || 0),
        savings_goal: Number(
          data.savings_goal || 0
        )
      }));


    yearExpenses = Object.entries(
      store.expenses || {}
    )
      .filter(([key]) =>
        key >= from && key <= to
      )
      .flatMap(([monthKey, rows]) =>
        (rows || []).map(item => ({
          ...item,
          month_key: monthKey
        }))
      );

  }


  // =========================
  // GOOGLE USER
  // =========================

  else {

    if (!currentUser) return;


    const [
      monthsResult,
      expensesResult,
      fixedResult
    ] = await Promise.all([

      db
        .from("months")
        .select(
          "month_key, salary, savings_goal"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .gte(
          "month_key",
          from
        )
        .lte(
          "month_key",
          to
        ),

      db
        .from("expenses")
        .select(
          "month_key, amount"
        )
        .eq(
          "user_id",
          currentUser.id
        )
        .gte(
          "month_key",
          from
        )
        .lte(
          "month_key",
          to
        )

      ,
      db
        .from("fixed_expenses")
        .select("month_key, amount")
        .eq("user_id", currentUser.id)
        .gte("month_key", from)
        .lte("month_key", to)
    ]);


    if (monthsResult.error) {

      console.error(
        "Year months error:",
        monthsResult.error
      );

      return;

    }


    if (expensesResult.error) {

      console.error(
        "Year expenses error:",
        expensesResult.error
      );

      return;

    }


    months =
      monthsResult.data || [];

    if (fixedResult.error) {
      console.error("Year fixed expenses error:", fixedResult.error);
      return;
    }
    yearFixedExpenses = fixedResult.data || [];


    yearExpenses =
      expensesResult.data || [];

  }


  // =========================
  // TOTALS
  // =========================

  const earned =
    months.reduce(
      (sum, month) =>
        sum +
        Number(month.salary || 0),
      0
    );


  const saved =
    months.reduce(
      (sum, month) =>
        sum +
        Number(
          month.savings_goal || 0
        ),
      0
    );


  const spent =
    [...yearExpenses, ...yearFixedExpenses].reduce(
      (sum, expense) =>
        sum +
        Number(expense.amount || 0),
      0
    );


  if ($("yearHeading")) {
    $("yearHeading").textContent =
      year;
  }


  if ($("yearEarned")) {
    $("yearEarned").textContent =
      money(earned);
  }


  if ($("yearSpent")) {
    $("yearSpent").textContent =
      money(spent);
  }


  if ($("yearSaved")) {
    $("yearSaved").textContent =
      money(saved);
  }


  // =========================
  // MONTH CARDS
  // =========================

  const existingMonths =
    new Set(
      months.map(
        month => month.month_key
      )
    );


  const locale =
    lang === "ar"
      ? "ar"
      : lang === "he"
      ? "he"
      : "en";


  if ($("yearMonths")) {

    $("yearMonths").innerHTML =
      Array.from(
        { length: 12 },
        (_, index) => {

          const date =
            new Date(
              year,
              index,
              1
            );


          const monthKey =
            keyOf(date);


          const monthName =
            new Intl.DateTimeFormat(
              locale,
              {
                month: "short"
              }
            ).format(date);


          const hasData =
            existingMonths.has(
              monthKey
            );


          return `
            <button
              type="button"
              class="year-month ${
                hasData
                  ? "has-data"
                  : ""
              }"
              onclick="goMonth(${year}, ${index})"
            >

              <strong>
                ${monthName}
              </strong>

              <small>
                ${hasData ? "✓" : "—"}
              </small>

            </button>
          `;

        }
      )
      .join("");

  }

}


// =====================================================
// GO TO MONTH FROM YEAR VIEW
// =====================================================

async function goMonth(year, monthIndex) {
  await navigateKeep({ month: keyOf(new Date(year, monthIndex, 1)), view: 'month', modal: null });
}

$("resetMonthBtn")?.addEventListener("click", resetCurrentMonth);
$("monthViewBtn")?.addEventListener("click", () => navigateKeep({ view: 'month', modal: null }));
$("yearViewBtn")?.addEventListener("click", () => navigateKeep({ view: 'year', modal: null }));
