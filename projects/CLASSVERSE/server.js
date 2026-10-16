const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
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
function broadcast(room) {
  io.to(room.code).emit('room:state', {
    code: room.code, title: room.title, world: room.world, stage: room.stage,
    questions: room.questions.map((q, i) => ({ index: i, q: q.q, options: q.options })),
    students: [...room.students.values()].map(s => ({ id: s.id, name: s.name, avatar: s.avatar, points: s.points, answered: s.answered })),
    activeQuestion: room.activeQuestion,
    answersCount: room.answers.size,
    proposals: room.proposals.map(p => ({ id: p.id, by: p.by, q: p.q, options: p.options })),
    surprise: room.surprise, storyChoice: room.storyChoice, storyVotes: Object.fromEntries(room.storyVotes),
    teacherConnected: Boolean(room.teacherId)
  });
}
function ackReply(ack, result) { if (typeof ack === 'function') ack(result); }
function roomFor(socket) { const room = rooms.get(socket.data.code); return room && (room.teacherId === socket.id || room.students.has(socket.id)) ? room : null; }
function isTeacher(socket, room) { return room && room.teacherId === socket.id; }
function resetAnswers(room) { room.answers.clear(); for (const s of room.students.values()) s.answered = false; }

io.on('connection', socket => {
  socket.on('teacher:create', (data, ack) => {
    let code = codeGen(); while (rooms.has(code)) code = codeGen();
    const title = clean(data?.title, 70) || 'Space Mission';
    const room = { code, title, world: clean(data?.world, 30) || 'space', teacherId: socket.id, teacherToken: crypto.randomUUID(), students: new Map(), questions: starter.map(q => ({ ...q })), activeQuestion: -1, answers: new Map(), proposals: [], surprise: null, stage: 'lobby', storyChoice: null, storyVotes: new Map() };
    rooms.set(code, room); socket.data.code = code; socket.data.role = 'teacher'; socket.join(code);
    ackReply(ack, { ok: true, code, teacherToken: room.teacherToken }); broadcast(room);
  });
  socket.on('teacher:resume', ({ code, token }, ack) => {
    const room = rooms.get(clean(code, 6).toUpperCase());
    if (!room || room.teacherToken !== token) return ackReply(ack, { ok: false, error: 'Room not found or invalid teacher token' });
    room.teacherId = socket.id; socket.data.code = room.code; socket.data.role = 'teacher'; socket.join(room.code);
    ackReply(ack, { ok: true, code: room.code }); broadcast(room);
  });
  socket.on('student:join', (data, ack) => {
    const code = clean(data?.code, 6).toUpperCase(); const room = rooms.get(code);
    if (!room) return ackReply(ack, { ok: false, error: 'Room not found' });
    if (room.students.size >= MAX_STUDENTS) return ackReply(ack, { ok: false, error: 'Room is full' });
    const name = clean(data?.name, 24);
    if (!name) return ackReply(ack, { ok: false, error: 'Enter a nickname' });
    const avatar = ['🚀','🪐','⭐','👾','🌙','☄️','🦊','🐙'].includes(data?.avatar) ? data.avatar : '🚀';
    room.students.set(socket.id, { id: socket.id, name, avatar, points: 0, answered: false });
    socket.data.code = code; socket.data.role = 'student'; socket.join(code);
    ackReply(ack, { ok: true, code, id: socket.id }); broadcast(room);
  });
  socket.on('teacher:addQuestion', (data, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false, error: 'Teacher only' });
    const q = clean(data?.q, 240), options = Array.isArray(data?.options) ? data.options.map(o => clean(o, 90)).slice(0, 4) : [];
    const answer = Number(data?.answer);
    if (!q || options.length !== 4 || options.some(o => !o) || !Number.isInteger(answer) || answer < 0 || answer > 3) return ackReply(ack, { ok: false, error: 'Complete all fields' });
    if (room.questions.length >= 30) return ackReply(ack, { ok: false, error: 'Maximum 30 questions' });
    room.questions.push({ q, options, answer }); ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:launch', (index, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false });
    const n = Number(index); if (!Number.isInteger(n) || n < 0 || n >= room.questions.length) return ackReply(ack, { ok: false, error: 'Invalid question' });
    room.activeQuestion = n; room.stage = 'question'; room.surprise = null; room.storyChoice = null; room.storyVotes.clear(); resetAnswers(room);
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('student:answer', (option, ack) => {
    const room = roomFor(socket); const student = room?.students.get(socket.id);
    if (!student || room.stage !== 'question' || room.activeQuestion < 0) return ackReply(ack, { ok: false, error: 'No active question' });
    if (room.answers.has(socket.id)) return ackReply(ack, { ok: false, error: 'Already answered' });
    const n = Number(option); if (!Number.isInteger(n) || n < 0 || n > 3) return ackReply(ack, { ok: false });
    const correct = n === room.questions[room.activeQuestion].answer;
    room.answers.set(socket.id, n); student.answered = true; if (correct) student.points += 100;
    ackReply(ack, { ok: true, correct, points: correct ? 100 : 0 }); broadcast(room);
  });
  socket.on('teacher:reveal', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room) || room.activeQuestion < 0) return ackReply(ack, { ok: false });
    room.stage = 'reveal'; io.to(room.code).emit('question:reveal', { answer: room.questions[room.activeQuestion].answer });
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:surprise', (kind, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false });
    const allowed = ['meteor','bonus','dance']; if (!allowed.includes(kind)) return ackReply(ack, { ok: false });
    room.surprise = { kind, at: Date.now() }; io.to(room.code).emit('surprise', room.surprise); ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('student:propose', (data, ack) => {
    const room = roomFor(socket); const student = room?.students.get(socket.id);
    if (!student) return ackReply(ack, { ok: false });
    const q = clean(data?.q, 180), options = Array.isArray(data?.options) ? data.options.map(o => clean(o, 70)).slice(0, 4) : [], answer = Number(data?.answer);
    if (!q || options.length !== 4 || options.some(o => !o) || !Number.isInteger(answer) || answer < 0 || answer > 3) return ackReply(ack, { ok: false, error: 'Fill all four answers' });
    if (room.proposals.filter(p => p.socketId === socket.id).length >= 2) return ackReply(ack, { ok: false, error: 'Two proposals per student' });
    room.proposals.push({ id: crypto.randomUUID(), socketId: socket.id, by: student.name, q, options, answer });
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:approve', (id, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false });
    const idx = room.proposals.findIndex(p => p.id === id); if (idx < 0) return ackReply(ack, { ok: false });
    const [p] = room.proposals.splice(idx, 1); room.questions.push({ q: p.q, options: p.options, answer: p.answer });
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:story', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false });
    room.stage = 'story'; room.storyChoice = null; room.storyVotes.clear(); room.surprise = null;
    ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('student:vote', (choice, ack) => {
    const room = roomFor(socket); if (!room?.students.has(socket.id) || room.stage !== 'story' || !['door','bridge'].includes(choice)) return ackReply(ack, { ok: false });
    room.storyVotes.set(socket.id, choice); ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:storyReveal', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false });
    const votes = [...room.storyVotes.values()]; room.storyChoice = votes.filter(v => v === 'door').length >= votes.filter(v => v === 'bridge').length ? 'door' : 'bridge';
    room.stage = 'storyResult'; ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('teacher:finish', (_, ack) => {
    const room = roomFor(socket); if (!isTeacher(socket, room)) return ackReply(ack, { ok: false });
    room.stage = 'finished'; room.activeQuestion = -1; ackReply(ack, { ok: true }); broadcast(room);
  });
  socket.on('disconnect', () => {
    const room = rooms.get(socket.data.code); if (!room) return;
    if (room.teacherId === socket.id) room.teacherId = null;
    if (room.students.has(socket.id)) { room.students.delete(socket.id); room.answers.delete(socket.id); room.storyVotes.delete(socket.id); }
    broadcast(room);
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CLASSVERSE running on http://localhost:${PORT}`));
