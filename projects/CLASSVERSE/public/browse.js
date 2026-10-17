/* CLASSVERSE subject and grade browser. Keeps its own filter state; app.js delegates rendering and events here. */
(function () {
'use strict';
const X = window.CLASSVERSE_TAXONOMY;
const STORE = 'cv_custom_subjects';
const FILTER_KEYS = ['level', 'grade', 'subject', 'topic', 'language', 'difficulty', 'type'];
const B = { filters: {}, open: null, custom: [] };

try {
  const saved = JSON.parse(localStorage.getItem(STORE) || '[]');
  if (Array.isArray(saved)) B.custom = saved.map(s => X.normalizeCustomSubject({ name: s.name?.en, icon: s.icon, from: s.topics?.[0]?.from, to: s.topics?.[0]?.to, topics: (s.topics || []).map(t => t.name?.en).join('\n'), objective: s.topics?.[0]?.objective?.en }, []).subject).filter(Boolean).map((s, i) => ({ ...s, id: saved[i].id, topics: s.topics.map((t, n) => ({ ...t, id: `${saved[i].id}.t${n + 1}`, subject: saved[i].id })) }));
} catch { B.custom = []; }

const subjects = () => [...X.SUBJECTS, ...B.custom];
const pick = (item, lang) => item[lang] || item.en;
const persist = () => { try { localStorage.setItem(STORE, JSON.stringify(B.custom)); } catch { /* storage unavailable */ } };

function normalizeFilters() {
  const f = B.filters;
  if (f.grade && f.level && X.levelOfGrade(Number(f.grade)) !== f.level) delete f.grade;
  if (f.topic) {
    const topic = subjects().flatMap(s => s.topics).find(t => t.id === f.topic);
    if (!topic || (f.subject && topic.subject !== f.subject)) delete f.topic;
  }
}
const activeFilters = () => {
  const f = {};
  FILTER_KEYS.forEach(k => { if (B.filters[k]) f[k] = k === 'grade' ? Number(B.filters[k]) : B.filters[k]; });
  return f;
};

function gradeRange(from, to, lang) {
  if (from === to) return X.gradeLabel(from, lang);
  if (lang === 'en' && to <= 12) return `Grades ${from}–${to}`;
  return `${X.gradeLabel(from, lang)} – ${X.gradeLabel(to, lang)}`;
}

function page(ctx) {
  const { lang, esc, tr, localizedGame, catalog } = ctx;
  const b = (key, values) => tr('browse', key, values);
  normalizeFilters();
  const f = activeFilters();
  const all = subjects();
  const result = X.search(all, X.GAMES, f);
  const topicTotal = result.subjects.reduce((n, s) => n + s.topics.length, 0);

  const option = (value, label, current) => `<option value="${esc(value)}" ${String(current) === String(value) ? 'selected' : ''}>${esc(label)}</option>`;
  const select = (key, label, anyLabel, options) => `<label class="bf-field" for="bf-${key}"><span>${esc(label)}</span><select id="bf-${key}"><option value="">${esc(anyLabel)}</option>${options}</select></label>`;
  const level = X.LEVELS.find(l => l.id === f.level);
  const grades = X.GRADES.filter(g => !level || (g >= level.from && g <= level.to));
  const topicOptions = all.filter(s => !f.subject || s.id === f.subject).map(s => `<optgroup label="${esc(pick(s.name, lang))}">${s.topics.map(t => option(t.id, pick(t.name, lang), f.topic)).join('')}</optgroup>`).join('');
  const groupName = s => s.custom ? b('custom') : pick(X.GROUPS.find(g => g.id === s.group).name, lang);
  const typeName = id => pick(X.GAME_TYPES.find(t => t.id === id).name, lang);
  const typeOf = id => X.GAME_TYPES.find(t => t.id === id);

  const filters = `<form class="bf-bar card" aria-label="${esc(b('filters'))}" onsubmit="return false">
    ${select('level', b('level'), b('allLevels'), X.LEVELS.map(l => option(l.id, `${l.icon} ${pick(l.name, lang)}`, f.level)).join(''))}
    ${select('grade', b('grade'), b('allGrades'), grades.map(g => option(g, X.gradeLabel(g, lang), f.grade)).join(''))}
    ${select('subject', b('subject'), b('allSubjects'), all.map(s => option(s.id, `${s.icon} ${pick(s.name, lang)}`, f.subject)).join(''))}
    ${select('topic', b('topic'), b('allTopics'), topicOptions)}
    ${select('language', b('language'), b('allLanguages'), X.LANGUAGES.map(l => option(l.id, pick(l.name, lang), f.language)).join(''))}
    ${select('difficulty', b('difficulty'), b('allDifficulties'), X.DIFFICULTIES.map(d => option(d.id, `${d.icon} ${pick(d.name, lang)}`, f.difficulty)).join(''))}
    ${select('type', b('type'), b('allTypes'), X.GAME_TYPES.map(t => option(t.id, `${t.icon} ${pick(t.name, lang)}`, f.type)).join(''))}
    <button type="button" class="btn secondary bf-reset" data-action="browse:reset">${esc(b('reset'))}</button>
  </form>`;

  const diffChips = topic => topic.difficulty.map(d => { const def = X.DIFFICULTIES.find(x => x.id === d); return `<span class="bf-chip bf-diff-${d}">${def.icon} ${esc(pick(def.name, lang))}</span>`; }).join('');

  const subjectCard = ({ subject: s, topics }) => {
    const from = Math.min(...topics.map(t => t.from)), to = Math.max(...topics.map(t => t.to));
    const isOpen = B.open === s.id;
    const types = s.gameTypes.map(id => `<span class="bf-chip ${typeOf(id).playable ? 'bf-playable' : ''}" title="${esc(typeOf(id).playable ? b('playableNow') : b('suggestionOnly'))}">${typeOf(id).icon} ${esc(typeName(id))}</span>`).join('');
    const lang2 = s.languages ? s.languages.map(id => pick(X.LANGUAGES.find(l => l.id === id).name, lang)).join(', ') : null;
    return `<article class="subject-card subject-${s.tint}${isOpen ? ' open' : ''}">
      <header><span class="subject-icon" aria-hidden="true">${esc(s.icon)}</span><div><p class="game-subject">${esc(groupName(s))}</p><h3>${esc(pick(s.name, lang))}</h3></div></header>
      <p class="subject-meta"><span>🎚️ <bdi>${esc(gradeRange(from, to, lang))}</bdi></span><span>📚 ${esc(b('topicsCount', { n: topics.length }))}</span>${lang2 ? `<span>🌐 ${esc(b('taughtIn', { language: lang2 }))}</span>` : ''}</p>
      <p class="subject-types-label">${esc(b('suggested'))}</p><div class="bf-chips">${types}</div>
      <div class="subject-actions"><button class="btn secondary" data-action="browse:toggle:${esc(s.id)}" aria-expanded="${isOpen}" aria-controls="topics-${esc(s.id)}">${esc(isOpen ? b('close') : b('open'))}</button>${s.custom ? `<button class="btn danger-soft" data-action="browse:delete:${esc(s.id)}">${esc(b('delete'))}</button>` : ''}</div>
      ${isOpen ? `<div class="subject-topics" id="topics-${esc(s.id)}"><h4>${esc(b('topicsHeading'))}</h4><ul>${topics.map(t => `<li class="${f.topic === t.id ? 'is-selected' : ''}"><div><strong>${esc(pick(t.name, lang))}</strong><span class="bf-grades"><bdi>${esc(gradeRange(t.from, t.to, lang))}</bdi></span></div><p><em>${esc(b('objectives'))}:</em> ${esc(pick(t.objective, lang))}</p><div class="bf-chips">${diffChips(t)}</div><button class="btn secondary bf-small" data-action="browse:topic:${esc(t.id)}">${esc(f.topic === t.id ? b('selected') : b('gamesFor'))}</button></li>`).join('')}</ul></div>` : ''}
    </article>`;
  };

  const gameCard = game => {
    const meta = catalog[game.id];
    const sub = all.find(s => s.id === game.subject);
    const topicNames = game.topics.map(id => { const t = sub.topics.find(x => x.id === id); return t ? pick(t.name, lang) : ''; }).filter(Boolean);
    const diff = X.DIFFICULTIES.find(d => d.id === game.difficulty);
    const langName = pick(X.LANGUAGES.find(l => l.id === game.language).name, lang);
    return `<article class="game-card game-${meta.tint}"><div class="game-art"><span aria-hidden="true">${meta.icon}</span><span class="game-level">${esc(gradeRange(game.from, game.to, lang))}</span></div><div class="game-card-content"><p class="game-subject">${esc(pick(sub.name, lang))}</p><h3>${esc(localizedGame(meta.title))}</h3><p class="game-description">${esc(topicNames.join(' · '))}</p><div class="bf-chips"><span class="bf-chip bf-diff-${game.difficulty}">${diff.icon} ${esc(pick(diff.name, lang))}</span><span class="bf-chip">🌐 ${esc(langName)}</span>${game.types.map(id => `<span class="bf-chip">${typeOf(id).icon} ${esc(typeName(id))}</span>`).join('')}</div><div class="game-meta"><span>❓ <bdi dir="ltr">${game.questions}</bdi> ${esc(b('questions'))}</span><button class="btn secondary" data-action="previewGame:${esc(game.id)}">${esc(tr('site', 'preview'))}</button></div></div></article>`;
  };

  const gradeOpts = n => Array.from({ length: 17 }, (_, i) => option(i + 1, X.gradeLabel(i + 1, lang), n)).join('');
  const addForm = `<details class="card bf-add"><summary>➕ ${esc(b('addTitle'))}</summary><p class="muted">${esc(b('addIntro'))}</p><div class="bf-add-grid">
    <label class="bf-field" for="cs-name"><span>${esc(b('name'))}</span><input id="cs-name" maxlength="60" autocomplete="off"></label>
    <label class="bf-field" for="cs-icon"><span>${esc(b('icon'))}</span><input id="cs-icon" maxlength="4" placeholder="⭐"></label>
    <label class="bf-field" for="cs-from"><span>${esc(b('fromGrade'))}</span><select id="cs-from">${gradeOpts(1)}</select></label>
    <label class="bf-field" for="cs-to"><span>${esc(b('toGrade'))}</span><select id="cs-to">${gradeOpts(12)}</select></label>
    <label class="bf-field bf-wide" for="cs-topics"><span>${esc(b('topicsInput'))}</span><textarea id="cs-topics" rows="3" maxlength="600"></textarea></label>
    <label class="bf-field bf-wide" for="cs-objective"><span>${esc(b('objectiveInput'))}</span><input id="cs-objective" maxlength="200"></label></div>
    <p class="muted">${esc(b('localNote'))}</p><button class="btn primary-action" data-action="browse:add">${esc(b('save'))}</button></details>`;

  return `<main class="library-page browse-page"><section class="library-heading"><button class="back-link" data-action="home">← ${esc(tr('site', 'back'))}</button><p class="game-subject">${esc(b('eyebrow'))}</p><h1>${esc(b('title'))}</h1><p>${esc(b('intro'))}</p></section>
  ${filters}
  <p class="bf-summary" role="status" aria-live="polite">${esc(b('summary', { subjects: result.subjects.length, topics: topicTotal, games: result.games.length }))}</p>
  <section aria-labelledby="bf-subjects-h"><h2 id="bf-subjects-h">${esc(b('subjectsHeading'))}</h2>${result.subjects.length ? `<div class="subject-grid">${result.subjects.map(subjectCard).join('')}</div>` : `<div class="empty-state card"><p>${esc(b('noSubjects'))}</p><button class="btn secondary" data-action="browse:reset">${esc(b('reset'))}</button></div>`}</section>
  <section aria-labelledby="bf-games-h"><h2 id="bf-games-h">${esc(b('gamesHeading'))}</h2>${result.games.length ? `<div class="game-grid">${result.games.map(gameCard).join('')}</div>` : `<div class="empty-state card"><p>${esc(b('noGames'))}</p></div>`}</section>
  ${addForm}</main>`;
}

// Returns true when the action belongs to the browser; `done(messageKey)` shows a toast.
function action(name, ctx) {
  if (!name.startsWith('browse:')) return false;
  const [, verb, ...rest] = name.split(':');
  const arg = rest.join(':');
  if (verb === 'reset') { B.filters = {}; B.open = null; }
  else if (verb === 'toggle') B.open = B.open === arg ? null : arg;
  else if (verb === 'topic') { const t = subjects().flatMap(s => s.topics).find(x => x.id === arg); if (t) { B.filters.topic = t.id; B.filters.subject = t.subject; } }
  else if (verb === 'delete') {
    if (!B.custom.some(s => s.id === arg) || !window.confirm(ctx.tr('browse', 'deleteConfirm'))) return true;
    B.custom = B.custom.filter(s => s.id !== arg); persist();
    if (B.filters.subject === arg) delete B.filters.subject;
    ctx.toast(ctx.tr('browse', 'deleted'));
  } else if (verb === 'add') {
    const val = id => document.getElementById(id)?.value;
    const res = X.normalizeCustomSubject({ name: val('cs-name'), icon: val('cs-icon'), from: val('cs-from'), to: val('cs-to'), topics: val('cs-topics'), objective: val('cs-objective') }, subjects().map(s => s.id));
    if (!res.ok) { ctx.toast(ctx.tr('browse', res.error)); return true; }
    B.custom.push(res.subject); persist(); B.open = res.subject.id;
    ctx.toast(ctx.tr('browse', 'saved'));
  }
  ctx.render();
  return true;
}

function change(id, value, ctx) {
  if (!id.startsWith('bf-')) return false;
  const key = id.slice(3);
  if (!FILTER_KEYS.includes(key)) return false;
  if (value) B.filters[key] = value; else delete B.filters[key];
  if (key === 'subject') delete B.filters.topic;
  if (key === 'level') delete B.filters.grade;
  ctx.render();
  document.getElementById(id)?.focus();
  return true;
}

window.CLASSVERSE_BROWSE = { page, action, change, _state: B };
})();
