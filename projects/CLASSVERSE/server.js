const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');
const A = require('./adventure');
const DB = require('./db');
const { createApi } = require('./api');
const { clerkAuth } = require('./auth');

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
} else {
  app.set('trust proxy', false);
}// Integrations are optional and read from the environment. Missing keys disable the feature instead of faking it.
const integrations = { pool: null, verify: null, clerkHost: null, publishableKey: null };
let apiRouter = null;
function configure({ pool = null, verify = null, publishableKey = null, clerkHost = null } = {}) {
  Object.assign(integrations, { pool, verify, publishableKey, clerkHost });
  apiRouter = createApi(integrations);
}
configure();
// Reads Clerk and Neon settings from the environment. Anything missing stays disabled and is reported, never faked.
async function bootstrapIntegrations(env = process.env) {
  const auth = clerkAuth(env);
  let pool = null;
  if (env.DATABASE_URL) {
    try {
      const { Pool } = require('pg');
      pool = new Pool({ connectionString: env.DATABASE_URL, max: 5, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 });
      await DB.init(pool);
    } catch (err) {
      console.error('Database unavailable, persistence disabled:', err.message);
      if (pool) pool.end().catch(() => {});
      pool = null;
    }
  }
  configure({ pool, verify: auth?.verify || null, publishableKey: auth?.publishableKey || null, clerkHost: auth?.host || null });
  console.log(`Teacher accounts (Clerk): ${auth ? 'connected' : 'NOT configured (set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY)'}`);
  console.log(`Database (Neon PostgreSQL): ${pool ? 'connected' : 'NOT configured (set DATABASE_URL)'}`);
}
function cspHeader() {
  const clerk = integrations.clerkHost ? ` https://${integrations.clerkHost}` : '';
  const clerkScripts = integrations.clerkHost ? ' https://cdn.protect.clerk.com' : '';
  const clerkExtra = integrations.clerkHost ? ' https://img.clerk.com https://challenges.cloudflare.com' : '';
  return `default-src 'self'; script-src 'self'${clerk}${clerkScripts} https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:${clerkExtra}; connect-src 'self' ws: wss:${clerk}${clerkScripts} https://clerk-telemetry.com; frame-src ${integrations.clerkHost ? 'https://challenges.cloudflare.com' : "'none'"}; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`;
}
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': cspHeader()
  });
  next();
});
const server = http.createServer(app);
const io = new Server(server, { cors: process.env.ALLOWED_ORIGINS ? { origin: process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) } : undefined, maxHttpBufferSize: 1e5 });
// Basic brute-force protection for room codes: attempts per IP per minute.
const attempts = new Map();
function tooManyAttempts(socket) {
  const ip = socket.handshake.address, now = Date.now();
  const entry = (attempts.get(ip) || []).filter(t => now - t < 60000);
  entry.push(now); attempts.set(ip, entry);
  return entry.length > 30;
}
setInterval(() => { const now = Date.now(); for (const [ip, list] of attempts) if (!list.some(t => now - t < 60000)) attempts.delete(ip); }, 60000).unref();
const ROOM_TTL_MS = (Number(process.env.ROOM_TTL_HOURS) || 6) * 3600 * 1000;
setInterval(() => { const now = Date.now(); for (const [code, r] of rooms) if (now - (r.touched || 0) > ROOM_TTL_MS) { clearTimeout(r.timer); rooms.delete(code); } }, 10 * 60 * 1000).unref();
app.get('/health', (_req, res) => {
  res.set('Access-Control-Allow-Origin', '*').json({ status: 'ok' });
});
app.get('/projector', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'projector.html')));
app.get('/api/qr', async (req, res) => {
  const code = String(req.query.code ?? '').toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code) || !rooms.has(code)) return res.status(404).end();
  const origin = `${req.protocol}://${req.get('host')}`;
  const svg = await QRCode.toString(`${origin}/?room=${code}`, { type: 'svg', margin: 1, color: { dark: '#111111', light: '#ffffff' } });
  res.type('image/svg+xml').send(svg);
});
// Clerk's own sign-in dialog is translated with its official Hebrew/Arabic packs, served locally (no extra CDN).
for (const [lang, file] of [['he', 'he-IL'], ['ar', 'ar-SA']]) {
  app.get(`/vendor/clerk-${lang}.mjs`, (_req, res) => {
    const source = path.join(__dirname, 'node_modules', '@clerk', 'localizations', 'dist', `${file}.mjs`);
    res.type('text/javascript').sendFile(source, err => { if (err && !res.headersSent) res.status(404).end(); });
  });
}
app.use('/api', (req, res, next) => apiRouter(req, res, next));
app.use(express.static(path.join(__dirname, 'public')));
const rooms = new Map();
const MAX_STUDENTS = 60;
const clean = (value, max = 90) => String(value ?? '').trim().slice(0, max);
const codeGen = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const starter = [
  { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Mercury'], answer: 1 },
  { q: 'What do astronauts need to breathe in space?', options: ['Oxygen', 'Sand', 'Moonlight', 'Fire'], answer: 0 },
  { q: 'Which star is at the center of our solar system?', options: ['Polaris', 'Sirius', 'The Sun', 'Betelgeuse'], answer: 2 }
];
const gamePacks = {
  space: starter,
  science: [
    { q: 'At what temperature does water boil at sea level?', options: ['50°C', '100°C', '150°C', '200°C'], answer: 1 },
    { q: 'Which gas do plants absorb from the air?', options: ['Carbon dioxide', 'Oxygen', 'Helium', 'Hydrogen'], answer: 0 },
    { q: 'What is the largest organ of the human body?', options: ['Heart', 'Liver', 'Skin', 'Lungs'], answer: 2 }
  ],
  math: [
    { q: 'What is 8 × 7?', options: ['48', '54', '56', '64'], answer: 2 },
    { q: 'Which fraction is equal to 0.75?', options: ['1/2', '2/3', '3/4', '4/5'], answer: 2 },
    { q: 'What is the perimeter of a square with sides of 5 cm?', options: ['10 cm', '15 cm', '20 cm', '25 cm'], answer: 2 }
  ],
  language: [
    { q: 'What is the opposite of “ancient”?', options: ['Modern', 'Quiet', 'Heavy', 'Narrow'], answer: 0 },
    { q: 'What is the plural of “child”?', options: ['Childs', 'Children', 'Childes', 'Childrens'], answer: 1 },
    { q: 'Which word is an adjective?', options: ['Quickly', 'Bright', 'Running', 'Under'], answer: 1 }
  ],
  history: [
    { q: 'In which country were the pyramids of Giza built?', options: ['Greece', 'Egypt', 'Italy', 'India'], answer: 1 },
    { q: 'In which year did humans first land on the Moon?', options: ['1959', '1965', '1969', '1975'], answer: 2 },
    { q: 'Who is associated with the European printing press?', options: ['Galileo', 'Gutenberg', 'Newton', 'Da Vinci'], answer: 1 }
  ]
};
function stateFor(room, teacher) {
  return {
    code: room.code, title: room.title, world: room.world, stage: room.stage, contentLanguage: room.contentLanguage, gameId: room.gameId,
    // Only the teacher sees upcoming questions; everyone else sees the active one.
    questions: room.questions.map((q, i) => (teacher || i === room.activeQuestion ? { index: i, q: q.q, options: q.options } : { index: i, q: '', options: [] })),
    students: [...room.students.values()].map(s => ({ id: s.id, name: s.name, avatar: s.avatar, points: s.points, answered: s.answered, team: s.team || null, connected: s.connected !== false })),
    adv: A.publicState(room),
    activeQuestion: room.activeQuestion,
    answersCount: room.answers.size,
    answerCounts: room.questions.map((question, index) => index === room.activeQuestion
      ? question.options.map((_, option) => [...room.answers.values()].filter(answer => answer === option).length)
      : []),
    // Unapproved student content is visible to the teacher only.
    proposals: teacher ? room.proposals.map(p => ({ id: p.id, by: p.by, q: p.q, options: p.options, answer: p.answer })) : [],
    surprise: room.surprise, storyChoice: room.storyChoice, storyVotes: Object.fromEntries(room.storyVotes),
    teacherConnected: Boolean(room.teacherId),
    timeLimit: room.timeLimit, endsAt: room.stage === 'question' ? room.endsAt : null, serverNow: Date.now(),
    revealAnswer: room.stage === 'reveal' && room.activeQuestion >= 0 ? room.questions[room.activeQuestion].answer : null,
    results: room.stage === 'finished' ? resultsFor(room) : null
  };
}
function broadcast(room) {
  io.to(room.code).except(room.teacherId || '').emit('room:state', stateFor(room, false));
  if (room.teacherId) io.to(room.teacherId).emit('room:state', stateFor(room, true));
  room.touched = Date.now();
}

const TEAMS = A.WORLDS.space.teams;
function pickTeam(room) {
  const counts = new Map(TEAMS.map(t => [t.id, 0]));
  for (const s of room.students.values()) if (counts.has(s.team)) counts.set(s.team, counts.get(s.team) + 1);
  return [...counts.entries()].sort((a, b) => a[1] - b[1])[0][0];
}
function badgesFor(room, s, fastest) {
  const total = room.played.size, log = s.log || [], out = [];
  if (!log.length) return out;
  if (total > 0 && log.filter(x => x.correct).length === total) out.push('perfect');
  let run = 0, best = 0; for (const x of log) { run = x.correct ? run + 1 : 0; best = Math.max(best, run); }
  if (best >= 3) out.push('streak');
  if (fastest === s.id) out.push('quick');
  if (total > 0 && log.length >= total) out.push('steady');
  out.push('participant');
  return out;
}
const pct = (a, b) => (b ? Math.round((a / b) * 100) : null);
function resultsFor(room) {
  const students = [...room.students.values()];
  const played = [...room.played].sort((a, b) => a - b);
  const questions = played.map(index => {
    const answered = students.filter(s => s.log?.some(x => x.index === index)).length;
    const correct = students.filter(s => s.log?.some(x => x.index === index && x.correct)).length;
    return { index, q: room.questions[index]?.q || '', answered, correct, accuracy: pct(correct, answered) };
  });
  let fastest = null, fastestMs = Infinity;
  for (const s of students) for (const x of s.log || []) if (x.correct && x.ms < fastestMs) { fastest = s.id; fastestMs = x.ms; }
  const players = students.slice().sort((a, b) => b.points - a.points).map((s, i) => {
    const answered = s.log?.length || 0, correct = (s.log || []).filter(x => x.correct).length;
    return { id: s.id, name: s.name, avatar: s.avatar, team: s.team, points: s.points, rank: i + 1, answered, correct, accuracy: pct(correct, answered), badges: badgesFor(room, s, fastest) };
  });
  const answeredAll = questions.reduce((n, q) => n + q.answered, 0), correctAll = questions.reduce((n, q) => n + q.correct, 0);
  const teams = TEAMS.map(t => {
    const members = students.filter(s => s.team === t.id);
    const answered = members.reduce((n, s) => n + (s.log?.length || 0), 0), correct = members.reduce((n, s) => n + (s.log || []).filter(x => x.correct).length, 0);
    return { id: t.id, icon: t.icon, members: members.length, points: members.reduce((n, s) => n + s.points, 0), accuracy: pct(correct, answered) };
  });
  const difficult = questions.filter(q => q.accuracy !== null && q.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy);
  return {
    participants: students.length, questionsPlayed: played.length, questionsTotal: room.questions.length,
    classAccuracy: pct(correctAll, answeredAll), progress: pct(played.length, room.questions.length) ?? 0,
    questions, difficult: difficult.map(q => q.index), teams, players, finishedAt: room.finishedAt || Date.now()
  };
}
const TIME_LIMITS = [0, 10, 20, 30, 60];
function revealRoom(room) {
  clearTimeout(room.timer); room.timer = null; room.endsAt = null;
  room.stage = 'reveal';
  io.to(room.code).emit('question:reveal', { answer: room.questions[room.activeQuestion].answer });
  broadcast(room);
}
// Teacher Studio is protected: a valid Clerk session is required. Without Clerk the studio stays closed unless
// ALLOW_ANONYMOUS_TEACHER=true is set explicitly (local development only).
async function authenticateTeacher(token) {
  if (integrations.verify) {
    const profile = await integrations.verify(token);
    if (!profile) return { error: 'unauthorized' };
    return { profile, user: integrations.pool ? await DB.upsertUser(integrations.pool, profile) : null };
  }
  if (process.env.ALLOW_ANONYMOUS_TEACHER === 'true') return { user: null };
  return { error: 'authNotConfigured' };
}
// Persists only nicknames and scores of a finished quiz session.
function saveResults(room) {
  if (!integrations.pool || !room.sessionId || room.resultsSaved) return;
  room.resultsSaved = true;
  const players = resultsFor(room).players.map(p => ({ nickname: p.name, avatar: p.avatar, score: p.points, correct: p.correct, answered: p.answered }));
  DB.finishSession(integrations.pool, room.sessionId, players).catch(err => console.error('finishSession failed:', err.message));
}
function ackReply(ack, result) { if (typeof ack === 'function') ack(result); }
function roomFor(socket) { const room = rooms.get(socket.data.code); return room && (room.teacherId === socket.id || room.students.has(socket.id)) ? room : null; }
function isTeacher(socket, room) { return room && room.teacherId === socket.id; }
function rejectIfEnded(room, ack) {
  if (room?.stage !== 'finished') return false;
  ackReply(ack, { ok: false, error: 'gameEnded' });
  return true;
}
function resetAnswers(room) { room.answers.clear(); for (const s of room.students.values()) s.answered = false; }

io.on('connection', socket => {
  socket.on('teacher:create', async (data, ack) => {
    let teacher, saved = null;
    try {
      teacher = await authenticateTeacher(data?.token);
      if (teacher.error) return ackReply(ack, { ok: false, error: teacher.error });
      if (data?.dbGameId) {
        if (!integrations.pool) return ackReply(ack, { ok: false, error: 'dbNotConfigured' });
        const game = await DB.getGame(integrations.pool, String(data.dbGameId));
        if (!game || !DB.canView(game, teacher.user?.id)) return ackReply(ack, { ok: false, error: 'notFound' });
        const rows = await DB.getQuestions(integrations.pool, game.id, { withAnswers: true });
        if (!rows.length) return ackReply(ack, { ok: false, error: 'gameEmpty' });
        saved = { game, questions: rows.map(q => ({ q: q.prompt, options: q.options, answer: q.correctIndex })) };
      }
    } catch (err) {
      console.error('teacher:create failed:', err.message);
      return ackReply(ack, { ok: false, error: 'serverError' });
    }
    const previousRoom = rooms.get(socket.data.code);
    if (previousRoom && previousRoom.teacherId === socket.id) {
      previousRoom.teacherId = null;
      socket.leave(previousRoom.code);
      broadcast(previousRoom);
    }
    let code = codeGen(); while (rooms.has(code)) code = codeGen();
    const gameId = saved ? '' : clean(data?.gameId, 24);
    const questions = saved ? saved.questions : gamePacks[gameId] || starter;
    const title = clean(data?.title, 70) || saved?.game.title || 'Space Mission';
    const room = { code, gameId, dbGameId: saved?.game.id || null, hostUserId: teacher.user?.id || null, sessionId: null, touched: Date.now(), played: new Set(), finishedAt: null, title, world: clean(data?.world, 30) || 'space', contentLanguage: saved?.game.language || 'en', timeLimit: 20, endsAt: null, timer: null, teacherId: socket.id, teacherToken: crypto.randomUUID(), students: new Map(), questions: questions.map(q => ({ ...q, options: [...q.options] })), activeQuestion: -1, answers: new Map(), proposals: [], surprise: null, stage: 'lobby', storyChoice: null, storyVotes: new Map() };
    rooms.set(code, room); socket.data.code = code; socket.data.role = 'teacher'; socket.join(code);
    if (integrations.pool && room.hostUserId && data?.mode !== 'adventure') {
      DB.recordSession(integrations.pool, { gameId: room.dbGameId, builtinKey: room.gameId || null, hostId: room.hostUserId, roomCode: code })
        .then(id => { room.sessionId = id; }).catch(err => console.error('recordSession failed:', err.message));
    }
    if (data?.mode === 'adventure') {
      const world = A.WORLDS[clean(data?.world, 20)] ? clean(data.world, 20) : 'space';
      room.adv = A.createAdventure(world, clean(data?.subject, 20)); room.world = world; room.questions = []; room.timeLimit = 30; room.title = clean(data?.title, 70) || 'Space Mission';
    }
    ackReply(ack, { ok: true, code, teacherToken: room.teacherToken }); broadcast(room);
  });
  socket.on('teacher:resume', ({ code, token }, ack) => {
    const room = rooms.get(clean(code, 6).toUpperCase());
    if (!room || room.teacherToken !== token) return ackReply(ack, { ok: false, error: 'teacherSessionInvalid' });
    room.teacherId = socket.id; socket.data.code = room.code; socket.data.role = 'teacher'; socket.join(room.code);
    ackReply(ack, { ok: true, code: room.code }); broadcast(room);
  });
  socket.on('student:join', (data, ack) => {
    if (tooManyAttempts(socket)) return ackReply(ack, { ok: false, error: 'tooManyAttempts' });
    const code = clean(data?.code, 6).toUpperCase(); const room = rooms.get(code);
    if (!room) return ackReply(ack, { ok: false, error: 'roomNotFound' });
    if (room.stage === 'finished') return ackReply(ack, { ok: false, error: 'gameEnded' });
    if (room.students.size >= MAX_STUDENTS) return ackReply(ack, { ok: false, error: 'roomFull' });
    const name = clean(data?.name, 24);
    if (!name) return ackReply(ack, { ok: false, error: 'nicknameRequired' });
    const avatar = ['🚀','🪐','⭐','👾','🌙','☄️','🦊','🐙'].includes(data?.avatar) ? data.avatar : '🚀';
    const token = crypto.randomUUID();
    room.students.set(socket.id, { id: socket.id, token, name, avatar, points: 0, answered: false, connected: true, log: [], stats: A.newStats(), team: pickTeam(room) });
    socket.data.code = code; socket.data.role = 'student'; socket.join(code);
    ackReply(ack, { ok: true, code, id: socket.id, token }); broadcast(room);
  });
  socket.on('student:rejoin', (data, ack) => {
    const room = rooms.get(clean(data?.code, 6).toUpperCase());
    const student = room && [...room.students.values()].find(s => s.token && s.token === data?.token);
    if (!student) return ackReply(ack, { ok: false, error: 'roomNotFound' });
    const oldId = student.id;
    room.students.delete(oldId); student.id = socket.id; student.connected = true; room.students.set(socket.id, student);
    if (room.answers.has(oldId)) { room.answers.set(socket.id, room.answers.get(oldId)); room.answers.delete(oldId); }
    if (room.storyVotes.has(oldId)) { room.storyVotes.set(socket.id, room.storyVotes.get(oldId)); room.storyVotes.delete(oldId); }
    for (const p of room.proposals) if (p.socketId === oldId) p.socketId = socket.id;
    socket.data.code = room.code; socket.data.role = 'student'; socket.join(room.code);
    ackReply(ack, { ok: true, code: room.code, id: socket.id }); broadcast(room);
  });
  socket.on('teacher:kick', (id, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (!room.students.has(id)) return ackReply(ack, { ok: false, error: 'invalidAction' });
    room.students.delete(id); room.answers.delete(id); room.storyVotes.delete(id);
    room.proposals = room.proposals.filter(p => p.socketId !== id);
    io.to(id).emit('kicked'); io.in(id).socketsLeave(room.code);
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:reject', (id, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    const before = room.proposals.length; room.proposals = room.proposals.filter(p => p.id !== id);
    if (room.proposals.length === before) return ackReply(ack, { ok: false, error: 'invalidAction' });
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:addQuestion', (data, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (rejectIfEnded(room, ack)) return;
    const q = clean(data?.q, 240), options = Array.isArray(data?.options) ? data.options.map(o => clean(o, 90)).slice(0, 4) : [];
    const answer = Number(data?.answer);
    if (!q || options.length !== 4 || options.some(o => !o) || !Number.isInteger(answer) || answer < 0 || answer > 3) return ackReply(ack, { ok: false, error: 'questionFieldsRequired' });
    if (room.questions.length >= 30) return ackReply(ack, { ok: false, error: 'questionLimit' });
    room.questions.push({ q, options, answer }); ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:launch', (index, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (rejectIfEnded(room, ack)) return;
    const n = Number(index); if (!Number.isInteger(n) || n < 0 || n >= room.questions.length) return ackReply(ack, { ok: false, error: 'invalidQuestion' });
    room.activeQuestion = n; room.stage = 'question'; room.surprise = null; room.storyChoice = null; room.storyVotes.clear(); resetAnswers(room);
    room.played.add(n); room.questionStartedAt = Date.now();
    for (const s of room.students.values()) s.log = s.log.filter(x => x.index !== n);
        clearTimeout(room.timer); room.timer = null; room.endsAt = null;
        if (room.timeLimit > 0) { room.endsAt = Date.now() + room.timeLimit * 1000; room.timer = setTimeout(() => { if (room.stage === 'question') revealRoom(room); }, room.timeLimit * 1000); }
        ackReply(ack, { ok: true }); broadcast(room);
      });
      socket.on('teacher:setTimer', (seconds, ack) => {
        const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
        const n = Number(seconds); if (!TIME_LIMITS.includes(n)) return ackReply(ack, { ok: false, error: 'invalidAction' });
        room.timeLimit = n; ackReply(ack, { ok: true }); broadcast(room);
      });
      socket.on('projector:join', (data, ack) => {
        const room = rooms.get(clean(data?.code, 6).toUpperCase());
        if (!room) return ackReply(ack, { ok: false, error: 'roomNotFound' });
        socket.data.code = room.code; socket.data.role = 'projector'; socket.join(room.code);
        ackReply(ack, { ok: true, code: room.code }); broadcast(room);
      });
  socket.on('student:answer', (option, ack) => {
    const room = roomFor(socket); const student = room?.students.get(socket.id);
    if (!student || room.stage !== 'question' || room.activeQuestion < 0) return ackReply(ack, { ok: false, error: 'noActiveQuestion' });
    if (room.answers.has(socket.id)) return ackReply(ack, { ok: false, error: 'alreadyAnswered' });
    const n = Number(option); if (!Number.isInteger(n) || n < 0 || n > 3) return ackReply(ack, { ok: false, error: 'invalidAnswer' });
    const correct = n === room.questions[room.activeQuestion].answer;
    const ms = room.questionStartedAt ? Date.now() - room.questionStartedAt : 0;
    room.answers.set(socket.id, n); student.answered = true; if (correct) student.points += 100;
    student.log.push({ index: room.activeQuestion, correct, ms });
    ackReply(ack, { ok: true, correct, points: correct ? 100 : 0 }); broadcast(room);
  });
  socket.on('teacher:reveal', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (room.adv) return ackReply(ack, { ok: false, error: 'invalidAction' });
    if (rejectIfEnded(room, ack)) return;
    if (room.activeQuestion < 0 || room.stage !== 'question') return ackReply(ack, { ok: false, error: 'noActiveQuestion' });
    revealRoom(room); ackReply(ack, { ok: true });
  });
  socket.on('teacher:surprise', (kind, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (room.adv) return ackReply(ack, { ok: false, error: 'invalidAction' });
    if (room.stage === 'lobby') return ackReply(ack, { ok: false, error: 'startGameFirst' });
    if (rejectIfEnded(room, ack)) return;
    const allowed = ['meteor','bonus','dance']; if (!allowed.includes(kind)) return ackReply(ack, { ok: false, error: 'invalidAction' });
    room.surprise = { kind, at: Date.now() }; io.to(room.code).emit('surprise', room.surprise); ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('student:propose', (data, ack) => {
    const room = roomFor(socket); const student = room?.students.get(socket.id);
    if (!student) return ackReply(ack, { ok: false, error: 'notInRoom' });
    if (rejectIfEnded(room, ack)) return;
    const q = clean(data?.q, 180), options = Array.isArray(data?.options) ? data.options.map(o => clean(o, 70)).slice(0, 4) : [], answer = Number(data?.answer);
    if (!q || options.length !== 4 || options.some(o => !o) || !Number.isInteger(answer) || answer < 0 || answer > 3) return ackReply(ack, { ok: false, error: 'questionFieldsRequired' });
    if (room.proposals.filter(p => p.socketId === socket.id).length >= 2) return ackReply(ack, { ok: false, error: 'proposalLimit' });
    room.proposals.push({ id: crypto.randomUUID(), socketId: socket.id, by: student.name, q, options, answer });
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:approve', (id, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (rejectIfEnded(room, ack)) return;
    const idx = room.proposals.findIndex(p => p.id === id); if (idx < 0) return ackReply(ack, { ok: false, error: 'invalidAction' });
    if (room.adv) {
      const added = A.addApprovedQuestion(room, room.proposals[idx]);
      if (!added.ok) return ackReply(ack, added);
      room.proposals.splice(idx, 1); return ackReply(ack, { ok: true }), broadcast(room);
    }
    if (room.questions.length >= 30) return ackReply(ack, { ok: false, error: 'questionLimit' });
    const [p] = room.proposals.splice(idx, 1); room.questions.push({ q: p.q, options: p.options, answer: p.answer });
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:story', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (room.adv) return ackReply(ack, { ok: false, error: 'invalidAction' });
    if (room.stage === 'lobby') return ackReply(ack, { ok: false, error: 'startGameFirst' });
    if (rejectIfEnded(room, ack)) return;
    room.stage = 'story'; room.storyChoice = null; room.storyVotes.clear(); room.surprise = null;
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('student:vote', (choice, ack) => {
    const room = roomFor(socket); if (!room?.students.has(socket.id)) return ackReply(ack, { ok: false, error: 'notInRoom' });
    if (room.stage !== 'story' || !['door','bridge'].includes(choice)) return ackReply(ack, { ok: false, error: 'invalidAction' });
    room.storyVotes.set(socket.id, choice); ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:storyReveal', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (room.stage !== 'story') return ackReply(ack, { ok: false, error: 'invalidAction' });
    const votes = [...room.storyVotes.values()]; room.storyChoice = votes.filter(v => v === 'door').length >= votes.filter(v => v === 'bridge').length ? 'door' : 'bridge';
    room.stage = 'storyResult'; ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:finish', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'teacherOnly' });
    if (room.stage === 'lobby') return ackReply(ack, { ok: false, error: 'startGameFirst' });
    if (rejectIfEnded(room, ack)) return;
    clearTimeout(room.timer); room.timer = null; room.endsAt = null;
    if (room.adv) { A.finishAdventure(room); return ackReply(ack, { ok: true }), broadcast(room); }
    room.stage = 'finished'; room.activeQuestion = -1; room.finishedAt = Date.now(); ackReply(ack, { ok: true }); broadcast(room);
    saveResults(room);
  });
  socket.on('disconnect', () => {
    const room = rooms.get(socket.data.code); if (!room) return;
    if (room.teacherId === socket.id) room.teacherId = null;
    const me = room.students.get(socket.id);
    // In the lobby leaving removes the player; during a game the seat is kept for a reconnect.
    if (me && (room.stage === 'lobby' || room.stage === 'finished')) { room.students.delete(socket.id); room.answers.delete(socket.id); room.storyVotes.delete(socket.id); }
    else if (me) me.connected = false;
    broadcast(room);
  });
});
const PORT = process.env.PORT || 3000;
app.use('/api', (_req, res) => res.status(404).json({ error: 'notFound' }));
app.use((_req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));
if (require.main === module) {
  bootstrapIntegrations().finally(() => server.listen(PORT, () => console.log(`CLASSVERSE running on http://localhost:${PORT}`)));
  const stop = () => { io.close(); server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 3000).unref(); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}
module.exports = { server, io, rooms, configure, bootstrapIntegrations };
