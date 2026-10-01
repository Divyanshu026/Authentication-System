// Connection Pooling: Instead of opening and closing connection for each request to the database. we have connection pool
// consisting of some no. of persistent connections. when a req is fired, it goes to one of these connection pool. it reduces
// the overload of opening and closing a connection for each request.

import { configDotenv } from 'dotenv';
import { Pool } from 'pg';
configDotenv();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is missing in environment variables');
const db = new Pool({
    connectionString: databaseUrl,
    max:20,
    idleTimeoutMillis:3000, // close idle connections to free up db space
    connectionTimeoutMillis:5000  // timeout if connection isn't established after 5 sec
});

db.on('error',(err)=> {
    console.error("Unexpected PostgreSQL pool error:", err)
})

export default db;