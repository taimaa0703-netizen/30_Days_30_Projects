const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const focusTask = document.getElementById("focusTask");

const timeButtons = document.querySelectorAll("[data-minutes]");
const customBtn = document.getElementById("customBtn");
const customBox = document.getElementById("customBox");
const customMinutes = document.getElementById("customMinutes");
const setCustomBtn = document.getElementById("setCustomBtn");

const progressRing = document.getElementById("progressRing");
const statusText = document.getElementById("status");

const distractionDisplay = document.getElementById("distractionCount");
const awayTimeDisplay = document.getElementById("awayTime");

const setupScreen = document.getElementById("setupScreen");
const timerCircle = document.querySelector(".timer-circle");
const controls = document.querySelector(".controls");
const liveStats = document.querySelector(".live-stats");

const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultTask = document.getElementById("resultTask");
const focusScoreDisplay = document.getElementById("focusScore");
const resultMinutes = document.getElementById("resultMinutes");
const resultEscapes = document.getElementById("resultEscapes");
const resultStreak = document.getElementById("resultStreak");
const reaction = document.getElementById("reaction");
const personalBest = document.getElementById("personalBest");
const bestScoreDisplay = document.getElementById("bestScore");
const againBtn = document.getElementById("againBtn");


/* -------------------------
   TIMER SETTINGS
------------------------- */

let selectedMinutes = 25;
let totalTime = selectedMinutes * 60;
let timeLeft = totalTime;

let timer = null;
let isRunning = false;


/* -------------------------
   DISTRACTION TRACKING
------------------------- */

let distractions = 0;

let totalAwaySeconds = 0;

let awayStartedAt = null;

let sessionStartedAt = null;

let streakStartedAt = null;

let longestStreakSeconds = 0;


/* -------------------------
   PROGRESS RING
------------------------- */

const radius = 140;
const circumference = 2 * Math.PI * radius;

progressRing.style.strokeDasharray = circumference;
progressRing.style.strokeDashoffset = 0;


/* -------------------------
   PERSONAL BEST
------------------------- */

let bestScore =
  Number(localStorage.getItem("focusFlowBest")) || 0;

updateBestScore();


function updateBestScore() {

  bestScoreDisplay.textContent =
    bestScore > 0
      ? `${bestScore}%`
      : "—";
}


/* -------------------------
   DISPLAY
------------------------- */

function updateDisplay() {

  const minutes =
    Math.floor(timeLeft / 60);

  const seconds =
    timeLeft % 60;

  minutesDisplay.textContent =
    String(minutes).padStart(2, "0");

  secondsDisplay.textContent =
    String(seconds).padStart(2, "0");

  const progress =
    timeLeft / totalTime;

  progressRing.style.strokeDashoffset =
    circumference * (1 - progress);
}


/* -------------------------
   PRESET TIME
------------------------- */

timeButtons.forEach(button => {

  button.addEventListener("click", () => {

    if (isRunning) return;

    selectedMinutes =
      Number(button.dataset.minutes);

    setTime(selectedMinutes);

    document
      .querySelectorAll(".time-btn")
      .forEach(btn =>
        btn.classList.remove("active")
      );

    button.classList.add("active");

    customBox.classList.remove("show");
  });

});


function setTime(minutes) {

  selectedMinutes = minutes;

  totalTime = minutes * 60;
  timeLeft = totalTime;

  updateDisplay();
}


/* -------------------------
   CUSTOM TIME
------------------------- */

customBtn.addEventListener("click", () => {

  if (isRunning) return;

  customBox.classList.toggle("show");
});


setCustomBtn.addEventListener("click", () => {

  const value =
    Math.floor(Number(customMinutes.value));

  if (
    !Number.isFinite(value) ||
    value < 1 ||
    value > 180
  ) {

    statusText.textContent =
      "Choose between 1 and 180 minutes.";

    return;
  }

  setTime(value);

  document
    .querySelectorAll(".time-btn")
    .forEach(btn =>
      btn.classList.remove("active")
    );

  customBtn.classList.add("active");

  customBox.classList.remove("show");

  statusText.textContent =
    "Custom session ready.";
});


/* -------------------------
   START / PAUSE
------------------------- */

startBtn.addEventListener("click", () => {

  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});


function startTimer() {

  if (timeLeft <= 0) return;

  isRunning = true;

  startBtn.textContent = "Pause";

  statusText.textContent =
    "Stay with it. No disappearing 👀";

  const now = Date.now();

  if (!sessionStartedAt) {
    sessionStartedAt = now;
  }

  streakStartedAt = now;

  timer = setInterval(() => {

    if (timeLeft > 0) {

      timeLeft--;

      updateDisplay();
    }

    if (timeLeft <= 0) {
      finishSession();
    }

  }, 1000);
}


function pauseTimer() {

  clearInterval(timer);

  timer = null;
  isRunning = false;

  updateCurrentStreak();

  streakStartedAt = null;

  startBtn.textContent =
    "Continue Focus";

  statusText.textContent =
    "Paused — your streak stopped.";
}


/* -------------------------
   RESET
------------------------- */

resetBtn.addEventListener("click", () => {

  clearInterval(timer);

  timer = null;
  isRunning = false;

  timeLeft = totalTime;

  distractions = 0;
  totalAwaySeconds = 0;

  awayStartedAt = null;
  sessionStartedAt = null;
  streakStartedAt = null;
  longestStreakSeconds = 0;

  distractionDisplay.textContent = "0";
  awayTimeDisplay.textContent = "00:00";

  startBtn.textContent = "Start Focus";
  statusText.textContent = "Ready when you are.";

  updateDisplay();
});


/* -------------------------
   AUTOMATIC DISTRACTION
   DETECTION 👀
------------------------- */

document.addEventListener(
  "visibilitychange",
  () => {

    if (!isRunning) return;


    /* USER LEFT THE TAB */

    if (document.hidden) {

      distractions++;

      distractionDisplay.textContent =
        distractions;

      awayStartedAt = Date.now();

      updateCurrentStreak();

      streakStartedAt = null;
    }


    /* USER CAME BACK */

    else {

      if (awayStartedAt) {

        const awaySeconds =
          Math.max(
            1,
            Math.round(
              (Date.now() - awayStartedAt) / 1000
            )
          );

        totalAwaySeconds +=
          awaySeconds;

        awayStartedAt = null;

        updateAwayDisplay();

        statusText.textContent =
          `Caught you 👀 You disappeared for ${formatDuration(awaySeconds)}.`;

        streakStartedAt = Date.now();
      }
    }

  }
);


/* -------------------------
   STREAK
------------------------- */

function updateCurrentStreak() {

  if (!streakStartedAt) return;

  const seconds =
    Math.floor(
      (Date.now() - streakStartedAt) / 1000
    );

  if (seconds > longestStreakSeconds) {

    longestStreakSeconds =
      seconds;
  }
}


/* -------------------------
   AWAY TIME
------------------------- */

function updateAwayDisplay() {

  awayTimeDisplay.textContent =
    formatDuration(totalAwaySeconds);
}


/* -------------------------
   FORMAT TIME
------------------------- */

function formatDuration(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    seconds % 60;

  return (
    String(minutes).padStart(2, "0")
    +
    ":"
    +
    String(remainingSeconds).padStart(2, "0")
  );
}


/* -------------------------
   SESSION FINISHED
------------------------- */

function finishSession() {

  clearInterval(timer);

  timer = null;
  isRunning = false;

  updateCurrentStreak();

  /* In case timer finishes while tab is hidden */

  if (awayStartedAt) {

    const finalAway =
      Math.max(
        1,
        Math.round(
          (Date.now() - awayStartedAt) / 1000
        )
      );

    totalAwaySeconds += finalAway;

    awayStartedAt = null;
  }

  showResults();
}


/* -------------------------
   FOCUS SCORE
------------------------- */

function calculateFocusScore() {

  const sessionSeconds =
    totalTime;

  if (sessionSeconds <= 0) {
    return 100;
  }

  /*
    Time away is the biggest factor.
    Each escape also has a small penalty.
  */

  const awayRatio =
    Math.min(
      totalAwaySeconds / sessionSeconds,
      1
    );

  const awayPenalty =
    awayRatio * 100;

  const escapePenalty =
    Math.min(distractions * 2, 15);

  const score =
    Math.round(
      100
      - awayPenalty
      - escapePenalty
    );

  return Math.max(0, score);
}


/* -------------------------
   RESULTS
------------------------- */

function showResults() {

  const score =
    calculateFocusScore();

  const task =
    focusTask.value.trim()
    || "your goal";


  resultTask.textContent =
    `"${task}"`;

  focusScoreDisplay.textContent =
    `${score}%`;

  resultMinutes.textContent =
    selectedMinutes;

  resultEscapes.textContent =
    distractions;

  resultStreak.textContent =
    formatDuration(longestStreakSeconds);


  /* PERSONALITY */

  if (
    distractions === 0 &&
    score === 100
  ) {

    resultTitle.textContent =
      "WAIT... ZERO DISTRACTIONS?!";

    reaction.textContent =
      "Okay, who ARE you?! 😭 You stayed locked in the entire time. I'm impressed.";

  }

  else if (
    distractions === 1 &&
    score >= 90
  ) {

    resultTitle.textContent =
      "OKAYYY, LOOK AT YOU 👀";

    reaction.textContent =
      "I'll pretend I didn't see that one little escape. You came right back.";

  }

  else if (score >= 80) {

    resultTitle.textContent =
      "THAT WAS SOLID. ✦";

    reaction.textContent =
      `I caught ${distractions} little escape${distractions === 1 ? "" : "s"}, but you kept coming back. Respect.`;

  }

  else if (score >= 60) {

    resultTitle.textContent =
      "NOT PERFECT. STILL A WIN.";

    reaction.textContent =
      "Your attention wandered a little, but you finished what you started. Next session, beat this score.";

  }

  else {

    resultTitle.textContent =
      "GIRL... I SAW THAT 👀";

    reaction.textContent =
      "Were we focusing or sightseeing? 😭 You finished though — now let's try that again with fewer escapes.";

  }


  /* PERSONAL BEST */

  personalBest.classList.remove("show");

  if (score > bestScore) {

    bestScore = score;

    localStorage.setItem(
      "focusFlowBest",
      bestScore
    );

    personalBest.classList.add("show");

    updateBestScore();
  }


  setupScreen.style.display = "none";
  timerCircle.style.display = "none";
  controls.style.display = "none";
  liveStats.style.display = "none";

  resultScreen.classList.add("show");
}


/* -------------------------
   START ANOTHER SESSION
------------------------- */

againBtn.addEventListener("click", () => {

  resultScreen.classList.remove("show");

  setupScreen.style.display = "block";
  timerCircle.style.display = "grid";
  controls.style.display = "flex";
  liveStats.style.display = "flex";

  distractions = 0;
  totalAwaySeconds = 0;

  awayStartedAt = null;
  sessionStartedAt = null;
  streakStartedAt = null;
  longestStreakSeconds = 0;

  distractionDisplay.textContent = "0";
  awayTimeDisplay.textContent = "00:00";

  totalTime =
    selectedMinutes * 60;

  timeLeft =
    totalTime;

  startBtn.textContent =
    "Start Focus";

  statusText.textContent =
    "Ready when you are.";

  updateDisplay();
});


/* -------------------------
   INITIAL
------------------------- */

updateDisplay();