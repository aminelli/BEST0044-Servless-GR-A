"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJsonTimerTrigger = csvToJsonTimerTrigger;
const functions_1 = require("@azure/functions");
async function csvToJsonTimerTrigger(myTimer, context) {
    context.log('Timer function processed request.');
}
functions_1.app.timer('csvToJsonTimerTrigger', {
    schedule: '0 */5 * * * *', // Ogni 5 minuti
    handler: csvToJsonTimerTrigger
});
//# sourceMappingURL=csvToJsonTimer.js.map