const crypto = require("node:crypto");
const { query, withClient } = require("../db/client");

function sha256(value) {
  return crypto.createHash("sha256").update(String(value || "")).digest("hex");
}

function sessionTokenHash(token) {
  return sha256(`session\0${token}`);
}

function loginAttemptKey(ipAddress, login) {
  return sha256(`login-attempt\0${String(ipAddress || "unknown")}\0${String(login || "").trim().toLowerCase()}`);
}

function accountLoginAttemptKey(login) {
  return sha256(`login-attempt\0account\0${String(login || "").trim().toLowerCase()}`);
}

function clientIpHash(ipAddress) {
  return sha256(`client-ip\0${String(ipAddress || "unknown")}`);
}

function mapSession(row) {
  if (!row) return null;
  return {
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : String(row.expires_at),
    csrfToken: row.csrf_token,
    account: {
      login: row.login,
      countryIds: row.country_ids || [],
    },
  };
}

async function createAdminSession({ token, csrfToken, account, expiresAt, ipAddress, userAgent }) {
  await query(`
    insert into admin_sessions (
      token_hash,
      csrf_token,
      login,
      country_ids,
      expires_at,
      client_ip_hash,
      user_agent
    )
    values ($1, $2, $3, $4::text[], $5::timestamptz, $6, $7)
  `, [
    sessionTokenHash(token),
    csrfToken,
    account.login,
    account.countryIds,
    expiresAt,
    clientIpHash(ipAddress),
    String(userAgent || "").slice(0, 500) || null,
  ]);
}

async function getAdminSession(token) {
  if (!token) return null;
  const result = await query(`
    update admin_sessions
    set last_seen_at = now()
    where token_hash = $1
      and revoked_at is null
      and expires_at > now()
    returning login, country_ids, csrf_token, expires_at
  `, [sessionTokenHash(token)]);
  return mapSession(result.rows[0]);
}

async function revokeAdminSession(token) {
  if (!token) return false;
  const result = await query(`
    update admin_sessions
    set revoked_at = coalesce(revoked_at, now())
    where token_hash = $1 and revoked_at is null
  `, [sessionTokenHash(token)]);
  return result.rowCount > 0;
}

async function removeExpiredAdminSessions() {
  await query(`
    delete from admin_sessions
    where expires_at <= now()
      or revoked_at < now() - interval '7 days'
  `);
}

async function getLoginAttemptByKey(key) {
  const result = await query(`
    select failed_count, first_attempt_at, blocked_until
    from admin_login_attempts
    where attempt_key = $1
  `, [key]);
  return result.rows[0] || null;
}

async function getLoginAttempt(ipAddress, login) {
  return getLoginAttemptByKey(loginAttemptKey(ipAddress, login));
}

async function getAccountLoginAttempt(login) {
  return getLoginAttemptByKey(accountLoginAttemptKey(login));
}

async function recordLoginFailureByKey({ key, windowMs, maxAttempts }) {
  return withClient(async client => {
    await client.query("begin");
    try {
      await client.query("select pg_advisory_xact_lock(hashtext($1))", [key]);
      const result = await client.query(`
        select failed_count, first_attempt_at, blocked_until
        from admin_login_attempts
        where attempt_key = $1
        for update
      `, [key]);
      const now = Date.now();
      const existing = result.rows[0];
      const existingFirstAttemptAt = existing?.first_attempt_at
        ? new Date(existing.first_attempt_at).getTime()
        : 0;
      const inCurrentWindow = existingFirstAttemptAt && existingFirstAttemptAt + windowMs > now;
      const failedCount = inCurrentWindow ? Number(existing.failed_count || 0) + 1 : 1;
      const firstAttemptAt = new Date(inCurrentWindow ? existingFirstAttemptAt : now);
      const blockedUntil = failedCount >= maxAttempts ? new Date(now + windowMs) : null;

      await client.query(`
        insert into admin_login_attempts (
          attempt_key,
          failed_count,
          first_attempt_at,
          blocked_until,
          updated_at
        )
        values ($1, $2, $3, $4, now())
        on conflict (attempt_key) do update set
          failed_count = excluded.failed_count,
          first_attempt_at = excluded.first_attempt_at,
          blocked_until = excluded.blocked_until,
          updated_at = now()
      `, [key, failedCount, firstAttemptAt, blockedUntil]);
      await client.query("commit");
      return { failedCount, firstAttemptAt, blockedUntil };
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

async function recordLoginFailure({ ipAddress, login, windowMs, maxAttempts }) {
  return recordLoginFailureByKey({ key: loginAttemptKey(ipAddress, login), windowMs, maxAttempts });
}

async function recordAccountLoginFailure({ login, windowMs, maxAttempts }) {
  return recordLoginFailureByKey({ key: accountLoginAttemptKey(login), windowMs, maxAttempts });
}

async function clearLoginFailures(ipAddress, login) {
  await query("delete from admin_login_attempts where attempt_key = $1", [loginAttemptKey(ipAddress, login)]);
}

async function clearAccountLoginFailures(login) {
  await query("delete from admin_login_attempts where attempt_key = $1", [accountLoginAttemptKey(login)]);
}

async function removeStaleLoginAttempts(windowMs) {
  await query(`
    delete from admin_login_attempts
    where updated_at < now() - ($1::double precision * interval '1 millisecond')
  `, [Math.max(windowMs * 2, 24 * 60 * 60 * 1000)]);
}

module.exports = {
  accountLoginAttemptKey,
  clearAccountLoginFailures,
  clearLoginFailures,
  createAdminSession,
  getAccountLoginAttempt,
  getAdminSession,
  getLoginAttempt,
  loginAttemptKey,
  recordAccountLoginFailure,
  recordLoginFailure,
  removeExpiredAdminSessions,
  removeStaleLoginAttempts,
  revokeAdminSession,
  sessionTokenHash,
};
