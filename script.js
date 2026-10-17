const projects = [
  {
    day: 1,
    name: "FocusFlow",
    description: "Stay focused. FocusFlow will know when you don’t. 👀",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "projects/01_FocusFlow/",
    unlocked: true
  },

  {
  day: 2,
  name: "Split It",
  description: "No drama. Just the bill. 💸",
  tags: ["HTML", "CSS", "JavaScript"],
  link: "projects/02_SplitIt/",
  unlocked: true
},

  {
  day: 3,
  name: "Who's Most Likely To?",
  description: "We all know who. Let's make it official. 👀",
  tags: ["HTML", "CSS", "JavaScript"],
  link: "projects/03_WhosMostLikelyTo/",
  unlocked: true
},

{
  day: 4,
  name: "PARKD.",
  description: "You parked. We remembered. 🚗📍",
  tags: ["HTML", "CSS", "JavaScript"],
  link: "projects/04_Parked/",
  unlocked: true
},
{
  day: 5,
  name: "KEEP.",
  description: "Your money, remembered. Plan your month and track your spending.",
  tags: ["HTML", "CSS", "JavaScript", "Supabase"],
  link: "projects/05_KEEP/index.html",
  unlocked: true
},
{
  day: 6,
  name: "SPARE.",
  description: "Make time for what matters. Plan your tasks, stay focused with a timer, and track your weekly and monthly progress.",
  tags: ["HTML", "CSS", "JavaScript"],
  link: "projects/06_DoIHaveTime/index.html?v=20261008-10",
  unlocked: true
},
{
  day: 7,
  name: "ADPULSE.",
  description: "Campaign intelligence for ad performance. Spot anomalies, compare channels and get a written PPC report.",
  tags: ["HTML", "CSS", "JavaScript", "Node.js"],
  link: "projects/07_ADPULSE/index.html",
  unlocked: true
},
{
  day: 8,
  name: "LEAD DNA.",
  description: "Quality over quantity. Uncover which campaigns bring qualified leads and real revenue.",
  tags: ["React", "Vite", "Supabase", "Marketing Analytics"],
  link: "projects/lead-dna-saas/site/",
  unlocked: true
},

{
  day: 9,
  name: "DROP ALERT",
  description: "A smart water leak detector powered by Arduino. Detects water, plays the Star Wars melody, and displays live sensor readings on a dashboard.",
  tags: ["Arduino", "IoT", "JavaScript", "Hardware"],
  link: "projects/DROP_ALERT_Dashboard_9/",
  unlocked: true
},
{
  day: 10,
  name: "Subscription Detective",
  description: "Take control of recurring costs. Track subscriptions, get renewal reminders, and discover your savings.",
  tags: ["HTML", "CSS", "JavaScript", "Personal Finance"],
  link: "projects/Subscription_Detective_Day10/index.html",
  unlocked: true
},


{
  day: 11,
  name: "TYPE IT.",
  description: "Your words. Your aesthetic. Design beautiful posts and stories.",
  tags: ["HTML", "CSS", "JavaScript", "Design"],
  link: "projects/11_TypeIt/",
  unlocked: true
},



{
  day: 12,
  name: "CARECODE.",
  description: "Decode clothing-care symbols and save easy instructions for your favorite pieces.",
  tags: ["HTML", "CSS", "JavaScript", "Lifestyle"],
  link: "projects/CARECODE_Day12/",
  unlocked: true
},

{
  day: 13,
  name: "SCOPE.",
  description: "Track project changes, estimate extra work, and keep every request organized.",
  tags: ["HTML", "CSS", "JavaScript", "Project Management"],
  link: "projects/day13-scope/",
  unlocked: true
},

{
  day: 14,
  name: "WHO SAID YES?",
  description: "Keep project decisions, approvals, version changes, and activity history in one place.",
  tags: ["HTML", "CSS", "JavaScript", "Project Management"],
  link: "projects/who_said_yes_day14/index.html",
  unlocked: true
},

{
  day: 15,
  name: "CLASSVERSE",
  description: "Turn every lesson into a multilingual, real-time classroom adventure.",
  tags: ["Node.js", "Socket.IO", "Education", "Multilingual"],
  link: "projects/CLASSVERSE/",
  unlocked: true
},

];


// Add locked placeholders until Day 30

for (let i = projects.length + 1; i <= 30; i++) {

  projects.push({
    day: i,
    unlocked: false
  });

}


const grid = document.getElementById("projectsGrid");

function renderGalleryCards() {
  let completed = 0;

  projects.forEach(project => {
    const card = document.createElement("div");

    card.classList.add("project-card");

    if (project.unlocked) {
      completed++;
      card.classList.add("unlocked");
      card.innerHTML = `

      <div class="project-number">
        PROJECT ${String(project.day).padStart(2, "0")}
      </div>

      <div class="project-content">

        <h3>${project.name}</h3>

        <p class="project-description" data-project-day="${project.day}">
            ${project.description}
        </p>

        <div class="tags">

          ${project.tags
            .map(tag => `<span class="tag">${tag}</span>`)
            .join("")}

        </div>

        <a
          href="${project.link}"
          class="project-link"  
        >
          ${translations[language].viewProject}
        </a>

      </div>

    `;
    } else {
      card.innerHTML = `

      <div class="project-number">
        PROJECT ${String(project.day).padStart(2, "0")}
      </div>

      <div class="lock-area">

        <span class="lock">🔒</span>

        <span class="locked-text">
          ${translations[language].locked}
        </span>

      </div>

      <div></div>

    `;
    }
    grid.appendChild(card);
  });

  const percentage = (completed / 30) * 100;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("progressPercentage").textContent =
    Math.round(percentage) + "%";
  document.getElementById("progressFill").style.width = percentage + "%";
}

const translations = {
  en: {
    date: "OCTOBER 2026",
    status: "CHALLENGE IN PROGRESS",
    eyebrow: "MY CODING CHALLENGE",
    days: "30 DAYS",
    projects: "30 PROJECTS",
    intro: "One project every day. Learning, building and getting better one line of code at a time.",
    scroll: "↓ SCROLL TO UNLOCK",
    progress: "CHALLENGE PROGRESS",
    total: "/ 30 PROJECTS",
    collection: "THE COLLECTION",
    collectionTitle: "30 things I'm building.",
    footer: "30 DAYS • 30 PROJECTS",
    credit: "BUILT BY TAIMAA ✦ 2026",
    project: "PROJECT",
    viewProject: "VIEW PROJECT →",
    locked: "LOCKED"
  }
};

const language = "en";
localStorage.removeItem("gallery-language");

function applyLanguage() {
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";

  const textById = {
    challengeDate: translations[language].date,
    challengeStatus: translations[language].status,
    heroEyebrow: translations[language].eyebrow,
    heroDays: translations[language].days,
    heroProjects: translations[language].projects,
    heroText: translations[language].intro,
    scrollText: translations[language].scroll,
    progressLabel: translations[language].progress,
    progressTotal: translations[language].total,
    collectionEyebrow: translations[language].collection,
    collectionTitle: translations[language].collectionTitle,
    footerChallenge: translations[language].footer,
    footerCredit: translations[language].credit
  };
  Object.entries(textById).forEach(([id, text]) => {
    document.getElementById(id).textContent = text;
  });

  grid.querySelectorAll(".project-number").forEach((label, index) => {
    label.textContent = `${translations[language].project} ${String(index + 1).padStart(2, "0")}`;
  });
  grid.querySelectorAll(".project-link").forEach(link => {
    link.textContent = translations[language].viewProject;
  });
  grid.querySelectorAll(".project-description").forEach(description => {
    const project = projects[Number(description.dataset.projectDay) - 1];
    description.textContent =
      project.description;
  });
  grid.querySelectorAll(".locked-text").forEach(label => {
    label.textContent = translations[language].locked;
  });
}

renderGalleryCards();
applyLanguage(language);
