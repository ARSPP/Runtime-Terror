require('dotenv').config();
const { execSync } = require('child_process');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

try {
  execSync(`psql "${databaseUrl}" -f ./setup/setup.sql`, { stdio: 'inherit' });
} catch (err) {
  process.exit(1);
}