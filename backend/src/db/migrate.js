const fs = require("node:fs");
const path = require("node:path");
const { withClient } = require("./client");

const migrationsDir = path.join(__dirname, "migrations");
const migrationLockKey = "stada-content-backend:schema-migrations";

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

function listMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith(".sql"))
    .sort();
}

async function applyMigration(client, fileName) {
  const id = fileName.replace(/\.sql$/i, "");
  const existing = await client.query("select id from schema_migrations where id = $1", [id]);
  if (existing.rowCount) return false;

  const sql = fs.readFileSync(path.join(migrationsDir, fileName), "utf8");
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query("insert into schema_migrations (id) values ($1)", [id]);
    await client.query("commit");
    return true;
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
}

async function runMigrations() {
  return withClient(async client => {
    // Keep the advisory lock for this database connection until every migration
    // has been checked. This prevents concurrent deploys from racing to record
    // the same migration.
    await client.query("select pg_advisory_lock(hashtext($1))", [migrationLockKey]);
    try {
      await ensureMigrationsTable(client);

      const applied = [];
      for (const fileName of listMigrationFiles()) {
        const didApply = await applyMigration(client, fileName);
        if (didApply) applied.push(fileName);
      }

      return applied;
    } finally {
      await client.query("select pg_advisory_unlock(hashtext($1))", [migrationLockKey]);
    }
  });
}

if (require.main === module) {
  runMigrations()
    .then(applied => {
      if (applied.length) {
        console.log(`Applied ${applied.length} database migration(s): ${applied.join(", ")}`);
      } else {
        console.log("Database migrations are up to date.");
      }
      process.exit(0);
    })
    .catch(error => {
      console.error("Database migration failed.");
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
};
