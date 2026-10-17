'use strict';
/* PostgreSQL (Neon) schema and data access. Works with any pg-compatible pool. Ids are generated here (uuid v4). */
const crypto = require('crypto');
const TAXONOMY = require('./public/taxonomy');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  clerk_id text NOT NULL UNIQUE,
  email text,
  display_name text NOT NULL DEFAULT '',
  image_url text,
  role text NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  group_id text NOT NULL,
  icon text,
  name_en text NOT NULL, name_he text NOT NULL, name_ar text NOT NULL,
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS topics (
  id text PRIMARY KEY,
  subject_id text NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  from_grade integer NOT NULL, to_grade integer NOT NULL,
  name_en text NOT NULL, name_he text NOT NULL, name_ar text NOT NULL,
  objective_en text, objective_he text, objective_ar text
);
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  objectives text NOT NULL DEFAULT '',
  subject_id text REFERENCES subjects(id) ON DELETE SET NULL,
  topic_id text REFERENCES topics(id) ON DELETE SET NULL,
  grade_from integer NOT NULL DEFAULT 1, grade_to integer NOT NULL DEFAULT 12,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en','he','ar')),
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','unlisted','public')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS games_owner_idx ON games(owner_id);
CREATE INDEX IF NOT EXISTS games_public_idx ON games(visibility, status);
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  position integer NOT NULL,
  type text NOT NULL DEFAULT 'multiple_choice',
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL,
  time_limit_sec integer NOT NULL DEFAULT 20,
  points integer NOT NULL DEFAULT 100
);
CREATE INDEX IF NOT EXISTS questions_game_idx ON questions(game_id, position);
CREATE TABLE IF NOT EXISTS favorites (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);
CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid PRIMARY KEY,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  builtin_key text,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_code text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  participant_count integer NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS game_results (
  id uuid PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  avatar text,
  score integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  answered_count integer NOT NULL DEFAULT 0
);
`;

const uuid = () => crypto.randomUUID();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = v => typeof v === 'string' && UUID_RE.test(v);
const VISIBILITY = ['private', 'unlisted', 'public'];
const STATUS = ['draft', 'published'];
const DIFFICULTY = ['easy', 'medium', 'hard'];
const LANGS = ['en', 'he', 'ar'];

const text = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

async function init(pool) {
  await pool.query(SCHEMA);
  for (const s of TAXONOMY.SUBJECTS) {
    await pool.query('INSERT INTO subjects (id, group_id, icon, name_en, name_he, name_ar) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING', [s.id, s.group, s.icon, s.name.en, s.name.he, s.name.ar]);
    for (const t of s.topics) {
      await pool.query('INSERT INTO topics (id, subject_id, from_grade, to_grade, name_en, name_he, name_ar, objective_en, objective_he, objective_ar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING', [t.id, s.id, t.from, t.to, t.name.en, t.name.he, t.name.ar, t.objective.en, t.objective.he, t.objective.ar]);
    }
  }
}

async function upsertUser(pool, { clerkId, email, name, imageUrl }) {
  const found = await pool.query('SELECT id FROM users WHERE clerk_id = $1', [clerkId]);
  if (found.rows.length) {
    await pool.query('UPDATE users SET email = $2, display_name = $3, image_url = $4, last_login_at = now() WHERE clerk_id = $1', [clerkId, email || null, text(name, 80), imageUrl || null]);
    return (await pool.query('SELECT * FROM users WHERE clerk_id = $1', [clerkId])).rows[0];
  }
  const id = uuid();
  await pool.query('INSERT INTO users (id, clerk_id, email, display_name, image_url) VALUES ($1,$2,$3,$4,$5)', [id, clerkId, email || null, text(name, 80), imageUrl || null]);
  return (await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0];
}

// Validates untrusted input. Returns { ok, value } or { ok:false, error } with a translation key.
async function validateGame(pool, input, { partial = false } = {}) {
  const v = {};
  const title = text(input?.title, 90);
  if (!title) return { ok: false, error: 'titleRequired' };
  v.title = title;
  v.description = text(input?.description, 300);
  v.objectives = text(input?.objectives, 400);
  v.difficulty = DIFFICULTY.includes(input?.difficulty) ? input.difficulty : 'medium';
  v.language = LANGS.includes(input?.language) ? input.language : 'en';
  v.visibility = VISIBILITY.includes(input?.visibility) ? input.visibility : 'private';
  v.status = STATUS.includes(input?.status) ? input.status : 'draft';
  const from = Math.min(17, Math.max(1, parseInt(input?.gradeFrom, 10) || 1));
  const to = Math.min(17, Math.max(from, parseInt(input?.gradeTo, 10) || 12));
  v.gradeFrom = from; v.gradeTo = to;
  v.subjectId = null; v.topicId = null;
  if (input?.subjectId) {
    const s = await pool.query('SELECT id FROM subjects WHERE id = $1', [String(input.subjectId)]);
    if (!s.rows.length) return { ok: false, error: 'subjectInvalid' };
    v.subjectId = s.rows[0].id;
  }
  if (input?.topicId) {
    const t = await pool.query('SELECT id, subject_id FROM topics WHERE id = $1', [String(input.topicId)]);
    if (!t.rows.length || (v.subjectId && t.rows[0].subject_id !== v.subjectId)) return { ok: false, error: 'topicInvalid' };
    v.topicId = t.rows[0].id; v.subjectId = v.subjectId || t.rows[0].subject_id;
  }
  const raw = Array.isArray(input?.questions) ? input.questions : [];
  if (raw.length > 50) return { ok: false, error: 'tooManyQuestions' };
  v.questions = [];
  for (const q of raw) {
    const prompt = text(q?.prompt, 240);
    const options = (Array.isArray(q?.options) ? q.options : []).map(o => text(o, 90));
    const correct = Number(q?.correctIndex);
    if (!prompt || options.length < 2 || options.length > 4 || options.some(o => !o) || !Number.isInteger(correct) || correct < 0 || correct >= options.length) return { ok: false, error: 'questionInvalid' };
    if (new Set(options.map(o => o.toLowerCase())).size !== options.length) return { ok: false, error: 'questionInvalid' };
    v.questions.push({ prompt, options, correctIndex: correct, timeLimit: Math.min(120, Math.max(5, parseInt(q?.timeLimit, 10) || 20)), points: Math.min(1000, Math.max(10, parseInt(q?.points, 10) || 100)) });
  }
  // Publishing requires at least one valid question; drafts may be empty.
  if (v.status === 'published' && !v.questions.length) return { ok: false, error: 'publishNeedsQuestions' };
  return { ok: true, value: v };
}

async function writeQuestions(client, gameId, questions) {
  await client.query('DELETE FROM questions WHERE game_id = $1', [gameId]);
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    await client.query('INSERT INTO questions (id, game_id, position, type, prompt, options, correct_index, time_limit_sec, points) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [uuid(), gameId, i, 'multiple_choice', q.prompt, JSON.stringify(q.options), q.correctIndex, q.timeLimit, q.points]);
  }
}

async function inTx(pool, fn) {
  const client = pool.connect ? await pool.connect() : pool;
  try {
    await client.query('BEGIN');
    const out = await fn(client);
    await client.query('COMMIT');
    return out;
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { if (client.release) client.release(); }
}

async function createGame(pool, ownerId, v) {
  const id = uuid();
  await inTx(pool, async c => {
    await c.query('INSERT INTO games (id, owner_id, title, description, objectives, subject_id, topic_id, grade_from, grade_to, difficulty, language, visibility, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)', [id, ownerId, v.title, v.description, v.objectives, v.subjectId, v.topicId, v.gradeFrom, v.gradeTo, v.difficulty, v.language, v.visibility, v.status]);
    await writeQuestions(c, id, v.questions);
  });
  return id;
}

async function updateGame(pool, id, v) {
  await inTx(pool, async c => {
    await c.query('UPDATE games SET title=$2, description=$3, objectives=$4, subject_id=$5, topic_id=$6, grade_from=$7, grade_to=$8, difficulty=$9, language=$10, visibility=$11, status=$12, updated_at=now() WHERE id=$1', [id, v.title, v.description, v.objectives, v.subjectId, v.topicId, v.gradeFrom, v.gradeTo, v.difficulty, v.language, v.visibility, v.status]);
    await writeQuestions(c, id, v.questions);
  });
}

const gameRow = r => ({
  id: r.id, ownerId: r.owner_id, ownerName: r.owner_name ?? undefined, title: r.title, description: r.description, objectives: r.objectives,
  subjectId: r.subject_id, topicId: r.topic_id, gradeFrom: r.grade_from, gradeTo: r.grade_to, difficulty: r.difficulty, language: r.language,
  visibility: r.visibility, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at, questionCount: r.question_count == null ? undefined : Number(r.question_count)
});

const SELECT_GAME = 'SELECT g.*, u.display_name AS owner_name, COALESCE(qc.n, 0) AS question_count FROM games g JOIN users u ON u.id = g.owner_id LEFT JOIN (SELECT game_id, COUNT(*) AS n FROM questions GROUP BY game_id) qc ON qc.game_id = g.id';

async function getGame(pool, id) {
  if (!isUuid(id)) return null;
  const r = await pool.query(`${SELECT_GAME} WHERE g.id = $1`, [id]);
  return r.rows[0] ? gameRow(r.rows[0]) : null;
}

// Owner sees everything; others see only published games that are public or unlisted (the shared link).
const canView = (game, userId) => !!game && (game.ownerId === userId || (game.status === 'published' && ['public', 'unlisted'].includes(game.visibility)));
const canEdit = (game, userId) => !!game && !!userId && game.ownerId === userId;

async function getQuestions(pool, gameId, { withAnswers }) {
  const r = await pool.query('SELECT prompt, options, correct_index, time_limit_sec, points FROM questions WHERE game_id = $1 ORDER BY position', [gameId]);
  return r.rows.map(q => {
    const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    const base = { prompt: q.prompt, options, timeLimit: q.time_limit_sec, points: q.points };
    return withAnswers ? { ...base, correctIndex: q.correct_index } : base;
  });
}

async function listMine(pool, ownerId, status) {
  const where = STATUS.includes(status) ? ' AND g.status = $2' : '';
  const r = await pool.query(`${SELECT_GAME} WHERE g.owner_id = $1${where} ORDER BY g.updated_at DESC`, STATUS.includes(status) ? [ownerId, status] : [ownerId]);
  return r.rows.map(gameRow);
}

async function listPublic(pool, { q, limit = 24 } = {}) {
  const r = await pool.query(`${SELECT_GAME} WHERE g.visibility = 'public' AND g.status = 'published' ORDER BY g.updated_at DESC LIMIT $1`, [Math.min(50, Math.max(1, limit))]);
  const needle = text(q, 60).toLowerCase();
  return r.rows.map(gameRow).filter(g => !needle || g.title.toLowerCase().includes(needle));
}

async function listFavorites(pool, userId) {
  const r = await pool.query(`${SELECT_GAME} JOIN favorites f ON f.game_id = g.id WHERE f.user_id = $1 AND (g.owner_id = $1 OR (g.status = 'published' AND g.visibility IN ('public','unlisted'))) ORDER BY f.created_at DESC`, [userId]);
  return r.rows.map(gameRow);
}

const setFavorite = (pool, userId, gameId) => pool.query('INSERT INTO favorites (user_id, game_id) VALUES ($1,$2) ON CONFLICT (user_id, game_id) DO NOTHING', [userId, gameId]);
const clearFavorite = (pool, userId, gameId) => pool.query('DELETE FROM favorites WHERE user_id = $1 AND game_id = $2', [userId, gameId]);
const favoriteIds = async (pool, userId) => (await pool.query('SELECT game_id FROM favorites WHERE user_id = $1', [userId])).rows.map(r => r.game_id);
const deleteGame = (pool, id) => pool.query('DELETE FROM games WHERE id = $1', [id]);

async function duplicateGame(pool, source, ownerId) {
  const questions = await getQuestions(pool, source.id, { withAnswers: true });
  const v = { title: text(`${source.title} (copy)`, 90), description: source.description, objectives: source.objectives, subjectId: source.subjectId, topicId: source.topicId, gradeFrom: source.gradeFrom, gradeTo: source.gradeTo, difficulty: source.difficulty, language: source.language, visibility: 'private', status: 'draft', questions: questions.map(q => ({ prompt: q.prompt, options: q.options, correctIndex: q.correctIndex, timeLimit: q.timeLimit, points: q.points })) };
  return createGame(pool, ownerId, v);
}

async function recordSession(pool, { gameId, builtinKey, hostId, roomCode }) {
  const id = uuid();
  await pool.query('INSERT INTO live_sessions (id, game_id, builtin_key, host_id, room_code) VALUES ($1,$2,$3,$4,$5)', [id, gameId || null, builtinKey || null, hostId, roomCode]);
  return id;
}

// Only nickname and scores are stored: no personal data about students.
async function finishSession(pool, sessionId, players) {
  await pool.query('UPDATE live_sessions SET ended_at = now(), participant_count = $2 WHERE id = $1', [sessionId, players.length]);
  for (const p of players) {
    await pool.query('INSERT INTO game_results (id, session_id, nickname, avatar, score, correct_count, answered_count) VALUES ($1,$2,$3,$4,$5,$6,$7)', [uuid(), sessionId, text(p.nickname, 24), p.avatar || null, p.score | 0, p.correct | 0, p.answered | 0]);
  }
}

module.exports = {
  SCHEMA, init, upsertUser, validateGame, createGame, updateGame, getGame, getQuestions, listMine, listPublic, listFavorites,
  setFavorite, clearFavorite, favoriteIds, deleteGame, duplicateGame, recordSession, finishSession, canView, canEdit, isUuid, VISIBILITY
};
