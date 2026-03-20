import { app, InvocationContext, Timer } from "@azure/functions";

// TODO: implementare la logica del timer prima di portare in produzione.
// Attualmente stub: ogni invocazione (ogni 5 min) non esegue alcun lavoro utile.
export async function csvToJsonTimerTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
}


app.timer('csvToJsonTimerTrigger', {
    schedule: '0 */5 * * * *', // Ogni 5 minuti
    handler: csvToJsonTimerTrigger
});
