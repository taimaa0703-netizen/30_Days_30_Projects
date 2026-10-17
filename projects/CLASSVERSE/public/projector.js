(function () {
  const I18N = window.CLASSVERSE_I18N;
  const params = new URLSearchParams(location.search);
  const saved = localStorage.getItem('classverse_lang');
  const initial = params.get('lang') || saved;
  const prefs = { lang: I18N.languages.includes(initial) ? initial : 'en', muted: localStorage.getItem('cv_pj_muted') === '1', reduced: localStorage.getItem('cv_pj_reduced') === '1' };
  const stage = document.getElementById('stage');
  const socket = io();
  const SHAPES = ['▲', '◆', '●', '■'];
  let room = null, code = (params.get('code') || '').toUpperCase(), error = '', connected = false;
  let clockOffset = 0, tick = null, lastStage = null, lastQuestion = null, lastStudents = 0;

  const p = (key, values) => I18N.translate(prefs.lang, 'projector', key, values);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const apply = () => {
    document.documentElement.lang = prefs.lang;
    document.documentElement.dir = I18N.direction(prefs.lang);
    document.documentElement.classList.toggle('reduced', prefs.reduced);
    document.title = p('pageTitle');
  };

  let audio;
  function beep(freq, dur = 0.15, type = 'sine', delay = 0) {
    if (prefs.muted) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audio.createOscillator(), gain = audio.createGain();
      osc.type = type; osc.frequency.value = freq;
      const start = audio.currentTime + delay;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(audio.destination); osc.start(start); osc.stop(start + dur + 0.05);
    } catch { /* audio unavailable */ }
  }
  const sounds = {
    join: () => beep(660, 0.12), question: () => { beep(523, 0.12); beep(784, 0.18, 'sine', 0.13); },
    tick: () => beep(880, 0.05, 'square'), reveal: () => { beep(440, 0.12, 'triangle'); beep(660, 0.2, 'triangle', 0.12); },
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.25, 'triangle', i * 0.14))
  };

  function confetti() {
    if (prefs.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.getElementById('confetti');
    const colors = ['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#ffd54a', '#b6a0ff'];
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement('i');
      piece.style.left = Math.random() * 100 + 'vw'; piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = 2.5 + Math.random() * 2.5 + 's'; piece.style.animationDelay = Math.random() * 0.8 + 's';
      box.appendChild(piece); setTimeout(() => piece.remove(), 6500);
    }
  }

  const remaining = () => room?.endsAt ? Math.max(0, (room.endsAt - (Date.now() + clockOffset)) / 1000) : null;

  function toolbar() {
    const full = Boolean(document.fullscreenElement);
    return `<div class="tool-group" style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="tool" data-do="fullscreen">${full ? '⤡ ' + p('exitFullscreen') : '⛶ ' + p('fullscreen')}</button>
      <button class="tool" data-do="mute" aria-pressed="${prefs.muted}">${prefs.muted ? '🔇 ' + p('unmute') : '🔊 ' + p('mute')}</button>
      <button class="tool" data-do="motion" aria-pressed="${prefs.reduced}">${prefs.reduced ? '🧘 ' + p('motionOff') : '✨ ' + p('motionOn')}</button>
      <label class="tool">🌐 <select data-do="lang" aria-label="${esc(p('lang'))}">${I18N.languages.map(l => `<option value="${l}"${l === prefs.lang ? ' selected' : ''}>${{ en: 'English', he: 'עברית', ar: 'العربية' }[l]}</option>`).join('')}</select></label></div>`;
  }

  function topbar() {
    const r = room;
    const stats = r ? `<span class="stat">👥 ${p('students')}: <bdi>${r.students.length}</bdi></span>${r.stage === 'question' || r.stage === 'reveal' ? `<span class="stat">✍️ ${p('answers')}: <bdi>${r.answersCount} / ${r.students.length}</bdi></span>` : ''}${r.teacherConnected ? '' : `<span class="warn">${p('teacherAway')}</span>`}` : '';
    return `<div class="topbar"><div class="brand">CLASS<span>VERSE</span></div>${stats}${toolbar()}</div>`;
  }

  function gate() {
    return `<div class="gate"><div class="brand">CLASS<span>VERSE</span></div><h1 class="big">${p('enterPin')}</h1>
      <input id="pin" maxlength="6" autocomplete="off" aria-label="${esc(p('pin'))}" value="${esc(code)}"/><div class="err" role="alert">${esc(error)}</div>
      <button class="tool" data-do="connect">${p('connect')}</button></div>`;
  }

  function lobby() {
    const host = location.host;
    const players = room.students.length ? room.students.map(s => `<span class="chip">${s.avatar} ${esc(s.name)}</span>`).join('') : `<span class="big-sub">${p('noPlayers')}</span>`;
    return `<div class="main"><div class="lobby"><div class="center"><h1 class="big">${p('lobbyTitle')}</h1><div class="joinurl">${p('joinAt', { host: '<bdi>' + esc(host) + '</bdi>' })}</div>
      <div class="pin-label">${p('pin')}</div><div class="pin ltr" aria-label="${esc(p('pin'))} ${esc(room.code)}">${esc(room.code)}</div><div class="big-sub">${p('waitingStart')}</div><div class="players">${players}</div></div>
      <div><div class="qr"><img alt="QR" src="/api/qr?code=${encodeURIComponent(room.code)}"/></div><div class="qr-label">${p('scan')}</div></div></div></div>`;
  }

  function question() {
    const r = room, q = r.questions[r.activeQuestion];
    if (!q) return '';
    const revealed = r.stage === 'reveal';
    const counts = r.answerCounts?.[r.activeQuestion] || [];
    const total = Math.max(1, r.students.length);
    const secs = remaining();
    const timerHtml = r.stage === 'question' && secs !== null
      ? `<div class="timer${secs <= 5 ? ' low' : ''}" id="timer" style="--p:${(secs / r.timeLimit) * 100}%" role="timer" aria-label="${esc(p('secondsLeft'))}"><b>${Math.ceil(secs)}</b></div>`
      : (r.stage === 'question' ? `<div class="stat">${p('noTimer')}</div>` : '');
    const options = q.options.map((o, i) => {
      const right = revealed && r.revealAnswer === i;
      return `<div class="opt opt-${i}${right ? ' right' : ''}" aria-label="${esc(p('optionLabel', { letter: String.fromCharCode(65 + i) }))}${right ? ' · ' + esc(p('correctAnswer')) : ''}">
        ${revealed ? `<span class="bar" style="--w:${Math.round(((counts[i] || 0) / total) * 100)}%"></span>` : ''}
        <span class="shape" aria-hidden="true">${SHAPES[i]}</span><span class="txt" lang="${esc(r.contentLanguage || 'en')}">${esc(o)}</span>${revealed ? `<span class="count">${right ? '✓ ' : ''}<bdi>${counts[i] || 0}</bdi></span>` : ''}</div>`;
    }).join('');
    const pct = Math.round((r.answersCount / total) * 100);
    const done = r.activeQuestion + (revealed ? 1 : 0);
    return `<div class="main" style="align-content:stretch;grid-template-rows:auto 1fr auto auto;gap:2vh">
      <div class="qhead"><div class="qnum">${p('question')} <bdi>${r.activeQuestion + 1} / ${r.questions.length}</bdi></div>${timerHtml}</div>
      <h1 class="question" lang="${esc(r.contentLanguage || 'en')}" dir="auto" style="align-self:center">${esc(q.q)}</h1>
      <div class="options${revealed ? ' reveal' : ''}">${options}</div>
      <div class="progress-wrap"><div>${p('progress')} · <bdi>${done} / ${r.questions.length}</bdi> · ${p('answered')} <bdi>${pct}%</bdi></div><div class="progress"><i style="--w:${Math.round((done / r.questions.length) * 100)}%"></i></div></div></div>`;
  }

  function finished() {
    const ranked = [...room.students].sort((a, b) => b.points - a.points).slice(0, 8);
    const rows = ranked.map((s, i) => `<div class="row" style="animation-delay:${i * 0.12}s"><span class="rank"><bdi>${i + 1}</bdi></span><span>${s.avatar}</span><span class="nm">${esc(s.name)}</span><span><bdi>${s.points}</bdi> ${p('points')}</span></div>`).join('');
    return `<div class="main"><div class="center"><div class="trophy" aria-hidden="true">🏆</div><h1 class="big">${p('finalTitle')}</h1>${ranked[0] ? `<div class="big-sub">${p('winner')}: ${ranked[0].avatar} ${esc(ranked[0].name)}</div>` : ''}<div class="board">${rows || `<span class="big-sub">${p('noPlayers')}</span>`}</div></div></div>`;
  }

  function render() {
    apply();
    if (!room) { stage.innerHTML = gate(); return; }
    let body;
    if (room.stage === 'lobby') body = lobby();
    else if (room.stage === 'question' || room.stage === 'reveal') body = question();
    else if (room.stage === 'finished') body = finished();
    else body = `<div class="main"><div class="center"><h1 class="big">${p('waitingStart')}</h1></div></div>`;
    const focus = document.activeElement?.dataset?.do;
    stage.innerHTML = topbar() + body + (connected ? '' : `<div class="warn" role="status" style="position:fixed;bottom:12px;inset-inline-start:12px">${p('reconnecting')}</div>`);
    if (focus === 'lang') stage.querySelector('[data-do="lang"]')?.focus();
  }

  function startTick() {
    clearInterval(tick);
    tick = setInterval(() => {
      const el = document.getElementById('timer');
      const secs = remaining();
      if (!el || secs === null || !room?.timeLimit) return;
      const shown = Math.ceil(secs);
      if (el.firstChild.textContent !== String(shown)) { el.firstChild.textContent = shown; if (shown <= 5 && shown > 0) sounds.tick(); }
      el.style.setProperty('--p', (secs / room.timeLimit) * 100 + '%');
      el.classList.toggle('low', secs <= 5);
    }, 100);
  }

  function onState(state) {
    clockOffset = state.serverNow - Date.now();
    const prev = room; room = state;
    if (!prev || prev.code !== state.code || lastStage !== state.stage || lastQuestion !== state.activeQuestion) {
      if (state.stage === 'question') sounds.question();
      if (state.stage === 'reveal') sounds.reveal();
      if (state.stage === 'finished' && lastStage !== 'finished') { sounds.win(); confetti(); }
    }
    if (state.students.length > lastStudents && state.stage === 'lobby') sounds.join();
    lastStage = state.stage; lastQuestion = state.activeQuestion; lastStudents = state.students.length;
    render();
  }

  function connect(pin) {
    error = '';
    socket.emit('projector:join', { code: pin }, res => {
      if (!res?.ok) { error = p('roomNotFound'); room = null; render(); return; }
      code = res.code; connected = true;
      history.replaceState(null, '', `/projector?code=${code}&lang=${prefs.lang}`);
    });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-do]'); if (!b || b.tagName === 'SELECT') return;
    const action = b.dataset.do;
    if (action === 'fullscreen') {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {});
    } else if (action === 'mute') { prefs.muted = !prefs.muted; localStorage.setItem('cv_pj_muted', prefs.muted ? '1' : '0'); if (!prefs.muted) sounds.join(); render(); }
    else if (action === 'motion') { prefs.reduced = !prefs.reduced; localStorage.setItem('cv_pj_reduced', prefs.reduced ? '1' : '0'); render(); }
    else if (action === 'connect') { const v = document.getElementById('pin').value.trim().toUpperCase(); if (v) connect(v); }
  });
  document.addEventListener('change', e => {
    if (e.target.dataset?.do === 'lang' && I18N.languages.includes(e.target.value)) { prefs.lang = e.target.value; localStorage.setItem('classverse_lang', prefs.lang); render(); }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'pin') document.querySelector('[data-do="connect"]').click(); });
  document.addEventListener('fullscreenchange', render);
  socket.on('room:state', s => { if (s.code === code) onState(s); });
  socket.on('connect', () => { connected = true; if (code) connect(code); else render(); });
  socket.on('disconnect', () => { connected = false; render(); });
  startTick();
  render();
})();
