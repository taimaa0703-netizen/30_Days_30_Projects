(function () {
  'use strict';
  const bank = window.CLASSVERSE_BANK;
  const copy = window.CLASSVERSE_COPY;
  const teacherPage = location.pathname === '/teacher.html';
  const params = new URLSearchParams(location.search);
  const invitedCode = /^[A-Za-z0-9]{6}$/.test(params.get('room') || '') ? params.get('room').toUpperCase() : null;
  const storedLanguage = localStorage.getItem('classverse_lang');
  const state = {
    lang: bank.languages.includes(storedLanguage) ? storedLanguage : 'ar',
    config: null, account: 'loading', user: null, games: [], editor: null, dirty: false,
    practice: null, room: null, role: null, me: null, session: null, busy: false,
    previewAnswer: null, notice: null, disconnected: false
  };
  const socket = io();
  const main = document.getElementById('main');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const t = key => copy[state.lang][key] || copy[state.lang].serverError;
  const localized = value => value[state.lang];
  const symbols = ['✳', '◈', '☰', '◎'];
  const teamIds = ['pilots', 'engineers', 'scientists'];
  let audioContext, audioGain, musicTimer;
  let soundEnabled = false;
  let previousSoundRoom = null;
  const soundNodes = new Set();
  function stopMusic() {
    clearInterval(musicTimer);
    musicTimer = null;
    for (const node of soundNodes) node.stop();
    soundNodes.clear();
  }
  function playNotes(notes, spacing = .2) {
    if (!soundEnabled || audioContext?.state !== 'running') return;
    notes.forEach((frequency, index) => {
      const start = audioContext.currentTime + index * spacing;
      const oscillator = audioContext.createOscillator();
      const envelope = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(.12, start + .025);
      envelope.gain.exponentialRampToValueAtTime(.001, start + spacing * .9);
      oscillator.connect(envelope);
      envelope.connect(audioGain);
      soundNodes.add(oscillator);
      oscillator.onended = () => { soundNodes.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(start);
      oscillator.stop(start + spacing);
    });
  }
  function syncSound(room) {
    const audible = soundEnabled && !state.disconnected && ['teacher', 'projector'].includes(state.role);
    const inLobby = audible && room?.stage === 'lobby';
    if (!inLobby) stopMusic();
    if (inLobby && !musicTimer) {
      const melody = () => playNotes([261.63, 329.63, 392, 493.88, 440, 392, 329.63, 293.66], .4);
      melody();
      musicTimer = setInterval(melody, 4000);
    }
    if (audible && room && previousSoundRoom?.code === room.code) {
      if (room.stage === 'lobby' && room.students.some(player => player.connected && !previousSoundRoom.players.has(player.id))) {
        playNotes([659.25, 880], .14);
      }
      if (previousSoundRoom.stage === 'lobby' && room.stage === 'question') playNotes([392, 523.25, 659.25, 783.99], .18);
    }
    previousSoundRoom = room ? { code: room.code, stage: room.stage, players: new Set(room.students.filter(player => player.connected).map(player => player.id)) } : null;
  }
  async function toggleSound(testOnly = false) {
    if (soundEnabled && !testOnly) {
      soundEnabled = false;
      stopMusic();
      audioGain.gain.value = 0;
      return;
    }
    try {
      if (!audioContext) {
        if (!window.AudioContext) throw new Error('Web Audio is unavailable');
        audioContext = new window.AudioContext();
        audioGain = audioContext.createGain();
        audioGain.connect(audioContext.destination);
      }
      await audioContext.resume();
      if (audioContext.state !== 'running') throw new Error('Audio playback is blocked');
      audioGain.gain.value = .8;
      soundEnabled = true;
      syncSound(state.room);
      if (testOnly || state.room?.stage !== 'lobby') playNotes([523.25, 659.25, 783.99], .3);
      notify('soundEnabledHint');
    } catch (error) {
      soundEnabled = false;
      stopMusic();
      console.error('Lobby audio failed:', error);
      notify('soundError');
    }
  }
  const teamName = id => t(`team${teamIds.indexOf(id) + 1}`);
  const gameById = id => bank.games.find(game => game.id === id);
  let pendingGame = teacherPage ? gameById(params.get('game'))?.id : null;
  let openingGame = false;
  const teacherRedirect = () => pendingGame ? `/teacher.html?game=${encodeURIComponent(pendingGame)}` : '/teacher.html';
  async function openSelectedGame() {
    if (!pendingGame || openingGame || state.room || state.session || !socket.connected || state.account !== 'ready' || (!state.user && !state.config?.anonymousTeacher)) return;
    openingGame = true;
    try {
      await host(pendingGame);
      pendingGame = null;
    } finally {
      openingGame = false;
    }
  }
  const button = (key, action, cls = '', attrs = '') => `<button type="button" class="${cls}" data-action="${esc(action)}" ${state.busy ? 'disabled' : ''} ${attrs}>${t(key)}</button>`;
  const field = (name, key, value = '', attrs = '') => `<div class="field"><label for="${name}">${t(key)}</label><input id="${name}" name="${name}" value="${esc(value)}" ${attrs}></div>`;
  let toastTimer;
  let renderedLanguage;
  function notify(key) {
    const toast = document.getElementById('toast');
    toast.textContent = t(key); toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 7000);
  }
  function report(error) {
    console.error('CLASSVERSE action failed:', error);
    state.notice = Object.hasOwn(copy[state.lang], error.message) ? error.message : 'serverError';
    notify(state.notice);
  }
  function callSocket(event, data) {
    return new Promise((resolve, reject) => {
      if (!socket.connected) return reject(new Error('networkError'));
      socket.timeout(10000).emit(event, data, (error, result) => {
        if (error) return reject(new Error('networkError'));
        if (!result?.ok) return reject(new Error(result?.error || 'serverError'));
        resolve(result);
      });
    });
  }
  async function token() {
    return window.Clerk?.session ? window.Clerk.session.getToken() : null;
  }
  async function api(path, { method = 'GET', body } = {}) {
    const accessToken = await token();
    let response;
    try {
      response = await fetch(`/api${path}`, {
        method, headers: { ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}), ...(body ? { 'content-type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined
      });
    } catch (error) {
      console.error('API connection failed:', error);
      throw new Error('networkError');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'serverError');
    return data;
  }
  function header() {
    const cosmicHome = !teacherPage && !state.room && !state.practice && !invitedCode;
    const headerKey = `${state.lang}:${cosmicHome}`;
    document.body.classList.add('cosmic-theme');
    document.body.classList.toggle('cosmic-home', cosmicHome);
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'en' ? 'ltr' : 'rtl';
    document.title = `CLASSVERSE | ${t(teacherPage ? 'teachers' : 'home')}`;
    if (renderedLanguage !== headerKey) {
      document.getElementById('navigation').innerHTML = `<div class="header-inner"><a class="brand" href="/" aria-label="CLASSVERSE"><span class="brand-planet" aria-hidden="true"></span><span class="brand-word">CLASS<span>VERSE</span><small>LEARN · PLAY · EXPLORE</small></span></a><nav aria-label="${t('home')}"><a href="${cosmicHome ? '#join' : '/'}" ${!teacherPage ? 'aria-current="page"' : ''}><span aria-hidden="true">${cosmicHome ? '♟' : '✦'}</span> ${t(cosmicHome ? 'joinPin' : 'home')}</a><a href="/teacher.html" ${teacherPage ? 'aria-current="page"' : ''}><span aria-hidden="true">▰</span> ${t('teachers')}</a></nav><label class="sr-only" for="language">Language / اللغة / שפה</label><select class="language" id="language">${[['ar', 'العربية'], ['he', 'עברית'], ['en', 'English']].map(([id, label]) => `<option value="${id}" ${id === state.lang ? 'selected' : ''}>${label}</option>`).join('')}</select></div>`;
      renderedLanguage = headerKey;
    }
    document.getElementById('footer').textContent = t('footer');
    document.getElementById('sound-settings').innerHTML = teacherPage || state.role === 'projector' ? `<div class="actions"><span>${t('soundLabel')}</span>${!state.room ? button(soundEnabled ? 'muteSound' : 'enableSound', 'toggleSound', 'secondary', `aria-pressed="${soundEnabled}"`) : ''}${button('testSound', 'testSound', 'secondary')}<span class="muted">${t(soundEnabled ? 'soundOn' : 'soundOff')}</span></div>` : '';
    document.getElementById('connection').innerHTML = state.disconnected ? `<div class="status-banner" role="alert">${t('reconnecting')}</div>` : '';
  }
  function answers(options, action, { selected = null, correct = null, disabled = false } = {}) {
    return `<div class="answers">${options.map((option, index) => `<button type="button" class="answer ${selected === index ? 'selected' : ''} ${correct === index ? 'correct' : ''} ${selected === index && correct !== null && correct !== index ? 'wrong' : ''}" data-action="${action}:${index}" ${disabled ? 'disabled' : ''} ${selected === index ? 'aria-pressed="true"' : 'aria-pressed="false"'}><span class="symbol" aria-hidden="true">${symbols[index]}</span><span>${esc(option)}${correct === index ? ' ✓' : ''}</span></button>`).join('')}</div>`;
  }
  function gameCards(isTeacher = false) {
    return `<div class="game-grid">${bank.games.map((game, index) => `<article class="game-card"><div class="game-art" aria-hidden="true"><strong>${['✳', '◈', '◎'][index]}</strong><span>PLAY / 0${index + 1}</span></div><div class="game-body"><span class="eyebrow">${t(game.mode)}</span><h3>${esc(localized(game.title))}</h3><p>${esc(localized(game.description))}</p><span class="pill">${game.questions.length} ${t('questions')} · 3 ${state.lang === 'en' ? 'languages' : state.lang === 'he' ? 'שפות' : 'لغات'}</span><p class="subtle">${t(`${game.mode}Help`)}</p><div class="actions">${button('host', `host:${game.id}`, 'primary')}${!isTeacher ? button('practice', `practice:${game.id}`, 'secondary') : ''}</div></div></article>`).join('')}</div>`;
  }
  function invitationPage() {
    return `<section class="panel invitation-page" id="join"><span class="eyebrow">CLASSVERSE / LIVE</span><h1>${t('join')}</h1><p class="muted">${t('inviteJoinHint')}</p><strong class="pin">${esc(invitedCode)}</strong><form id="join-form"><input type="hidden" name="code" value="${esc(invitedCode)}">${field('nickname', 'nickname', '', 'required maxlength="24" autocomplete="off" autofocus')}<button class="primary" ${state.busy ? 'disabled' : ''}>${t('join')}</button></form><p class="muted">${t('privacy')}</p></section>`;
  }
  function homepage() {
    const question = bank.games[0].questions[0];
    const chosen = state.previewAnswer;
    return `<section class="universe-hero" aria-labelledby="universe-title"><div class="universe-stars" aria-hidden="true"></div><div class="universe-intro"><span class="cosmic-eyebrow">THE LEARNING UNIVERSE</span><h1 id="universe-title">${t('welcome')}<strong dir="ltr">CLASSVERSE</strong></h1><p class="planet-intro">${t('planetIntro')}</p><div class="role-cards"><a class="role-card student-card" href="#join"><span class="role-icon" aria-hidden="true">✥</span><span><strong>${t('studentRole')}</strong><small>${t('studentHint')}</small></span><b aria-hidden="true">›</b></a><a class="role-card teacher-card" href="/teacher.html"><span class="role-icon" aria-hidden="true">▰</span><span><strong>${t('teacherRole')}</strong><small>${t('teacherHint')}</small></span><b aria-hidden="true">›</b></a></div><div class="curiosity-card"><span class="mini-globe" aria-hidden="true">✦</span><p>${t('worldNote')}</p><span class="cosmic-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></div><section class="world-map" aria-label="${t('mapLabel')}"><img class="world-artwork" src="/learning-planet.svg?v=1" alt="" width="900" height="840" fetchpriority="high"><button type="button" class="world-link world-science" data-action="host:science"><span class="world-icon" aria-hidden="true">⚗</span><span><strong>${t('scienceWorld')}</strong><small>${t('quiz')} · 25</small></span><b aria-hidden="true">↗</b></button><button type="button" class="world-link world-math" data-action="host:math"><span class="world-icon" aria-hidden="true">123</span><span><strong>${t('mathWorld')}</strong><small>${t('teams')} · 25</small></span><b aria-hidden="true">↗</b></button><button type="button" class="world-link world-together" data-action="host:together"><span class="world-icon" aria-hidden="true">▤</span><span><strong>${t('togetherWorld')}</strong><small>${t('cooperative')} · 25</small></span><b aria-hidden="true">↗</b></button><a class="world-link world-arena" href="#join"><span class="world-icon" aria-hidden="true">⚔</span><span><strong>${t('arenaWorld')}</strong><small>${t('joinPin')}</small></span><b aria-hidden="true">↗</b></a><div class="planet-wordmark" aria-hidden="true"><span class="little-planet"></span><strong>CLASSVERSE</strong><small>LEARN · PLAY · EXPLORE</small></div></section><aside class="universe-side"><a class="explore-worlds" href="#games"><span aria-hidden="true">✦</span><span><strong>${t('exploreWorlds')}</strong><small>${t('exploreHint')}</small></span><b aria-hidden="true">›</b></a><div class="orbit-friend" aria-hidden="true"><div class="friend-star">✧</div><div class="astronaut"><div class="astronaut-helmet"><div class="astronaut-visor"></div></div><div class="astronaut-body"><i></i></div><div class="astronaut-arm arm-a"></div><div class="astronaut-arm arm-b"></div><div class="astronaut-boot boot-a"></div><div class="astronaut-boot boot-b"></div></div><div class="friend-rock"></div></div><section class="cosmic-preview question-card" aria-label="${t('preview')}"><div class="question-top"><span>${t('preview')}</span><span dir="ltr">01 / 25</span></div><h2>${esc(localized(question.q))}</h2>${answers(localized(question.options), 'preview', { selected: chosen, correct: chosen === null ? null : question.answer, disabled: chosen !== null })}<p class="feedback" role="status">${chosen === null ? '' : t(chosen === question.answer ? 'correct' : 'incorrect')}</p>${chosen !== null ? button('practice', 'continuePreview', 'primary') : ''}</section></aside><a href="#games" class="world-scroll"><span aria-hidden="true">↓</span> ${t('scrollWorlds')}</a><div class="universe-cloud cloud-left" aria-hidden="true"></div><div class="universe-cloud cloud-right" aria-hidden="true"></div></section><section class="cosmic-collection" id="games"><div class="section-head"><div><span class="eyebrow">${t('growTitle')}</span><h2>${t('collection')}</h2><p class="muted">${t('growHint')} · ${t('languages')}</p></div><span class="pill">3 × 25 ${t('questions')}</span></div>${gameCards()}</section><section class="panel join-panel" id="join"><div><h2>${t('join')}</h2><p class="muted">${t('privacy')}</p></div><form id="join-form" class="join-form">${field('code', 'code', params.get('room') || '', 'required minlength="6" maxlength="6" pattern="[A-Za-z0-9]{6}" dir="ltr" autocomplete="off"')}${field('nickname', 'nickname', '', 'required maxlength="24" autocomplete="off"') }<button class="primary" ${state.busy ? 'disabled' : ''}>${t('join')}</button></form></section>`;
  }
  function practicePage() {
    const practice = state.practice, game = gameById(practice.id);
    if (practice.finished) {
      return `<section class="practice-wrap"><span class="eyebrow">${t('results')}</span><h1>${esc(localized(game.title))}</h1>${summaryStats(practice.score * 100, Math.round(practice.score / game.questions.length * 100), game.questions.length)}<p class="lead">${t('keepGoing')}</p>${button('back', 'back', 'primary')}</section>`;
    }
    const question = game.questions[practice.index];
    return `<section class="practice-wrap"><div class="actions spread">${button('back', 'back', 'secondary')}<span class="pill">${t('practice')}</span></div><p class="muted">${t('practiceNote')}</p><section class="panel question-card"><div class="question-top"><span>${esc(localized(game.title))}</span><span dir="ltr">${practice.index + 1} / ${game.questions.length}</span></div><h2>${esc(localized(question.q))}</h2>${answers(localized(question.options), 'answerPractice', { selected: practice.answer, correct: practice.answer === null ? null : question.answer, disabled: practice.answer !== null })}<p class="feedback" role="status">${practice.answer === null ? '' : t(practice.answer === question.answer ? 'correct' : 'incorrect')}</p>${practice.answer !== null ? button(practice.index === game.questions.length - 1 ? 'finish' : 'next', 'nextPractice', 'primary') : ''}</section></section>`;
  }
  function accountPanel() {
    if (state.account === 'loading') return `<section class="panel account-panel" role="status">${t('loading')}</section>`;
    if (state.account === 'failed') return `<section class="panel account-panel"><p>${t('networkError')}</p>${button('retry', 'retryAuth')}</section>`;
    if (!state.config?.auth || !state.config?.database) return `<section class="panel account-panel"><p>${t('setup')}</p><p class="muted" dir="ltr">${!state.config?.auth ? 'CLERK_PUBLISHABLE_KEY · CLERK_SECRET_KEY' : ''} ${!state.config?.database ? 'DATABASE_URL' : ''}</p>${button('retry', 'retryAuth')}</section>`;
    if (state.user) return `<section class="panel account-panel actions spread"><span>${esc(state.user.fullName || state.user.primaryEmailAddress?.emailAddress || '')}</span>${button('signOut', 'signOut', 'secondary')}</section>`;
    return `<section class="panel account-panel"><p>${t('gate')}</p><div class="actions">${button('signIn', 'signIn', 'primary')}${button('signUp', 'signUp')}</div></section>`;
  }
  function studio() {
    const selected = pendingGame ? gameById(pendingGame) : null;
    const selection = selected ? `<section class="panel account-panel selected-game"><span class="eyebrow">${t('selectedGame')}</span><h2>${esc(localized(selected.title))}</h2><p class="muted">${t('selectedGameHint')}</p>${button('host', `host:${selected.id}`, 'primary')}</section>` : '';
    return `<section class="studio-hero"><div><span class="eyebrow">CLASSVERSE / ${t('teachers')}</span><h1>${t('studioTitle')}</h1><p class="lead">${t('studioIntro')}</p>${!state.editor ? `<p class="muted">${t('hostSteps')}</p>` : ''}</div><div class="actions">${!state.editor ? `<a class="button primary" href="#ready-games">${t('chooseGame')}</a>` : ''}${state.user ? button('newGame', 'newGame', 'primary') : ''}</div></section>${selection}${accountPanel()}${state.editor ? editorPage() : `<section id="ready-games" tabindex="-1" style="scroll-margin-top:160px"><div class="section-head"><h2>${t('ready')}</h2></div>${gameCards(true)}</section><section><div class="section-head"><h2>${t('myGames')}</h2>${state.user ? button('newGame', 'newGame', 'primary') : ''}</div>${state.user ? savedCards() : `<p class="empty">${t('gate')}</p>`}</section>`}`;
  }
  function savedCards() {
    return state.games.length ? `<div class="saved-grid">${state.games.map(game => `<article class="panel saved-card"><h3>${esc(game.title)}</h3><p class="muted">${esc(game.description)}</p><p class="muted">${game.questionCount} ${t('questions')} · ${esc({ ar: 'العربية', he: 'עברית', en: 'English' }[game.language])}</p><div class="actions">${button('host', `hostSaved:${game.id}`, 'primary')}${button('edit', `edit:${game.id}`)}${button('delete', `delete:${game.id}`, 'danger')}</div></article>`).join('')}</div>` : `<p class="empty">${t('empty')}</p>`;
  }
  function editorPage() {
    const editor = state.editor;
    return `<section class="editor"><div class="section-head"><h2>${t(editor.id ? 'edit' : 'newGame')}</h2>${button('cancel', 'cancelEdit')}</div><p class="muted">${t('editorHelp')}</p><form id="editor-form"><div class="panel editor-fields">${field('title', 'gameTitle', editor.title, 'required maxlength="90" dir="auto"')}<div class="field"><label for="content-language">${t('contentLanguage')}</label><select name="language" id="content-language">${[['ar', 'العربية'], ['he', 'עברית'], ['en', 'English']].map(([id, text]) => `<option value="${id}" ${editor.language === id ? 'selected' : ''}>${text}</option>`).join('')}</select></div><div class="wide">${field('description', 'description', editor.description, 'maxlength="300" dir="auto"')}<p class="muted subtle">${t('ownLanguage')}</p></div></div>${editor.questions.map((question, index) => `<fieldset class="question-editor"><legend>${t('question')} ${index + 1}</legend>${field(`q-${index}`, 'prompt', question.prompt, 'required maxlength="240" dir="auto"')}<div class="option-fields">${question.options.map((option, n) => `<div class="field"><label for="o-${index}-${n}">${symbols[n]} ${t('option')} ${n + 1}</label><input id="o-${index}-${n}" name="o-${index}-${n}" value="${esc(option)}" maxlength="90" dir="auto" required></div>`).join('')}</div><div class="actions spread"><div><label for="a-${index}">${t('right')}</label><select name="a-${index}" id="a-${index}">${question.options.map((_, n) => `<option value="${n}" ${n === question.correctIndex ? 'selected' : ''}>${symbols[n]} ${n + 1}</option>`).join('')}</select></div>${button('remove', `removeQuestion:${index}`, 'danger', editor.questions.length === 1 ? 'disabled' : '')}</div></fieldset>`).join('')}<div class="save-bar">${button('add', 'addQuestion', '', editor.questions.length >= 50 ? 'disabled' : '')}<button class="primary" ${state.busy ? 'disabled' : ''}>${t('save')}</button></div></form></section>`;
  }
  function syncEditor() {
    const form = document.getElementById('editor-form');
    if (!form || !state.editor) return;
    const data = new FormData(form);
    Object.assign(state.editor, {
      title: data.get('title'), description: data.get('description'), language: data.get('language'),
      questions: state.editor.questions.map((_, index) => ({
        prompt: data.get(`q-${index}`), options: [0, 1, 2, 3].map(n => data.get(`o-${index}-${n}`)),
        correctIndex: Number(data.get(`a-${index}`))
      }))
    });
  }
  const blankQuestion = () => ({ prompt: '', options: ['', '', '', ''], correctIndex: 0 });
  function summaryStats(points, accuracy, questions) {
    return `<div class="stats"><div class="stat"><strong>${points}</strong><span>${t('score')}</span></div><div class="stat"><strong>${accuracy ?? 0}%</strong><span>${t('accuracy')}</span></div><div class="stat"><strong>${questions}</strong><span>${t('questions')}</span></div></div>`;
  }
  function scoreBoard(room) {
    const students = room.students;
    if (room.mode === 'cooperative') {
      const accuracy = room.cooperative.accuracy || 0;
      return `<h2>${t('cooperative')}</h2><p>${t('target')}</p><div class="meter" role="meter" aria-label="${t('accuracy')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${accuracy}"><span style="width:${accuracy}%"></span></div><strong>${accuracy}%</strong><p class="muted">${t(room.stage === 'finished' && accuracy >= 70 ? 'reached' : 'keepGoing')}</p>`;
    }
    if (room.mode === 'teams') return `<h2>${t('teams')}</h2>${teamIds.map(id => `<div class="team-stat"><span>${teamName(id)}</span><b>${students.filter(player => player.team === id).reduce((sum, player) => sum + player.points, 0)}</b></div>`).join('')}`;
    return `<h2>${t('board')}</h2><ol class="player-list">${students.slice().sort((a, b) => b.points - a.points).map(player => `<li><span>${esc(player.name)}</span><b>${player.points}</b></li>`).join('')}</ol>`;
  }
  function lobbyPage(room, host) {
    const connected = room.students.filter(player => player.connected).length;
    const joinUrl = new URL(`/?room=${encodeURIComponent(room.code)}#join`, location.origin).href;
    const localOnly = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    return `<section class="game-lobby lobby-stage" aria-labelledby="lobby-title">
      <div class="lobby-toolbar"><span class="eyebrow">CLASSVERSE / LIVE</span><div class="actions"><span class="pill" role="status">${t('connectedPlayers')}: ${connected}</span>${host || state.role === 'projector' ? button(soundEnabled ? 'muteSound' : 'enableSound', 'toggleSound', 'secondary', `aria-pressed="${soundEnabled}"`) : ''}${button('leave', 'leave', 'secondary')}</div></div>
      ${host ? `<div class="lobby-launch-bar">${button('start', 'launch:0', 'primary start-game', 'aria-describedby="start-guidance"')}</div>` : ''}
      <div class="lobby-columns">
        <aside class="panel lobby-join"><h2>${t('join')}</h2><img class="join-qr" src="/api/qr?code=${encodeURIComponent(room.code)}" alt="${t('scanJoin')}" width="220" height="220"><p class="muted">${t('code')}</p><strong class="pin">${esc(room.code)}</strong>${host ? `<div class="actions">${button('shareGame', 'shareGame', 'primary')}${button('copyLink', 'copyInvite')}${button('screen', 'screen')}</div><details class="invite-details"><summary>${t('inviteLink')}</summary><label class="sr-only" for="game-invite">${t('inviteLink')}</label><input id="game-invite" value="${esc(joinUrl)}" dir="ltr" readonly><p class="muted">${t('shareHint')}</p>${localOnly ? `<p class="status-banner">${t('localShareWarning')}</p>` : ''}</details>` : ''}</aside>
        <section class="lobby-center"><span class="pill">${t(host ? 'readyToStart' : 'waiting')}</span><h1 id="lobby-title">${esc(room.title)}</h1><p class="lead">${t('lobby')}</p>${host ? `<div class="lobby-start"><p class="muted" id="start-guidance">${t(connected ? 'teacherControlsStart' : 'waitForPlayers')}</p><div class="timer-setting"><label for="timer">${t('timer')}</label><select id="timer">${[0, 10, 20, 30, 60].map(seconds => `<option value="${seconds}" ${room.timeLimit === seconds ? 'selected' : ''}>${seconds ? `${seconds} ${t('seconds')}` : t('noTimer')}</option>`).join('')}</select></div></div>` : ''}<p class="muted">${t(`${room.mode}Help`)}</p></section>
        <aside class="panel lobby-roster" aria-labelledby="roster-title"><div class="section-head"><h2 id="roster-title">${t('players')}</h2><span class="pill">${room.students.length}</span></div><p class="muted" role="status">${t('liveUpdates')} · ${connected} ${t('connectedPlayers')}</p>${room.students.length ? `<ul class="player-list lobby-players">${room.students.map(player => `<li><span class="lobby-player"><span class="player-avatar" aria-hidden="true">${esc(player.avatar || '✦')}</span><span><strong>${esc(player.name)}</strong><small>${t(player.connected ? 'playerConnected' : 'playerOffline')}${room.mode === 'teams' ? ` · ${teamName(player.team)}` : ''}</small></span></span>${host ? button('removePlayer', `kick:${player.id}`, 'small danger') : ''}</li>`).join('')}</ul>` : `<p class="empty">${t('inviteStudents')}</p>`}</aside>
      </div></section>`;
  }
  function livePage() {
    const room = state.room;
    const host = state.role === 'teacher', student = state.role === 'student';
    const me = room.students.find(player => player.id === state.me);
    const question = room.questions[room.activeQuestion];
    const nextIndex = room.activeQuestion + 1;
    const revealed = room.stage === 'reveal';
    let content;
    if (room.stage === 'lobby') {
      content = lobbyPage(room, host);
    } else if (room.stage === 'finished') {
      const personal = room.results.players.find(player => player.id === state.me);
      content = `<section class="panel"><span class="eyebrow">${t('results')}</span><h2>${esc(room.title)}</h2>${summaryStats(personal?.points ?? room.students.reduce((sum, player) => sum + player.points, 0), personal?.accuracy ?? room.results.classAccuracy, room.results.questionsPlayed)}<p class="lead">${t(room.mode === 'cooperative' && room.results.classAccuracy >= 70 ? 'reached' : 'keepGoing')}</p>${button('back', 'leave', 'primary')}</section>`;
    } else if (question) {
      content = `<section class="panel question-card live-question"><div class="question-top"><span>${t('question')} <bdi>${room.activeQuestion + 1} / ${room.questions.length}</bdi></span><span class="timer-count" id="countdown">${remaining(room)}</span></div><h2>${esc(question.q)}</h2>${answers(question.options, 'answerLive', { selected: state.session?.answerIndex === room.activeQuestion ? state.session.answer : null, correct: revealed ? room.revealAnswer : null, disabled: !student || revealed || !!me?.answered })}<p class="feedback" role="status">${student && me?.answered ? t(revealed ? 'right' : 'sent') : ''}</p><p class="muted">${room.answersCount} / ${room.students.length} ${t('answered')}</p>${host ? `<div class="actions room-controls">${room.stage === 'question' ? button('reveal', 'reveal', 'primary') : nextIndex < room.questions.length ? button('next', `launch:${nextIndex}`, 'primary') : button('finish', 'finish', 'primary')}${nextIndex < room.questions.length ? button('end', 'end', 'danger') : ''}</div>` : ''}</section>`;
    } else content = `<section class="panel">${t('waiting')}</section>`;
    if (room.stage === 'lobby') return `${!room.hostConnected ? `<p class="status-banner">${t('hostOffline')}</p>` : ''}${content}`;
    return `<section class="room-header"><div><span class="eyebrow">${t(room.mode)}</span><h1>${esc(room.title)}</h1><span class="pill">${t('code')}: <bdi>${esc(room.code)}</bdi></span>${me && room.mode === 'teams' ? `<span class="pill accent">${teamName(me.team)}</span>` : ''}</div><div class="actions">${host || state.role === 'projector' ? button(soundEnabled ? 'muteSound' : 'enableSound', 'toggleSound', 'secondary', `aria-pressed="${soundEnabled}"`) : ''}${button('leave', 'leave', 'secondary')}</div></section>${!room.hostConnected && room.stage !== 'finished' ? `<p class="status-banner">${t('hostOffline')}</p>` : ''}${!room.translated ? `<p class="muted">${t('ownLanguage')} (${esc(room.contentLanguage)})</p>` : ''}<div class="live-layout">${content}<aside class="panel">${scoreBoard(room)}</aside></div>`;
  }
  function remaining(room) {
    return room.endsAt ? Math.max(0, Math.ceil((room.endsAt - Date.now() - serverOffset) / 1000)) : '—';
  }
  function render() {
    header();
    document.body.classList.toggle('lobby-view', state.room?.stage === 'lobby');
    if (!state.room && previousSoundRoom) syncSound(null);
    main.innerHTML = `${state.notice ? `<div class="error-banner" role="alert">${t(state.notice)}</div>` : ''}${state.room ? livePage() : state.practice ? practicePage() : teacherPage ? studio() : invitedCode ? invitationPage() : homepage()}`;
  }
  async function loadGames() {
    state.games = (await api('/games/mine')).games;
  }
  async function authLocalization() {
    if (state.lang === 'en') return undefined;
    const module = await import(`/vendor/clerk-${state.lang}.mjs`);
    return module.arSA || module.heIL;
  }
  let lastUserId = null;
  async function syncUser() {
    state.user = window.Clerk.user;
    if (state.user?.id !== lastUserId) {
      lastUserId = state.user?.id || null;
      state.editor = null; state.dirty = false; state.games = [];
      if (state.user && state.config.database) await loadGames();
    }
    render();
    await openSelectedGame();
  }
  let clerkListener;
  async function initializeAccount() {
    state.account = 'loading'; render();
    try {
      state.config = await api('/config');
      if (state.config.auth && state.config.clerkPublishableKey && state.config.clerkHost) {
        if (!window.Clerk) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://${state.config.clerkHost}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
            script.crossOrigin = 'anonymous';
            script.setAttribute('data-clerk-publishable-key', state.config.clerkPublishableKey);
            script.onload = resolve; script.onerror = () => reject(new Error('networkError'));
            document.head.appendChild(script);
          });
        }
        await window.Clerk.load({ localization: await authLocalization() });
        if (clerkListener) clerkListener();
        clerkListener = window.Clerk.addListener(() => { syncUser().catch(report); });
        await syncUser();
      }
      state.account = 'ready';
      await openSelectedGame();
    } catch (error) {
      state.account = 'failed'; report(error);
    }
    render();
  }
  function storeSession() {
    sessionStorage.setItem(`classverse_session_${teacherPage ? 'teacher' : 'student'}`, JSON.stringify(state.session));
  }
  async function host(id, saved = false) {
    if (!teacherPage) {
      location.assign(`/teacher.html?game=${encodeURIComponent(id)}`);
      return;
    }
    if (!saved) pendingGame = gameById(id)?.id || null;
    if (!state.user && !state.config?.anonymousTeacher) {
      notify('gate');
      if (state.account === 'ready' && state.config?.auth && window.Clerk) {
        await window.Clerk.openSignIn({ fallbackRedirectUrl: teacherRedirect() });
      } else {
        document.querySelector('.account-panel')?.scrollIntoView({ block: 'center' });
      }
      return;
    }
    const game = saved ? state.games.find(item => item.id === id) : gameById(id);
    const result = await callSocket('teacher:create', {
      token: await token(), ...(saved ? { dbGameId: id } : { gameId: id }),
      language: state.lang, title: saved ? game.title : localized(game.title)
    });
    state.role = 'teacher';
    state.session = { role: 'teacher', code: result.code, token: result.teacherToken };
    storeSession();
    pendingGame = null;
  }
  async function action(value) {
    const [name, id] = value.split(':');
    state.notice = null;
    if (name === 'toggleSound') await toggleSound();
    if (name === 'testSound') await toggleSound(true);
    if (name === 'preview') state.previewAnswer = Number(id);
    if (name === 'practice' || name === 'continuePreview') {
      state.practice = { id: id || 'science', index: 0, answer: name === 'continuePreview' ? state.previewAnswer : null, score: name === 'continuePreview' && state.previewAnswer === gameById('science').questions[0].answer ? 1 : 0, finished: false };
    }
    if (name === 'answerPractice' && state.practice?.answer === null) {
      state.practice.answer = Number(id);
      if (Number(id) === gameById(state.practice.id).questions[state.practice.index].answer) state.practice.score++;
    }
    if (name === 'nextPractice') {
      if (state.practice.index === gameById(state.practice.id).questions.length - 1) state.practice.finished = true;
      else { state.practice.index++; state.practice.answer = null; }
    }
    if (name === 'back') state.practice = null;
    if (name === 'host' || name === 'hostSaved') await host(id, name === 'hostSaved');
    if (name === 'signIn') await window.Clerk.openSignIn({ fallbackRedirectUrl: teacherRedirect() });
    if (name === 'signUp') await window.Clerk.openSignUp({ fallbackRedirectUrl: teacherRedirect() });
    if (name === 'signOut' && (!state.dirty || confirm(t('draftWarning')))) await window.Clerk.signOut();
    if (name === 'retryAuth') await initializeAccount();
    if (name === 'newGame') {
      if (state.dirty && !confirm(t('draftWarning'))) return;
      state.editor = { title: '', description: '', language: state.lang, questions: [blankQuestion()] }; state.dirty = false;
    }
    if (name === 'cancelEdit' && (!state.dirty || confirm(t('draftWarning')))) { state.editor = null; state.dirty = false; }
    if (name === 'addQuestion') {
      syncEditor(); if (state.editor.questions.length < 50) { state.editor.questions.push(blankQuestion()); state.dirty = true; }
    }
    if (name === 'removeQuestion') {
      syncEditor(); if (state.editor.questions.length > 1) { state.editor.questions.splice(Number(id), 1); state.dirty = true; }
    }
    if (name === 'edit') {
      const data = await api(`/games/${id}`);
      state.editor = { ...data.game, questions: data.questions.map(question => ({ ...question, options: [...question.options, ...Array(4 - question.options.length).fill('')] })) };
      state.dirty = false;
    }
    if (name === 'delete' && confirm(t('deleteConfirm'))) { await api(`/games/${id}`, { method: 'DELETE' }); await loadGames(); }
    if (name === 'launch') {
      await callSocket('teacher:launch', Number(id));
    }
    if (name === 'shareGame' || name === 'copyInvite') {
      const url = new URL(`/?room=${encodeURIComponent(state.room.code)}#join`, location.origin).href;
      if (name === 'shareGame' && navigator.share) {
        try {
          await navigator.share({ title: state.room.title, text: `${t('code')}: ${state.room.code}`, url });
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Game sharing failed:', error);
            notify('copyManually');
          }
        }
      } else if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(url);
          notify('linkCopied');
        } catch (error) {
          console.error('Invite clipboard failed:', error);
          notify('copyManually');
        }
      } else notify('copyManually');
    }
    if (name === 'reveal') await callSocket('teacher:reveal');
    if (name === 'finish' || (name === 'end' && confirm(t('endConfirm')))) await callSocket('teacher:finish');
    if (name === 'kick') await callSocket('teacher:kick', id);
    if (name === 'screen') window.open(`/?screen=${state.room.code}`, '_blank', 'noopener');
    if (name === 'answerLive') {
      await callSocket('student:answer', Number(id));
      state.session.answer = Number(id); state.session.answerIndex = state.room.activeQuestion; storeSession();
    }
    if (name === 'leave' && (state.room.stage === 'finished' || confirm(t('leaveConfirm')))) {
      state.session = null; state.room = null; state.role = null; state.me = null;
      sessionStorage.removeItem(`classverse_session_${teacherPage ? 'teacher' : 'student'}`);
      socket.disconnect(); socket.connect();
      if (params.has('screen')) location.replace('/');
    }
    render();
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled || state.busy) return;
    state.busy = true;
    target.disabled = true;
    Promise.resolve(action(target.dataset.action)).catch(report).finally(() => { state.busy = false; render(); });
  });
  document.addEventListener('input', event => {
    if (event.target.closest('#editor-form')) state.dirty = true;
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'language') {
      syncEditor();
      state.lang = event.target.value;
      localStorage.setItem('classverse_lang', state.lang);
      state.notice = null;
      render();
      if (socket.connected) callSocket('client:language', state.lang).catch(report);
      if (window.Clerk?.loaded) authLocalization().then(localization => window.Clerk.__unstable__updateProps({ options: { localization } })).catch(report);
    }
    if (event.target.id === 'timer') callSocket('teacher:setTimer', Number(event.target.value)).catch(report);
  });
  document.addEventListener('submit', async event => {
    if (!['join-form', 'editor-form'].includes(event.target.id)) return;
    event.preventDefault();
    if (state.busy) return;
    state.busy = true; state.notice = null;
    const submit = event.submitter; if (submit) submit.disabled = true;
    try {
      if (event.target.id === 'join-form') {
        const data = new FormData(event.target);
        const result = await callSocket('student:join', { code: data.get('code').trim().toUpperCase(), name: data.get('nickname').trim(), language: state.lang });
        state.role = 'student'; state.me = result.id;
        state.session = { role: 'student', code: result.code, token: result.token };
        storeSession();
      } else {
        syncEditor();
        const editor = state.editor;
        await api(editor.id ? `/games/${editor.id}` : '/games', {
          method: editor.id ? 'PUT' : 'POST',
          body: { ...editor, status: editor.status || 'draft', visibility: editor.visibility || 'private', gradeFrom: editor.gradeFrom || 5, gradeTo: editor.gradeTo || 6 }
        });
        state.editor = null; state.dirty = false; await loadGames(); notify('saved');
      }
    } catch (error) { report(error); }
    finally { state.busy = false; render(); }
  });
  let serverOffset = 0;
  socket.on('room:state', room => {
    serverOffset = room.serverNow - Date.now();
    syncSound(room);
    state.room = room; render();
  });
  socket.on('disconnect', () => { state.disconnected = true; stopMusic(); render(); });
  socket.on('connect', async () => {
    state.disconnected = false;
    try {
      if (params.has('screen')) {
        state.role = 'projector';
        await callSocket('projector:join', { code: params.get('screen'), language: state.lang });
      } else {
        if (!state.session) {
          const raw = sessionStorage.getItem(`classverse_session_${teacherPage ? 'teacher' : 'student'}`);
          if (raw) state.session = JSON.parse(raw);
        }
        if (state.session) {
          state.role = state.session.role;
          const result = await callSocket(state.role === 'teacher' ? 'teacher:resume' : 'student:rejoin', { ...state.session, language: state.lang });
          state.me = result.id || null;
          pendingGame = null;
        }
        await openSelectedGame();
      }
    } catch (error) {
      state.room = null; state.session = null; state.role = null;
      sessionStorage.removeItem(`classverse_session_${teacherPage ? 'teacher' : 'student'}`);
      report(error);
    }
    render();
  });
  socket.on('kicked', () => {
    state.room = null; state.session = null; state.role = null;
    sessionStorage.removeItem(`classverse_session_${teacherPage ? 'teacher' : 'student'}`);
    notify('kicked'); render();
  });
  setInterval(() => {
    const countdown = document.getElementById('countdown');
    if (countdown && state.room) countdown.textContent = remaining(state.room);
  }, 250);
  window.addEventListener('beforeunload', event => {
    if (state.dirty) { event.preventDefault(); event.returnValue = ''; }
  });
  window.addEventListener('pagehide', () => {
    soundEnabled = false;
    stopMusic();
    if (audioGain) audioGain.gain.value = 0;
  });
  render();
  if (!teacherPage && params.has('room')) document.getElementById('join')?.scrollIntoView();
  if (teacherPage) initializeAccount();
}());
