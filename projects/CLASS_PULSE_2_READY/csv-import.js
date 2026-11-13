(() => {
  const labels = {
    en: { button: "↑ Import CSV", error: "CSV import failed", added: "added", updated: "updated" },
    he: { button: "↑ ייבוא CSV", error: "ייבוא CSV נכשל", added: "נוספו", updated: "עודכנו" },
    ar: { button: "↑ استيراد CSV", error: "فشل استيراد CSV", added: "تمت إضافتهم", updated: "تم تحديثهم" }
  };
  const aliases = {
    name: ["student", "students", "name", "studentname", "תלמיד", "שם", "שםתלמיד", "طالب", "الطالب", "اسم", "اسمالطالب"],
    math: ["mathematics", "math", "מתמטיקה", "رياضيات"],
    reading: ["reading", "language", "שפה", "קריאה", "لغة", "قراءة"],
    science: ["science", "מדעים", "علوم"]
  };
  const normalize = value => String(value).normalize("NFKC").trim().toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");

  function parseCSV(text) {
    const source = text.replace(/^\uFEFF/, "");
    let delimiter = ",";
    let bestCount = -1;
    let quoted = false;
    for (let i = 0; i < source.length; i++) {
      if (source[i] === '"') {
        if (quoted && source[i + 1] === '"') i++;
        else quoted = !quoted;
      } else if (!quoted && (source[i] === "\n" || source[i] === "\r")) {
        break;
      } else if (!quoted && [",", ";", "\t"].includes(source[i])) {
        const candidate = source[i];
        let count = 0;
        for (let j = 0; j < source.length; j++) {
          if (source[j] === '"') {
            if (quoted && source[j + 1] === '"') j++;
            else quoted = !quoted;
          } else if (!quoted && (source[j] === "\n" || source[j] === "\r")) {
            break;
          } else if (!quoted && source[j] === candidate) count++;
        }
        quoted = false;
        if (count > bestCount) {
          bestCount = count;
          delimiter = candidate;
        }
      }
    }

    const rows = [];
    let row = [];
    let cell = "";
    quoted = false;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (quoted) {
        if (char === '"' && source[i + 1] === '"') {
          cell += '"';
          i++;
        } else if (char === '"') {
          quoted = false;
        } else {
          cell += char;
        }
      } else if (char === '"' && cell.length === 0) {
        quoted = true;
      } else if (char === delimiter) {
        row.push(cell);
        cell = "";
      } else if (char === "\n" || char === "\r") {
        if (char === "\r" && source[i + 1] === "\n") i++;
        row.push(cell);
        if (row.some(value => value.trim() !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    if (quoted) throw new Error("The CSV contains an unclosed quoted field.");
    row.push(cell);
    if (row.some(value => value.trim() !== "")) rows.push(row);
    if (rows.length < 2) throw new Error("Add a header row and at least one student.");

    const headers = rows[0].map(normalize);
    const columns = {};
    for (const [field, names] of Object.entries(aliases)) {
      const matches = headers.flatMap((header, index) =>
        names.includes(header) ? [index] : []);
      if (matches.length !== 1) {
        throw new Error(`The CSV must contain one ${field} column.`);
      }
      columns[field] = matches[0];
    }

    const seen = new Set();
    return rows.slice(1).map((cells, index) => {
      const line = index + 2;
      const name = (cells[columns.name] || "").trim();
      if (!name) throw new Error(`Row ${line}: student name is missing.`);
      const key = normalize(name);
      if (seen.has(key)) throw new Error(`Row ${line}: duplicate student name "${name}".`);
      seen.add(key);

      const student = { name };
      for (const field of ["math", "reading", "science"]) {
        const raw = (cells[columns[field]] || "").trim();
        const score = Number(raw);
        if (!raw || !Number.isFinite(score) || score < 0 || score > 100) {
          throw new Error(`Row ${line}: ${field} must be a number from 0 to 100.`);
        }
        student[field] = score;
      }
      return student;
    });
  }

  const actions = document.querySelector(".topbar .actions");
  if (!actions) throw new Error("CSV import controls could not be added.");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn secondary";
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".csv,text/csv";
  input.hidden = true;
  input.setAttribute("aria-label", "CSV file");
  const updateLabel = () => {
    const copy = labels[document.documentElement.lang] || labels.en;
    button.textContent = copy.button;
    button.setAttribute("aria-label", copy.button);
  };

  button.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const records = parseCSV(await file.text());
      const result = window.importClassPulseStudents(records);
      const copy = labels[document.documentElement.lang] || labels.en;
      window.showClassPulseToast(`${result.added} ${copy.added}, ${result.updated} ${copy.updated}.`);
    } catch (error) {
      const copy = labels[document.documentElement.lang] || labels.en;
      window.showClassPulseToast(`${copy.error}: ${error.message}`);
    } finally {
      input.value = "";
    }
  });

  updateLabel();
  new MutationObserver(updateLabel).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });
  actions.insertBefore(button, document.getElementById("exportBtn"));
  actions.append(input);
})();
