// ========================
// ELEMENTS
// ========================

const setupScreen =
  document.getElementById("setupScreen");

const gameScreen =
  document.getElementById("gameScreen");

const resultsScreen =
  document.getElementById("resultsScreen");


const playerName =
  document.getElementById("playerName");

const addPlayerBtn =
  document.getElementById("addPlayerBtn");

const playersList =
  document.getElementById("playersList");

const playerCount =
  document.getElementById("playerCount");


const vibeButtons =
  document.querySelectorAll(".vibe-btn");


const customQuestion =
  document.getElementById("customQuestion");

const addQuestionBtn =
  document.getElementById("addQuestionBtn");

const questionMessage =
  document.getElementById("questionMessage");


const startBtn =
  document.getElementById("startBtn");

const quitBtn =
  document.getElementById("quitBtn");


const questionCounter =
  document.getElementById("questionCounter");

const progressFill =
  document.getElementById("progressFill");

const questionText =
  document.getElementById("questionText");

const voteOptions =
  document.getElementById("voteOptions");


const winnerName =
  document.getElementById("winnerName");

const winnerVotes =
  document.getElementById("winnerVotes");

const finalResults =
  document.getElementById("finalResults");


const copyResultsBtn =
  document.getElementById("copyResultsBtn");

const playAgainBtn =
  document.getElementById("playAgainBtn");


// ========================
// DATA
// ========================

let players = [];

let selectedVibe = "funny";

let customQuestions = [];

let gameQuestions = [];

let currentQuestion = 0;


// ========================
// QUESTIONS
// ========================

const questions = {

  funny: [
    "be late to their own wedding? 😂",
    "say “I'm 5 minutes away” while still at home? 😭",
    "lose their phone while holding it? 📱",
    "laugh at the worst possible moment? 💀",
    "order food and then eat everyone else's? 🍟",
    "fall asleep during a movie they chose? 😴",
    "send a message to the wrong person? 👀",
    "forget why they walked into a room? 😂",
    "survive a zombie apocalypse by accident? 🧟",
    "turn a small story into a 40-minute story? 🎤"
  ],

  friends: [
    "plan the whole group trip? ✈️",
    "remember everyone's birthday? 🎂",
    "answer the phone at 3 AM? 💗",
    "give the best advice? 🫶",
    "make everyone laugh when things go wrong? 😂",
    "organize a last-minute hangout? 👀",
    "take 200 photos on one night out? 📸",
    "keep everyone's secrets? 🤐",
    "bring snacks for everyone? 🍫",
    "become everyone's emergency contact? 📞"
  ],

  work: [
    "say 'quick question' and start a 30-minute conversation? 😂",
    "be first to suggest ordering food? 🍕",
    "have 37 tabs open at once? 💻",
    "reply to a message in 0.2 seconds? ⚡",
    "forget they're on mute? 🎤",
    "turn a coffee break into a meeting? ☕",
    "know all the office gossip? 👀",
    "say 'let's circle back' seriously? 😭",
    "arrive with coffee for everyone? 💗",
    "still be working when everyone else left? 💻"
  ],

  savage: [
    "leave the group chat dramatically? 💀",
    "read the message and never reply? 👀",
    "say 'I'm fine' when they're definitely not? 😂",
    "cancel plans at the last minute? 🫠",
    "stalk someone's profile back to 2018? 📱",
    "win an argument even when they're wrong? 😭",
    "know the tea before everyone else? ☕",
    "accidentally start drama? 🔥",
    "say something savage with a completely straight face? 💀",
    "pretend they didn't see the message? 👀"
  ]

};


// ========================
// ADD PLAYER
// ========================

addPlayerBtn.addEventListener(
  "click",
  addPlayer
);


playerName.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      addPlayer();
    }

  }
);


function addPlayer() {

  const name =
    playerName.value.trim();

  if (!name) return;


  const exists =
    players.some(
      player =>
        player.name.toLowerCase() ===
        name.toLowerCase()
    );


  if (exists) {

    alert(`${name} is already here 👀`);

    playerName.value = "";

    return;

  }


  players.push({

    id: Date.now() + Math.random(),

    name: name,

    votes: 0

  });


  playerName.value = "";

  renderPlayers();

}


// ========================
// RENDER PLAYERS
// ========================

function renderPlayers() {

  playersList.innerHTML = "";


  players.forEach(player => {

    const chip =
      document.createElement("div");

    chip.className =
      "player-chip";


    chip.innerHTML = `

      <span>
        ${player.name}
      </span>

      <button
        data-id="${player.id}"
        aria-label="Remove ${player.name}"
      >
        ×
      </button>

    `;


    playersList.appendChild(chip);

  });


  playerCount.textContent =
    `${players.length} ${
      players.length === 1
        ? "player"
        : "players"
    }`;


  document
    .querySelectorAll(".player-chip button")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);


          players =
            players.filter(
              player =>
                player.id !== id
            );


          renderPlayers();

        }
      );

    });

}


// ========================
// VIBE
// ========================

vibeButtons.forEach(button => {

  button.addEventListener(
    "click",
    () => {

      vibeButtons.forEach(btn =>
        btn.classList.remove("active")
      );


      button.classList.add("active");


      selectedVibe =
        button.dataset.vibe;

    }
  );

});


// ========================
// CUSTOM QUESTION
// ========================

addQuestionBtn.addEventListener(
  "click",
  addCustomQuestion
);


customQuestion.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      addCustomQuestion();
    }

  }
);


function addCustomQuestion() {

  let text =
    customQuestion.value.trim();


  if (!text) return;


  text =
    text.replace(
      /^who['’]?s most likely to\s*/i,
      ""
    );


  customQuestions.push(text);


  customQuestion.value = "";


  questionMessage.textContent =
    `Added! ${customQuestions.length} custom ${
      customQuestions.length === 1
        ? "question"
        : "questions"
    } 👀`;


  setTimeout(() => {

    questionMessage.textContent = "";

  }, 1800);

}


// ========================
// START GAME
// ========================

startBtn.addEventListener(
  "click",
  startGame
);


function startGame() {

  if (players.length < 2) {

    alert(
      "Add at least 2 people first 👀"
    );

    return;

  }


  players.forEach(player => {
    player.votes = 0;
  });


  currentQuestion = 0;


  let selectedQuestions = [];


  if (selectedVibe === "mixed") {

    selectedQuestions = [

      ...questions.funny,
      ...questions.friends,
      ...questions.work,
      ...questions.savage

    ];

  } else {

    selectedQuestions = [
      ...questions[selectedVibe]
    ];

  }


  selectedQuestions.push(
    ...customQuestions
  );


  gameQuestions =
    shuffle(selectedQuestions)
      .slice(0, 10);


  showScreen(gameScreen);

  renderQuestion();

}


// ========================
// QUESTION
// ========================

function renderQuestion() {

  const question =
    gameQuestions[currentQuestion];


  questionText.textContent =
    question;


  questionCounter.textContent =
    `${currentQuestion + 1} / ${gameQuestions.length}`;


  const progress =
    ((currentQuestion) /
      gameQuestions.length) * 100;


  progressFill.style.width =
    `${progress}%`;


  voteOptions.innerHTML = "";


  players.forEach(player => {

    const button =
      document.createElement("button");


    button.className =
      "vote-btn";


    button.textContent =
      player.name;


    button.addEventListener(
      "click",
      () => vote(player.id)
    );


    voteOptions.appendChild(button);

  });

}


// ========================
// VOTE
// ========================

function vote(playerId) {

  const player =
    players.find(
      player =>
        player.id === playerId
    );


  if (!player) return;


  player.votes++;


  currentQuestion++;


  if (
    currentQuestion >=
    gameQuestions.length
  ) {

    showResults();

    return;

  }


  renderQuestion();

}


// ========================
// RESULTS
// ========================

function showResults() {

  progressFill.style.width = "100%";


  const sortedPlayers =
    [...players].sort(
      (a, b) =>
        b.votes - a.votes
    );


  const winner =
    sortedPlayers[0];


  winnerName.textContent =
    winner.name;


  winnerVotes.textContent =
    `${winner.votes} ${
      winner.votes === 1
        ? "vote"
        : "votes"
    }`;


  finalResults.innerHTML = "";


  sortedPlayers.forEach(
    (player, index) => {

      const row =
        document.createElement("div");


      row.className =
        "result-row";


      row.innerHTML = `

        <span>
          ${index === 0 ? "👑 " : ""}
          ${player.name}
        </span>

        <strong>
          ${player.votes}
          ${player.votes === 1
            ? "vote"
            : "votes"}
        </strong>

      `;


      finalResults.appendChild(row);

    }
  );


  showScreen(resultsScreen);

}


// ========================
// COPY RESULTS
// ========================

copyResultsBtn.addEventListener(
  "click",
  async () => {

    const sortedPlayers =
      [...players].sort(
        (a, b) =>
          b.votes - a.votes
      );


    let message =
      `Who's Most Likely To? 👀😂\n\n`;


    sortedPlayers.forEach(
      (player, index) => {

        message +=
          `${index + 1}. ${player.name} — ${player.votes} votes\n`;

      }
    );


    message +=
      `\nApparently we know each other too well 😂`;


    try {

      await navigator.clipboard
        .writeText(message);


      copyResultsBtn.textContent =
        "Copied! Send the drama 😂";


      setTimeout(() => {

        copyResultsBtn.textContent =
          "Copy results 📲";

      }, 2000);


    } catch {

      alert(
        "Couldn't copy the results."
      );

    }

  }
);


// ========================
// PLAY AGAIN
// ========================

playAgainBtn.addEventListener(
  "click",
  () => {

    players.forEach(player => {
      player.votes = 0;
    });


    currentQuestion = 0;


    showScreen(setupScreen);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// ========================
// QUIT
// ========================

quitBtn.addEventListener(
  "click",
  () => {

    showScreen(setupScreen);

  }
);


// ========================
// SCREEN
// ========================

function showScreen(screen) {

  document
    .querySelectorAll(".screen")
    .forEach(item =>
      item.classList.remove("active")
    );


  screen.classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ========================
// SHUFFLE
// ========================

function shuffle(array) {

  const copy = [...array];


  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );


    [
      copy[i],
      copy[j]
    ] = [
      copy[j],
      copy[i]
    ];

  }


  return copy;

}


// ========================
// INITIAL
// ========================

renderPlayers();