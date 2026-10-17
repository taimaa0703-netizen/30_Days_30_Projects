'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { io: connect } = require('socket.io-client');
const { server, rooms, io } = require('../server');

process.env.ALLOW_ANONYMOUS_TEACHER = 'true';
let url;
const clients = [];
test.before(async () => {
  await new Promise(resolve => server.listen(0, resolve));
  url = `http://localhost:${server.address().port}`;
});
test.after(async () => {
  for (const socket of clients) socket.disconnect();
  for (const room of rooms.values()) clearTimeout(room.timer);
  await new Promise(resolve => io.close(resolve));
});
async function client() {
  const socket = connect(url, { transports: ['websocket'], forceNew: true });
  clients.push(socket);
  await new Promise(resolve => socket.once('connect', resolve));
  return socket;
}
const call = (socket, event, data) => new Promise((resolve, reject) => {
  socket.timeout(3000).emit(event, data, (error, result) => error ? reject(error) : resolve(result));
});
function nextState(socket, predicate = () => true) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { socket.off('room:state', handle); reject(new Error('Missing room state')); }, 3000);
    function handle(state) {
      if (predicate(state)) { clearTimeout(timeout); socket.off('room:state', handle); resolve(state); }
    }
    socket.on('room:state', handle);
  });
}
test('only two UI destinations; old pages redirect and display mode stays on home', async () => {
  for (const path of ['/', '/teacher.html']) {
    const response = await fetch(url + path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /classroom.js/);
    assert.match(html, /id="navigation"/);
    assert.doesNotMatch(html, /universe.js|app.js|quest-studio.js/);
  }
  for (const [path, destination] of [
    ['/worlds.html', '/'], ['/academy.html', '/'], ['/arena.html', '/teacher.html'],
    ['/quest-studio.html', '/teacher.html'], ['/projector?code=ABC123', '/?screen=ABC123']
  ]) {
    const response = await fetch(url + path, { redirect: 'manual' });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), destination);
  }
});
test('both pages share the cosmic theme and serve local artwork with complete trilingual navigation copy', async () => {
  const home = await (await fetch(url + '/')).text();
  const teacher = await (await fetch(url + '/teacher.html')).text();
  assert.match(home, /cosmic-home\.css/);
  assert.match(teacher, /cosmic-home\.css/);
  assert.match(home, /classroom\.js\?v=12/);
  assert.match(teacher, /classroom\.js\?v=12/);
  const art = await fetch(url + '/learning-planet.svg');
  assert.equal(art.status, 200);
  assert.match(art.headers.get('content-type'), /image\/svg\+xml/);
  assert.doesNotMatch(await art.text(), /(?:href|src)=["']https?:|<script|<foreignObject/);
  const css = await (await fetch(url + '/cosmic-home.css')).text();
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /\.cosmic-theme \.question-editor/);
  assert.match(css, /\.cosmic-theme \.live-question/);
  assert.match(css, /\.cosmic-theme \.stat/);
  const vm = require('node:vm');
  const context = { window: {} };
  vm.runInNewContext(await (await fetch(url + '/classroom-i18n.js')).text(), context);
  for (const language of ['ar', 'he', 'en']) {
    for (const key of ['readyToStart', 'enableSound', 'muteSound', 'soundError', 'testSound', 'soundLabel', 'soundOn', 'soundOff', 'soundEnabledHint', 'volume', 'selectedGame', 'selectedGameHint']) {
      assert.ok(context.window.CLASSVERSE_COPY[language][key]?.trim(), `${language}.${key}`);
    }
    for (const key of ['welcome', 'planetIntro', 'studentRole', 'teacherRole', 'scienceWorld', 'mathWorld', 'togetherWorld', 'arenaWorld', 'joinPin', 'mapLabel', 'exploreWorlds', 'chooseGame', 'hostSteps', 'start', 'shareGame', 'copyLink', 'inviteLink', 'scanJoin', 'shareHint', 'localShareWarning', 'connectedPlayers', 'playerConnected', 'playerOffline', 'lobbyHostHint', 'liveUpdates', 'inviteStudents', 'waitForPlayers', 'teacherControlsStart', 'linkCopied', 'copyManually']) {
      assert.ok(context.window.CLASSVERSE_COPY[language][key]?.trim(), `${language}.${key}`);
    }
  }
});
test('lobby shares only the student invite and reserves start and removal controls for the teacher', async () => {
  const vm = require('node:vm');
  const handlers = {}, listeners = {}, emitted = [], copied = [], tones = [], stopped = [], redirects = [];
  let musicLoops = 0, musicCallback, liveLoops = 0;
  let audioInstance;
  const gains = [];
  class FakeAudioContext {
    constructor() { audioInstance = this; }
    state = 'running';
    currentTime = 0;
    destination = {};
    resume() { return Promise.resolve(); }
    createGain() {
      const gain = { value: 0, setValueAtTime() {}, setTargetAtTime(value) { this.value = value; }, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} };
      gains.push(gain);
      return { gain, connect() {}, disconnect() {} };
    }
    createDynamicsCompressor() {
      return { threshold: {}, knee: {}, ratio: {}, attack: {}, release: {}, connect() {} };
    }
    createOscillator() {
      return { frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {},
        start(time) { tones.push(time); }, stop() { stopped.push(true); } };
    }
  }
  const elements = Object.fromEntries(['main', 'navigation', 'footer', 'connection', 'toast', 'sound-settings', 'volume-value'].map(id => [id, { innerHTML: '', textContent: '', hidden: true }]));
  const context = {
    window: { addEventListener() {}, AudioContext: FakeAudioContext }, URL, URLSearchParams, console,
    location: { pathname: '/', search: '', origin: 'http://localhost:3000', hostname: 'localhost', assign: value => redirects.push(value) },
    localStorage: { getItem: () => 'en', setItem() {} },
    sessionStorage: { getItem: () => JSON.stringify({ role: 'teacher', code: 'ABC123', token: 'private-host-token' }), setItem() {}, removeItem() {} },
    document: {
      getElementById: id => elements[id], documentElement: {},
      body: { classList: { add() {}, toggle() {} } },
      addEventListener: (event, handler) => { listeners[event] = handler; }
    },
    navigator: { clipboard: { writeText: async value => { copied.push(value); } } },
    setInterval(callback, delay) { if (delay === 100) { musicLoops++; liveLoops++; musicCallback = callback; } return delay; },
    clearInterval(id) { if (id === 100) liveLoops--; }, setTimeout() {}, clearTimeout() {},
    io: () => ({
      connected: true,
      on: (event, handler) => { handlers[event] = handler; },
      timeout: () => ({ emit: (event, data, callback) => { emitted.push(event); callback(null, { ok: true }); } })
    })
  };
  vm.createContext(context);
  for (const file of ['question-bank.js', 'classroom-i18n.js', 'classroom.js']) {
    vm.runInContext(await (await fetch(`${url}/${file}`)).text(), context);
  }
  await handlers.connect();
  const room = { code: 'ABC123', mode: 'quiz', title: 'Science', stage: 'lobby', students: [],
    questions: [], activeQuestion: -1, hostConnected: true, translated: true, timeLimit: 20, serverNow: Date.now() };
  handlers['room:state'](room);
  assert.match(elements.main.innerHTML, /data-action="shareGame"/);
  assert.match(elements.main.innerHTML, /http:\/\/localhost:3000\/\?room=ABC123#join/);
  assert.doesNotMatch(elements.main.innerHTML, /private-host-token/);
  assert.doesNotMatch(elements.main.innerHTML, /data-action="launch:0"[^>]*disabled/);
  assert.match(elements.main.innerHTML, /You can start without students/);
  assert.match(elements.main.innerHTML, /class="lobby-columns"/);
  assert.match(elements.main.innerHTML, /class="lobby-launch-bar"><button[^>]*data-action="launch:0"/);
  assert.equal((elements.main.innerHTML.match(/data-action="launch:0"/g) || []).length, 1);
  assert.match(elements.main.innerHTML, /class="panel lobby-join"/);
  assert.match(elements.main.innerHTML, /class="lobby-center"/);
  assert.match(elements.main.innerHTML, /class="panel lobby-roster"/);
  assert.equal(tones.length, 0, 'audio must not autoplay');
  const click = async action => {
    listeners.click({ target: { closest: () => ({ dataset: { action }, disabled: false }) } });
    for (let i = 0; i < 15; i++) await Promise.resolve();
  };
  await click('launch:0');
  assert.equal(emitted.filter(event => event === 'teacher:launch').length, 1, 'an empty lobby can start');
  for (const id of ['science', 'math', 'together']) await click(`host:${id}`);
  assert.deepEqual(redirects, ['science', 'math', 'together'].map(id => `/teacher.html?game=${id}`));
  await click('toggleSound');
  const musicNotes = tones.length;
  assert.ok(musicNotes >= 7, 'music combines bass, chords, melody and percussion');
  assert.equal(musicLoops, 1);
  assert.equal(gains[0].value, .8);
  listeners.input({ target: { id: 'sound-volume', value: '100', closest: () => null } });
  assert.equal(gains[0].value, 1);
  assert.equal(elements['volume-value'].textContent, '100%');
  assert.match(elements.main.innerHTML, /aria-pressed="true"/);
  handlers['room:state'](room);
  assert.equal(musicLoops, 1, 'state updates must not duplicate the music loop');
  await click('copyInvite');
  assert.deepEqual(copied, ['http://localhost:3000/?room=ABC123#join']);
  assert.equal(elements.toast.textContent, 'Invite link copied.');
  let shareData;
  context.navigator.share = async data => { shareData = data; };
  await click('shareGame');
  assert.equal(shareData.url, copied[0]);
  assert.equal(shareData.text, 'Game PIN: ABC123');
  context.navigator.share = async () => { const error = new Error('Cancelled'); error.name = 'AbortError'; throw error; };
  await click('shareGame');
  assert.match(elements.main.innerHTML, /data-action="shareGame"/);
  const errors = [];
  context.console = { ...console, error: (...args) => errors.push(args) };
  context.navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
  await click('copyInvite');
  assert.equal(errors.length, 1);
  assert.match(elements.toast.textContent, /Copy the displayed invite link manually/);
  room.students.push({ id: 'student', name: '<Explorer>', connected: true, avatar: '🚀', points: 0 });
  handlers['room:state'](room);
  assert.equal(tones.length, musicNotes + 2, 'joining plays a two-note cue');
  assert.match(elements.main.innerHTML, /&lt;Explorer&gt;/);
  assert.match(elements.main.innerHTML, /data-action="kick:student"/);
  assert.doesNotMatch(elements.main.innerHTML, /data-action="launch:0"[^>]*disabled/);
  await click('launch:0');
  assert.ok(emitted.includes('teacher:launch'));
  const questionRoom = { ...room, stage: 'question', activeQuestion: 0,
    questions: [{ q: 'Question', options: ['a', 'b', 'c', 'd'] }], answersCount: 0 };
  handlers['room:state'](questionRoom);
  assert.equal(tones.length, musicNotes + 6, 'starting plays the start cue without stopping music');
  assert.equal(liveLoops, 1);
  assert.equal(musicLoops, 1);
  assert.equal(stopped.length, tones.length, 'no extra stop calls at question transition');
  for (const stage of ['reveal', 'question', 'finished']) {
    handlers['room:state']({ ...questionRoom, stage, results: { players: [], classAccuracy: null, questionsPlayed: 1 } });
    assert.equal(liveLoops, 1, `music continues in ${stage}`);
    assert.equal(musicLoops, 1, 'stage changes do not start extra schedulers');
    const previousNotes = tones.length;
    audioInstance.currentTime += 2;
    musicCallback();
    assert.ok(tones.length > previousNotes, `scheduler produces new notes in ${stage}`);
  }
  const beforeMute = tones.length;
  await click('toggleSound');
  assert.equal(liveLoops, 0);
  assert.match(elements.main.innerHTML, /aria-pressed="false"/);
  await click('testSound');
  assert.ok(tones.length >= beforeMute + musicNotes + 3, 'sound test restarts music and plays a cue');
  assert.match(elements.main.innerHTML, /aria-pressed="true"/);
  assert.equal(gains[0].value, 1, 'chosen volume survives mute and re-enable');
  await click('toggleSound');
  const mutedNotes = tones.length;
  musicCallback();
  assert.equal(tones.length, mutedNotes, 'a stale scheduler cannot play after mute');
  context.window.AudioContext.prototype.resume = async () => { throw new Error('Blocked audio'); };
  await click('toggleSound');
  assert.match(elements.toast.textContent, /Audio could not start/);
  assert.match(elements.main.innerHTML, /aria-pressed="false"/);
  room.students[0].connected = false;
  handlers['room:state'](room);
  assert.equal(tones.length, mutedNotes, 'muted lobby must not play audio');
  assert.doesNotMatch(elements.main.innerHTML, /data-action="launch:0"[^>]*disabled/);
  await click('launch:0');
  assert.equal(emitted.filter(event => event === 'teacher:launch').length, 3, 'disconnected players do not block starting');
  assert.match(elements.main.innerHTML, /Disconnected/);
  handlers.kicked();
  handlers['room:state'](room);
  assert.doesNotMatch(elements.main.innerHTML, /data-action="(?:launch:0|shareGame|kick:student)"/);
  assert.match(elements.main.innerHTML, /Waiting for the teacher/);
});
test('teacher can start, reveal, advance and finish an empty classroom game', async () => {
  const host = await client();
  const created = await call(host, 'teacher:create', { gameId: 'science', language: 'en' });
  assert.ok(created.ok);
  assert.ok((await call(host, 'teacher:setTimer', 0)).ok);
  for (const index of [0, 1]) {
    const question = nextState(host, room => room.stage === 'question' && room.activeQuestion === index);
    assert.ok((await call(host, 'teacher:launch', index)).ok);
    assert.equal((await question).students.length, 0);
    const reveal = nextState(host, room => room.stage === 'reveal' && room.activeQuestion === index);
    assert.ok((await call(host, 'teacher:reveal')).ok);
    await reveal;
  }
  const finished = nextState(host, room => room.stage === 'finished');
  assert.ok((await call(host, 'teacher:finish')).ok);
  const result = await finished;
  assert.equal(result.results.players.length, 0);
  assert.equal(result.results.questionsPlayed, 2);
  assert.equal(result.results.classAccuracy, null);
});
test('live lobby broadcasts arrivals and removal; only the room teacher can start', async () => {
  const host = await client(), student = await client(), projector = await client();
  const created = await call(host, 'teacher:create', { gameId: 'science', language: 'en' });
  const arrival = nextState(host, room => room.stage === 'lobby' && room.students.length === 1);
  const joined = await call(student, 'student:join', { code: created.code, name: 'Explorer', language: 'en' });
  assert.ok(joined.ok);
  const lobby = await arrival;
  assert.equal(lobby.students[0].name, 'Explorer');
  assert.equal(lobby.students[0].connected, true);
  assert.ok((await call(projector, 'projector:join', { code: created.code })).ok);
  assert.equal((await call(student, 'teacher:launch', 0)).error, 'teacherOnly');
  assert.equal((await call(projector, 'teacher:launch', 0)).error, 'teacherOnly');
  assert.equal((await call(student, 'teacher:kick', joined.id)).error, 'teacherOnly');
  const removed = nextState(host, room => room.stage === 'lobby' && !room.students.length);
  assert.ok((await call(host, 'teacher:kick', joined.id)).ok);
  await removed;
  assert.ok((await call(student, 'student:join', { code: created.code, name: 'Explorer', language: 'en' })).ok);
  await call(host, 'teacher:setTimer', 0);
  const started = nextState(student, room => room.stage === 'question' && room.activeQuestion === 0);
  assert.ok((await call(host, 'teacher:launch', 0)).ok);
  await started;
});
test('all 25 live questions and answers localize independently for each participant without leaking answers', async () => {
  const host = await client();
  const created = await call(host, 'teacher:create', { gameId: 'science', language: 'ar' });
  const english = await client(), hebrew = await client(), arabic = await client();
  for (const [socket, language] of [[english, 'en'], [hebrew, 'he'], [arabic, 'ar']]) {
    assert.ok((await call(socket, 'student:join', { code: created.code, name: language, language })).ok);
  }
  assert.ok((await call(host, 'teacher:setTimer', 0)).ok);
  for (let index = 0; index < 25; index++) {
    const pending = [english, hebrew, arabic].map(socket => nextState(socket, state => state.stage === 'question' && state.activeQuestion === index));
    assert.ok((await call(host, 'teacher:launch', index)).ok);
    const states = await Promise.all(pending);
    const question = rooms.get(created.code).questions[index];
    for (const [n, language] of ['en', 'he', 'ar'].entries()) {
      assert.equal(states[n].questions.length, 25);
      assert.equal(states[n].questions[index].q, question.translations.q[language]);
      assert.match(states[n].title, language === 'ar' ? /[\u0600-\u06ff]/ : language === 'he' ? /[\u0590-\u05ff]/ : /[A-Za-z]/);
      assert.deepEqual(states[n].questions[index].options, question.translations.options[language]);
      assert.equal(states[n].questions[index].answer, undefined);
      assert.equal(states[n].questions[index].translations, undefined);
      assert.equal(states[n].revealAnswer, null);
      if (index < 24) assert.equal(states[n].questions[index + 1].q, '');
    }
    assert.ok((await call(arabic, 'student:answer', question.answer)).correct);
    assert.ok((await call(host, 'teacher:reveal')).ok);
  }
  const changed = nextState(english, state => /[\u0600-\u06ff]/.test(state.questions[24].q));
  assert.ok((await call(english, 'client:language', 'ar')).ok);
  await changed;
  const finished = nextState(arabic, state => state.stage === 'finished');
  assert.ok((await call(host, 'teacher:finish')).ok);
  const results = (await finished).results;
  assert.equal(results.questionsPlayed, 25);
  assert.equal(results.players.find(player => player.name === 'ar').points, 2500);
  assert.ok(results.questions.every(question => /[\u0600-\u06ff]/.test(question.q)));
});
test('team assignment, cooperative scoring, and teacher/student reconnection work in the new modes', async () => {
  const host = await client();
  const teams = await call(host, 'teacher:create', { gameId: 'math', language: 'he' });
  assert.equal(rooms.get(teams.code).mode, 'teams');
  assert.equal(rooms.get(teams.code).questions.length, 25);
  for (let index = 0; index < 6; index++) {
    const student = await client();
    await call(student, 'student:join', { code: teams.code, name: `student${index}`, language: 'he' });
  }
  const counts = [...rooms.get(teams.code).students.values()].reduce((out, student) => {
    out[student.team] = (out[student.team] || 0) + 1; return out;
  }, {});
  assert.deepEqual(Object.values(counts), [2, 2, 2]);
  const created = await call(host, 'teacher:create', { gameId: 'together', language: 'ar' });
  const student = await client();
  const joined = await call(student, 'student:join', { code: created.code, name: 'Learner', language: 'ar' });
  student.disconnect();
  const returned = await client();
  assert.ok((await call(returned, 'student:rejoin', { code: created.code, token: joined.token, language: 'he' })).ok);
  host.disconnect();
  const returnedHost = await client();
  assert.ok((await call(returnedHost, 'teacher:resume', { code: created.code, token: created.teacherToken, language: 'ar' })).ok);
  await call(returnedHost, 'teacher:launch', 0);
  const scored = nextState(returned, state => state.cooperative.answered === 1);
  await call(returned, 'student:answer', rooms.get(created.code).questions[0].answer);
  const state = await scored;
  assert.equal(state.mode, 'cooperative');
  assert.equal(state.cooperative.accuracy, 100);
  assert.equal(state.cooperative.target, 70);
  const finished = nextState(returned, state => state.stage === 'finished');
  await call(returnedHost, 'teacher:finish');
  assert.equal((await finished).results.players[0].points, 100);
  returned.disconnect();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(rooms.get(created.code).students.size, 1, 'completed scores survive leaving');
});
