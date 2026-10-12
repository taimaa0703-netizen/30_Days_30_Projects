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

];


// Add locked placeholders until Day 30

for (let i = projects.length + 1; i <= 30; i++) {

  projects.push({
    day: i,
    unlocked: false
  });

}


const grid = document.getElementById("projectsGrid");

function createMilestone() {

  const section = document.createElement("section");

  section.className = "milestone";

  section.setAttribute("aria-label", "Special milestone: Project Passport");

  section.innerHTML = `
    <div class="milestone-inner">

      <a class="milestone-cover" href="projects/Project_Passport/" tabindex="-1" aria-hidden="true">
        <img
          src="projects/Project_Passport/journey-cover.png"
          alt="Project Passport cover"
          loading="lazy"
          width="1086"
          height="1448"
        >
      </a>

      <div class="milestone-text">

        <span class="milestone-badge">✦ 10/30 UNLOCKED — SPECIAL MILESTONE ✦</span>

        <h2>10 PROJECTS.<br>10 STAMPS.<br>ONE JOURNEY.</h2>

        <p class="milestone-quote">A little piece of my journey — and you're part of it. ♡</p>

        <p class="milestone-invite">Collect your stamps. Join the challenge. Your name could be on stamp 11!</p>

        <a class="milestone-btn" href="projects/Project_Passport/">OPEN YOUR PASSPORT ↗</a>

      </div>

    </div>
  `;

  return section;
}

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

        <p>
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
          VIEW PROJECT →
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
          LOCKED
        </span>

      </div>

      <div></div>

    `;

  }


  grid.appendChild(card);

  // Special milestone: rendered inside the same loop so it is never lost on re-render
  if (project.day === 10) {
    grid.appendChild(createMilestone());
  }

});


// PROGRESS

const percentage = (completed / 30) * 100;

document.getElementById("completedCount").textContent = completed;

document.getElementById("progressPercentage").textContent =
  Math.round(percentage) + "%";

document.getElementById("progressFill").style.width =
  percentage + "%";
