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
    description: "Split bills quickly between friends.",
    tags: ["HTML", "CSS", "JavaScript"],
    link: "#",
    unlocked: false
  },

  {
    day: 3,
    name: "Password Check",
    description: "Check how strong your password really is.",
    tags: ["JavaScript"],
    link: "#",
    unlocked: false
  }
];


// Add locked placeholders until Day 30

for (let i = projects.length + 1; i <= 30; i++) {

  projects.push({
    day: i,
    unlocked: false
  });

}


const grid = document.getElementById("projectsGrid");

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

});


// PROGRESS

const percentage = (completed / 30) * 100;

document.getElementById("completedCount").textContent = completed;

document.getElementById("progressPercentage").textContent =
  Math.round(percentage) + "%";

document.getElementById("progressFill").style.width =
  percentage + "%";