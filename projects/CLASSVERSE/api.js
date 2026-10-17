'use strict';
const express = require('express');
const DB = require('./db');

/* REST API for teacher accounts and games.
   deps.pool          pg-compatible pool, or null when DATABASE_URL is missing
   deps.verify        async (token) => profile | null, or null when Clerk is not configured
   deps.publishableKey / deps.clerkHost  public Clerk values (safe for the browser) */
function createApi({ pool, verify, publishableKey = null, clerkHost = null }) {
  const router = express.Router();
  router.use(express.json({ limit: '200kb' }));

  const fail = (res, status, error) => res.status(status).json({ error });
  const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(err => { console.error('API error:', err.message); fail(res, 500, 'serverError'); });

  // Public, non-secret configuration so the UI can explain what is and is not connected.
  router.get('/config', (_req, res) => res.json({ auth: !!verify, database: !!pool, anonymousTeacher: !verify && process.env.ALLOW_ANONYMOUS_TEACHER === 'true', clerkPublishableKey: verify ? publishableKey : null, clerkHost: verify ? clerkHost : null }));

  const needDb = (_req, res, next) => (pool ? next() : fail(res, 503, 'dbNotConfigured'));
  const needAuth = wrap(async (req, res, next) => {
    if (!verify) return fail(res, 503, 'authNotConfigured');
    const header = req.get('authorization') || '';
    const profile = await verify(header.startsWith('Bearer ') ? header.slice(7) : '');
    if (!profile) return fail(res, 401, 'unauthorized');
    req.user = await DB.upsertUser(pool, profile);
    next();
  });
  const optionalAuth = wrap(async (req, _res, next) => {
    const header = req.get('authorization') || '';
    if (verify && header.startsWith('Bearer ')) {
      const profile = await verify(header.slice(7));
      if (profile) req.user = await DB.upsertUser(pool, profile);
    }
    next();
  });

  const publicUser = u => ({ id: u.id, email: u.email, name: u.display_name, imageUrl: u.image_url, role: u.role, createdAt: u.created_at });
  const present = (g, userId) => ({ ...g, ownerName: undefined, isOwner: g.ownerId === userId, creator: g.ownerName || '' });

  router.get('/me', needDb, needAuth, (req, res) => res.json({ user: publicUser(req.user) }));

  router.get('/subjects', needDb, wrap(async (_req, res) => {
    const subjects = (await pool.query('SELECT id, group_id, icon, name_en, name_he, name_ar FROM subjects WHERE owner_id IS NULL ORDER BY id')).rows;
    const topics = (await pool.query('SELECT id, subject_id, from_grade, to_grade, name_en, name_he, name_ar FROM topics ORDER BY id')).rows;
    res.json({ subjects, topics });
  }));

  router.get('/games/mine', needDb, needAuth, wrap(async (req, res) => {
    const games = await DB.listMine(pool, req.user.id, req.query.status);
    res.json({ games: games.map(g => present(g, req.user.id)) });
  }));

  router.get('/games/public', needDb, optionalAuth, wrap(async (req, res) => {
    const games = await DB.listPublic(pool, { q: req.query.q });
    res.json({ games: games.map(g => present(g, req.user?.id)) });
  }));

  router.get('/sessions', needDb, needAuth, wrap(async (req, res) => {
    const rows = (await pool.query(
      `SELECT s.id, s.room_code, s.started_at, s.ended_at, s.participant_count, s.builtin_key, g.title AS game_title, COALESCE(a.average_score, 0) AS average_score
       FROM live_sessions s LEFT JOIN games g ON g.id = s.game_id
       LEFT JOIN (SELECT session_id, AVG(score) AS average_score FROM game_results GROUP BY session_id) a ON a.session_id = s.id
       WHERE s.host_id = $1 ORDER BY s.started_at DESC LIMIT 20`, [req.user.id])).rows;
    res.json({ sessions: rows.map(r => ({ id: r.id, roomCode: r.room_code, startedAt: r.started_at, endedAt: r.ended_at, participants: Number(r.participant_count), title: r.game_title || r.builtin_key || '', averageScore: Math.round(Number(r.average_score)) })) });
  }));

  router.get('/favorites', needDb, needAuth, wrap(async (req, res) => {
    const games = await DB.listFavorites(pool, req.user.id);
    res.json({ games: games.map(g => present(g, req.user.id)) });
  }));

  router.post('/games', needDb, needAuth, wrap(async (req, res) => {
    const checked = await DB.validateGame(pool, req.body);
    if (!checked.ok) return fail(res, 400, checked.error);
    const id = await DB.createGame(pool, req.user.id, checked.value);
    res.status(201).json({ id });
  }));

  // Loads a game and applies the view/edit rule. Hidden games answer 404 so their existence is not revealed.
  const load = (mode) => wrap(async (req, res, next) => {
    const game = await DB.getGame(pool, req.params.id);
    if (!game || !DB.canView(game, req.user?.id)) return fail(res, 404, 'notFound');
    if (mode === 'edit' && !DB.canEdit(game, req.user?.id)) return fail(res, 403, 'forbidden');
    req.game = game; next();
  });

  router.get('/games/:id', needDb, optionalAuth, load('view'), wrap(async (req, res) => {
    const isOwner = req.game.ownerId === req.user?.id;
    const questions = await DB.getQuestions(pool, req.game.id, { withAnswers: isOwner });
    res.json({ game: present(req.game, req.user?.id), questions, favorite: req.user ? (await DB.favoriteIds(pool, req.user.id)).includes(req.game.id) : false });
  }));

  router.put('/games/:id', needDb, needAuth, load('edit'), wrap(async (req, res) => {
    const checked = await DB.validateGame(pool, req.body);
    if (!checked.ok) return fail(res, 400, checked.error);
    await DB.updateGame(pool, req.game.id, checked.value);
    res.json({ ok: true });
  }));

  router.patch('/games/:id/visibility', needDb, needAuth, load('edit'), wrap(async (req, res) => {
    const visibility = req.body?.visibility;
    if (!DB.VISIBILITY.includes(visibility)) return fail(res, 400, 'visibilityInvalid');
    const status = req.body?.status === 'published' ? 'published' : req.body?.status === 'draft' ? 'draft' : req.game.status;
    if (status === 'published' && req.game.questionCount < 1) return fail(res, 400, 'publishNeedsQuestions');
    await pool.query('UPDATE games SET visibility = $2, status = $3, updated_at = now() WHERE id = $1', [req.game.id, visibility, status]);
    res.json({ ok: true, visibility, status });
  }));

  router.delete('/games/:id', needDb, needAuth, load('edit'), wrap(async (req, res) => {
    await DB.deleteGame(pool, req.game.id);
    res.json({ ok: true });
  }));

  router.post('/games/:id/duplicate', needDb, needAuth, load('view'), wrap(async (req, res) => {
    const id = await DB.duplicateGame(pool, req.game, req.user.id);
    res.status(201).json({ id });
  }));

  router.put('/games/:id/favorite', needDb, needAuth, load('view'), wrap(async (req, res) => { await DB.setFavorite(pool, req.user.id, req.game.id); res.json({ ok: true }); }));
  router.delete('/games/:id/favorite', needDb, needAuth, wrap(async (req, res) => {
    if (!DB.isUuid(req.params.id)) return fail(res, 404, 'notFound');
    await DB.clearFavorite(pool, req.user.id, req.params.id); res.json({ ok: true });
  }));

  router.use((_req, res) => fail(res, 404, 'notFound'));
  return router;
}

module.exports = { createApi };
