import dotenv from 'dotenv';
import express, { Application, Request, Response} from 'express'
import helmet from 'helmet'; 
import cors from 'cors'; 
import compression from 'compression'; 
import rateLimit from 'express-rate-limit';
import path from 'path';
import { closePool, testConnection } from './config/database';

import customerRoute from './routes/customers.routes';
import { notFoundHandler, errorHandler } from './middleware/errorHandler'
import logger from './utils/logger';

// Caricamento delle vcariabili d'ambiente da .env
dotenv.config();

// Inizializzazione del server
const app: Application = express()
const PORT = process.env.PORT || 3000;

// ==============================
// Middleware Start
// ==============================

// Helmet per la sicurezza
app.use(
    helmet({
        // Disabilita la Content Security Policy per evitare problemi con le risorse esterne (es. uso CDN)
        contentSecurityPolicy: false, 
    })
);

// CORS per permettere richieste da qualsiasi origine (da configurare in produzione)
app.use(
    cors({
        // Permette richieste da qualsiasi origine, 
        // ma in produzione è consigliabile specificare l'URL del frontend
        origin: process.env.CORS_ORIGIN || '*', 
        // Metodi HTTP permessi
        methods: ['GET', 'POST', 'PUT', 'DELETE'], 
        // Intestazioni permesse
        allowedHeaders: ['Content-Type', 'Authorization'], 
    })
);

// Compressione delle risposte
app.use(compression());

// Body parser per JSON
app.use(express.json());
// Body parser per dati URL-encoded (es. form submission)
app.use(express.urlencoded({ extended: true }));

// Rate limiting per prevenire abusi (es. 100 richieste ogni 15 minuti per IP)
// In produzione, è consigliabile utilizzare un sistema di rate limiting più robusto (es. Redis)
const limiter = rateLimit({
    // 15 minuti
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15') * 60 * 1000, 
    // Limite di 100 richieste per IP
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), 
    message: 'Troppi tentativi, riprova più tardi.',
    // Restituisce informazioni sul rate limit nei header
    standardHeaders: true,
    // Disabilita gli header legacy di rate limit 
    legacyHeaders: false,
});

// Applica il rate limiter a tutte le rotte API
app.use('/api/', limiter);


// ==============================
// Gestione file statici (Asset di progetto)
// ==============================

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));


// ==============================
// Health Check Endpoint
// ==============================

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        // Stato del server, in questo caso sempre 'ok' se raggiungibile
        status: 'ok', 
        // Timestamp dell'ultima verifica di salute
        timestamp: new Date().toISOString(),
        // Tempo di attività del server in secondi
        uptime: process.uptime() 
    });
});

app.get('/ready', async (req: Request, res: Response) => {
    const dbConnected = await testConnection();
    if (dbConnected) {
        return res.status(200).json({ 
            // Stato del server, in questo caso 'ready' se il database è connesso   
            status: 'ready',
            database: 'connected',
            // Timestamp dell'ultima verifica di salute
            timestamp: new Date().toISOString(),
            // Tempo di attività del server in secondi
            uptime: process.uptime() 
        });
    } else {
        return res.status(503).json({ 
            // Stato del server, in questo caso 'not ready' se il database non è connesso   
            status: 'not ready',
            database: 'disconnected',
            // Timestamp dell'ultima verifica di salute
            timestamp: new Date().toISOString(),
            // Tempo di attività del server in secondi
            uptime: process.uptime() 
        });
    }   
});

// ==============================
// API Routes
// ==============================

app.use('/api/customers', customerRoute);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);


const server = app.listen(PORT, async() => {
    logger.info(`Server in ascolto sulla porta ${PORT}`);
    logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

    // Test della connessione al database all'avvio del server
    const dbConnected = await testConnection();
    if (!dbConnected) {
        logger.warn('Impossibile connettersi al database all\'avvio del server. Verifica la configurazione e lo stato del database.');
    }
});


/* Graceful  shutdown */

const gracefulShutdown = async (signal: string) => {
    logger.info(`Ricevuto segnale ${signal}, avviando la chiusura del server...`);

    server.close(async () => {
        logger.info('Server chiuso con successo.');
        try {
          await closePool();
          process.exit(0);
        } catch (error) {
            logger.error('Errore durante la chiusura del pool di connessioni:', error);
            process.exit(1);
        }
    });
    
    // Forzare lo shutdown dopo 10 secondi se il server non si chiude correttamente
    setTimeout(() => {
        logger.warn('Forzando la chiusura del server dopo 10 secondi...');
        process.exit(1);
    }, 10000);
}


// Gestione dei segnali di terminazione per una chiusura pulita
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestione promesse non gestite

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Promessa non gestita:', reason);
    //gracefulShutdown('UNHANDLED_REJECTION');
});

// Gestione errori non catturati 
process.on('uncaughtException', (error: Error) => {
    logger.error('Eccezione non catturata:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});


export default app;
