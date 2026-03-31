import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Caricamento delle variabili d'ambiente da .env
dotenv.config();

// Gestione del connection pool MySql
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root', 
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'customer_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    // Imposta queueLimit a 0 per consentire un numero illimitato di richieste in coda quando il pool è al limite
    queueLimit: 0,
    // Abilita keep-alive per migliorare le prestazioni mantenendo le connessioni aperte
    enableKeepAlive: true,
    // keepAliveInitialDelay: 0 significa che la connessione sarà mantenuta viva senza ritardi iniziali
    keepAliveInitialDelay: 0, // 10 secondi
});


export async function testConnection(): Promise<boolean> {
    try {
        const connection = await pool.getConnection();
        // Verifica che la connessione sia attiva
        await connection.ping(); 
        // Rilascia la connessione al pool
        connection.release(); 
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}