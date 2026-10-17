const test = require('node:test');
const assert = require('node:assert/strict');
const { newDb } = require('pg-mem');
const { io: connect } = require('socket.io-client');
const { server, rooms, io, configure } = require('../server');
const DB = require('../db');

/* No real Clerk or Neon is contacted: tokens are fake strings handled by an injected verifier,
   and the database is an in-memory PostgreSQL emulation. */
const PEOPLE = {
  'tok-alice': { clerkId: 'user_alice', email: 'alice@example.test', name: 'Alice Teacher', imageUrl: null },
  'tok-bob': { clerkId: 'user_bob', email: 'bob@example.test', name: 'Bob Teacher', imageUrl: null }
};
const verify = async token => PEOPLE[token] || null;

let url, pool;
test.before(async () => {
  pool = new (newDb().adapters.createPg().Pool)();
  await DB.init(pool);
  configure({ pool, verify, publishableKey: null, clerkHost: null });
  await new Promise(r => server.listen(0, r));
  url = `http://localhost:${server.address().port}`;
});
test.after(async () => { for (const r of rooms.values()) clearTimeout(r.timer); await new Promise(r => io.close(r)); });

const api = async (path, { token, method = 'GET', body } = {}) => {
  const res = await fetch(`${url}/api${path}`, { method, headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json() };
};
const quiz = (over = {}) => ({ title: 'Fractions', description: 'Halves and quarters', subjectId: 'math', difficulty: 'easy', language: 'en', questions: [{ prompt: '1/2 + 1/2 = ?', options: ['1', '2', '1/4', '0'], correctIndex: 0 }, { prompt: '1/4 of 8?', options: ['1', '2', '4', '8'], correctIndex: 1 }], ...over });
const client = () => new Promise(res => { const s = connect(url, { transports: ['websocket'], forceNew: true }); s.on('connect', () => res(s)); });
const call = (s, ev, data) => new Promise(r => s.emit(ev, data, r));

test('authentication: protected endpoints reject missing and invalid tokens', async () => {
  assert.deepEqual((await api('/config')).body, { auth: true, database: true, anonymousTeacher: false, clerkPublishableKey: null, clerkHost: null });
  for (const path of ['/me', '/games/mine', '/favorites', '/sessions']) {
    assert.equal((await api(path)).status, 401, path);
    assert.equal((await api(path, { token: 'forged' })).status, 401, path);
  }
  assert.equal((await api('/games', { method: 'POST', body: quiz() })).status, 401);
  const me = await api('/me', { token: 'tok-alice' });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'alice@example.test');
  assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n >= 1, true);
  assert.equal(me.body.user.clerk_id, undefined); // internal identifiers are not exposed
});

test('games: owner CRUD, drafts vs published, validation and persistence', async () => {
  assert.equal((await api('/games', { token: 'tok-alice', method: 'POST', body: { title: '' } })).status, 400);
  assert.equal((await api('/games', { token: 'tok-alice', method: 'POST', body: quiz({ subjectId: 'nope' }) })).body.error, 'subjectInvalid');
  assert.equal((await api('/games', { token: 'tok-alice', method: 'POST', body: quiz({ questions: [{ prompt: 'x', options: ['a', 'a'], correctIndex: 0 }] }) })).body.error, 'questionInvalid');
  assert.equal((await api('/games', { token: 'tok-alice', method: 'POST', body: quiz({ status: 'published', questions: [] }) })).body.error, 'publishNeedsQuestions');

  const created = await api('/games', { token: 'tok-alice', method: 'POST', body: quiz() });
  assert.equal(created.status, 201);
  const id = created.body.id;

  const mine = await api('/games/mine', { token: 'tok-alice' });
  assert.equal(mine.body.games.length, 1);
  assert.equal(mine.body.games[0].status, 'draft');
  assert.equal(mine.body.games[0].visibility, 'private'); // private by default
  assert.equal(mine.body.games[0].isOwner, true);
  assert.equal((await api('/games/mine?status=draft', { token: 'tok-alice' })).body.games.length, 1);
  assert.equal((await api('/games/mine?status=published', { token: 'tok-alice' })).body.games.length, 0);

  const upd = await api(`/games/${id}`, { token: 'tok-alice', method: 'PUT', body: quiz({ title: 'Fractions 2', questions: [{ prompt: 'Only one', options: ['a', 'b'], correctIndex: 1 }] }) });
  assert.equal(upd.status, 200);
  const read = await api(`/games/${id}`, { token: 'tok-alice' });
  assert.equal(read.body.game.title, 'Fractions 2');
  assert.equal(read.body.questions.length, 1);
  assert.equal(read.body.questions[0].correctIndex, 1); // the owner sees answers

  assert.equal((await api(`/games/${id}/visibility`, { token: 'tok-alice', method: 'PATCH', body: { visibility: 'galaxy' } })).status, 400);
  const pub = await api(`/games/${id}/visibility`, { token: 'tok-alice', method: 'PATCH', body: { visibility: 'public', status: 'published' } });
  assert.deepEqual([pub.body.visibility, pub.body.status], ['public', 'published']);
  assert.equal((await api('/games/mine?status=published', { token: 'tok-alice' })).body.games.length, 1);

  // Persistence: a fresh API instance on the same database still serves the data.
  configure({ pool, verify });
  assert.equal((await api('/games/mine', { token: 'tok-alice' })).body.games[0].title, 'Fractions 2');
  assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM questions')).rows[0].n, 1);
});

test('authorization: visibility rules and owner-only edit/delete', async () => {
  const make = async (visibility, status) => (await api('/games', { token: 'tok-alice', method: 'POST', body: quiz({ title: `${visibility}-${status}`, visibility, status }) })).body.id;
  const priv = await make('private', 'published'), unl = await make('unlisted', 'published'), pubd = await make('public', 'published'), draftPublic = await make('public', 'draft');

  // Private: only the owner.
  assert.equal((await api(`/games/${priv}`)).status, 404);
  assert.equal((await api(`/games/${priv}`, { token: 'tok-bob' })).status, 404);
  assert.equal((await api(`/games/${priv}`, { token: 'tok-alice' })).status, 200);
  // Unlisted: reachable by link (anyone), but not discoverable.
  const link = await api(`/games/${unl}`);
  assert.equal(link.status, 200);
  assert.equal(link.body.questions[0].correctIndex, undefined); // answers are never sent to non-owners
  const listed = (await api('/games/public')).body.games.map(g => g.title);
  assert.ok(listed.includes('public-published'));
  assert.ok(!listed.includes('unlisted-published') && !listed.includes('private-published') && !listed.includes('public-draft'));
  // A public game that is still a draft is not visible to others.
  assert.equal((await api(`/games/${draftPublic}`, { token: 'tok-bob' })).status, 404);
  // Malformed ids are not found rather than causing server errors.
  assert.equal((await api('/games/not-a-uuid')).status, 404);

  // Only the owner edits or deletes.
  for (const id of [unl, pubd]) {
    assert.equal((await api(`/games/${id}`, { token: 'tok-bob', method: 'PUT', body: quiz({ title: 'hijack' }) })).status, 403);
    assert.equal((await api(`/games/${id}`, { token: 'tok-bob', method: 'DELETE' })).status, 403);
    assert.equal((await api(`/games/${id}/visibility`, { token: 'tok-bob', method: 'PATCH', body: { visibility: 'private' } })).status, 403);
    assert.equal((await api(`/games/${id}`, { method: 'DELETE' })).status, 401);
  }
  assert.equal((await api(`/games/${priv}`, { token: 'tok-bob', method: 'DELETE' })).status, 404);
  assert.equal((await api(`/games/${pubd}`)).body.game.title, 'public-published');

  // Favorites: add, list, remove; hidden games cannot be favorited.
  assert.equal((await api(`/games/${priv}/favorite`, { token: 'tok-bob', method: 'PUT' })).status, 404);
  assert.equal((await api(`/games/${pubd}/favorite`, { token: 'tok-bob', method: 'PUT' })).status, 200);
  assert.deepEqual((await api('/favorites', { token: 'tok-bob' })).body.games.map(g => g.id), [pubd]);
  assert.equal((await api(`/games/${pubd}`, { token: 'tok-bob' })).body.favorite, true);
  // If the owner hides the game again, it vanishes from other people's favorites.
  await api(`/games/${pubd}/visibility`, { token: 'tok-alice', method: 'PATCH', body: { visibility: 'private' } });
  assert.equal((await api('/favorites', { token: 'tok-bob' })).body.games.length, 0);
  await api(`/games/${pubd}/visibility`, { token: 'tok-alice', method: 'PATCH', body: { visibility: 'public' } });
  assert.equal((await api(`/games/${pubd}/favorite`, { token: 'tok-bob', method: 'DELETE' })).status, 200);
  assert.equal((await api('/favorites', { token: 'tok-bob' })).body.games.length, 0);

  // Duplicating yields a private draft owned by the copier.
  const copy = await api(`/games/${pubd}/duplicate`, { token: 'tok-bob', method: 'POST' });
  const copied = await api(`/games/${copy.body.id}`, { token: 'tok-bob' });
  assert.deepEqual([copied.body.game.visibility, copied.body.game.status, copied.body.game.isOwner], ['private', 'draft', true]);

  // Owner deletion cascades to questions.
  assert.equal((await api(`/games/${unl}`, { token: 'tok-alice', method: 'DELETE' })).status, 200);
  assert.equal((await api(`/games/${unl}`)).status, 404);
  assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM questions WHERE game_id = $1', [unl])).rows[0].n, 0);
});

test('Teacher Studio over sockets: token required, saved games, sessions and results persist', async () => {
  const created = await api('/games', { token: 'tok-alice', method: 'POST', body: quiz({ title: 'Live saved', visibility: 'private', status: 'published', language: 'he' }) });
  const gameId = created.body.id;
  const teacher = await client(), student = await client(), stranger = await client();

  assert.equal((await call(teacher, 'teacher:create', { gameId: 'space' })).error, 'unauthorized');
  assert.equal((await call(teacher, 'teacher:create', { gameId: 'space', token: 'forged' })).error, 'unauthorized');
  assert.equal((await call(stranger, 'teacher:create', { token: 'tok-bob', dbGameId: gameId })).error, 'notFound'); // private game of another teacher
  assert.equal((await call(teacher, 'teacher:create', { token: 'tok-alice', dbGameId: '00000000-0000-4000-8000-000000000000' })).error, 'notFound');

  const room = await call(teacher, 'teacher:create', { token: 'tok-alice', dbGameId: gameId });
  assert.ok(room.ok);
  const live = rooms.get(room.code);
  assert.equal(live.contentLanguage, 'he');
  assert.equal(live.questions.length, 2);
  assert.equal(live.title, 'Live saved');

  assert.ok((await call(student, 'student:join', { code: room.code, name: 'Noa' })).ok);
  assert.ok((await call(teacher, 'teacher:launch', 0)).ok);
  assert.ok((await call(student, 'student:answer', 0)).correct);
  assert.ok((await call(teacher, 'teacher:reveal')).ok);
  assert.ok((await call(teacher, 'teacher:finish')).ok);
  await new Promise(r => setTimeout(r, 100));

  const sessions = await api('/sessions', { token: 'tok-alice' });
  assert.equal(sessions.body.sessions.length, 1);
  assert.equal(sessions.body.sessions[0].participants, 1);
  assert.equal(sessions.body.sessions[0].title, 'Live saved');
  assert.equal((await api('/sessions', { token: 'tok-bob' })).body.sessions.length, 0);
  const results = (await pool.query('SELECT nickname, score, correct_count FROM game_results')).rows;
  assert.deepEqual(results, [{ nickname: 'Noa', score: 100, correct_count: 1 }]);
  [teacher, student, stranger].forEach(s => s.disconnect());
});

test('missing credentials: features stay disabled and nothing is faked', async () => {
  configure(); // as if CLERK_* and DATABASE_URL were absent
  assert.deepEqual((await api('/config')).body, { auth: false, database: false, anonymousTeacher: false, clerkPublishableKey: null, clerkHost: null });
  assert.equal((await api('/me', { token: 'tok-alice' })).body.error, 'dbNotConfigured');
  assert.equal((await api('/games/mine', { token: 'tok-alice' })).status, 503);
  const teacher = await client();
  assert.equal((await call(teacher, 'teacher:create', { gameId: 'space' })).error, 'authNotConfigured');
  teacher.disconnect();

  configure({ pool: null, verify });
  assert.equal((await api('/me', { token: 'tok-alice' })).body.error, 'dbNotConfigured');
  configure({ pool, verify: null });
  assert.equal((await api('/me', { token: 'tok-alice' })).body.error, 'authNotConfigured');
  assert.equal((await api('/games/public')).status, 200); // community library works without sign-in once a database exists
});
