import dotenv from 'dotenv';
import express, { Application, Request, Response} from 'express'
import helmet from 'helmet'; 
import cors from 'cors'; 
import compression from 'compression'; 
import rateLimit from 'express-rate-limit';
import path from 'path';
 

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

