# Progetto Web-Based in nodejs con express per gestione clienti

## Dipendenze di sviluppo:

| Dipendenza                       | Type | Desc                                                     |
| -------------------------------- | ---- | -------------------------------------------------------- |
| @types/compression               | dev  | Tipi TS utilizzabili per la libreria compression di prod |
| @types/cors                      | dev  | Tipi TS utilizzabili per la libreria cors di prod        |
| @types/express                   | dev  | Tipi TS utilizzabili per la libreria express di prod     |
| @types/node                      | dev  | Tipi TS per Node.js                                      |
| @typescript-eslint/eslint-plugin | dev  | Regole TS per ESLint                                     |
| @typescript-eslint/parser        | dev  | Parser TS per ESLint                                     |
| eslint                           | dev  | Linting codice                                           |
| nodemon                          | dev  | Riavvio automatico del server in sviluppo                |
| ts-node                          | dev  | Esecuzione diretta file TS                               |
| typescript                       | dev  | Compilatore Typescript (TS)                              |

```json
"devDependencies": {
    "@types/compression": "^1.8.1",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/node": "^25.5.0",
    "@typescript-eslint/eslint-plugin": "^8.57.2",
    "@typescript-eslint/parser": "^8.57.2",
    "eslint": "^10.1.0",
    "nodemon": "^3.1.14",
    "ts-node": "^10.9.2",
    "typescript": "^5.9.2"
  }

```


## Dipendenze di produzione:

| Dipendenza         | Type | Desc                                                              |
| ------------------ | ---- | ----------------------------------------------------------------- |
| compression        | prod | Comprime le risposte HTTP                                         |
| cors               | prod | Abilitazione richieste cross-domain                               |
| dotenv             | prod | Libreria utile per la gestione delle variabili di ambiente (.env) |
| express            | prod | Framework per Web API, Web App (+ Server HTTP)                    |
| express-rate-limit | prod | Protezione da abuso / DDOS                                        |
| express-validator  | prod | Validazione degli input API                                       |
| helmet             | prod | Sicurezza HTTP (Protezione degli Headers)                         |
| mysql2             | prod | Driver MySQL                                                      |

```json
"dependencies": {
    "compression": "^1.8.1",
    "cors": "^2.8.6",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "express-rate-limit": "^8.3.1",
    "express-validator": "^7.3.1",
    "helmet": "^8.1.0",
    "mysql2": "^3.20.0"
  }
```

