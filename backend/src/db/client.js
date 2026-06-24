const { Pool } = require("pg");

let pool = null;

function getDatabaseUrl() {
  return String(process.env.DATABASE_URL || "").trim();
}

function shouldUseSsl(databaseUrl) {
  if (process.env.DATABASE_SSL === "false") return false;
  if (process.env.DATABASE_SSL === "true") return true;
  return Boolean(databaseUrl) && !/localhost|127\.0\.0\.1/i.test(databaseUrl);
}

function getPool() {
  if (pool) return pool;

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw Object.assign(new Error("DATABASE_URL is not configured."), {
      statusCode: 500,
      code: "DATABASE_URL_MISSING",
    });
  }

  pool = new Pool({
    connectionString,
    ssl: shouldUseSsl(connectionString) ? { rejectUnauthorized: false } : false,
    max: Number(process.env.DATABASE_POOL_MAX || 5),
  });

  return pool;
}

async function query(text, params = []) {
  return getPool().query(text, params);
}

async function withClient(callback) {
  const client = await getPool().connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

async function checkDatabaseConnection() {
  const result = await query("select now() as now");
  return {
    connected: true,
    now: result.rows[0]?.now || null,
  };
}

module.exports = {
  checkDatabaseConnection,
  getPool,
  query,
  withClient,
};
