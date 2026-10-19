const itemIllustrations = {
  'tops': 'folded-tshirt',
  't-shirts': 'folded-tshirt',
  't-shirt': 'folded-tshirt',
  'shirt': 'folded-tshirt',
  'button-up shirt': 'collared-shirt',
  'button up shirt': 'collared-shirt',
  'collared shirt': 'collared-shirt',
  'work outfit': 'collared-shirt',
  'bottoms': 'folded-trousers',
  'trousers': 'folded-trousers',
  'pants': 'folded-trousers',
  'jeans': 'jeans',
  'underwear': 'folded-underwear',
  'socks': 'socks',
  'sleepwear': 'pajamas',
  'pajamas': 'pajamas',
  'shoes': 'sneakers',
  'sneakers': 'sneakers',
  'sandals': 'sandals',
  'hiking shoes': 'hiking-boots',
  'toothbrush': 'toothbrush',
  'toothpaste': 'toothpaste',
  'skincare': 'skincare',
  'shampoo': 'shampoo',
  'conditioner': 'shampoo',
  'sunscreen': 'sunscreen',
  'perfume': 'perfume',
  'phone charger': 'phone-charger',
  'charger': 'phone-charger',
  'travel adapter': 'travel-adapter',
  'laptop': 'laptop',
  'passport / id': 'passport',
  'passport': 'passport',
  'tickets / reservations': 'boarding-pass',
  'personal medication': 'medicine',
  'first aid kit': 'first-aid-kit',
  'swimwear': 'swimwear',
  'beach towel': 'rolled-towel',
  'towel': 'rolled-towel',
  'rain jacket': 'jacket',
  'jacket': 'jacket',
  'formal outfit': 'formal-outfit',
  'dress': 'dress',
  'day bag': 'day-bag',
  'sportswear': 'sportswear',
  'sunglasses': 'sunglasses'
};

const categoryIllustrations = {
  clothes: 'folded-tshirt',
  shoes: 'sneakers',
  toiletries: 'shampoo',
  tech: 'phone-charger',
  documents: 'passport',
  health: 'medicine',
  other: 'day-bag'
};

function illustrationFor(item) {
  const name = String(item.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const matchingNames = [
    [/\b(button[\s-]?up|collared shirt|work outfit)\b/, 'collared-shirt'],
    [/\b(jeans|denim)\b/, 'jeans'],
    [/\b(trousers|pants|bottoms)\b/, 'folded-trousers'],
    [/\b(underwear|panties|briefs)\b/, 'folded-underwear'],
    [/\bsocks?\b/, 'socks'],
    [/\b(sleepwear|pajamas?)\b/, 'pajamas'],
    [/\b(hiking shoes|hiking boots)\b/, 'hiking-boots'],
    [/\b(sneakers?|trainers|running shoes)\b/, 'sneakers'],
    [/\b(sandals|flip[ -]?flops)\b/, 'sandals'],
    [/\b(shoes|boots)\b/, 'sneakers'],
    [/\btoothbrush\b/, 'toothbrush'],
    [/\btoothpaste\b/, 'toothpaste'],
    [/\b(sunscreen|sunblock)\b/, 'sunscreen'],
    [/\b(shampoo|conditioner)\b/, 'shampoo'],
    [/\b(skincare|lotion|face cream)\b/, 'skincare'],
    [/\b(perfume|fragrance)\b/, 'perfume'],
    [/\b(charger|charging cable)\b/, 'phone-charger'],
    [/\b(travel adapter|adapter)\b/, 'travel-adapter'],
    [/\b(laptop|notebook computer)\b/, 'laptop'],
    [/\b(passport|id card)\b/, 'passport'],
    [/\b(tickets?|boarding pass|reservations?)\b/, 'boarding-pass'],
    [/\b(medication|medicine|pills)\b/, 'medicine'],
    [/\b(first aid|first-aid)\b/, 'first-aid-kit'],
    [/\b(swimwear|swimsuit|bathing suit)\b/, 'swimwear'],
    [/\btowels?\b/, 'rolled-towel'],
    [/\b(rain jacket|jacket|coat)\b/, 'jacket'],
    [/\b(formal outfit|formal wear|suit|blazer)\b/, 'formal-outfit'],
    [/\bdresses?\b/, 'dress'],
    [/\b(umbrella|brolly)\b/, 'umbrella'],
    [/\b(sun hat|hat|cap)\b/, 'sun-hat'],
    [/\b(day bag|backpack|handbag)\b/, 'day-bag'],
    [/\b(sportswear|activewear|gym clothes)\b/, 'sportswear'],
    [/\bsunglasses\b/, 'sunglasses'],
    [/\b(shirts?|t-?shirts?|tops)\b/, 'folded-tshirt']
  ];
  const match = matchingNames.find(([pattern]) => pattern.test(name));
  return itemIllustrations[name] || match?.[1] || categoryIllustrations[item.category] || 'day-bag';
}

let expandedPackingSlot = null;

const quantityCopy = {
  en: { edit: 'Change quantity', increase: 'Increase quantity', decrease: 'Decrease quantity' },
  he: { edit: 'שינוי כמות', increase: 'הוספת יחידה', decrease: 'הפחתת יחידה' },
  ar: { edit: 'تغيير الكمية', increase: 'زيادة الكمية', decrease: 'تقليل الكمية' }
};

function changePackedQuantity(id, change, caseId) {
  const item = state.items.find((candidate) => candidate.id === id);
  if (!item || item.slot === null) return;
  const quantity = item.qty + change;
  if (quantity < 1 || quantity > 99) return;

  item.qty = quantity;
  save();
  render(false);
  const controls = document.getElementById(caseId).querySelectorAll('.packing-quantity button');
  const button = [...controls].find((candidate) =>
    candidate.dataset.itemId === id && candidate.dataset.change === String(change));
  if (button && !button.disabled) button.focus();
  else document.getElementById(caseId).querySelector('.packing-quantity')?.focus();
}

function showPackingQuantity(slot) {
  const index = Number(slot.dataset.slot);
  if (index !== expandedPackingSlot) return;
  const copy = quantityCopy[state.lang] || quantityCopy.en;
  const panel = document.createElement('div');
  panel.className = 'packing-quantity';
  panel.tabIndex = -1;
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', copy.edit);
  panel.onclick = (event) => event.stopPropagation();
  panel.onkeydown = (event) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      expandedPackingSlot = null;
      const illustration = slot.querySelector('.item-illustration');
      illustration.setAttribute('aria-expanded', 'false');
      panel.remove();
      illustration.focus();
    }
  };
  for (const item of state.items.filter((candidate) => candidate.slot === index)) {
    const row = document.createElement('div');
    row.className = 'packing-quantity-row';
    const name = document.createElement('span');
    name.className = 'packing-quantity-name';
    name.dir = 'auto';
    name.textContent = label(item);
    row.append(name);
    for (const change of [-1, 1]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = change === 1 ? '+' : '−';
      button.dataset.itemId = item.id;
      button.dataset.change = String(change);
      button.setAttribute('aria-label', `${change === 1 ? copy.increase : copy.decrease}: ${label(item)}`);
      button.disabled = change === 1 ? item.qty >= 99 : item.qty <= 1;
      button.onclick = () => changePackedQuantity(item.id, change, slot.closest('.case').id);
      if (change === 1) {
        const count = document.createElement('span');
        count.className = 'packing-quantity-count';
        count.setAttribute('aria-live', 'polite');
        count.textContent = item.qty;
        row.append(count);
      }
      row.append(button);
    }
    panel.append(row);
  }
  slot.append(panel);
}

function updateItemIllustrations() {
  document.querySelectorAll('.item-illustration').forEach((element) => {
    const itemCard = element.closest('.item');
    const slot = element.closest('.slot');
    const item = itemCard
      ? state.items.find((candidate) => candidate.id === itemCard.dataset.id)
      : slot
        ? state.items.find((candidate) => candidate.slot === Number(slot.dataset.slot))
        : null;

    if (!item) return;

    const illustration = illustrationFor(item);
    if (element.dataset.illustration !== illustration) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 96 76');
      svg.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `./item-illustrations.svg#${illustration}`);
      svg.append(use);
      element.replaceChildren(svg);
      element.dataset.illustration = illustration;
    }

    if (!slot) return;

    const copy = quantityCopy[state.lang] || quantityCopy.en;
    const accessibleName = `${label(item)}. ${copy.edit}`;
    element.removeAttribute('aria-hidden');
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.setAttribute('aria-label', accessibleName);
    element.title = accessibleName;
    element.setAttribute('aria-expanded', String(Number(slot.dataset.slot) === expandedPackingSlot));
    const toggleQuantity = () => {
      expandedPackingSlot = expandedPackingSlot === Number(slot.dataset.slot)
        ? null : Number(slot.dataset.slot);
      const caseId = slot.closest('.case').id;
      const slotIndex = slot.dataset.slot;
      render(false);
      document.getElementById(caseId)
        .querySelector(`.slot[data-slot="${slotIndex}"] .item-illustration`)?.focus();
    };
    element.onclick = (event) => {
      event.stopPropagation();
      toggleQuantity();
    };
    element.onkeydown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      toggleQuantity();
    };
    slot.querySelector('.packing-quantity')?.remove();
    showPackingQuantity(slot);
  });
}

const renderWithItemIllustrations = render;
render = (...args) => {
  const result = renderWithItemIllustrations(...args);
  updateItemIllustrations();
  return result;
};

updateItemIllustrations();
