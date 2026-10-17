const test = require('node:test');
process.env.ALLOW_ANONYMOUS_TEACHER = 'true'; // these tests exercise the classroom flow, not accounts (see accounts.test.js)
const assert = require('node:assert/strict');
const { io: connect } = require('socket.io-client');
const { server, rooms, io } = require('../server');
const A = require('../adventure');

let url;
test.before(async () => { await new Promise(r => server.listen(0, r)); url = `http://localhost:${server.address().port}`; });
test.after(async () => { for (const r of rooms.values()) clearTimeout(r.timer); await new Promise(r => io.close(r)); });

const client = () => new Promise(res => { const s = connect(url, { transports: ['websocket'], forceNew: true }); s.on('connect', () => res(s)); });
const call = (s, ev, data) => new Promise(r => s.emit(ev, data, r));
const nextState = (s, pred = () => true) => new Promise(r => { const h = st => { if (pred(st)) { s.off('room:state', h); r(st); } }; s.on('room:state', h); });

test('quiz flow: join, answer, reveal, results, moderation, reconnect, privacy', async () => {
  const teacher = await client(), s1 = await client(), s2 = await client(), pj = await client();
  const created = await call(teacher, 'teacher:create', { gameId: 'math', title: 'Math' });
  assert.ok(created.ok); const code = created.code;

  assert.equal((await call(s1, 'student:join', { code: 'ZZZZZZ', name: 'x' })).error, 'roomNotFound');
  assert.equal((await call(s1, 'student:join', { code, name: '' })).error, 'nicknameRequired');
  const j1 = await call(s1, 'student:join', { code, name: 'Dana' }), j2 = await call(s2, 'student:join', { code, name: 'Omar' });
  assert.ok(j1.ok && j2.ok && j1.token);
  assert.ok((await call(pj, 'projector:join', { code })).ok);

  // Unapproved proposals reach only the teacher.
  const seenByStudent = nextState(s2, st => st.proposals !== undefined);
  const teacherSees = nextState(teacher, st => st.proposals.length === 1);
  assert.ok((await call(s1, 'student:propose', { q: 'Idea?', options: ['a', 'b', 'c', 'd'], answer: 1 })).ok);
  assert.equal((await seenByStudent).proposals.length, 0);
  const prop = (await teacherSees).proposals[0];
  assert.ok((await call(s1, 'teacher:approve', prop.id)).error === 'teacherOnly');
  assert.ok((await call(teacher, 'teacher:approve', prop.id)).ok);

  // No answer or upcoming question leakage to students before reveal.
  const live = nextState(s1, st => st.stage === 'question');
  assert.ok((await call(teacher, 'teacher:launch', 0)).ok);
  const st = await live;
  assert.equal(st.revealAnswer, null);
  assert.equal(st.questions[1].q, '');
  assert.equal(st.questions[0].options.length, 4);

  const right = 2; // 8 x 7 = 56
  assert.ok((await call(s1, 'student:answer', right)).correct);
  assert.equal((await call(s1, 'student:answer', right)).error, 'alreadyAnswered');
  assert.equal((await call(s1, 'student:answer', 9)).error, 'alreadyAnswered');
  assert.equal((await call(s2, 'student:answer', 0)).correct, false);

  // Reconnect keeps the student's seat and score.
  s2.disconnect();
  const s2b = await client();
  const rejoin = await call(s2b, 'student:rejoin', { code, token: j2.token });
  assert.ok(rejoin.ok && rejoin.id !== j2.id);
  assert.equal((await call(s2b, 'student:rejoin', { code, token: 'bad' })).ok, false);

  assert.ok((await call(teacher, 'teacher:reveal')).ok);
  assert.equal((await call(s1, 'teacher:finish')).error, 'teacherOnly');
  const finalTeacher = nextState(teacher, x => x.stage === 'finished');
  const finalStudent = nextState(s1, x => x.stage === 'finished');
  assert.ok((await call(teacher, 'teacher:finish')).ok);
  const res = (await finalTeacher).results;
  assert.equal(res.participants, 2);
  assert.equal(res.questionsPlayed, 1);
  assert.equal(res.questions[0].accuracy, 50);
  assert.deepEqual(res.difficult, [0]);
  assert.equal(res.teams.length, 3);
  const dana = res.players.find(p => p.name === 'Dana');
  assert.equal(dana.rank, 1); assert.ok(dana.badges.includes('perfect'));
  assert.equal((await finalStudent).results.players.length, 2);
  assert.equal((await call(s1, 'student:join', { code, name: 'Late' })).error, 'gameEnded');
  [teacher, s1, s2b, pj].forEach(s => s.disconnect());
});

test('teacher can remove a student and reject proposals', async () => {
  const teacher = await client(), s = await client();
  const { code } = await call(teacher, 'teacher:create', { gameId: 'space' });
  const j = await call(s, 'student:join', { code, name: 'Kid' });
  assert.equal((await call(s, 'teacher:kick', j.id)).error, 'teacherOnly');
  const kicked = new Promise(r => s.on('kicked', r));
  assert.ok((await call(teacher, 'teacher:kick', j.id)).ok);
  await kicked;
  assert.equal(rooms.get(code).students.size, 0);
  teacher.disconnect(); s.disconnect();
});

test('HTTP: security headers, health, QR validation and 404s', async () => {
  const health = await fetch(`${url}/health`); assert.equal(health.status, 200);
  assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
  assert.match(health.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal((await fetch(`${url}/api/qr?code=NOPE`)).status, 404);
  assert.equal((await fetch(`${url}/api/unknown`)).status, 404);
  assert.equal((await fetch(`${url}/projector`)).status, 200);
});

test('adventure engine grades every challenge kind server-side', () => {
  const spec = raw => { const r = A.validateSpec(raw); assert.ok(r.ok, raw.prompt); return r.spec; };
  assert.equal(A.grade(spec({ type: 'equation', prompt: 'x', answer: 5 }), '5').score, 1);
  assert.equal(A.grade(spec({ type: 'equation', prompt: 'x', answer: 5 }), 'abc').ok, false);
  assert.equal(A.grade(spec({ type: 'spelling', prompt: 'x', answers: ['Gravity'] }), ' gravity ').score, 1);
  const order = spec({ type: 'timeline', prompt: 'x', items: ['a', 'b', 'c', 'd'] });
  assert.equal(A.grade(order, [0, 1, 2, 3]).score, 1);
  assert.equal(A.grade(order, [1, 0, 2, 3]).score, 0.5);
  assert.equal(A.grade(order, [0, 0, 2, 3]).ok, false);
  const match = spec({ type: 'wordMatch', prompt: 'x', pairs: [['a', '1'], ['b', '2']] });
  assert.equal(A.grade(match, [[0, 0], [1, 1]]).score, 1);
  assert.equal(A.grade(match, [[0, 1], [1, 0]]).score, 0);
  const cls = spec({ type: 'classification', prompt: 'x', categories: ['p', 'q'], items: [['a', 0], ['b', 1]] });
  assert.equal(A.grade(cls, [[0, 0], [1, 1]]).score, 1);
  assert.equal(A.validateSpec({ type: 'quiz', prompt: 'x', options: ['a', 'b'], answer: 0 }).ok, false);
  for (const pack of Object.values(A.PACKS)) assert.equal(pack.length, 9);
});
