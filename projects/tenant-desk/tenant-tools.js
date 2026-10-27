(() => {
  const copy = {
    en: {
      import: "↑ Import CSV",
      reset: "Reset demo",
      imported: (added, updated) => `Imported ${added} requests; updated ${updated}.`,
      resetDone: "Demo data restored.",
      importError: "CSV import failed",
      resetConfirm: "Restore the original demo data? This replaces all saved properties, vendors, and requests."
    },
    he: {
      import: "↑ ייבוא CSV",
      reset: "איפוס הדמו",
      imported: (added, updated) => `יובאו ${added} קריאות, ועודכנו ${updated}.`,
      resetDone: "נתוני הדמו שוחזרו.",
      importError: "ייבוא CSV נכשל",
      resetConfirm: "לשחזר את נתוני הדמו המקוריים? הפעולה תחליף את כל הנכסים, הספקים והקריאות השמורים."
    },
    ar: {
      import: "↑ استيراد CSV",
      reset: "إعادة ضبط العرض",
      imported: (added, updated) => `تم استيراد ${added} من الطلبات وتحديث ${updated}.`,
      resetDone: "تمت استعادة بيانات العرض.",
      importError: "فشل استيراد CSV",
      resetConfirm: "هل تريد استعادة بيانات العرض الأصلية؟ سيؤدي ذلك إلى استبدال العقارات والموردين والطلبات المحفوظة."
    }
  };
  const normalize = value => String(value ?? "").normalize("NFKC").trim().toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
  const aliases = {
    id: ["id", "ticketid", "requestid", "מספר", "מזהה", "رقم", "معرف"],
    title: ["title", "issue", "request", "תיאורקצר", "כותרת", "בעיה", "العنوان", "المشكلة"],
    property: ["property", "building", "נכס", "בניין", "عقار", "مبنى"],
    unit: ["unit", "apartment", "יחידה", "דירה", "وحدة", "شقة"],
    tenant: ["tenant", "resident", "דייר", "مستأجر", "ساكن"],
    category: ["category", "סוג", "קטגוריה", "فئة", "التصنيف"],
    priority: ["priority", "עדיפות", "أولوية"],
    status: ["status", "סטטוס", "מצב", "الحالة"],
    vendor: ["vendor", "assignedvendor", "supplier", "ספק", "ספקמוקצה", "مورد", "المورد"],
    due: ["due", "duedate", "deadline", "תאריךיעד", "מועד", "تاريخالاستحقاق", "الموعد"],
    cost: ["cost", "amount", "עלות", "סכום", "التكلفة", "المبلغ"],
    created: ["created", "createddate", "נוצרבתאריך", "תאריךיצירה", "تاريخالإنشاء"],
    updated: ["updated", "updateddate", "עודכןבתאריך", "תאריךעדכון", "تاريخالتحديث"],
    notes: ["notes", "הערות", "ملاحظات"],
    description: ["description", "details", "תיאור", "פרטים", "الوصف", "التفاصيل"]
  };
  const labelKeys = {
    title: "title",
    property: "property",
    unit: "unit",
    tenant: "tenant",
    category: "category",
    priority: "priority",
    status: "status",
    due: "due",
    cost: "amount",
    notes: "notes"
  };
  for (const [field, key] of Object.entries(labelKeys)) {
    for (const dictionary of Object.values(I18N)) {
      if (dictionary[key]) aliases[field].push(dictionary[key]);
    }
  }
  aliases.vendor.push(...Object.values(I18N).map(dictionary => dictionary.assigned).filter(Boolean));

  function parseRows(source) {
    source = source.replace(/^\uFEFF/, "");
    let delimiter = ",";
    let bestCount = -1;
    for (const candidate of [",", ";", "\t"]) {
      let quoted = false;
      let count = 0;
      for (let i = 0; i < source.length; i++) {
        const char = source[i];
        if (char === '"') {
          if (quoted && source[i + 1] === '"') i++;
          else quoted = !quoted;
        } else if (!quoted && (char === "\n" || char === "\r")) {
          break;
        } else if (!quoted && char === candidate) {
          count++;
        }
      }
      if (count > bestCount) {
        delimiter = candidate;
        bestCount = count;
      }
    }

    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
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
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    if (quoted) throw new Error("Unclosed quoted CSV field.");
    row.push(cell);
    if (row.some(value => value.trim())) rows.push(row);
    if (rows.length < 2) throw new Error("Include a header and at least one request.");

    const headers = rows[0].map(normalize);
    const columns = {};
    for (const [field, names] of Object.entries(aliases)) {
      const matches = headers.flatMap((header, index) => names.includes(header) ? [index] : []);
      if (matches.length > 1) throw new Error(`Duplicate ${field} columns.`);
      if (matches.length === 1) columns[field] = matches[0];
    }
    for (const field of ["title", "property", "unit", "tenant", "category", "priority", "status", "due", "cost"]) {
      if (columns[field] === undefined) throw new Error(`Missing ${field} column.`);
    }
    return rows.slice(1).map((cells, index) => {
      const record = {};
      for (const [field, column] of Object.entries(columns)) record[field] = (cells[column] || "").trim();
      record.rowNumber = index + 2;
      return record;
    });
  }

  function enumValue(value, allowed, field, rowNumber) {
    const normalized = normalize(value);
    for (const option of allowed) {
      if (normalized === normalize(option) || Object.values(I18N).some(dictionary =>
        dictionary[option] && normalized === normalize(dictionary[option]))) return option;
    }
    throw new Error(`Row ${rowNumber}: invalid ${field} "${value}".`);
  }

  function prepareTickets(records) {
    const properties = new Map(data.properties.map(property => [normalize(property.name), property]));
    const vendors = new Map(data.vendors.map(item => [normalize(item.name), item]));
    const seen = new Set();
    const maxId = Math.max(0, ...data.tickets.map(ticket => Number(ticket.id) || 0));
    let nextId = maxId + 1;

    return records.map(record => {
      const line = record.rowNumber;
      const title = record.title.trim();
      const unit = record.unit.trim();
      const tenant = record.tenant.trim();
      if (!title || !unit || !tenant) throw new Error(`Row ${line}: title, unit, and tenant are required.`);

      const property = properties.get(normalize(record.property));
      if (!property) throw new Error(`Row ${line}: property "${record.property}" does not exist.`);
      const vendorName = record.vendor || "";
      const vendor = vendorName ? vendors.get(normalize(vendorName)) : null;
      if (vendorName && !vendor) throw new Error(`Row ${line}: vendor "${vendorName}" does not exist.`);

      const rawId = record.id || "";
      const id = rawId ? Number(rawId) : nextId++;
      if (!Number.isSafeInteger(id) || id < 1) throw new Error(`Row ${line}: ID must be a positive whole number.`);
      if (seen.has(id)) throw new Error(`Row ${line}: duplicate request ID ${id}.`);
      seen.add(id);

      const cost = Number(record.cost);
      if (!record.cost || !Number.isFinite(cost) || cost < 0) {
        throw new Error(`Row ${line}: cost must be zero or a positive number.`);
      }
      for (const field of ["due", "created", "updated"]) {
        if (record[field]) {
          const date = new Date(`${record[field]}T00:00:00Z`);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(record[field]) || Number.isNaN(date.valueOf()) ||
              date.toISOString().slice(0, 10) !== record[field]) {
            throw new Error(`Row ${line}: ${field} must use a valid YYYY-MM-DD date.`);
          }
        }
      }

      const existing = data.tickets.find(ticket => ticket.id === id);
      return {
        ...(existing || {}),
        id,
        title,
        propertyId: property.id,
        unit,
        tenant,
        category: enumValue(record.category, ["plumbing", "electric", "heating", "appliance", "other"], "category", line),
        priority: enumValue(record.priority, ["low", "medium", "high"], "priority", line),
        status: enumValue(record.status, ["new", "inprogress", "resolved"], "status", line),
        vendorId: vendor?.id || 0,
        due: record.due,
        cost,
        created: record.created || existing?.created || today(),
        updated: record.updated || today(),
        description: record.description || existing?.description || "",
        notes: record.notes || "",
        before: existing?.before || "",
        after: existing?.after || ""
      };
    });
  }

  function importCSV(text) {
    const records = parseRows(text);
    const imported = prepareTickets(records);
    const byId = new Map(data.tickets.map(ticket => [ticket.id, ticket]));
    let added = 0;
    let updated = 0;
    for (const ticket of imported) {
      if (byId.has(ticket.id)) updated++;
      else added++;
      byId.set(ticket.id, ticket);
    }

    const previous = data;
    data = { ...data, tickets: [...byId.values()] };
    try {
      save();
    } catch (error) {
      data = previous;
      throw new Error(`Could not save imported requests: ${error.message}`);
    }
    render();
    return { added, updated };
  }

  const actions = document.querySelector(".topbar .actions");
  if (!actions) throw new Error("Tenant Desk CSV controls could not be added.");
  const upload = document.createElement("input");
  upload.type = "file";
  upload.accept = ".csv,text/csv";
  upload.hidden = true;
  upload.setAttribute("aria-label", "CSV file");

  const makeButton = (id, variant, label) => {
    const button = document.createElement("button");
    button.id = id;
    button.type = "button";
    button.className = `btn ${variant}`;
    button.textContent = label;
    return button;
  };
  const importButton = makeButton("importCsvBtn", "secondary", "");
  const resetButton = makeButton("resetDemoBtn", "warn", "");
  const updateLabels = () => {
    const labels = copy[lang] || copy.en;
    importButton.textContent = labels.import;
    resetButton.textContent = labels.reset;
  };

  importButton.addEventListener("click", () => upload.click());
  upload.addEventListener("change", async () => {
    const file = upload.files[0];
    if (!file) return;
    try {
      const result = importCSV(await file.text());
      const labels = copy[lang] || copy.en;
      toast(labels.imported(result.added, result.updated));
    } catch (error) {
      toast(`${(copy[lang] || copy.en).importError}: ${error.message}`);
    } finally {
      upload.value = "";
    }
  });
  resetButton.addEventListener("click", () => {
    if (!confirm((copy[lang] || copy.en).resetConfirm)) return;
    data = structuredClone(SEED);
    try {
      save();
    } catch (error) {
      toast(`Could not reset demo data: ${error.message}`);
      return;
    }
    page = "overview";
    render();
    toast((copy[lang] || copy.en).resetDone);
  });

  actions.insertBefore(importButton, document.getElementById("exportBtn"));
  actions.append(upload, resetButton);
  updateLabels();
  new MutationObserver(updateLabels).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });
})();
