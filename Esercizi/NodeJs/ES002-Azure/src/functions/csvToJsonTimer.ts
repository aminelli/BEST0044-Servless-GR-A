import { app, InvocationContext, Timer } from "@azure/functions";

export async function csvToJsonTimerTrigger(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function processed request.');
}

app.timer('csvToJsonTimerTrigger', {
    schedule: '0 */5 * * * *', // Ogni 5 minuti
    handler: csvToJsonTimerTrigger
});
