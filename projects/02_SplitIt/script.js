// ========================
// ELEMENTS
// ========================

let billAmount = document.getElementById("billAmount");
const billSection = document.getElementById("billSection");

const friendName = document.getElementById("friendName");
const addFriendBtn = document.getElementById("addFriendBtn");
const friendsList = document.getElementById("friendsList");
const friendCount = document.getElementById("friendCount");

const modeButtons = document.querySelectorAll(".mode-btn");
const itemsSection = document.getElementById("itemsSection");
const itemsList = document.getElementById("itemsList");
const addItemBtn = document.getElementById("addItemBtn");

const splitBtn = document.getElementById("splitBtn");

const mainCard = document.querySelector(".card");
const resultCard = document.getElementById("resultCard");

const paymentResults = document.getElementById("paymentResults");
const owesResults = document.getElementById("owesResults");

const copyBtn = document.getElementById("copyBtn");
const newBillBtn = document.getElementById("newBillBtn");

const coverPayer = document.getElementById("coverPayer");
const coverFriend = document.getElementById("coverFriend");
const coverBtn = document.getElementById("coverBtn");
const coverMessage = document.getElementById("coverMessage");


// ========================
// DATA
// ========================

let friends = [];
let items = [];
let selectedMode = "equal";
let currentResults = [];
let currentBillTotal = 0;


// ========================
// FRIENDS
// ========================

addFriendBtn.addEventListener("click", addFriend);

friendName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addFriend();
  }
});


function addFriend() {
  const name = friendName.value.trim();

  if (!name) return;

  const alreadyExists = friends.some(
    friend =>
      friend.name.toLowerCase() === name.toLowerCase()
  );

  if (alreadyExists) {
    alert(`${name} is already here 👀`);
    friendName.value = "";
    return;
  }

  friends.push({
    id: Date.now() + Math.random(),
    name
  });

  friendName.value = "";

  renderFriends();
  renderItems();
}


function renderFriends() {
  friendsList.innerHTML = "";

  friends.forEach(friend => {
    const chip = document.createElement("div");

    chip.className = "friend-chip";

    chip.innerHTML = `
      <span>${friend.name}</span>

      <button
        data-id="${friend.id}"
        aria-label="Remove ${friend.name}"
      >
        ×
      </button>
    `;

    friendsList.appendChild(chip);
  });


  friendCount.textContent =
    `${friends.length} ${
      friends.length === 1 ? "friend" : "friends"
    }`;


  document
    .querySelectorAll(".friend-chip button")
    .forEach(button => {
      button.addEventListener("click", () => {
        const id = Number(button.dataset.id);

        friends = friends.filter(
          friend => friend.id !== id
        );

        // Remove this friend from item quantities
        items.forEach(item => {
          delete item.quantities[id];
        });

        renderFriends();
        renderItems();
        updateCalculatedTotal();
      });
    });
}


// ========================
// MODE
// ========================

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    modeButtons.forEach(btn =>
      btn.classList.remove("active")
    );

    button.classList.add("active");

    selectedMode = button.dataset.mode;

    if (selectedMode === "items") {
      itemsSection.classList.add("show");

      showCalculatedTotal();
      renderItems();
      updateCalculatedTotal();
    } else {
      itemsSection.classList.remove("show");

      showBillInput();
    }
  });
});


// ========================
// TOTAL BILL AREA
// ========================

function showBillInput() {
  billSection.innerHTML = `
    <label for="billAmount">
      TOTAL BILL
    </label>

    <div class="money-input">
      <span>₪</span>

      <input
        id="billAmount"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
      >
    </div>
  `;

  billAmount = document.getElementById("billAmount");
}


function showCalculatedTotal() {
  billSection.innerHTML = `
    <label>
      TOTAL BILL
    </label>

    <div class="money-input">
      <span>₪</span>

      <div
        id="calculatedTotal"
        class="calculated-total"
      >
        ${calculateItemsTotal().toFixed(2)}
      </div>
    </div>

    <p class="auto-total-note">
      Calculated automatically from your order ✦
    </p>
  `;
}


// ========================
// ITEM CALCULATIONS
// ========================

function getItemQuantity(item) {
  return Object.values(item.quantities)
    .reduce(
      (total, quantity) => total + quantity,
      0
    );
}


function getItemTotal(item) {
  const price = Number(item.price) || 0;
  const quantity = getItemQuantity(item);

  return price * quantity;
}


function calculateItemsTotal() {
  return items.reduce(
    (total, item) =>
      total + getItemTotal(item),
    0
  );
}


function updateCalculatedTotal() {
  const total = calculateItemsTotal();

  currentBillTotal = total;

  const calculatedTotal =
    document.getElementById("calculatedTotal");

  if (calculatedTotal) {
    calculatedTotal.textContent =
      total.toFixed(2);
  }
}


// ========================
// ADD ITEM
// ========================

addItemBtn.addEventListener("click", () => {
  if (friends.length === 0) {
    alert("Add your friends first 👀");
    return;
  }

  items.push({
    id: Date.now() + Math.random(),
    name: "",
    price: "",
    quantities: {}
  });

  renderItems();
  updateCalculatedTotal();
});


// ========================
// RENDER ITEMS
// ========================

function renderItems() {
  itemsList.innerHTML = "";

  items.forEach(item => {
    const itemBox =
      document.createElement("div");

    itemBox.className = "item-box";


    const peopleControls = friends
      .map(friend => {
        const quantity =
          item.quantities[friend.id] || 0;

        return `
          <div class="person-quantity">

            <span class="person-name">
              ${friend.name}
            </span>

            <div class="quantity-control">

              <button
                type="button"
                class="quantity-btn minus"
                data-item="${item.id}"
                data-friend="${friend.id}"
              >
                −
              </button>

              <span class="quantity-number">
                ${quantity}
              </span>

              <button
                type="button"
                class="quantity-btn plus"
                data-item="${item.id}"
                data-friend="${friend.id}"
              >
                +
              </button>

            </div>

          </div>
        `;
      })
      .join("");


    const quantity =
      getItemQuantity(item);

    const itemTotal =
      getItemTotal(item);


    itemBox.innerHTML = `
      <div class="item-top">

        <input
          class="item-name"
          data-id="${item.id}"
          type="text"
          placeholder="Pizza 🍕"
          value="${item.name}"
        >

        <div class="item-price-wrap">
          <span>₪</span>

          <input
            class="item-price"
            data-id="${item.id}"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value="${item.price}"
          >
        </div>

        <button
          type="button"
          class="remove-item"
          data-id="${item.id}"
          aria-label="Remove item"
        >
          ×
        </button>

      </div>


      <p class="price-note">
        PRICE PER ITEM
      </p>


      <p class="mini-label">
        WHO HAD THIS?
      </p>


      <div class="people-quantities">
        ${peopleControls}
      </div>


      <div class="item-summary">

        <span>
          ${quantity}
          ${quantity === 1 ? "item" : "items"}
          ×
          ₪${(Number(item.price) || 0).toFixed(2)}
        </span>

        <strong>
          ₪${itemTotal.toFixed(2)}
        </strong>

      </div>
    `;


    itemsList.appendChild(itemBox);
  });


  attachItemEvents();
}


// ========================
// ITEM EVENTS
// ========================

function attachItemEvents() {
  document
    .querySelectorAll(".item-name")
    .forEach(input => {
      input.addEventListener("input", () => {
        const item =
          findItem(input.dataset.id);

        if (item) {
          item.name = input.value;
        }
      });
    });


  document
    .querySelectorAll(".item-price")
    .forEach(input => {
      input.addEventListener("input", () => {
        const item =
          findItem(input.dataset.id);

        if (!item) return;

        item.price = input.value;

        renderItems();
        updateCalculatedTotal();
      });
    });


  document
    .querySelectorAll(".quantity-btn.plus")
    .forEach(button => {
      button.addEventListener("click", () => {
        changePersonQuantity(
          button.dataset.item,
          button.dataset.friend,
          1
        );
      });
    });


  document
    .querySelectorAll(".quantity-btn.minus")
    .forEach(button => {
      button.addEventListener("click", () => {
        changePersonQuantity(
          button.dataset.item,
          button.dataset.friend,
          -1
        );
      });
    });


  document
    .querySelectorAll(".remove-item")
    .forEach(button => {
      button.addEventListener("click", () => {
        const id =
          Number(button.dataset.id);

        items = items.filter(
          item => item.id !== id
        );

        renderItems();
        updateCalculatedTotal();
      });
    });
}


function changePersonQuantity(
  itemId,
  friendId,
  change
) {
  const item = findItem(itemId);

  if (!item) return;

  const id = Number(friendId);

  const current =
    item.quantities[id] || 0;

  const newQuantity =
    Math.max(0, current + change);

  item.quantities[id] =
    newQuantity;

  renderItems();
  updateCalculatedTotal();
}


function findItem(id) {
  return items.find(
    item => item.id === Number(id)
  );
}


// ========================
// SPLIT BUTTON
// ========================

splitBtn.addEventListener("click", () => {
  if (friends.length < 2) {
    alert("Add at least 2 friends 👀");
    return;
  }


  if (selectedMode === "equal") {
    const input =
      document.getElementById("billAmount");

    const bill =
      Number(input?.value);

    if (!bill || bill <= 0) {
      alert("Enter the bill amount first 💸");
      return;
    }

    currentBillTotal = bill;

    splitEqually(bill);
  } else {
    splitByItems();
  }
});


// ========================
// SPLIT TOTAL EQUALLY
// ========================

function splitEqually(bill) {
  const amountPerPerson =
    bill / friends.length;

  const results =
    friends.map(friend => ({
      id: friend.id,
      name: friend.name,
      amount: amountPerPerson,
      coveredBy: null
    }));

  showResults(results);
}


// ========================
// PAY FOR WHAT YOU HAD
// ========================

function splitByItems() {
  if (items.length === 0) {
    alert("Add at least one item 🍕");
    return;
  }


  const totals = {};

  friends.forEach(friend => {
    totals[friend.id] = 0;
  });


  for (const item of items) {
    const price =
      Number(item.price);

    const quantity =
      getItemQuantity(item);


    if (!item.name.trim()) {
      alert("Give every item a name 👀");
      return;
    }


    if (!price || price <= 0) {
      alert(
        `Add a price for ${item.name} 👀`
      );
      return;
    }


    if (quantity === 0) {
      alert(
        `Who had ${item.name}? Add at least one person 👀`
      );
      return;
    }


    friends.forEach(friend => {
      const friendQuantity =
        item.quantities[friend.id] || 0;

      totals[friend.id] +=
        friendQuantity * price;
    });
  }


  currentBillTotal =
    calculateItemsTotal();


  const results =
    friends.map(friend => ({
      id: friend.id,
      name: friend.name,
      amount: totals[friend.id],
      coveredBy: null
    }));


  showResults(results);
}


// ========================
// SHOW RESULTS
// ========================

function showResults(results) {
  currentResults =
    results.map(result => ({
      ...result
    }));


  renderResults(false);

  setupCoverOptions();

  coverMessage.textContent = "";


  mainCard.style.display =
    "none";

  resultCard.classList.add(
    "show"
  );


  resultCard.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


// ========================
// RESULTS
// ========================

function renderResults(isNewSplit = false) {
  paymentResults.innerHTML = "";


  // TOTAL BILL
  const totalBox =
    document.createElement("div");

  totalBox.className =
    "result-total";

  totalBox.innerHTML = `
    <span>TOTAL BILL</span>
    <strong>
      ₪${currentBillTotal.toFixed(2)}
    </strong>
  `;

  paymentResults.appendChild(
    totalBox
  );


  if (isNewSplit) {
    const title =
      document.createElement("div");

    title.className =
      "new-split-title";

    title.textContent =
      "NEW SPLIT ✦";

    paymentResults.appendChild(
      title
    );
  }


  currentResults.forEach(result => {
    const row =
      document.createElement("div");

    row.className =
      "payment-row";


    if (result.coveredBy) {
      row.innerHTML = `
        <span>
          ${result.name}

          <small>
            Covered by ${result.coveredBy} 💗
          </small>
        </span>

        <strong>
          ₪0.00
        </strong>
      `;
    } else {
      row.innerHTML = `
        <span>
          ${result.name}
        </span>

        <strong>
          ₪${result.amount.toFixed(2)}
        </strong>
      `;
    }


    paymentResults.appendChild(row);
  });


  updateSummary();
}


// ========================
// I GOT YOU
// ========================

function setupCoverOptions() {
  coverPayer.innerHTML = `
    <option value="">
      Who are you?
    </option>
  `;


  coverFriend.innerHTML = `
    <option value="">
      Who are you covering?
    </option>
  `;


  currentResults.forEach(
    (result, index) => {
      if (!result.coveredBy) {
        coverPayer.innerHTML += `
          <option value="${index}">
            ${result.name}
          </option>
        `;
      }


      if (
        result.amount > 0 &&
        !result.coveredBy
      ) {
        coverFriend.innerHTML += `
          <option value="${index}">
            ${result.name}
          </option>
        `;
      }
    }
  );
}


// ========================
// COVER FRIEND
// ========================

coverBtn.addEventListener("click", () => {
  if (
    coverPayer.value === "" ||
    coverFriend.value === ""
  ) {
    coverMessage.textContent =
      "Choose two friends first 👀";

    return;
  }


  const payerIndex =
    Number(coverPayer.value);

  const friendIndex =
    Number(coverFriend.value);


  if (payerIndex === friendIndex) {
    coverMessage.textContent =
      "You can't cover yourself 😂";

    return;
  }


  const payer =
    currentResults[payerIndex];

  const coveredFriend =
    currentResults[friendIndex];


  if (!payer || !coveredFriend) {
    return;
  }


  if (
    coveredFriend.amount <= 0 ||
    coveredFriend.coveredBy
  ) {
    coverMessage.textContent =
      `${coveredFriend.name} is already covered 💗`;

    return;
  }


  const coveredAmount =
    coveredFriend.amount;


  payer.amount +=
    coveredAmount;

  coveredFriend.amount = 0;

  coveredFriend.coveredBy =
    payer.name;


  renderResults(true);


  coverMessage.innerHTML = `
    <strong>
      ${payer.name}'s got ${coveredFriend.name} 💗
    </strong>

    <br>

    New split calculated ✦
  `;


  coverBtn.textContent =
    "New split calculated ✦";


  setTimeout(() => {
    coverBtn.textContent =
      "Cover their share 💗";
  }, 1800);


  setupCoverOptions();
});


// ========================
// SUMMARY
// ========================

function updateSummary() {
  owesResults.innerHTML = "";


  const coveredPeople =
    currentResults.filter(
      result => result.coveredBy
    );


  if (coveredPeople.length === 0) {
    owesResults.innerHTML = `
      <div class="owe-row">
        No fighting. Split It did the math. 💅
      </div>
    `;

    return;
  }


  coveredPeople.forEach(person => {
    const row =
      document.createElement("div");

    row.className =
      "owe-row";

    row.innerHTML = `
      💗 ${person.coveredBy}
      is covering
      ${person.name}'s share.
    `;

    owesResults.appendChild(row);
  });
}


// ========================
// COPY TO GROUP
// ========================

copyBtn.addEventListener("click", async () => {
  let message =
    `Split It 💸\n`;

  message +=
    `Total: ₪${currentBillTotal.toFixed(2)}\n\n`;


  currentResults.forEach(result => {
    if (result.coveredBy) {
      message +=
        `${result.name}: ₪0.00 — Covered by ${result.coveredBy} 💗\n`;
    } else {
      message +=
        `${result.name}: ₪${result.amount.toFixed(2)}\n`;
    }
  });


  message +=
    "\nNo drama. Split It did the math. ✦";


  try {
    await navigator.clipboard
      .writeText(message);

    copyBtn.textContent =
      "Copied! Send it to the group 💗";

    setTimeout(() => {
      copyBtn.textContent =
        "Copy to group chat 📲";
    }, 2000);
  } catch {
    alert("Couldn't copy the message.");
  }
});


// ========================
// NEW BILL
// ========================

newBillBtn.addEventListener("click", () => {
  resultCard.classList.remove(
    "show"
  );

  mainCard.style.display =
    "block";

  paymentResults.innerHTML = "";
  owesResults.innerHTML = "";
  coverMessage.textContent = "";

  currentResults = [];

  coverBtn.textContent =
    "Cover their share 💗";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// ========================
// INITIAL
// ========================

renderFriends();