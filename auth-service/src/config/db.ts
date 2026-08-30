// Connection Pooling: Instead of opening and closing connection for each request to the database. we have connection pool
// consisting of some no. of persistent connections. when a req is fired, it goes to one of these connection pool. it reduces
// the overload of opening and closing a connection for each request.

import { configDotenv } from 'dotenv';
import { error } from 'node:console';
import {Pool} from 'pg';
configDotenv();
if(!process.env.DATABASE_URL) {
    console.error('Database Connection Failed');
    process.exit(1);
}
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    max:20,
    idleTimeoutMillis:3000, // close idle connections to free up db space
    connectionTimeoutMillis:5000  // timeout if connection isn't established after 5 sec
});

db.on('error',(err)=> {
    console.error("Unexpected PostgreSQL pool error:", err)
})

export default db;