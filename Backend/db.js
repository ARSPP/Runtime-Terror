require('dotenv').config();
let { Pool } = require('pg');

let port = 3000;
let host;
let databaseConfig;
// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
	host = "0.0.0.0";
	databaseConfig = { connectionString: process.env.DATABASE_URL, ssl: {rejectUnauthorized: false} };
} else {
	host = "localhost";
	let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
	databaseConfig = { 
        user:PGUSER,
        password:PGPASSWORD,
        database:PGDATABASE,
        host:PGHOST,
        port:PGPORT };
}

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'set' : 'NOT SET');

const pool = new Pool(databaseConfig);

module.exports = pool;