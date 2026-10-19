Object.assign(T.en, {
  heroEyebrow: 'MEDITERRANEAN ESCAPE',
  heroTitle: 'Every trip starts with a suitcase.',
  heroSubtitle: 'Pack with ease. Enjoy the journey.',
  heroSuitcase: 'My suitcase',
  heroPlan: 'Plan my trip →'
});

Object.assign(T.he, {
  heroEyebrow: 'חופשה ים־תיכונית',
  heroTitle: 'התכנון מתחיל במזוודה.',
  heroSubtitle: 'מסדרים את המזוודה, ומתפנים ליהנות מהדרך.',
  heroSuitcase: 'המזוודה שלי',
  heroPlan: 'לתכנון הטיול ←'
});

Object.assign(T.ar, {
  heroEyebrow: 'عطلة على البحر المتوسط',
  heroTitle: 'التخطيط ببلّش من الشنطة.',
  heroSubtitle: 'رتّب شنطتك، وخلي بالك عالرحلة.',
  heroSuitcase: 'شنطتي',
  heroPlan: 'خطّط لرحلتك ←'
});

translate();

document.querySelector('#heroSuitcaseBtn').addEventListener('click', () => {
  switchTab('suitcase');
  document.querySelector('#suitcase').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#heroPlanBtn').addEventListener('click', () => {
  switchTab('trip');
  document.querySelector('#trip').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
