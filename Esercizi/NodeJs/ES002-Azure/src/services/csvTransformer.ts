import { parse } from 'csv-parse';

/**
 * Interfaccia che rappresenta una riga del CSV come un oggetto con chiavi dinamiche.
 * Le chiavi corrispondono ai nomi delle colonne del CSV, e i valori possono essere stringhe, numeri o booleani.
 * (Nota: se necessario, è possibile estendere questa interfaccia per includere anche valori nulli o altri tipi di dati).
 */
export interface CsvRow {
    [key: string]: string | number | boolean; // | null;
}

/**
 * 
 */
export interface CsvParserOptions {
    // Delimitatore dei campi (default: ',')
    delimiter?: string; 
    // Se true, usa la prima riga come intestazione; se è un array, usa i valori come nomi delle colonne
    columns?: boolean | string[]; 
    // Se true, ignora le righe vuote (default: false)
    skip_empty_lines?: boolean; 
    // Se true, rimuove gli spazi bianchi all'inizio e alla fine dei campi (default: false)
    trim?: boolean; 
    // Se true, rimuove gli spazi bianchi all'inizio e alla fine dei valori (default: false),
    trimValues?: boolean; 
    // Se true, permette righe con un numero diverso di campi (default: true)
    relax_column_count?: boolean; 
    // Se true, ignora le righe che causano errori di parsing (default: true)
    skip_records_with_error?: boolean; 
}

export class CsvToJsonTransformer {

    public async transform(csvContent: string, options?: CsvParserOptions): Promise<CsvRow[]> {
        // Validazione dati nel caso in cui csvContent sia null, undefined o non una stringa
        if (!csvContent || typeof csvContent !== 'string' || csvContent.trim().length === 0) {
            throw new Error('Invalid CSV content: content must be a non-empty string');
        }

        const parserOptions: CsvParserOptions = {
            delimiter: options?.delimiter || ',',
            columns: options?.columns ?? true, // Usa la prima riga come intestazione per default
            skip_empty_lines: options?.skip_empty_lines ?? false,
            trim: options?.trim ?? false,
            trimValues: options?.trimValues ?? false,
            relax_column_count: true, // Permette righe con un numero diverso di campi
            skip_records_with_error: true // Ignora le righe che causano errori di parsing
        };

        // Parsing asincrono del CSV: non blocca l'event loop
        return new Promise<CsvRow[]>((resolve, reject) => {
            parse(csvContent, parserOptions, (err: Error | undefined, records: unknown) => {
                if (err) {
                    return reject(new Error(`Error parsing CSV content: ${err.message}`));
                }
                const rows = records as CsvRow[];
                if (!Array.isArray(rows) || rows.length === 0) {
                    return reject(new Error('Parsed CSV data is empty or not an array'));
                }
                resolve(rows);
            });
        });
    }

    public toJsonString(data: CsvRow[], pretty: boolean = true): string {
        try {
            return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error converting to JSON string: ${error.message}`);
            }
            throw new Error('Unknown error converting to JSON string');
        } finally {

        }        
    }
}
