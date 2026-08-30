// runner script
import fs from 'fs'
import path from 'path'
import db from '../config/db.js'

async function runMigration() {
    try {
        console.log("Initiating DataBase Migration");

        // figure out the file path of schema.sql
        const sqlFilePath = path.join(process.cwd(),'src/config/schema.sql');
        const sql = fs.readFileSync(sqlFilePath,'utf-8');

        await db.query(sql);

        console.log("Database Migration Succesfull");
        process.exit(0);
    } catch (error) {
        console.error('Migration failed', error);
        process.exit(1);  
    }
}

runMigration();