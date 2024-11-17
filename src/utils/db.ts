import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Client({
    connectionString: process.env.DATABASE_URL,
});

db.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection error:', err));

export { db };