import { app, InvocationContext } from "@azure/functions";

export async function csvToJsonBlobTrigger(
    blob: Buffer, 
    context: InvocationContext
): Promise<void> {
    
    
    
}

app.storageBlob('csvToJsonBlobTrigger', {
    path: 'csv-to-json/{name}.csv',
    connection: '',
    handler: csvToJsonBlobTrigger
});
