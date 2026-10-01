// runner script
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import db from '../config/db.js';

async function runMigration() {
    try {
        console.log('Initiating DataBase Migration');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));
        const sqlFilePath = `${__dirname}/../config/schema.sql`;
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');

        await db.query(sql);

        console.log('Database Migration Succesfull');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed', error);
        process.exit(1);
    }
}

runMigration();