// =========================
// ELEMENTS
// =========================

const saveScreen =
  document.getElementById("saveScreen");

const parkedScreen =
  document.getElementById("parkedScreen");

const foundScreen =
  document.getElementById("foundScreen");


const floorInput =
  document.getElementById("floorInput");

const zoneInput =
  document.getElementById("zoneInput");

const spotInput =
  document.getElementById("spotInput");

const noteInput =
  document.getElementById("noteInput");


const locationBtn =
  document.getElementById("locationBtn");

const locationStatus =
  document.getElementById("locationStatus");


const saveBtn =
  document.getElementById("saveBtn");

const formMessage =
  document.getElementById("formMessage");


const savedFloor =
  document.getElementById("savedFloor");

const savedZone =
  document.getElementById("savedZone");

const savedSpot =
  document.getElementById("savedSpot");

const savedNote =
  document.getElementById("savedNote");

const savedNoteContainer =
  document.getElementById("savedNoteContainer");

const parkedAtText =
  document.getElementById("parkedAtText");


const navigateBtn =
  document.getElementById("navigateBtn");

const navigationMessage =
  document.getElementById("navigationMessage");


const saveCardBtn =
  document.getElementById("saveCardBtn");

const shareBtn =
  document.getElementById("shareBtn");

const mapsBtn =
  document.getElementById("mapsBtn");


const editBtn =
  document.getElementById("editBtn");

const foundBtn =
  document.getElementById("foundBtn");

const parkAgainBtn =
  document.getElementById("parkAgainBtn");


// =========================
// STATE
// =========================

let selectedLocation = null;


// =========================
// LOCATION
// =========================

locationBtn.addEventListener(
  "click",
  saveCurrentLocation
);


function saveCurrentLocation() {

  if (!navigator.geolocation) {

    locationStatus.textContent =
      "Location isn't supported on this device";

    return;
  }


  locationStatus.textContent =
    "Finding your car location...";

  locationBtn.disabled =
    true;


  navigator.geolocation.getCurrentPosition(

    position => {

      selectedLocation = {

        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude,

        accuracy:
          Math.round(
            position.coords.accuracy
          )

      };


      locationStatus.textContent =
        `Location saved ✓ · ~${selectedLocation.accuracy}m accuracy`;


      locationBtn.classList.add(
        "location-saved"
      );


      locationBtn.disabled =
        false;

    },


    error => {

      console.error(
        "Location error:",
        error
      );


      locationBtn.disabled =
        false;


      if (error.code === 1) {

        locationStatus.textContent =
          "Allow location access to save this spot";

      } else if (error.code === 2) {

        locationStatus.textContent =
          "Location isn't available right now";

      } else if (error.code === 3) {

        locationStatus.textContent =
          "Location took too long. Try again.";

      } else {

        locationStatus.textContent =
          "Couldn't save your location";

      }

    },


    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }

  );

}


// =========================
// SAVE PARKING
// =========================

saveBtn.addEventListener(
  "click",
  saveParking
);


function saveParking() {

  const floor =
    floorInput.value.trim();

  const zone =
    zoneInput.value.trim();

  const spot =
    spotInput.value.trim();

  const note =
    noteInput.value.trim();


  if (
    !floor &&
    !zone &&
    !spot &&
    !note &&
    !selectedLocation
  ) {

    formMessage.textContent =
      "Save your location or add a parking detail first 👀";

    return;
  }


  const oldData =
    getParkingData();


  const parkingData = {

    floor:
      floor || "—",

    zone:
      zone || "—",

    spot:
      spot || "—",

    note:
      note,

    latitude:
      selectedLocation
        ? selectedLocation.latitude
        : null,

    longitude:
      selectedLocation
        ? selectedLocation.longitude
        : null,

    accuracy:
      selectedLocation
        ? selectedLocation.accuracy
        : null,

    parkedAt:
      oldData?.parkedAt ||
      Date.now()

  };


  localStorage.setItem(
    "parkedCar",
    JSON.stringify(parkingData)
  );


  formMessage.textContent =
    "";


  showParkedCar(
    parkingData
  );

}


// =========================
// SHOW PARKING
// =========================

function showParkedCar(data) {

  savedFloor.textContent =
    data.floor || "—";

  savedZone.textContent =
    data.zone || "—";

  savedSpot.textContent =
    data.spot || "—";


  if (data.note) {

    savedNote.textContent =
      data.note;

    savedNoteContainer.style.display =
      "flex";

  } else {

    savedNoteContainer.style.display =
      "none";

  }


  parkedAtText.textContent =
    formatParkedTime(
      data.parkedAt
    );


  const hasLocation =
    hasSavedLocation(data);


  navigateBtn.style.display =
    hasLocation
      ? "flex"
      : "none";


  mapsBtn.style.display =
    hasLocation
      ? "block"
      : "none";


  navigationMessage.textContent =
    "";


  showScreen(
    parkedScreen
  );

}


// =========================
// PARKED TIME
// =========================

function formatParkedTime(timestamp) {

  if (!timestamp) {
    return "—";
  }


  return new Date(
    timestamp
  ).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}


// =========================
// LOCATION HELPER
// =========================

function hasSavedLocation(data) {

  return Boolean(
    data &&
    data.latitude !== null &&
    data.latitude !== undefined &&
    data.longitude !== null &&
    data.longitude !== undefined
  );

}


// =========================
// MAPS
// =========================

function getMapsUrl(data) {

  if (!hasSavedLocation(data)) {
    return null;
  }


  const destination =
    `${data.latitude},${data.longitude}`;


  return (
    "https://www.google.com/maps/dir/" +
    "?api=1" +
    `&destination=${encodeURIComponent(destination)}` +
    "&travelmode=walking"
  );

}


// =========================
// NAVIGATE
// =========================

navigateBtn.addEventListener(
  "click",
  navigateToCar
);


function navigateToCar() {

  const data =
    getParkingData();


  const mapsUrl =
    getMapsUrl(data);


  if (!mapsUrl) {

    navigationMessage.textContent =
      "No GPS location was saved.";

    return;
  }


  window.open(
    mapsUrl,
    "_blank",
    "noopener,noreferrer"
  );

}


// =========================
// OPEN MAPS
// =========================

mapsBtn.addEventListener(
  "click",
  () => {

    const data =
      getParkingData();


    const mapsUrl =
      getMapsUrl(data);


    if (!mapsUrl) {

      navigationMessage.textContent =
        "No GPS location was saved.";

      return;
    }


    window.open(
      mapsUrl,
      "_blank",
      "noopener,noreferrer"
    );

  }
);


// =========================
// SHARE
// =========================

shareBtn.addEventListener(
  "click",
  shareParking
);


async function shareParking() {

  const data =
    getParkingData();


  if (!data) {
    return;
  }


  const mapsUrl =
    getMapsUrl(data);


  const time =
    formatParkedTime(
      data.parkedAt
    );


  const details = [];


  if (data.floor !== "—") {
    details.push(
      `Floor ${data.floor}`
    );
  }


  if (data.zone !== "—") {
    details.push(
      `Zone ${data.zone}`
    );
  }


  if (data.spot !== "—") {
    details.push(
      `Spot ${data.spot}`
    );
  }


  let text =
    "🚗 My car is parked here\n\n";


  if (details.length) {

    text +=
      `${details.join(" · ")}\n`;

  }


  if (data.note) {

    text +=
      `📍 ${data.note}\n`;

  }


  text +=
    `🕒 Parked at ${time}`;


  if (mapsUrl) {

    text +=
      `\n\n📍 Open car location:\n${mapsUrl}`;

  }


  text +=
    "\n\nSaved with Parked. 🚗";


  if (navigator.share) {

    try {

      await navigator.share({
        title:
          "My parking spot 🚗",

        text:
          text
      });


      return;

    } catch (error) {

      if (
        error.name ===
        "AbortError"
      ) {

        return;

      }

    }

  }


  try {

    await navigator.clipboard
      .writeText(text);


    navigationMessage.textContent =
      "Parking details copied ✓";

  } catch {

    navigationMessage.textContent =
      "Couldn't share parking details.";

  }

}


// =========================
// SAVE CARD
// =========================

saveCardBtn.addEventListener(
  "click",
  saveParkingCard
);


function saveParkingCard() {

  const data =
    getParkingData();


  if (!data) {
    return;
  }


  const canvas =
    document.createElement(
      "canvas"
    );


  canvas.width =
    1080;

  canvas.height =
    1350;


  const ctx =
    canvas.getContext(
      "2d"
    );


  // BACKGROUND

  ctx.fillStyle =
    "#0b0c0d";

  ctx.fillRect(
    0,
    0,
    1080,
    1350
  );


  // LIME DECORATION

  ctx.fillStyle =
    "#d7ff3f";

  ctx.fillRect(
    0,
    0,
    1080,
    22
  );


  // LOGO

  ctx.textAlign =
    "left";

  ctx.fillStyle =
    "#f7f7f2";

  ctx.font =
    "700 48px Arial";


  ctx.fillText(
    "PARKED.",
    75,
    105
  );


  // PARKING ICON

  ctx.fillStyle =
    "#d7ff3f";


  roundedRect(
    ctx,
    75,
    175,
    145,
    145,
    28
  );


  ctx.fillStyle =
    "#0b0c0d";

  ctx.font =
    "700 95px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";


  ctx.fillText(
    "P",
    147,
    247
  );


  ctx.textBaseline =
    "alphabetic";

  ctx.textAlign =
    "left";


  // TITLE

  ctx.fillStyle =
    "#8e9191";

  ctx.font =
    "700 24px Arial";


  ctx.fillText(
    "YOUR CAR IS AT",
    75,
    415
  );


  // FLOOR

  ctx.fillStyle =
    "#f7f7f2";

  ctx.font =
    "700 200px Arial";


  ctx.fillText(
    data.floor || "—",
    65,
    625
  );


  // ZONE / SPOT

  ctx.fillStyle =
    "#8e9191";

  ctx.font =
    "700 23px Arial";


  ctx.fillText(
    "ZONE",
    75,
    730
  );


  ctx.fillText(
    "SPOT",
    390,
    730
  );


  ctx.fillStyle =
    "#d7ff3f";

  ctx.font =
    "700 58px Arial";


  ctx.fillText(
    data.zone || "—",
    75,
    800
  );


  ctx.fillText(
    data.spot || "—",
    390,
    800
  );


  // NOTE

  if (data.note) {

    ctx.fillStyle =
      "#17191a";


    roundedRect(
      ctx,
      75,
      860,
      930,
      105,
      22
    );


    ctx.fillStyle =
      "#f7f7f2";

    ctx.font =
      "500 29px Arial";


    ctx.fillText(
      data.note,
      110,
      925
    );

  }


  // PARKED AT

  ctx.fillStyle =
    "#8e9191";

  ctx.font =
    "700 21px Arial";


  ctx.fillText(
    "PARKED AT",
    75,
    1060
  );


  ctx.fillStyle =
    "#f7f7f2";

  ctx.font =
    "700 48px Arial";


  ctx.fillText(
    formatParkedTime(
      data.parkedAt
    ),
    75,
    1120
  );


  // FOOTER

  ctx.fillStyle =
    "#d7ff3f";

  ctx.font =
    "700 30px Arial";


  ctx.fillText(
    "Save it now. Find it later.",
    75,
    1250
  );


  ctx.fillStyle =
    "#666969";

  ctx.font =
    "500 21px Arial";


  ctx.fillText(
    "30 DAYS • 30 PROJECTS",
    75,
    1295
  );


  canvas.toBlob(

    blob => {

      if (!blob) {
        return;
      }


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;

      link.download =
        "parked-my-car.png";


      document.body.appendChild(
        link
      );


      link.click();

      link.remove();


      setTimeout(
        () =>
          URL.revokeObjectURL(
            url
          ),
        1000
      );


      navigationMessage.textContent =
        "Parking card saved ✓";

    },

    "image/png"
  );

}


// =========================
// CANVAS HELPER
// =========================

function roundedRect(
  ctx,
  x,
  y,
  width,
  height,
  radius
) {

  ctx.beginPath();

  ctx.roundRect(
    x,
    y,
    width,
    height,
    radius
  );

  ctx.fill();

}


// =========================
// EDIT
// =========================

editBtn.addEventListener(
  "click",
  editParking
);


function editParking() {

  const data =
    getParkingData();


  if (!data) {
    return;
  }


  floorInput.value =
    data.floor === "—"
      ? ""
      : data.floor;


  zoneInput.value =
    data.zone === "—"
      ? ""
      : data.zone;


  spotInput.value =
    data.spot === "—"
      ? ""
      : data.spot;


  noteInput.value =
    data.note || "";


  if (
    hasSavedLocation(data)
  ) {

    selectedLocation = {

      latitude:
        data.latitude,

      longitude:
        data.longitude,

      accuracy:
        data.accuracy || null

    };


    locationStatus.textContent =
      data.accuracy
        ? `Location saved ✓ · ~${data.accuracy}m accuracy`
        : "Location saved ✓";


    locationBtn.classList.add(
      "location-saved"
    );

  } else {

    selectedLocation =
      null;


    resetLocationButton();

  }


  showScreen(
    saveScreen
  );

}


// =========================
// FOUND
// =========================

foundBtn.addEventListener(
  "click",
  foundCar
);


function foundCar() {

  localStorage.removeItem(
    "parkedCar"
  );


  selectedLocation =
    null;


  clearForm();


  showScreen(
    foundScreen
  );

}


// =========================
// PARK AGAIN
// =========================

parkAgainBtn.addEventListener(
  "click",
  () => {

    clearForm();

    showScreen(
      saveScreen
    );

  }
);


// =========================
// STORAGE
// =========================

function getParkingData() {

  const saved =
    localStorage.getItem(
      "parkedCar"
    );


  if (!saved) {
    return null;
  }


  try {

    return JSON.parse(
      saved
    );

  } catch {

    return null;

  }

}


// =========================
// RESET
// =========================

function resetLocationButton() {

  locationStatus.textContent =
    "Use GPS to remember where you parked";


  locationBtn.classList.remove(
    "location-saved"
  );


  locationBtn.disabled =
    false;

}


function clearForm() {

  floorInput.value = "";

  zoneInput.value = "";

  spotInput.value = "";

  noteInput.value = "";


  selectedLocation =
    null;


  formMessage.textContent =
    "";


  navigationMessage.textContent =
    "";


  resetLocationButton();

}


// =========================
// SCREEN
// =========================

function showScreen(screen) {

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(
      item =>
        item.classList.remove(
          "active"
        )
    );


  screen.classList.add(
    "active"
  );


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// =========================
// LOAD
// =========================

function loadSavedParking() {

  const data =
    getParkingData();


  if (data) {

    showParkedCar(data);

  } else {

    showScreen(
      saveScreen
    );

  }

}


// =========================
// START
// =========================

loadSavedParking();

// =========================
// LANGUAGES
// =========================

const translations = {

  en: {
    heroBadge: "YOUR PARKING MEMORY",
    title1: "Where's",
    title2: "my car?",
    subtitle: "Save it now. Thank yourself later.",

    saveLocation: "SAVE MY LOCATION",
    locationHelp: "Use GPS to remember where you parked",

    optionalDetails: "OPTIONAL PARKING DETAILS",
    parkingDetails: "PARKING DETAILS",
    detailsTitle: "Make it easier to find.",

    floor: "FLOOR",
    zone: "ZONE",
    spot: "SPOT NUMBER",
    note: "QUICK NOTE",

    floorPlaceholder: "P2",
    zonePlaceholder: "B",
    spotPlaceholder: "147",
    notePlaceholder: "Near elevator B...",

    saveParking: "SAVE MY PARKING",

    carSaved: "CAR SAVED",
    futureThanks: "Future you says thanks.",
    yourCarAt: "YOUR CAR IS AT",

    parkedAt: "PARKED AT",

    takeMe: "TAKE ME TO MY CAR",
    directions: "Open walking directions",

    keepIt: "KEEP IT WITH YOU",
    keepSubtitle: "No need to keep this page open.",

    saveCard: "SAVE CARD",
    saveCardSub: "Keep it in Photos",

    share: "SHARE",
    shareSub: "Send it anywhere",

    maps: "MAPS",
    mapsSub: "Open saved spot",

    edit: "Edit parking",
    found: "✓ I FOUND MY CAR",

    reunited: "REUNITED",
    foundTitle: "Found it.",
    foundEasy: "Easy. 😌",
    cleared: "Parking memory cleared. Until next time. 🚗",
    parkAgain: "PARK AGAIN"
  },


  he: {
    heroBadge: "הזיכרון של החניה שלך",
    title1: "איפה",
    title2: "הרכב שלי?",
    subtitle: "שמרו עכשיו. תודו לעצמכם אחר כך.",

    saveLocation: "שמור את המיקום שלי",
    locationHelp: "השתמשו ב-GPS כדי לזכור איפה חניתם",

    optionalDetails: "פרטי חניה אופציונליים",
    parkingDetails: "פרטי החניה",
    detailsTitle: "בואו נעשה את הרכב קל יותר למציאה.",

    floor: "קומה",
    zone: "אזור",
    spot: "מספר חניה",
    note: "הערה",

    floorPlaceholder: "P2",
    zonePlaceholder: "B",
    spotPlaceholder: "147",
    notePlaceholder: "ליד מעלית B...",

    saveParking: "שמור את החניה שלי",

    carSaved: "הרכב נשמר",
    futureThanks: "אתם של העתיד יודו לכם.",
    yourCarAt: "הרכב שלכם נמצא ב־",

    parkedAt: "חניתם בשעה",

    takeMe: "קח אותי לרכב",
    directions: "פתח ניווט רגלי",

    keepIt: "שמרו את זה איתכם",
    keepSubtitle: "אין צורך להשאיר את העמוד פתוח.",

    saveCard: "שמור כרטיס",
    saveCardSub: "שמרו אותו בתמונות",

    share: "שתף",
    shareSub: "שלחו לכל מקום",

    maps: "מפות",
    mapsSub: "פתחו את המיקום",

    edit: "עריכת חניה",
    found: "✓ מצאתי את הרכב",

    reunited: "נפגשנו שוב",
    foundTitle: "מצאנו אותו.",
    foundEasy: "קל. 😌",
    cleared: "פרטי החניה נמחקו. עד הפעם הבאה. 🚗",
    parkAgain: "חניה חדשה"
  },


  ar: {
    heroBadge: "ذاكرة موقف سيارتك",
    title1: "وين",
    title2: "سيارتي؟",
    subtitle: "احفظها هسا. واشكر حالك بعدين.",

    saveLocation: "احفظ موقع سيارتي",
    locationHelp: "استخدم الـ GPS عشان تتذكر وين صفّيت",

    optionalDetails: "تفاصيل إضافية للموقف",
    parkingDetails: "تفاصيل الموقف",
    detailsTitle: "خلّي الرجعة للسيارة أسهل.",

    floor: "الطابق",
    zone: "المنطقة",
    spot: "رقم الموقف",
    note: "ملاحظة",

    floorPlaceholder: "P2",
    zonePlaceholder: "B",
    spotPlaceholder: "147",
    notePlaceholder: "جنب مصعد B...",

    saveParking: "احفظ موقف سيارتي",

    carSaved: "تم حفظ السيارة",
    futureThanks: "نسختك المستقبلية رح تشكرك.",
    yourCarAt: "سيارتك موجودة في",

    parkedAt: "وقت الاصطفاف",

    takeMe: "خذني لسيارتي",
    directions: "افتح طريق المشي",

    keepIt: "خليه معك",
    keepSubtitle: "مش لازم تضل فاتح الصفحة.",

    saveCard: "احفظ البطاقة",
    saveCardSub: "خليها بصورك",

    share: "شارك",
    shareSub: "ابعثها وين ما بدك",

    maps: "الخريطة",
    mapsSub: "افتح موقع السيارة",

    edit: "عدّل الموقف",
    found: "✓ لقيت سيارتي",

    reunited: "وأخيرًا 😌",
    foundTitle: "لقيتها.",
    foundEasy: "سهلة. 😌",
    cleared: "مسحنا معلومات الموقف. للمرة الجاية 🚗",
    parkAgain: "موقف جديد"
  }
};


// =========================
// LANGUAGE SWITCH
// =========================

const langButtons =
  document.querySelectorAll(".lang-btn");


langButtons.forEach(button => {

  button.addEventListener("click", () => {

    const language =
      button.dataset.lang;

    changeLanguage(language);

  });

});


function changeLanguage(language) {

  const t =
    translations[language];


  // SAVE SCREEN

  document.querySelector(
    ".hero-badge span"
  ).textContent =
    t.heroBadge;


  const heroTitle =
    document.querySelector(".hero h1");


  heroTitle.childNodes[0].textContent =
    t.title1 + " ";


  heroTitle.querySelector(
    "span"
  ).textContent =
    t.title2;


  document.querySelector(
    ".hero > p"
  ).innerHTML =
    `${t.subtitle}`;


  document.querySelector(
    ".location-copy strong"
  ).textContent =
    t.saveLocation;


  if (!selectedLocation) {

    locationStatus.textContent =
      t.locationHelp;

  }


  document.querySelector(
    ".divider span"
  ).textContent =
    t.optionalDetails;


  document.querySelector(
    ".details-heading .section-label"
  ).textContent =
    t.parkingDetails;


  document.querySelector(
    ".details-heading h2"
  ).textContent =
    t.detailsTitle;


  const labels =
    document.querySelectorAll(
      ".details-card label"
    );


  labels[0].textContent =
    t.floor;

  labels[1].textContent =
    t.zone;

  labels[2].textContent =
    t.spot;

  labels[3].textContent =
    t.note;


  floorInput.placeholder =
    t.floorPlaceholder;

  zoneInput.placeholder =
    t.zonePlaceholder;

  spotInput.placeholder =
    t.spotPlaceholder;

  noteInput.placeholder =
    t.notePlaceholder;


  saveBtn.childNodes[0].textContent =
    t.saveParking + " ";


  // SAVED SCREEN

  document.querySelector(
    ".success-pill"
  ).lastChild.textContent =
    " " + t.carSaved;


  document.querySelector(
    ".saved-top > p"
  ).textContent =
    t.futureThanks;


  document.querySelector(
    ".car-card-header > span"
  ).textContent =
    t.yourCarAt;


  const parkingLabels =
    document.querySelectorAll(
      ".parking-info span"
    );


  parkingLabels[0].textContent =
    t.zone;

  parkingLabels[1].textContent =
    t.spot;


  document.querySelector(
    ".parked-at span"
  ).textContent =
    t.parkedAt;


  document.querySelector(
    ".nav-copy strong"
  ).textContent =
    t.takeMe;


  document.querySelector(
    ".nav-copy span"
  ).textContent =
    t.directions;


  document.querySelector(
    ".keep-title > span"
  ).textContent =
    t.keepIt;


  document.querySelector(
    ".keep-title p"
  ).textContent =
    t.keepSubtitle;


  const actions =
    document.querySelectorAll(
      ".action-card"
    );


  actions[0].querySelector(
    "strong"
  ).textContent =
    t.saveCard;

  actions[0].querySelector(
    ":scope > span"
  ).textContent =
    t.saveCardSub;


  actions[1].querySelector(
    "strong"
  ).textContent =
    t.share;

  actions[1].querySelector(
    ":scope > span"
  ).textContent =
    t.shareSub;


  actions[2].querySelector(
    "strong"
  ).textContent =
    t.maps;

  actions[2].querySelector(
    ":scope > span"
  ).textContent =
    t.mapsSub;


  editBtn.textContent =
    t.edit;

  foundBtn.textContent =
    t.found;


  // FOUND SCREEN

  document.querySelector(
    ".found-screen-content .section-label"
  ).textContent =
    t.reunited;


  const foundTitle =
    document.querySelector(
      ".found-screen-content h2"
    );


  foundTitle.childNodes[0].textContent =
    t.foundTitle + " ";


  foundTitle.querySelector(
    "span"
  ).textContent =
    t.foundEasy;


  document.querySelector(
    ".found-screen-content > p"
  ).textContent =
    t.cleared;


  parkAgainBtn.childNodes[0].textContent =
    t.parkAgain + " ";


  // DIRECTION

  if (
    language === "he" ||
    language === "ar"
  ) {

    document.documentElement.dir =
      "rtl";

  } else {

    document.documentElement.dir =
      "ltr";

  }


  document.documentElement.lang =
    language;


  // ACTIVE BUTTON

  langButtons.forEach(btn => {

    btn.classList.toggle(
      "active",
      btn.dataset.lang === language
    );

  });


  // REMEMBER LANGUAGE

  localStorage.setItem(
    "parkedLanguage",
    language
  );

}


// =========================
// LOAD LANGUAGE
// =========================

const savedLanguage =
  localStorage.getItem(
    "parkedLanguage"
  ) || "en";


changeLanguage(
  savedLanguage
);