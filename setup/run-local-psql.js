require('dotenv').config();
const { spawnSync } = require('child_process');

const {
  PGUSER,
  PGHOST,
  PGDATABASE,
  PGPASSWORD,
  PGPORT
} = process.env;

if (!PGUSER || !PGHOST || !PGDATABASE || !PGPASSWORD || !PGPORT) {
  console.error('Error: One or more Postgres env variables are missing');
  process.exit(1);
}

// Build connection string
const connectionString = `postgresql://${encodeURIComponent(PGUSER)}:${encodeURIComponent(PGPASSWORD)}@${PGHOST}:${PGPORT}/${PGDATABASE}`;

const args = [connectionString, '-f', './setup/setup.sql'];

const result = spawnSync('psql', args, {
  stdio: 'inherit'
});

if (result.error) {
  console.error('Failed to run psql:', result.error);
  process.exit(1);
}

process.exit(result.status);