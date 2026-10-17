const socket = io();
const app = document.querySelector('#app');
const savedLanguage = localStorage.getItem('classverse_lang');
const state = { lang: ['en','he','ar'].includes(savedLanguage) ? savedLanguage : 'he', page: 'home', role: null, code: null, teacherToken: null, me: null, room: null, avatar: '🚀', lastResult: null, revealed: null, surprise: null, questionDraft: null, selectedGame: 'space' };

const { catalog } = window.CLASSVERSE_I18N;
const t = (k, values) => window.CLASSVERSE_I18N.translate(state.lang, 'app', k, values);
const errorText = key => window.CLASSVERSE_ACCOUNT.error(key, state.lang) || window.CLASSVERSE_I18N.translate(state.lang, 'errors', key);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = { space:'🪐', forest:'🌳', ocean:'🐠', castle:'🏰' };
const room = () => state.room;
const btn = (text, action, cls='btn') => `<button class="${cls}" data-action="${action}">${text}</button>`;
const field = (id, label, value='', placeholder='') => `<div class="field"><label for="${id}">${esc(label)}</label><input class="input" id="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="240" dir="${id==='joincode'?'ltr':'auto'}" /></div>`;
const renderNavigation = () => `<header class="site-header"><a class="logo" href="/" data-action="home" aria-label="${site('homeLabel')}">CLASS<span>VERSE</span><i>✦</i></a><nav class="main-nav" aria-label="${site('navigationLabel')}"><button class="nav-link" data-action="${state.role==='teacher'?'teacher':'teacherForm'}">${site('teacherNav')}</button><button class="nav-link" data-action="${state.role==='student'?'student':'studentForm'}">${site('studentNav')}</button><button class="nav-link nav-explore" data-action="library">${site('exploreNav')}</button>${window.CLASSVERSE_ACCOUNT.navHtml()}</nav><label class="language-control"><span class="visually-hidden">${site('language')}</span><select class="lang" id="lang" aria-label="${site('language')}"><option value="en" ${state.lang==='en'?'selected':''}>${site('english')}</option><option value="he" ${state.lang==='he'?'selected':''}>${site('hebrew')}</option><option value="ar" ${state.lang==='ar'?'selected':''}>${site('arabic')}</option></select></label></header>`;
const renderFooter = () => `<footer class="site-footer"><a class="logo" href="/" data-action="home">CLASS<span>VERSE</span><i>✦</i></a><p>${site('footerText')}</p><div class="footer-links"><button data-action="teacherForm">${site('teacherNav')}</button><button data-action="studentForm">${site('studentNav')}</button><button data-action="library">${site('exploreNav')}</button></div><small>${site('projectStamp')} · CLASSVERSE</small></footer>`;
const worldBox = (w, title) => `<div class="world"><div class="planet">${icons[w]||'🪐'}</div><h2>${esc(title)}</h2><p>${esc(t(w))} · ✨</p></div>`;
const qForm = prefix => `<div class="stack">${field(prefix+'q',t('questionLabel'))}${[0,1,2,3].map(i=>field(prefix+'o'+i,t('answerOption',{number:i+1}))).join('')}<div class="field"><label for="${prefix}answer">${t('right')}</label><select class="select" id="${prefix}answer" dir="ltr">${[0,1,2,3].map(i=>`<option value="${i}">${i+1}</option>`).join('')}</select></div>${btn(prefix==='p'?t('send'):t('add'),prefix==='p'?'propose':'addQuestion')}</div>`;

const g = key => window.CLASSVERSE_I18N.translate(state.lang, 'game', key);


const localized = item => item[state.lang] || item.en;
const site = key => window.CLASSVERSE_I18N.translate(state.lang, 'site', key);
const pj = (key, values) => window.CLASSVERSE_I18N.translate(state.lang, 'projector', key, values);
const gameCard = (id, game) => `<article class="game-card game-${game.tint}"><div class="game-art"><span aria-hidden="true">${game.icon}</span><span class="game-level">${localized(game.level)}</span></div><div class="game-card-content"><p class="game-subject">${localized(game.subject)}</p><h3>${localized(game.title)}</h3><p class="game-description">${localized(game.description)}</p><div class="game-meta"><span>❓ <bdi dir="ltr">${game.count}</bdi> ${site('questions')}</span>${btn(site('preview'),'previewGame:'+id,'btn secondary')}</div></div></article>`;
function landingPage() {
  const cards = ['space','science','math'].map(id => gameCard(id,catalog[id])).join('');
  return `<main><section class="home-hero"><div class="hero-copy"><span class="eyebrow">${site('homeEyebrow')}</span><h1>${site('homeTitle')}</h1><p>${site('homeText')}</p><div class="hero-actions">${btn(site('teacherCta'),'teacherForm','btn primary-action')}${btn(site('studentCta'),'studentForm','btn secondary')}</div><button class="text-link" data-action="library">${site('exploreCta')} <span aria-hidden="true">←</span></button></div><div class="hero-art" aria-hidden="true"><div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div><div class="hero-planet">✦</div><div class="float-card float-card-one">🎯 <span>${site('playTogether')}</span></div><div class="float-card float-card-two">⭐ <span>${site('learnByDoing')}</span></div><div class="hero-student">👩🏻‍🚀</div></div></section><section class="feature-strip" aria-label="${site('stepsTitle')}">${site('steps').map((step,index)=>`<div class="feature-step"><span dir="ltr">${String(index+1).padStart(2,'0')}</span><p>${step}</p></div>`).join('')}</section><section class="home-library"><div class="section-heading"><div><p class="game-subject">${site('featured')}</p><h2>${site('libraryTitle')}</h2></div>${btn(site('exploreCta'),'library','btn secondary')}</div><div class="game-grid">${cards}</div></section></main>`;
}
function libraryPage() {
  return `<main class="library-page"><section class="library-heading"><button class="back-link" data-action="home">← ${site('back')}</button><p class="game-subject">${site('libraryEyebrow')}</p><h1>${site('libraryTitle')}</h1><p>${site('libraryText')}</p></section><div class="game-grid">${Object.entries(catalog).map(([id,game])=>gameCard(id,game)).join('')}</div></main>`;
}
function previewPage(id) {
  const game=catalog[id];
  if(!game)return libraryPage();
  return `<main class="preview-page"><button class="back-link" data-action="library">← ${site('back')}</button><div class="preview-card game-${game.tint}"><div class="preview-art" aria-hidden="true"><span>${game.icon}</span></div><div class="preview-info"><p class="game-subject">${localized(game.subject)}</p><h1>${localized(game.title)}</h1><p>${localized(game.description)}</p><div class="preview-facts"><span>❓ <bdi dir="ltr">${game.count}</bdi> ${site('questions')}</span><span>◷ <bdi dir="ltr">5–10</bdi> ${site('minutes')}</span><span>${localized(game.level)}</span><span>${site('contentLanguage')}: <bdi dir="ltr">English</bdi></span></div><h2>${site('learningObjectives')}</h2><p>${localized(game.objectives)}</p>${btn(site('host'),'hostGame:'+id,'btn primary-action')}</div></div></main>`;
}
const rs = (key, values) => window.CLASSVERSE_I18N.translate(state.lang, 'results', key, values);
const pctText = v => v === null || v === undefined ? '–' : `${v}%`;
const badgeIcons = { perfect: '🏆', streak: '🔥', quick: '⚡', steady: '🧭', participant: '🤝' };
const badgeList = badges => badges.length ? `<ul class="badge-list">${badges.map(b => `<li><span aria-hidden="true">${badgeIcons[b]}</span><span><strong>${rs('badge_' + b)}</strong><small>${rs('badge_' + b + '_d')}</small></span></li>`).join('')}</ul>` : `<p class="muted">${rs('noAchievements')}</p>`;
const meter = v => `<span class="meter" role="img" aria-label="${pctText(v)}"><i style="width:${v || 0}%"></i></span>`;
const topicOf = r => r.gameId && catalog[r.gameId] ? localized(catalog[r.gameId].subject) : esc(r.title);
function teacherResults(r) {
  const res = r.results; if (!res) return `<div class="card"><p class="muted">${rs('noData')}</p></div>`;
  const hard = res.questions.filter(q => res.difficult.includes(q.index));
  return `<div class="card results-hero"><div class="center"><div class="emoji" aria-hidden="true">🏆</div><h2>${rs('teacherTitle')}</h2></div>
    <div class="stat-grid"><div class="stat-card"><strong dir="ltr">${res.participants}</strong><span>${rs('participants')}</span></div><div class="stat-card"><strong dir="ltr">${res.questionsPlayed} / ${res.questionsTotal}</strong><span>${rs('questionsPlayed')}</span></div><div class="stat-card"><strong dir="ltr">${pctText(res.classAccuracy)}</strong><span>${rs('classAccuracy')}</span></div><div class="stat-card"><strong dir="ltr">${res.progress}%</strong><span>${rs('progress')}</span></div></div>
    <div class="actions">${btn('⬇ ' + rs('download'), 'download', 'btn primary-action')}${btn(g('retry'), 'newroom', 'btn secondary')}</div></div>
    <div class="card"><h2>${rs('questionAccuracy')}</h2>${res.questions.length ? `<div class="list">${res.questions.map(q => `<div class="listitem result-row"><span dir="auto"><bdi dir="ltr">${q.index + 1}.</bdi> ${esc(q.q)}</span>${meter(q.accuracy)}<strong dir="ltr">${pctText(q.accuracy)} · ${q.correct}/${q.answered}</strong></div>`).join('')}</div>` : `<p class="muted">${rs('noData')}</p>`}</div>
    <div class="card"><h2>⚠️ ${rs('difficult')}</h2>${hard.length ? `<div class="list">${hard.map(q => `<div class="listitem"><span dir="auto">${esc(q.q)}</span><strong dir="ltr">${pctText(q.accuracy)}</strong></div>`).join('')}</div>` : `<p class="muted">${rs('noDifficult')}</p>`}</div>
    ${hard.length ? `<div class="card review-card"><h2>📚 ${rs('review')}</h2><p class="muted">${rs('reviewHelp')}</p><p><strong>${rs('reviewTopic')}:</strong> ${topicOf(r)}</p><ul class="review-list">${hard.slice(0, 3).map(q => `<li dir="auto">${esc(q.q)}</li>`).join('')}</ul></div>` : ''}
    <div class="card"><h2>🤝 ${rs('teams')}</h2><div class="list">${res.teams.map(tm => `<div class="listitem"><span>${tm.icon} ${rs('team_' + tm.id)} · <bdi dir="ltr">${tm.members}</bdi> ${rs('members')}</span><strong dir="ltr">⭐ ${tm.points} · ${pctText(tm.accuracy)}</strong></div>`).join('')}</div></div>
    <div class="card"><h2>${rs('students')}</h2>${res.players.length ? `<div class="list">${res.players.map(p => `<div class="listitem"><span><bdi dir="ltr">${p.rank}.</bdi> ${p.avatar} <span dir="auto">${esc(p.name)}</span></span><strong dir="ltr">⭐ ${p.points} · ${pctText(p.accuracy)}</strong></div>`).join('')}</div>` : `<p class="muted">${g('noStudents')}</p>`}</div>`;
}
function feedbackKey(p) { if (!p || !p.answered) return 'feedback_none'; if (p.accuracy >= 80) return 'feedback_top'; if (p.accuracy >= 50) return 'feedback_good'; return 'feedback_keep'; }
function studentResults(r, me) {
  const res = r.results; const mine = res?.players.find(p => p.id === me?.id);
  const podium = (res?.players || []).slice(0, 3).map(p => `<div class="listitem"><span><bdi dir="ltr">${p.rank}.</bdi> ${p.avatar} <span dir="auto">${esc(p.name)}</span></span><strong dir="ltr">⭐ ${p.points}</strong></div>`).join('');
  const confetti = Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 4.3) % 100}%;animation-delay:${(i % 8) * 0.18}s;background:${['#e21b3c', '#1368ce', '#d89e00', '#26890c', '#6d4ce0'][i % 5]}"></i>`).join('');
  return `<div class="card student-end celebrate"><div class="confetti" aria-hidden="true">${confetti}</div><div class="center"><div class="emoji" aria-hidden="true">🏆</div><h1>${rs('celebrate')}</h1>
    <div class="stat-grid"><div class="stat-card"><strong dir="ltr">⭐ ${mine?.points ?? 0}</strong><span>${rs('yourScore')}</span></div><div class="stat-card"><strong dir="ltr">#${mine?.rank ?? '–'}</strong><span>${rs('yourRank')}</span></div><div class="stat-card"><strong dir="ltr">${pctText(mine?.accuracy)}</strong><span>${rs('yourAccuracy')}</span></div></div>
    <p class="feedback" role="status">${rs(feedbackKey(mine))}</p></div>
    <h2>🎖️ ${rs('achievements')}</h2>${badgeList(mine?.badges || [])}
    ${res ? `<h2>🌟 ${rs('crewTitle')}</h2><p>${rs('crewText', { answers: res.questions.reduce((n, q) => n + q.answered, 0), accuracy: pctText(res.classAccuracy) })}</p>` : ''}
    <h2>${rs('podium')}</h2><div class="list">${podium}</div><div class="actions">${btn(rs('backHome'), 'home', 'btn secondary')}</div></div>`;
}
function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // neutralise spreadsheet formulas from student-controlled text
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function downloadResults() {
  const r = room(); const res = r?.results; if (!res) return;
  const rows = [
    [rs('teacherTitle'), r.title, r.code], [],
    [rs('participants'), res.participants], [rs('questionsPlayed'), `${res.questionsPlayed}/${res.questionsTotal}`], [rs('classAccuracy'), pctText(res.classAccuracy)], [],
    [rs('question'), rs('answered'), rs('correct'), rs('accuracy')], ...res.questions.map(q => [q.q, q.answered, q.correct, pctText(q.accuracy)]), [],
    [rs('teamCol'), rs('members'), rs('score'), rs('accuracy')], ...res.teams.map(tm => [rs('team_' + tm.id), tm.members, tm.points, pctText(tm.accuracy)]), [],
    [rs('rank'), rs('player'), rs('teamCol'), rs('score'), rs('correct'), rs('accuracy'), rs('badgesCol')], ...res.players.map(p => [p.rank, p.name, rs('team_' + p.team), p.points, `${p.correct}/${p.answered}`, pctText(p.accuracy), p.badges.map(b => rs('badge_' + b)).join(' | ')])
  ];
  const blob = new Blob(['\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${rs('csvName')}-${r.code}.csv`;
  document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  toast(rs('downloaded'));
}
function teacherScreen(r) {
  const finished = r.stage === 'finished';
  const inLobby = r.stage === 'lobby';
  const activeQuestion = r.questions[r.activeQuestion];
  const nextIndex = r.activeQuestion + 1;
  const progress = r.activeQuestion >= 0 ? `<bdi dir="ltr">${r.activeQuestion + 1} / ${r.questions.length}</bdi>` : `<bdi dir="ltr">0 / ${r.questions.length}</bdi>`;
  const studentList = r.students.length
    ? r.students.map(student => `<div class="listitem"><span>${student.avatar} <span dir="auto">${esc(student.name)}</span>${student.connected === false ? ` <small class="muted">(${rs('offline')})</small>` : ''}</span><strong>⭐ ${student.points} ${g('points')}</strong>${btn(rs('remove'),'kick:'+student.id,'btn secondary small')}</div>`).join('')
    : `<p class="muted">${g('noStudents')}</p>`;
  const scoreboard = [...r.students].sort((a, b) => b.points - a.points)
    .map((student, index) => `<div class="listitem"><span>${index + 1}. ${student.avatar} ${esc(student.name)}</span><strong>⭐ ${student.points}</strong></div>`).join('');
  let playPanel;

  if (finished) {
    playPanel = teacherResults(r);
  } else if (inLobby) {
    playPanel = `<div class="card lobby-card"><span class="eyebrow">${g('ready')}</span><h2>${g('join')}</h2><button class="room-code" data-action="copy" aria-label="${site('copyRoomCode')}" dir="ltr">${esc(r.code)}</button><p class="copy-hint">${g('tapCopy')}</p><a class="join-link" href="/?room=${encodeURIComponent(r.code)}" target="_blank" rel="noopener">${g('joinLink')} ↗</a><h3>${g('students')} · <bdi dir="ltr">${r.students.length}</bdi></h3><div class="list">${studentList}</div></div>
      <div class="card"><h2>🎯 ${t('questions')} · ${r.questions.length}</h2><p class="muted">${g('waiting')}</p><div class="question-plan">${r.questions.map((question, index) => `<div class="listitem"><span>${esc(question.q)}</span>${btn(index === 0 ? g('start') : g('startHere'),'launch:'+question.index,index === 0 ? 'btn primary-action' : 'btn secondary')}</div>`).join('')}</div></div>
      <details class="card"><summary>${g('addQuestion')}</summary>${qForm('t')}</details>`;
  } else if (r.stage === 'question') {
    const counts = r.answerCounts?.[r.activeQuestion] || [];
    playPanel = `<div class="card live-question"><div class="question-progress">${g('question')} ${progress}<span class="content-language">${site('contentLanguage')}: <bdi dir="ltr">${site('english')}</bdi></span></div><h2 class="bigq" lang="${esc(r.contentLanguage||'en')}" dir="auto">${esc(activeQuestion?.q || '')}</h2><div class="answer-results">${(activeQuestion?.options || []).map((option, index) => `<div class="listitem"><span dir="auto"><bdi dir="ltr">${String.fromCharCode(65 + index)}</bdi> · ${esc(option)}</span><strong dir="ltr">${counts[index] || 0}</strong></div>`).join('')}</div><div class="notice live-count"><bdi dir="ltr">${r.answersCount} / ${r.students.length}</bdi> ${g('answered')}</div><p class="muted">${g('waitingReveal')}</p>${btn(g('reveal'),'reveal','btn primary-action')}${btn(g('finish'),'finish','btn danger')}</div>`;
  } else if (r.stage === 'reveal') {
    const counts = r.answerCounts?.[r.activeQuestion] || [];
    const answer = state.revealed;
    const nextButton = nextIndex < r.questions.length ? btn(g('next'),'launch:'+nextIndex,'btn primary-action') : btn(g('finish'),'finish','btn primary-action');
    playPanel = `<div class="card revealed-question"><div class="question-progress">${g('question')} ${progress}<span class="content-language">${site('contentLanguage')}: <bdi dir="ltr">${site('english')}</bdi></span></div><h2 class="bigq" lang="${esc(r.contentLanguage||'en')}" dir="auto">${esc(activeQuestion?.q || '')}</h2><h3 class="correct-label">✅ ${g('correct')}</h3><div class="answer-results">${(activeQuestion?.options || []).map((option, index) => `<div class="listitem ${answer === index ? 'correct-option' : ''}"><span dir="auto"><bdi dir="ltr">${String.fromCharCode(65 + index)}</bdi> · ${esc(option)}</span><strong dir="ltr">${counts[index] || 0}</strong></div>`).join('')}</div>${nextButton}${nextIndex < r.questions.length ? btn(g('finish'),'finish','btn secondary') : ''}</div>`;
  } else if (r.stage === 'storyResult') {
    playPanel = `<div class="card"><div class="center"><div class="emoji">${r.storyChoice === 'door' ? '🚪' : '🌉'}</div><h2>${t('results')} ${t(r.storyChoice)}</h2></div>${nextIndex < r.questions.length ? btn(g('next'),'launch:'+nextIndex,'btn primary-action') : btn(g('finish'),'finish','btn primary-action')}${nextIndex < r.questions.length ? btn(g('finish'),'finish','btn secondary') : ''}</div>`;
  } else {
    playPanel = `<div class="card"><h2>${t('journey')}</h2><p class="muted">${t('door')}: ${Object.values(r.storyVotes).filter(v => v === 'door').length} · ${t('bridge')}: ${Object.values(r.storyVotes).filter(v => v === 'bridge').length}</p>${btn(g('revealStory'),'storyReveal','btn primary-action')}${btn(g('next'),`launch:${Math.max(0,nextIndex)}`,'btn secondary')}${btn(g('finish'),'finish','btn danger')}</div>`;
  }

  const status = finished ? g('finished') : inLobby ? g('lobbyStatus') : r.stage === 'reveal' ? g('revealedStatus') : g('liveStatus');
  return `<div class="section-head"><div><h1>🪄 ${t('teacher')}</h1><p class="muted" dir="auto">${esc(r.title)}</p></div><span class="portal-tag">${g('students')}: <bdi dir="ltr">${r.students.length}</bdi></span></div><div class="notice game-status">${status}</div>
    <div class="teacher-game"><div class="teacher-main">${playPanel}</div><aside class="teacher-side">${finished ? '' : `<div class="card projector-card"><h2>📽️ ${pj('projectorSection')}</h2><p class="muted">${pj('projectorHelp')}</p>${btn(pj('openProjector'),'openProjector','btn secondary')}<label class="timer-field" for="timer">${pj('timer')}</label><select id="timer">${[0,10,20,30,60].map(s => `<option value="${s}"${s === r.timeLimit ? ' selected' : ''}>${s ? s + ' ' + pj('seconds') : pj('timerOff')}</option>`).join('')}</select></div>`}${!inLobby && !finished ? `<div class="card"><h2>${g('score')}</h2><div class="list">${studentList}</div></div>` : ''}${r.proposals.length ? `<details class="card moderation-card" open><summary>${rs('moderation')} (${r.proposals.length})</summary><p class="muted">${rs('moderationHelp')}</p><div class="list">${r.proposals.map(proposal => `<div class="proposal"><p><strong dir="auto">${esc(proposal.by)}</strong>: <span dir="auto">${esc(proposal.q)}</span></p><ol class="proposal-options">${proposal.options.map((o, i) => `<li${i === proposal.answer ? ' class="correct-option"' : ''} dir="auto">${esc(o)}${i === proposal.answer ? ' ✓' : ''}</li>`).join('')}</ol><div class="actions">${btn(t('approve'),'approve:'+proposal.id,'btn secondary')}${btn(rs('reject'),'reject:'+proposal.id,'btn danger')}</div></div>`).join('')}</div></details>` : ''}${r.stage === 'reveal' ? `<details class="card"><summary>${t('questions')}</summary><div class="list">${r.questions.map(question => `<div class="listitem"><span>${esc(question.q)}</span>${btn(g('launch'),'launch:'+question.index,'btn secondary')}</div>`).join('')}</div></details>` : ''}${!inLobby && !finished ? `<details class="card"><summary>${g('extras')}</summary><div class="actions">${btn(t('story'),'story','btn secondary')}${btn(t('meteor'),'surprise:meteor','btn secondary')}${btn(t('bonus'),'surprise:bonus','btn secondary')}${btn(t('dance'),'surprise:dance','btn secondary')}</div></details>` : ''}</aside></div>`;
}
function studentScreen(r, me) {
  const active = r.questions[r.activeQuestion];
  const answer = state.revealed;
  let playPanel;
  if (r.stage === 'question' || r.stage === 'reveal') {
    playPanel = `<div class="card student-question"><div class="question-progress">${g('question')} <bdi dir="ltr">${r.activeQuestion + 1} / ${r.questions.length}</bdi><span class="content-language">${site('contentLanguage')}: <bdi dir="ltr">${site('english')}</bdi></span></div><h1 class="bigq" lang="${esc(r.contentLanguage||'en')}" dir="auto">${esc(active?.q || '')}</h1><p class="muted">${r.stage === 'reveal' ? g('studentReveal') : me?.answered ? g('submitted') : g('studentLive')}</p><div class="student-answers">${(active?.options || []).map((option, index) => `<button class="answer answer-color-${index} ${r.stage === 'reveal' && answer === index ? 'correct' : ''} ${state.lastResult?.index === r.activeQuestion && state.lastResult?.choice === index ? 'selected' : ''}" aria-label="${esc(t('answerOption',{number:index+1,answer:option}))}" data-answer="${index}" ${me?.answered || r.stage === 'reveal' ? 'disabled' : ''}><span dir="ltr">${String.fromCharCode(65 + index)}</span><span class="option-label" dir="auto">${esc(option)}</span></button>`).join('')}</div></div>`;
  } else if (r.stage === 'finished') {
    playPanel = studentResults(r, me);
  } else if (r.stage === 'story') {
    playPanel = `<div class="card"><h2>🗺️ ${t('journey')}</h2><div class="grid"><button class="answer storyopt" data-vote="door">🚪 ${t('door')}</button><button class="answer storyopt" data-vote="bridge">🌉 ${t('bridge')}</button></div></div>`;
  } else if (r.stage === 'storyResult') {
    playPanel = `<div class="card center"><div class="emoji">${r.storyChoice === 'door' ? '🚪' : '🌉'}</div><h2>${t('results')} ${t(r.storyChoice)}</h2></div>`;
  } else {
    playPanel = `<div class="card student-waiting"><div class="emoji">🚀</div><h1>${g('studentLobby')}</h1><p class="muted">${g('codeLabel')}: <strong class="inline-room-code">${esc(r.code)}</strong></p></div>`;
  }
  const ended = r.stage === 'finished';
  return `<div class="section-head"><div><h1>🚀 <span dir="auto">${esc(r.title)}</span></h1><p class="muted">${me?.avatar || '⭐'} <span dir="auto">${esc(me?.name || t('anonymousStudent'))}</span> · ⭐ <bdi dir="ltr">${me?.points || 0}</bdi></p></div><span class="portal-tag" dir="ltr">${esc(r.code)}</span></div><div class="student-game"><main>${playPanel}</main>${!ended ? `<aside class="student-tools"><details class="card"><summary>${t('propose')}</summary><p class="muted">${t('proposalNotice')}</p>${qForm('p')}</details><details class="card"><summary>${g('score')}</summary><div class="list">${[...r.students].sort((a,b)=>b.points-a.points).map((student,index)=>`<div class="listitem"><span><bdi dir="ltr">${index+1}.</bdi> ${student.avatar} <span dir="auto">${esc(student.name)}</span></span><strong>⭐ <bdi dir="ltr">${student.points}</bdi></strong></div>`).join('')}</div></details></aside>` : ''}</div>`;
}
function render() {
  document.documentElement.lang = state.lang; document.documentElement.dir = window.CLASSVERSE_I18N.direction(state.lang);
  document.title = site('pageTitle');
  const description = document.querySelector('meta[name="description"]');
  if(description)description.content=site('homeText');
  document.body.classList.toggle('rtl', ['he','ar'].includes(state.lang));
  let content='';
  if(state.page==='home') content=landingPage();
  if(state.page==='library') content=libraryPage();
  if(state.page==='gamePreview') content=previewPage(state.selectedGame);
  if(state.page==='teacherForm') content=`<main class="form-page"><div class="section-head"><div><p class="game-subject">${site('teacherTag')}</p><h1>🪄 ${site('teacherForm')}</h1></div>${btn('← '+site('back'),'home','btn secondary')}</div><div class="card stack">${field('title',t('classroom'),state.dbGame?state.dbGame.title:localized(catalog[state.selectedGame].title))}<label>${t('world')}</label><div class="worlds">${Object.entries(icons).map(([k,v])=>`<button class="worldbtn ${state.avatar===k?'active':''}" data-world="${k}">${v} ${t(k)}</button>`).join('')}</div>${btn(t('create')+' ✨','create','btn primary-action')}</div></main>`;
  if(state.page==='studentForm') content=`<main class="form-page student-form-page"><div class="section-head"><div><p class="game-subject">${site('studentTag')}</p><h1>🚀 ${site('joinForm')}</h1></div>${btn('← '+site('back'),'home','btn secondary')}</div><div class="card stack">${field('joincode',t('code'),new URLSearchParams(location.search).get('room')||'',t('enterCode'))}${field('nickname',t('nickname'))}<p class="privacy-note">🔒 ${rs('privacy')}</p><label>${t('choose')}</label><div class="avatars">${['🚀','🪐','⭐','👾','🌙','☄️','🦊','🐙'].map(a=>`<button class="avatar ${state.avatar===a?'selected':''}" data-avatar="${a}">${a}</button>`).join('')}</div>${btn(t('enter')+' →','join','btn primary-action')}</div></main>`;
  if(state.page==='acct') content=window.CLASSVERSE_ACCOUNT.render();
  if(state.page==='teacher' && room()) content=teacherScreen(room());
  if(state.page==='student' && room()) content=studentScreen(room(),room().students.find(student=>student.id===state.me));
  app.innerHTML=`<div class="app">${state.online===false?`<div class="offline-banner" role="alert">${rs('reconnecting')}</div>`:''}${renderNavigation()}${content}${renderFooter()}${state.page==='student'||state.page==='studentForm'?'<div class="student-sparkle" aria-hidden="true">✦</div>':''}</div>`;
  refreshGameInterface();
}
function refreshGameInterface() {
  const copy = Object.fromEntries([
    'teacherPortal','studentPortal','teacherLobby','teacherLive','teacherFinished',
    'studentLobby','studentLive','studentFinished','startGame','launchChallenge','endGame'
  ].map(key => [key, g(key)]));
  const portals = app.querySelectorAll('.role');
  portals.forEach((card, index) => {
    card.classList.add(index === 0 ? 'teacher-portal' : 'student-portal');
    const label = document.createElement('span');
    label.className = 'portal-label';
    label.textContent = index === 0 ? copy.teacherPortal : copy.studentPortal;
    card.prepend(label);
  });
  if (!['teacher', 'student'].includes(state.page) || !room()) return;
  if(state.page==='teacher') return;
  const r = room();
  const phase = r.stage === 'finished' ? 'Finished' : r.stage === 'lobby' ? 'Lobby' : 'Live';
  const message = copy[`${state.page}${phase}`];
  const notice = document.createElement('div');
  notice.className = `notice game-status game-status-${r.stage}`;
  notice.setAttribute('role', 'status');
  notice.textContent = message;
  app.querySelector('.section-head')?.insertAdjacentElement('afterend', notice);
  const ended = r.stage === 'finished';
  if (state.page === 'student') {
    if (ended) {
      const proposalForm = app.querySelector('#pq')?.closest('.card');
      if (proposalForm) proposalForm.hidden = true;
    }
    return;
  }
  const waiting = r.stage === 'lobby';
  app.querySelectorAll('[data-action^="launch:"]').forEach(button => {
    button.textContent = `${waiting ? copy.startGame : copy.launchChallenge} →`;
    button.hidden = ended;
  });
  const finish = app.querySelector('[data-action="finish"]');
  if (finish) {
    finish.textContent = copy.endGame;
    finish.hidden = waiting || ended;
  }
  ['story', 'surprise:meteor', 'surprise:bonus', 'surprise:dance'].forEach(action => {
    const button = app.querySelector(`[data-action="${action}"]`);
    if (button) button.hidden = waiting || ended;
  });
  if (ended) {
    const teacherQuestionForm = app.querySelector('#tq')?.closest('.card');
    const studentQuestionForm = app.querySelector('#pq')?.closest('.card');
    if (teacherQuestionForm) teacherQuestionForm.hidden = true;
    if (studentQuestionForm) studentQuestionForm.hidden = true;
    app.querySelectorAll('[data-action^="approve:"]').forEach(button => { button.hidden = true; });
  }
}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2800)}
function send(event, data, cb=()=>{}){
  let done=false;document.body.setAttribute('aria-busy','true');
  const timeout=setTimeout(()=>{if(!done){done=true;document.body.removeAttribute('aria-busy');toast(errorText('connectionFailed'))}},8000);
  socket.emit(event,data,res=>{if(done)return;done=true;clearTimeout(timeout);document.body.removeAttribute('aria-busy');if(!res?.ok)toast(errorText(res?.error||'requestFailed'));else cb(res)})
}
function readQuestion(prefix){return {q:document.getElementById(prefix+'q')?.value,options:[0,1,2,3].map(i=>document.getElementById(prefix+'o'+i)?.value),answer:Number(document.getElementById(prefix+'answer')?.value)}}
function act(action){
  const ACC=window.CLASSVERSE_ACCOUNT;
  if(ACC.handle(action))return;
  if((action==='teacherForm'||action.startsWith('hostGame:')||(action==='teacher'&&!(state.role==='teacher'&&room())))&&ACC.guard(()=>act(action.startsWith('hostGame:')?action:'teacherForm')))return;
  if(action==='home'||action==='library'||action==='teacherForm'||action.startsWith('hostGame:'))state.dbGame=null;
  if(action==='teacher'){state.page=state.role==='teacher'&&room()?'teacher':'teacherForm';render();return}
  if(action==='student'){state.page=state.role==='student'&&room()?'student':'studentForm';render();return}
  if(['home','library','teacherForm','studentForm'].includes(action)){state.page=action;if(action==='home')state.avatar='🚀';if(action==='teacherForm'){if(!catalog[state.selectedGame])state.selectedGame='space';state.avatar=catalog[state.selectedGame].world}if(action==='studentForm')state.avatar='🚀';render();return}
  if(action==='newroom'){sessionStorage.removeItem('cv_teacher');state.role=null;state.code=null;state.teacherToken=null;state.room=null;state.selectedGame='space';state.page='teacherForm';render();return}
  if(action.startsWith('previewGame:')){const gameId=action.slice(12);if(!catalog[gameId])return;state.selectedGame=gameId;state.avatar=catalog[gameId].world;state.page='gamePreview';render();return}
  if(action.startsWith('hostGame:')){const gameId=action.slice(9);if(!catalog[gameId])return;state.selectedGame=gameId;state.avatar=catalog[gameId].world;state.page='teacherForm';render();return}
  if(action==='create'){const title=document.getElementById('title').value,world=['space','forest','ocean','castle'].includes(state.avatar)?state.avatar:'space',dbGame=state.dbGame;ACC.token().then(token=>send('teacher:create',{token,title,gameId:dbGame?undefined:state.selectedGame,dbGameId:dbGame?.id,world},res=>{state.role='teacher';state.page='teacher';state.code=res.code;state.teacherToken=res.teacherToken;sessionStorage.setItem('cv_teacher',JSON.stringify({code:res.code,token:res.teacherToken}));render()}));return}
  if(action==='join'){const code=document.getElementById('joincode').value.trim();const nickname=document.getElementById('nickname').value.trim();if(!code){toast(t('codeRequired'));return}if(!nickname){toast(t('nicknameRequired'));return}send('student:join',{code,name:nickname,avatar:state.avatar},res=>{state.role='student';state.page='student';state.code=res.code;state.me=res.id;sessionStorage.setItem('cv_student',JSON.stringify({code:res.code,token:res.token}));render()});return}
  if(action==='copy'){if(!navigator.clipboard){toast(errorText('clipboardUnavailable'));return}navigator.clipboard.writeText(state.code).then(()=>toast(g('copied'))).catch(()=>toast(errorText('clipboardUnavailable')));return}
  if(action==='addQuestion'){send('teacher:addQuestion',readQuestion('t'),()=>toast(t('saved')));return}
  if(action==='propose'){send('student:propose',readQuestion('p'),()=>toast(t('saved')));return}
  if(action.startsWith('launch:')){state.revealed=null;send('teacher:launch',Number(action.split(':')[1]));return}
  if(action.startsWith('approve:')){send('teacher:approve',action.slice(8),()=>toast(t('saved')));return}
  if(action.startsWith('surprise:')){send('teacher:surprise',action.slice(9));return}
  if(action==='download'){downloadResults();return}
  if(action.startsWith('kick:')){if(window.confirm(rs('removeConfirm')))send('teacher:kick',action.slice(5));return}
  if(action.startsWith('reject:')){send('teacher:reject',action.slice(7));return}
  if(action==='openProjector'){window.open('/projector?code='+encodeURIComponent(state.code)+'&lang='+state.lang,'classverse-projector','popup,width=1280,height=720');return}
  const events={reveal:'teacher:reveal',story:'teacher:story',storyReveal:'teacher:storyReveal',finish:'teacher:finish'};
  if(events[action])send(events[action],null);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action],[data-world],[data-avatar],[data-answer],[data-vote]');if(!b)return;
  if(b.tagName==='A'&&b.dataset.action)e.preventDefault();
  if(b.dataset.action)act(b.dataset.action);
  if(b.dataset.world){state.avatar=b.dataset.world;render()}
  if(b.dataset.avatar){state.avatar=b.dataset.avatar;render()}
  if(b.dataset.answer!==undefined){const index=room()?.activeQuestion;const choice=Number(b.dataset.answer);send('student:answer',choice,res=>{state.lastResult={index,choice,correct:res.correct};toast(res.correct?t('correct'):t('incorrect'));render()})}
  if(b.dataset.vote)send('student:vote',b.dataset.vote,()=>toast(t('saved')));
});
document.addEventListener('change',e=>{if(e.target.id==='timer'){send('teacher:setTimer',Number(e.target.value));return}if(e.target.id==='lang'&&window.CLASSVERSE_I18N.languages.includes(e.target.value)){state.lang=e.target.value;localStorage.setItem('classverse_lang',state.lang);window.CLASSVERSE_ACCOUNT.languageChanged();render();document.getElementById('lang')?.focus()}});
socket.on('room:state',r=>{state.room=r; if(state.page==='teacher'||state.page==='student')render()});
socket.on('question:reveal',({answer})=>{state.revealed=answer;toast('✨ '+t('reveal'));render()});
socket.on('surprise',s=>{const k={meteor:t('meteor'),bonus:t('bonus'),dance:t('dance')};toast(k[s.kind]||'✨')});
socket.on('connect_error',()=>toast(errorText('connectionFailed')));
socket.on('kicked',()=>{sessionStorage.removeItem('cv_student');state.role=null;state.room=null;state.code=null;state.page='home';render();toast(errorText('kicked'))});
socket.on('disconnect',()=>{state.online=false;render()});
function restoreStudent(saved){socket.emit('student:rejoin',saved,res=>{if(!res?.ok){sessionStorage.removeItem('cv_student');return}state.role='student';state.page='student';state.code=res.code;state.me=res.id;render()})}
socket.on('connect',()=>{const wasOffline=state.online===false;state.online=true;if(wasOffline)render();
  if(state.role==='student'&&state.code){try{const saved=JSON.parse(sessionStorage.getItem('cv_student'));if(saved?.token)restoreStudent(saved)}catch{}}
  else if(state.role==='teacher'&&state.teacherToken&&state.code){send('teacher:resume',{code:state.code,token:state.teacherToken})}
  else if(!state.role){try{const saved=JSON.parse(sessionStorage.getItem('cv_teacher'));if(saved?.code&&saved?.token){send('teacher:resume',saved,res=>{state.role='teacher';state.page='teacher';state.code=res.code;state.teacherToken=saved.token;render()});return}}catch{}
    try{const savedStudent=JSON.parse(sessionStorage.getItem('cv_student'));if(savedStudent?.token)restoreStudent(savedStudent)}catch{}}});
if(new URLSearchParams(location.search).has('room')){state.page='studentForm';state.avatar='🚀'}
render();
window.CLASSVERSE_ACCOUNT.init({state,rerender:render,toast});
