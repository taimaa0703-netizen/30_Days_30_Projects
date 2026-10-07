let tasks = [];
let currentLanguage = "en";

const taskName = document.getElementById("taskName");
const taskMinutes = document.getElementById("taskMinutes");
const priority = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const availableTime = document.getElementById("availableTime");
const availableHours = document.getElementById("availableHours");
const taskHours = document.getElementById("taskHours");


const translations = {

  en: {
    heroTitle: "Where's your time?",
    hero: "Maybe you don't need more time… maybe you just don't see it yet.",

    availableTime: "How much free time do you have?",
    minutesShort: "min",

    yourTasks: "YOUR TASKS",
    tasksTitle: "What needs to get done?",

    taskPlaceholder: "Finish assignment",
    minutesPlaceholder: "Minutes",
    hours: "Hours",
    timeUnit: "Time unit",
    timeHint: "Start with the time you really have.",
    emptyTasks: "A little space for everything on your mind.",
    durationLabel: "Task duration",
    priorityLabel: "Task priority",

    highPriority: "🔥 High priority",
    mediumPriority: "Medium priority",
    lowPriority: "Low priority",

    high: "🔥 High",
    medium: "Medium",
    low: "Low",

    addTask: "+ Add task",
    buildPlan: "FIND MY TIME ✨",

    yourPlan: "YOUR PLAN",
    whatFits: "Here's what actually fits 👀",

    timeUsed: "Time used",
    saveForLater: "SAVE FOR LATER",
    startAgain: "Start again",

    task: "task",
    tasks: "tasks",

    addTaskAlert: "Add a task and how long it takes 👀",
    timeAlert: "How much time do you actually have? 👀",
    noTasksAlert: "Add at least one task first 😅",


    nothingFits:
      "None of these tasks fit into the time you have 😅",

    plannedInto:
      "You planned {total} minutes into {available}. 😅",

    cryForHelp:
      "That's not a schedule.<br>That's a cry for help.",

    plannedOver:
      "You planned {total} minutes into {available}. 👀",

    realisticDay:
      "Maybe you don't need more productivity.<br>Maybe you need a more realistic day.",

    productivityQueen:
      "Look at that 👀✨",

    planFits:
      "You had enough time after all.",

    start:
      "START"
  },


  ar: {
    heroTitle: "وين وقتك؟",
    hero: "يمكن مش ناقصك وقت… يمكن بس مش شايفه.",

    availableTime: "قديش عندك وقت فاضي؟",
    minutesShort: "دقيقة",

    yourTasks: "مهامك",
    tasksTitle: "شو لازم تخلّص اليوم؟",

    taskPlaceholder: "خلّص المهمة",
    minutesPlaceholder: "دقائق",
    hours: "ساعات",
    timeUnit: "وحدة الوقت",
    timeHint: "ابدأ بالوقت اللي عندك فعلًا.",
    emptyTasks: "مساحة صغيرة لكل اللي ببالك.",
    durationLabel: "مدة المهمة",
    priorityLabel: "أولوية المهمة",

    highPriority: "🔥 أولوية عالية",
    mediumPriority: "أولوية متوسطة",
    lowPriority: "أولوية منخفضة",

    high: "🔥 عالية",
    medium: "متوسطة",
    low: "منخفضة",

    addTask: "+ أضف مهمة",
    buildPlan: "رتبلي المهام",

    yourPlan: "خطتك",
    whatFits: "هذا اللي فعلًا بلحق 👀",

    timeUsed: "الوقت المستخدم",
    saveForLater: "خليه لبعدين",
    startAgain: "ابدأ من جديد",

    task: "مهمة",
    tasks: "مهام",

    addTaskAlert:
      "أضف المهمة وقديش بدها وقت 👀",

    timeAlert:
      "قديش عندك وقت فعلًا؟ 👀",

    noTasksAlert:
      "أضف مهمة وحدة على الأقل 😅",



    nothingFits:
      "ولا مهمة من هدول بتلحق بالوقت اللي عندك 😅",

    plannedInto:
      "مخطط لـ {total} دقيقة بوقت فيه بس {available} دقيقة 😅",

    cryForHelp:
      "هاي مش خطة.<br>هاي صرخة استغاثة 😅",

    plannedOver:
      "مخطط لـ {total} دقيقة بوقت فيه {available} دقيقة 👀",

    realisticDay:
      "يمكن المشكلة مش إنك محتاج وقت أكتر.<br>يمكن بس محتاج تشوف وقتك بشكل أوضح.",

    productivityQueen:
      "شفت؟ 👀✨",

    planFits:
      "طلع عندك وقت أكتر مما كنت مفكّر.",

    start:
      "البداية"
  },


  he: {
    heroTitle: "איפה הזמן שלך?",
    hero: "אולי לא חסר לך זמן… אולי אתה פשוט לא רואה אותו.",

    availableTime: "כמה זמן פנוי יש לך?",
    minutesShort: "דק׳",

    yourTasks: "המשימות שלך",
    tasksTitle: "מה צריך להספיק היום?",

    taskPlaceholder: "לסיים את המטלה",
    minutesPlaceholder: "דקות",
    hours: "שעות",
    timeUnit: "יחידת זמן",
    timeHint: "מתחילים בזמן שבאמת עומד לרשותך.",
    emptyTasks: "קצת מקום לכל מה שיש לך בראש.",
    durationLabel: "משך המשימה",
    priorityLabel: "עדיפות המשימה",

    highPriority: "🔥 עדיפות גבוהה",
    mediumPriority: "עדיפות בינונית",
    lowPriority: "עדיפות נמוכה",

    high: "🔥 גבוהה",
    medium: "בינונית",
    low: "נמוכה",

    addTask: "+ הוספת משימה",
    buildPlan: "מצא לי את הזמן ✨",

    yourPlan: "התוכנית שלך",
    whatFits: "זה מה שבאמת נכנס בזמן 👀",

    timeUsed: "זמן שנוצל",
    saveForLater: "נשמור לאחר כך",
    startAgain: "להתחיל מחדש",

    task: "משימה",
    tasks: "משימות",

    addTaskAlert:
      "תוסיף משימה וכמה זמן היא לוקחת 👀",

    timeAlert:
      "כמה זמן באמת יש לך? 👀",

    noTasksAlert:
      "תוסיף לפחות משימה אחת 😅",



    nothingFits:
      "אף אחת מהמשימות לא נכנסת בזמן שיש לך 😅",

    plannedInto:
      "תכננת {total} דקות בתוך {available} דקות 😅",

    cryForHelp:
      "זו לא תוכנית.<br>זו קריאה לעזרה 😅",

    plannedOver:
      "תכננת {total} דקות בתוך {available} דקות 👀",

    realisticDay:
      "אולי לא חסר לך זמן.<br>אולי אתה פשוט צריך לראות אותו בצורה ברורה יותר.",

    productivityQueen:
      "ראית? 👀✨",

    planFits:
      "מסתבר שהיה לך יותר זמן ממה שחשבת.",

    start:
      "התחלה"
  }

};


