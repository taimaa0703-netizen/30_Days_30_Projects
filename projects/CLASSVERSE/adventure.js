'use strict';
// Adventure engine: worlds, subject game types, server-side grading and the mission state machine.
const crypto = require('crypto');

const uid = () => crypto.randomUUID().slice(0, 8);
const clean = (value, max = 120) => String(value ?? '').trim().slice(0, max);

// ---- Worlds -------------------------------------------------------------
// To add a world (Mystery Forest, Ocean Explorer, Secret Castle) add an entry here and its
// translation keys (w_<id>, m_<mission>, m_<mission>_story, t_<team>) in public/adventure-i18n.js.
const WORLDS = {
  space: {
    id: 'space', icon: '🪐', maxEnergy: 100, startEnergy: 40,
    teams: [{ id: 'pilots', icon: '🧑‍🚀' }, { id: 'engineers', icon: '🔧' }, { id: 'scientists', icon: '🔬' }],
    voteOptions: ['shield', 'fuel'],
    missions: [
      { id: 'moon', icon: '🌙', need: 55 },
      { id: 'mars', icon: '🔴', need: 65 },
      { id: 'saturn', icon: '🪐', need: 75 }
    ]
  }
};

// ---- Game types: each maps a subject experience onto an interaction kind --------
const GAME_TYPES = {
  quiz: { subject: 'general', kind: 'choice' },
  equation: { subject: 'math', kind: 'numeric' },
  calculation: { subject: 'math', kind: 'numeric' },
  numberPuzzle: { subject: 'math', kind: 'order' },
  spelling: { subject: 'language', kind: 'text' },
  wordMatch: { subject: 'language', kind: 'match' },
  sentenceBuild: { subject: 'language', kind: 'order' },
  classification: { subject: 'science', kind: 'classify' },
  process: { subject: 'science', kind: 'order' },
  concept: { subject: 'science', kind: 'choice' },
  timeline: { subject: 'history', kind: 'order' },
  eventMatch: { subject: 'history', kind: 'match' },
  historyQuiz: { subject: 'history', kind: 'choice' },
  logicPuzzle: { subject: 'cs', kind: 'choice' },
  algorithm: { subject: 'cs', kind: 'order' },
  debugging: { subject: 'cs', kind: 'choice' }
};
const SUBJECTS = ['science', 'math', 'language', 'history', 'cs'];

const list = (value, min, max, len) => {
  const items = (Array.isArray(value) ? value : []).map(v => clean(v, len)).filter(Boolean).slice(0, max);
  return items.length >= min ? items : null;
};

// Validates a challenge specification (used by the creator and for built-in packs).
function validateSpec(raw) {
  const def = GAME_TYPES[raw?.type];
  if (!def) return { ok: false, error: 'challengeInvalid' };
  const prompt = clean(raw.prompt, 240);
  if (!prompt) return { ok: false, error: 'challengeInvalid' };
  const base = { id: uid(), type: raw.type, kind: def.kind, prompt, explain: clean(raw.explain, 240) || undefined };
  if (raw.by) base.by = clean(raw.by, 24);
  switch (def.kind) {
    case 'choice': {
      const options = (Array.isArray(raw.options) ? raw.options : []).map(o => clean(o, 90));
      const answer = Number(raw.answer);
      if (options.length !== 4 || options.some(o => !o) || !Number.isInteger(answer) || answer < 0 || answer > 3) return { ok: false, error: 'challengeInvalid' };
      return { ok: true, spec: { ...base, options, answer, code: clean(raw.code, 400) || undefined, mono: raw.mono ? true : undefined } };
    }
    case 'numeric': {
      const answer = Number(String(raw.answer).replace(',', '.')), tolerance = Math.abs(Number(raw.tolerance) || 0);
      if (!Number.isFinite(answer) || raw.answer === '' || raw.answer === null) return { ok: false, error: 'challengeInvalid' };
      return { ok: true, spec: { ...base, answer, tolerance, unit: clean(raw.unit, 12) || undefined } };
    }
    case 'text': {
      const answers = list(raw.answers, 1, 6, 40);
      if (!answers) return { ok: false, error: 'challengeInvalid' };
      return { ok: true, spec: { ...base, answers, hint: clean(raw.hint, 80) || undefined } };
    }
    case 'order': {
      const items = list(raw.items, 2, 8, 80);
      if (!items) return { ok: false, error: 'challengeInvalid' };
      return { ok: true, spec: { ...base, items } };
    }
    case 'match': {
      const pairs = (Array.isArray(raw.pairs) ? raw.pairs : []).map(p => [clean(p?.[0], 60), clean(p?.[1], 80)]).filter(p => p[0] && p[1]).slice(0, 6);
      if (pairs.length < 2 || new Set(pairs.map(p => p[0])).size !== pairs.length || new Set(pairs.map(p => p[1])).size !== pairs.length) return { ok: false, error: 'challengeInvalid' };
      return { ok: true, spec: { ...base, pairs } };
    }
    case 'classify': {
      const categories = list(raw.categories, 2, 4, 40);
      const items = (Array.isArray(raw.items) ? raw.items : []).map(i => [clean(i?.[0], 60), Number(i?.[1])]).filter(i => i[0]).slice(0, 8);
      if (!categories || items.length < 2 || items.some(i => !Number.isInteger(i[1]) || i[1] < 0 || i[1] >= categories.length)) return { ok: false, error: 'challengeInvalid' };
      if (new Set(items.map(i => i[1])).size < 2) return { ok: false, error: 'challengeInvalid' };
      return { ok: true, spec: { ...base, categories, items } };
    }
    default: return { ok: false, error: 'challengeInvalid' };
  }
}

function shuffled(items) {
  const out = items.map((value, id) => ({ id, ...value }));
  for (let i = out.length - 1; i > 0; i--) { const j = crypto.randomInt(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  if (out.length > 1 && out.every((x, i) => x.id === i)) out.push(out.shift());
  return out;
}

// What students/projectors may see: never the answers.
function publicView(spec, mystery) {
  const view = { id: spec.id, type: spec.type, kind: spec.kind, prompt: spec.prompt, mystery: Boolean(mystery), by: spec.by || null };
  switch (spec.kind) {
    case 'choice': return { ...view, options: spec.options, code: spec.code || null, mono: Boolean(spec.mono) };
    case 'numeric': return { ...view, unit: spec.unit || '' };
    case 'text': return { ...view, hint: spec.hint || '', length: spec.answers[0].length };
    case 'order': return { ...view, items: shuffled(spec.items.map(text => ({ text }))) };
    case 'match': return { ...view, left: spec.pairs.map(([text], id) => ({ id, text })), right: shuffled(spec.pairs.map(([, text]) => ({ text }))) };
    case 'classify': return { ...view, categories: spec.categories, items: shuffled(spec.items.map(([text]) => ({ text }))) };
  }
}

function solutionOf(spec) {
  const out = { explain: spec.explain || null };
  switch (spec.kind) {
    case 'choice': out.answer = spec.answer; break;
    case 'numeric': out.answer = spec.answer; break;
    case 'text': out.answer = spec.answers[0]; break;
    case 'order': out.items = spec.items; break;
    case 'match': out.pairs = spec.pairs; break;
    case 'classify': out.items = spec.items.map(([text, cat]) => [text, spec.categories[cat]]); break;
  }
  return out;
}

const normalize = s => String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
const isIndex = (v, n) => Number.isInteger(v) && v >= 0 && v < n;

// Returns { ok, score } with score in 0..1 (partial credit for ordering, matching and classifying).
function grade(spec, response) {
  const bad = { ok: false, error: 'invalidAnswer' };
  switch (spec.kind) {
    case 'choice': { const n = Number(response); return isIndex(n, 4) ? { ok: true, score: n === spec.answer ? 1 : 0 } : bad; }
    case 'numeric': {
      const n = Number(String(response ?? '').trim().replace(',', '.'));
      if (String(response ?? '').trim() === '' || !Number.isFinite(n)) return bad;
      return { ok: true, score: Math.abs(n - spec.answer) <= spec.tolerance + 1e-9 ? 1 : 0 };
    }
    case 'text': {
      const text = clean(response, 60); if (!text) return bad;
      return { ok: true, score: spec.answers.some(a => normalize(a) === normalize(text)) ? 1 : 0 };
    }
    case 'order': {
      const n = spec.items.length;
      if (!Array.isArray(response) || response.length !== n || new Set(response).size !== n || !response.every(v => isIndex(v, n))) return bad;
      return { ok: true, score: response.filter((v, i) => v === i).length / n };
    }
    case 'match': {
      const n = spec.pairs.length;
      if (!Array.isArray(response) || response.length !== n) return bad;
      const lefts = new Set(), rights = new Set(); let right = 0;
      for (const pair of response) {
        if (!Array.isArray(pair) || !isIndex(pair[0], n) || !isIndex(pair[1], n)) return bad;
        lefts.add(pair[0]); rights.add(pair[1]); if (pair[0] === pair[1]) right++;
      }
      return lefts.size === n && rights.size === n ? { ok: true, score: right / n } : bad;
    }
    case 'classify': {
      const n = spec.items.length;
      if (!Array.isArray(response) || response.length !== n) return bad;
      const seen = new Set(); let right = 0;
      for (const pair of response) {
        if (!Array.isArray(pair) || !isIndex(pair[0], n) || !isIndex(pair[1], spec.categories.length)) return bad;
        seen.add(pair[0]); if (spec.items[pair[0]][1] === pair[1]) right++;
      }
      return seen.size === n ? { ok: true, score: right / n } : bad;
    }
  }
  return bad;
}

// ---- Built-in content (English). Three missions x three challenges per subject. ----
const c = (type, data) => ({ type, ...data });
const PACKS = {
  math: [
    c('equation', { prompt: 'Solve for x: 3x + 5 = 20', answer: 5, explain: '3x = 15, so x = 5.' }),
    c('calculation', { prompt: 'Each fuel tank holds 12 litres. How many litres do 7 tanks hold?', answer: 84, unit: 'L' }),
    c('numberPuzzle', { prompt: 'Order these numbers from smallest to largest.', items: ['−4', '−0.5', '0.25', '3/4', '1.2'] }),
    c('equation', { prompt: 'Solve for x: 2(x − 3) = 14', answer: 10, explain: 'x − 3 = 7, so x = 10.' }),
    c('calculation', { prompt: 'A rocket flies 450 km in 3 hours at a constant speed. What is its speed in km/h?', answer: 150, unit: 'km/h' }),
    c('numberPuzzle', { prompt: 'Order these fractions from smallest to largest.', items: ['1/4', '1/3', '1/2', '2/3', '5/6'] }),
    c('equation', { prompt: 'Solve for x (x > 0): x² = 81', answer: 9 }),
    c('calculation', { prompt: 'What is 15% of 240?', answer: 36, explain: '240 × 0.15 = 36.' }),
    c('numberPuzzle', { prompt: 'Order these values from smallest to largest.', items: ['10', '5²', '3³', '2⁵', '7²'], explain: '10, 25, 27, 32, 49.' })
  ],
  language: [
    c('spelling', { prompt: 'Spell the word: the force that pulls objects toward Earth. (g _ _ _ _ _ y)', answers: ['gravity'], hint: 'g _ _ _ _ _ y' }),
    c('wordMatch', { prompt: 'Match each word with its synonym.', pairs: [['big', 'large'], ['quick', 'fast'], ['silent', 'quiet'], ['begin', 'start']] }),
    c('sentenceBuild', { prompt: 'Build the sentence in the correct order.', items: ['The', 'astronauts', 'explored', 'the', 'red', 'planet'] }),
    c('spelling', { prompt: 'Spell the word: the scientific study of stars and planets.', answers: ['astronomy'], hint: 'a _ _ _ _ _ _ _ y' }),
    c('wordMatch', { prompt: 'Match each word with its opposite.', pairs: [['hot', 'cold'], ['early', 'late'], ['empty', 'full'], ['rise', 'fall']] }),
    c('sentenceBuild', { prompt: 'Build the sentence in the correct order.', items: ['Our', 'crew', 'will', 'land', 'on', 'Mars', 'tomorrow'] }),
    c('spelling', { prompt: 'Spell the word: a long journey made for exploring.', answers: ['expedition'], hint: 'e _ _ _ _ _ _ _ _ n' }),
    c('wordMatch', { prompt: 'Match each word with its part of speech.', pairs: [['quickly', 'adverb'], ['planet', 'noun'], ['explore', 'verb'], ['bright', 'adjective']] }),
    c('sentenceBuild', { prompt: 'Build the sentence in the correct order.', items: ['Because', 'the', 'signal', 'was', 'weak', 'we', 'moved', 'closer'] })
  ],
  science: [
    c('classification', { prompt: 'Sort each object into the right group.', categories: ['Planets', 'Stars'], items: [['Mars', 0], ['The Sun', 1], ['Venus', 0], ['Sirius', 1], ['Jupiter', 0], ['Polaris', 1]] }),
    c('process', { prompt: 'Put the stages of the water cycle in order.', items: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'] }),
    c('concept', { prompt: 'Why do astronauts float inside the International Space Station?', options: ['There is no gravity at all up there', 'They are in continuous free fall around Earth', 'The station spins very fast', 'Air pushes them upward'], answer: 1, explain: 'Gravity still acts; the station and crew fall around Earth together.' }),
    c('classification', { prompt: 'Sort each animal into its class.', categories: ['Mammal', 'Bird', 'Reptile'], items: [['Dolphin', 0], ['Eagle', 1], ['Snake', 2], ['Bat', 0], ['Penguin', 1], ['Crocodile', 2]] }),
    c('process', { prompt: 'Put the steps of photosynthesis in order.', items: ['The plant absorbs sunlight, water and carbon dioxide', 'Chlorophyll captures the light energy', 'Glucose (sugar) is produced', 'Oxygen is released'] }),
    c('concept', { prompt: 'Which state of matter has a fixed volume but takes the shape of its container?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], answer: 1 }),
    c('classification', { prompt: 'Sort each energy source.', categories: ['Renewable', 'Non-renewable'], items: [['Solar', 0], ['Coal', 1], ['Wind', 0], ['Oil', 1], ['Hydropower', 0], ['Natural gas', 1]] }),
    c('process', { prompt: 'Order the layers of Earth from the outside in.', items: ['Crust', 'Mantle', 'Outer core', 'Inner core'] }),
    c('concept', { prompt: 'Which force keeps the planets in orbit around the Sun?', options: ['Magnetism', 'Friction', 'Gravity', 'Wind'], answer: 2 })
  ],
  history: [
    c('timeline', { prompt: 'Place these events on the timeline, earliest first.', items: ['Pyramids of Giza built (c. 2560 BCE)', 'First ancient Olympic Games (776 BCE)', 'Fall of the Western Roman Empire (476 CE)', 'Gutenberg\u2019s printing press (c. 1450)'] }),
    c('eventMatch', { prompt: 'Match each historical figure with what they are known for.', pairs: [['Cleopatra', 'Last active ruler of Ptolemaic Egypt'], ['Julius Caesar', 'Roman leader assassinated in 44 BCE'], ['Alexander the Great', 'Built an empire from Greece to India'], ['Genghis Khan', 'Founded the Mongol Empire']] }),
    c('historyQuiz', { prompt: 'Which civilization built Machu Picchu?', options: ['Aztec', 'Maya', 'Inca', 'Olmec'], answer: 2 }),
    c('timeline', { prompt: 'Place these events on the timeline, earliest first.', items: ['Columbus reaches the Americas (1492)', 'The French Revolution begins (1789)', 'World War I begins (1914)', 'First Moon landing (1969)'] }),
    c('eventMatch', { prompt: 'Match each person with their achievement.', pairs: [['Gutenberg', 'Printing press in Europe'], ['Isaac Newton', 'Laws of motion and gravity'], ['Marie Curie', 'Research on radioactivity'], ['Tim Berners-Lee', 'Invented the World Wide Web']] }),
    c('historyQuiz', { prompt: 'What was the Silk Road?', options: ['A network of trade routes linking East and West', 'A Roman highway', 'A river in China', 'A canal in Egypt'], answer: 0 }),
    c('timeline', { prompt: 'Place these space milestones in order, earliest first.', items: ['Sputnik 1 launched (1957)', 'Yuri Gagarin orbits Earth (1961)', 'Apollo 11 lands on the Moon (1969)', 'First ISS module launched (1998)'] }),
    c('eventMatch', { prompt: 'Match each pioneer with their first.', pairs: [['Sputnik 1', 'First artificial satellite'], ['Yuri Gagarin', 'First human in space'], ['Neil Armstrong', 'First person on the Moon'], ['Valentina Tereshkova', 'First woman in space']] }),
    c('historyQuiz', { prompt: 'Which empire built the Colosseum?', options: ['Greek', 'Roman', 'Ottoman', 'Persian'], answer: 1 })
  ],
  cs: [
    c('logicPuzzle', { prompt: 'A = true and B = false. What is the value of A AND (NOT B)?', options: ['True', 'False', 'Error', 'Undefined'], answer: 0 }),
    c('algorithm', { prompt: 'Order the steps that find the largest number in a list.', items: ['Set max to the first number', 'Look at the next number', 'If it is bigger, update max', 'Repeat until the list ends', 'Report max'] }),
    c('debugging', { prompt: 'This loop should print 1 to 5 but stops at 4. Which line has the bug?', mono: true, options: ['let total = 0;', 'for (let i = 1; i < 5; i++) {', 'console.log(i);', '}'], answer: 1, explain: 'It must be i <= 5 (or i < 6).' }),
    c('logicPuzzle', { prompt: 'Which decimal number is the binary number 101?', options: ['3', '4', '5', '6'], answer: 2 }),
    c('algorithm', { prompt: 'Order the steps of a binary search in a sorted list.', items: ['Look at the middle item', 'Compare it with the target', 'Discard the half that cannot contain the target', 'Repeat with the remaining half', 'Stop when the target is found'] }),
    c('debugging', { prompt: 'add(a, b) should return the sum. Which line has the bug?', mono: true, options: ['function add(a, b) {', '  let result = a - b;', '  return result;', '}'], answer: 1, explain: 'It subtracts instead of adding.' }),
    c('logicPuzzle', { prompt: 'Which number continues the pattern 2, 4, 8, 16, ?', options: ['18', '24', '32', '20'], answer: 2 }),
    c('algorithm', { prompt: 'Order one pass of bubble sort.', items: ['Compare two neighbouring items', 'Swap them if they are in the wrong order', 'Move one position to the right', 'Repeat until the end of the list', 'Start another pass until no swaps happen'] }),
    c('debugging', { prompt: 'The counter always shows 1 after every click. Why?', code: 'function onClick() {\n  let count = 0;\n  count++;\n  show(count);\n}', options: ['count is reset to 0 on every call', 'show is not defined', 'count++ is invalid syntax', 'onClick has no parameters'], answer: 0 })
  ]
};
// Fail fast if a built-in challenge is malformed.
for (const [subject, pack] of Object.entries(PACKS)) {
  PACKS[subject] = pack.map(raw => { const r = validateSpec(raw); if (!r.ok) throw new Error(`Invalid built-in challenge in ${subject}: ${raw.prompt}`); return r.spec; });
}

// ---- Adventure state ------------------------------------------------------
function createAdventure(worldId, subject) {
  const world = WORLDS[worldId] || WORLDS.space;
  const pack = PACKS[subject] || PACKS.science;
  const missions = world.missions.map((m, i) => ({ id: m.id, icon: m.icon, need: m.need, challenges: pack.slice(i * 3, i * 3 + 3).map(spec => ({ ...spec, id: uid() })) }));
  const adv = {
    world: world.id, subject: PACKS[subject] ? subject : 'science', missions,
    missionIndex: 0, challengeIndex: -1, phase: 'lobby', mysteryIndex: 0,
    energy: world.startEnergy, maxEnergy: world.maxEnergy,
    unlocked: missions.map((_, i) => i === 0), completed: missions.map(() => false), retries: missions.map(() => 0),
    current: null, responses: new Map(), result: null, vote: null, votes: new Map(),
    shield: false, doubleNext: false, lastEvent: null, log: [], final: null
  };
  startMission(adv);
  return adv;
}
const startMission = adv => { adv.mysteryIndex = crypto.randomInt(adv.missions[adv.missionIndex].challenges.length); };
const worldOf = adv => WORLDS[adv.world];
const log = (adv, key, values = {}) => { adv.log.push({ key, values, at: Date.now() }); adv.log = adv.log.slice(-8); };
const clampEnergy = adv => { adv.energy = Math.max(0, Math.min(adv.maxEnergy, adv.energy)); };

function pickTeam(room) {
  const teams = worldOf(room.adv).teams;
  const counts = new Map(teams.map(t => [t.id, 0]));
  for (const s of room.students.values()) if (counts.has(s.team)) counts.set(s.team, counts.get(s.team) + 1);
  return [...counts.entries()].sort((a, b) => a[1] - b[1])[0][0];
}
const newStats = () => ({ correct: 0, answered: 0, energy: 0, synergy: 0, quick: 0, ideas: 0 });

function launchChallenge(room, now = Date.now()) {
  const adv = room.adv, mission = adv.missions[adv.missionIndex];
  adv.challengeIndex += 1;
  const spec = mission.challenges[adv.challengeIndex];
  const mystery = adv.challengeIndex === adv.mysteryIndex;
  adv.current = { spec, mystery, startedAt: now, view: publicView(spec, mystery) };
  adv.responses.clear(); adv.result = null; adv.phase = 'challenge';
  for (const s of room.students.values()) s.answered = false;
}

function submitAnswer(room, studentId, response, now = Date.now()) {
  const adv = room.adv;
  if (adv.phase !== 'challenge') return { ok: false, error: 'noActiveQuestion' };
  if (adv.responses.has(studentId)) return { ok: false, error: 'alreadyAnswered' };
  const graded = grade(adv.current.spec, response);
  if (!graded.ok) return graded;
  adv.responses.set(studentId, { score: graded.score, elapsed: Math.max(0, now - adv.current.startedAt) });
  const student = room.students.get(studentId); if (student) student.answered = true;
  return { ok: true };
}

// Closes the challenge: awards points, moves the class energy meter and finds team synergy.
function resolveChallenge(room, now = Date.now()) {
  const adv = room.adv, { spec, mystery } = adv.current;
  const students = [...room.students.values()];
  const mult = mystery ? 2 : 1, pointsMult = mult * (adv.doubleNext ? 2 : 1);
  const limitMs = room.timeLimit * 1000;
  const perStudent = {};
  let total = 0, quick = null;
  for (const s of students) {
    const r = adv.responses.get(s.id);
    s.stats = s.stats || newStats();
    if (!r) { perStudent[s.id] = { answered: false, score: 0, points: 0, correct: false }; continue; }
    const correct = r.score === 1;
    const speed = correct && limitMs > 0 ? Math.round(50 * Math.max(0, 1 - r.elapsed / limitMs)) : 0;
    const points = Math.round((100 * r.score + speed) * pointsMult);
    s.points += points; total += r.score;
    s.stats.answered += 1; s.stats.energy += r.score; if (correct) s.stats.correct += 1;
    if (correct && (!quick || r.elapsed < quick.elapsed)) quick = { id: s.id, elapsed: r.elapsed };
    perStudent[s.id] = { answered: true, score: r.score, points, correct };
  }
  if (quick) students.find(s => s.id === quick.id).stats.quick += 1;
  const accuracy = students.length ? total / students.length : 0;
  const base = Math.round(accuracy * 20) - 5;
  let delta = base > 0 ? base * mult : base;
  const synergy = [];
  for (const team of worldOf(adv).teams) {
    const members = students.filter(s => s.team === team.id);
    if (members.length >= 2 && members.every(s => perStudent[s.id]?.correct)) { synergy.push(team.id); members.forEach(s => { s.stats.synergy += 1; }); delta += 3; }
  }
  adv.energy += delta; clampEnergy(adv); adv.doubleNext = false;
  adv.result = { solution: solutionOf(spec), summary: { perStudent, accuracy: Math.round(accuracy * 100), delta, synergy, mystery, answered: adv.responses.size, participants: students.length } };
  adv.phase = 'result';
  log(adv, 'logResult', { delta, accuracy: Math.round(accuracy * 100) });
  return adv.result;
}

// After the last challenge of a mission: unlock the next planet or ask for a retry.
function endMission(room) {
  const adv = room.adv, mission = adv.missions[adv.missionIndex];
  if (adv.energy < mission.need) { adv.phase = 'locked'; log(adv, 'logLocked'); return; }
  adv.completed[adv.missionIndex] = true;
  if (adv.missionIndex + 1 < adv.missions.length) {
    adv.unlocked[adv.missionIndex + 1] = true;
    adv.vote = { options: worldOf(adv).voteOptions, decision: null }; adv.votes.clear();
    adv.phase = 'vote'; log(adv, 'logUnlocked');
  } else finishAdventure(room);
}

function castVote(room, studentId, option) {
  const adv = room.adv;
  if (adv.phase !== 'vote' || !adv.vote.options.includes(option)) return { ok: false, error: 'invalidAction' };
  adv.votes.set(studentId, option); return { ok: true };
}

function closeVote(room) {
  const adv = room.adv;
  const tally = adv.vote.options.map(o => [o, [...adv.votes.values()].filter(v => v === o).length]);
  tally.sort((a, b) => b[1] - a[1] || adv.vote.options.indexOf(a[0]) - adv.vote.options.indexOf(b[0]));
  const decision = tally[0][0];
  if (decision === 'shield') adv.shield = true;
  if (decision === 'fuel') { adv.energy += 10; clampEnergy(adv); }
  adv.vote.decision = decision; adv.phase = 'voteResult'; log(adv, 'logDecision', { decision });
}

function advance(room) {
  const adv = room.adv;
  if (adv.phase === 'result') {
    if (adv.challengeIndex + 1 < adv.missions[adv.missionIndex].challenges.length) { adv.phase = 'briefing'; adv.current = null; }
    else { adv.current = null; endMission(room); }
  } else if (adv.phase === 'voteResult') {
    adv.missionIndex += 1; adv.challengeIndex = -1; adv.phase = 'briefing'; adv.vote = null; startMission(adv);
  } else return { ok: false, error: 'invalidAction' };
  return { ok: true };
}

function retryMission(room) {
  const adv = room.adv;
  if (adv.phase !== 'locked' || adv.retries[adv.missionIndex] >= 1) return { ok: false, error: 'invalidAction' };
  adv.retries[adv.missionIndex] += 1; adv.challengeIndex = -1; adv.energy += 10; clampEnergy(adv);
  adv.phase = 'briefing'; adv.current = null; startMission(adv); log(adv, 'logRetry');
  return { ok: true };
}

const SURPRISES = ['meteor', 'bonus', 'flare', 'dance'];
function triggerSurprise(room, kind) {
  const adv = room.adv;
  if (!SURPRISES.includes(kind) || ['lobby', 'final'].includes(adv.phase)) return { ok: false, error: 'invalidAction' };
  let effect = 0;
  if (kind === 'meteor') { if (adv.shield) adv.shield = false; else effect = -15; }
  if (kind === 'bonus') effect = 15;
  if (kind === 'dance') effect = 5;
  if (kind === 'flare') adv.doubleNext = true;
  adv.energy += effect; clampEnergy(adv);
  adv.lastEvent = { kind, effect, at: Date.now(), id: uid() };
  log(adv, 'logSurprise', { kind });
  return { ok: true };
}

function addApprovedQuestion(room, proposal) {
  const adv = room.adv;
  const beforeEnd = ['lobby', 'briefing', 'challenge', 'result'].includes(adv.phase);
  const target = beforeEnd ? adv.missionIndex : adv.missionIndex + 1;
  if (!adv.missions[target] || adv.missions[target].challenges.length >= 8) return { ok: false, error: 'questionLimit' };
  const checked = validateSpec({ type: 'quiz', prompt: proposal.q, options: proposal.options, answer: proposal.answer, by: proposal.by });
  if (!checked.ok) return checked;
  adv.missions[target].challenges.push(checked.spec);
  const author = room.students.get(proposal.socketId);
  if (author) { author.stats = author.stats || newStats(); author.stats.ideas += 1; }
  return { ok: true };
}

function addChallenge(room, rawSpec, missionIndex) {
  const adv = room.adv;
  const target = Number.isInteger(missionIndex) ? missionIndex : adv.missionIndex;
  const mission = adv.missions[target];
  if (!mission || target < adv.missionIndex || (target === adv.missionIndex && ['vote', 'voteResult', 'locked', 'final'].includes(adv.phase))) return { ok: false, error: 'invalidAction' };
  if (mission.challenges.length >= 8) return { ok: false, error: 'questionLimit' };
  const checked = validateSpec(rawSpec);
  if (!checked.ok) return checked;
  mission.challenges.push(checked.spec);
  return { ok: true };
}

function finishAdventure(room) {
  const adv = room.adv, students = [...room.students.values()];
  const stat = s => s.stats || newStats();
  const top = (key, min = 1) => {
    const best = Math.max(0, ...students.map(s => stat(s)[key]));
    return best >= min ? students.filter(s => stat(s)[key] === best) : [];
  };
  const badges = [];
  const give = (list, badge) => list.forEach(s => badges.push({ id: s.id, name: s.name, avatar: s.avatar, badge }));
  give(top('synergy'), 'teamPlayer'); give(top('quick'), 'quickThinker'); give(top('energy', 0.5), 'energyHero'); give(top('ideas'), 'ideaMaker');
  give(students.filter(s => stat(s).answered > 0 && !badges.some(b => b.id === s.id)), 'crewMember');
  const teams = worldOf(adv).teams.map(t => {
    const members = students.filter(s => s.team === t.id);
    return { id: t.id, icon: t.icon, members: members.length, points: members.reduce((n, s) => n + s.points, 0), synergy: members.reduce((n, s) => n + stat(s).synergy, 0) };
  });
  adv.final = {
    energy: adv.energy, missionsCompleted: adv.completed.filter(Boolean).length, missionsTotal: adv.missions.length,
    outcome: adv.completed.every(Boolean) ? 'complete' : 'partial', badges, teams
  };
  adv.phase = 'final'; adv.current = null; room.stage = 'finished';
}

function teamsPublic(room) {
  const students = [...room.students.values()];
  return worldOf(room.adv).teams.map(t => {
    const members = students.filter(s => s.team === t.id);
    return { id: t.id, icon: t.icon, members: members.length, points: members.reduce((n, s) => n + s.points, 0), synergy: members.reduce((n, s) => n + (s.stats?.synergy || 0), 0) };
  });
}

function publicState(room) {
  const adv = room.adv; if (!adv) return null;
  const mission = adv.missions[adv.missionIndex];
  const nextIsMystery = adv.phase === 'briefing' && adv.challengeIndex + 1 === adv.mysteryIndex;
  const nextSpec = adv.phase === 'briefing' ? mission.challenges[adv.challengeIndex + 1] : null;
  return {
    world: adv.world, subject: adv.subject, phase: adv.phase, missionIndex: adv.missionIndex, challengeIndex: adv.challengeIndex,
    challengeCount: mission.challenges.length,
    missions: adv.missions.map((m, i) => ({ id: m.id, icon: m.icon, need: m.need, count: m.challenges.length, unlocked: adv.unlocked[i], completed: adv.completed[i], retries: adv.retries[i] })),
    energy: adv.energy, maxEnergy: adv.maxEnergy, shield: adv.shield, doubleNext: adv.doubleNext,
    mysteryPending: adv.phase !== 'lobby' && adv.mysteryIndex > adv.challengeIndex && adv.mysteryIndex < mission.challenges.length,
    next: nextSpec ? { mystery: nextIsMystery, type: nextIsMystery ? null : nextSpec.type, by: nextSpec.by || null } : null,
    challenge: ['challenge', 'result'].includes(adv.phase) ? adv.current.view : null,
    answered: adv.responses.size,
    solution: adv.phase === 'result' ? adv.result.solution : null,
    result: adv.phase === 'result' ? adv.result.summary : null,
    vote: adv.vote ? { options: adv.vote.options, decision: adv.vote.decision, counts: Object.fromEntries(adv.vote.options.map(o => [o, [...adv.votes.values()].filter(v => v === o).length])), voted: adv.votes.size } : null,
    teams: teamsPublic(room), lastEvent: adv.lastEvent, log: adv.log.slice(-5), final: adv.final
  };
}

module.exports = {
  WORLDS, GAME_TYPES, SUBJECTS, PACKS, validateSpec, grade, createAdventure, pickTeam, newStats, launchChallenge, submitAnswer,
  resolveChallenge, advance, castVote, closeVote, retryMission, triggerSurprise, addApprovedQuestion, addChallenge, finishAdventure, publicState
};
