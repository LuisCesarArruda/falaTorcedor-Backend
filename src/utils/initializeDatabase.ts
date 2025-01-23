import { db } from './db'; 
import fs from 'fs';
import path from 'path';

async function initializeDatabase(): Promise<void> {
    const client = await db.connect();

    try {
        
        const sql = fs.readFileSync(path.resolve(__dirname, 'setup.sql')).toString();


        await client.query(sql);
        console.log('Banco de dados configurado com sucesso!');
    } catch (error) {
        console.error('Erro ao configurar o banco de dados:', error);
    } finally {
        client.release(); 
    }
}

initializeDatabase().catch((error) => {
    console.error('Erro ao inicializar o banco de dados:', error);
});
