'use strict';
/* Authentication adapter. Real Clerk verification only; nothing is ever faked in production.
   Tests inject their own `authenticate` function through createApi(). */

function frontendHost(publishableKey) {
  try {
    const encoded = String(publishableKey).replace(/^pk_(test|live)_/, '');
    const host = Buffer.from(encoded, 'base64').toString('utf8').replace(/\$$/, '');
    return /^[a-z0-9.-]+$/i.test(host) ? host : null;
  } catch { return null; }
}

function clerkAuth(env = process.env) {
  const publishableKey = env.CLERK_PUBLISHABLE_KEY || '';
  const secretKey = env.CLERK_SECRET_KEY || '';
  if (!/^pk_(test|live)_/.test(publishableKey) || !/^sk_(test|live)_/.test(secretKey)) return null;
  const { verifyToken, createClerkClient } = require('@clerk/express');
  const client = createClerkClient({ secretKey, publishableKey });
  const profileCache = new Map();
  async function profile(userId) {
    const hit = profileCache.get(userId);
    if (hit && Date.now() - hit.at < 5 * 60 * 1000) return hit.value;
    const u = await client.users.getUser(userId);
    const email = (u.emailAddresses.find(e => e.id === u.primaryEmailAddressId) || u.emailAddresses[0])?.emailAddress || null;
    const value = { clerkId: userId, email, name: [u.firstName, u.lastName].filter(Boolean).join(' ') || email || '', imageUrl: u.imageUrl || null };
    profileCache.set(userId, { at: Date.now(), value });
    return value;
  }
  // Accepts a Clerk session JWT (Bearer header or socket auth payload). Returns the profile or null.
  async function verify(token) {
    if (!token || typeof token !== 'string') return null;
    try {
      const payload = await verifyToken(token, { secretKey });
      return await profile(payload.sub);
    } catch { return null; }
  }
  return { verify, publishableKey, host: frontendHost(publishableKey) };
}

module.exports = { clerkAuth, frontendHost };
