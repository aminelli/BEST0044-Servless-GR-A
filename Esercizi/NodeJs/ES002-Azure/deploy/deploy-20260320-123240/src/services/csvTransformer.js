"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CsvToJsonTransformer = void 0;
const sync_1 = require("csv-parse/sync");
class CsvToJsonTransformer {
    transform(csvContent, options) {
        try {
            // Validazione dati nel caso in cui csvContent sia null, undefined o non una stringa
            if (!csvContent || typeof csvContent !== 'string' || csvContent.trim().length === 0) {
                throw new Error('Invalid CSV content: content must be a non-empty string');
            }
            const parserOptions = {
                delimiter: options?.delimiter || ',',
                columns: options?.columns ?? true, // Usa la prima riga come intestazione per default
                skip_empty_lines: options?.skip_empty_lines ?? false,
                trim: options?.trim ?? false,
                trimValues: options?.trimValues ?? false,
                relax_column_count: true, // Permette righe con un numero diverso di campi
                skip_records_with_error: true // Ignora le righe che causano errori di parsing
            };
            // Parsing del CSV in un array di oggetti CsvRow
            const records = (0, sync_1.parse)(csvContent, parserOptions);
            if (!Array.isArray(records) || records.length === 0) {
                throw new Error('Parsed CSV data is empty or not an array');
            }
            return records;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error parsing CSV content: ${error.message}`);
            }
            throw new Error('Unknown error parsing CSV content');
        }
    }
    toJsonString(data, pretty = true) {
        try {
            return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error converting to JSON string: ${error.message}`);
            }
            throw new Error('Unknown error converting to JSON string');
        }
        finally {
        }
    }
}
exports.CsvToJsonTransformer = CsvToJsonTransformer;
//# sourceMappingURL=csvTransformer.js.map