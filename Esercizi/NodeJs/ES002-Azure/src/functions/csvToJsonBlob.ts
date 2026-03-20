import { app, InvocationContext } from "@azure/functions";

import { CsvToJsonTransformer } from "../services/csvTransformer.js";
import { getAppConfig } from "../config/appConfig.js";
import { StorageService } from "../services/storageService.js";

// import { v4 as uuidv4 } from 'uuid';
import { randomUUID } from 'crypto'

export async function csvToJsonBlobTrigger(
    blob: Buffer, 
    context: InvocationContext
): Promise<void> {

    
    const blobName = context.triggerMetadata?.name as string || 'unknown';
    
    context.log("=== CSV to JSON Blob Trigger ===");
    context.log("START processing blob...");
    context.log(`Blob trigger function processed blob: ${blobName}, size: ${blob.length} bytes`);

    try {
        if (!blobName.toLowerCase().endsWith('.csv')) {
            context.log(`Skipping non-CSV file: ${blobName}`);
            return;
        }

        const config = getAppConfig();
        const service = new StorageService(config);
        const transformer = new CsvToJsonTransformer();

        // Conversione del contenuto del blob da Buffer a stringa
        const csvContent = blob.toString('utf-8');
        context.log(`CSV content length: ${csvContent.length} characters`);

        // Trasformazione del CSV in JSON
        const jsonData = transformer.transform(csvContent);
        const jsonString = transformer.toJsonString(jsonData);
        context.log(`Total successfully transformed CSV to JSON for blob : ${jsonData.length} records`);

        // Preparazione del nome del blob di destinazione per il JSON e il CSV da archiviare
        //const uuid = uuidv4();
        const uuid = randomUUID();
        const csvBlobDestName = `${uuid}.csv`;
        const jsonBlobName = `${uuid}.json`;
        context.log(`Generated CSV blob name: ${csvBlobDestName}`);
        context.log(`Generated JSON blob name: ${jsonBlobName}`);

        // Salviamo il file Json nella stessa cartella di output con un nome unico
        const outputPath = `${config.outputFolderPath}/${jsonBlobName}`;
        await service.writeBlobFromString(outputPath, jsonString, 'application/json');

        // Spostiamo il file CSV originale nella cartella di archiviazione con un nome unico
        const destinationBlobName = `${config.csvParsedFolderPath}/${csvBlobDestName}`;
        // await service.writeBlobFromString(archivePath, csvContent, 'text/csv');
        await service.moveBlob(blobName, destinationBlobName);
        




    } catch (error) {
        if (error instanceof Error) {
            context.log(`Error processing blob ${blobName}: ${error.message}`);
        }
            context.log(`Unknown error processing blob ${blobName}`);
    } finally {

    }
}

app.storageBlob('csvToJsonBlobTrigger', {
    path: 'csv-to-json/{name}.csv',
    connection: '',
    handler: csvToJsonBlobTrigger
});
