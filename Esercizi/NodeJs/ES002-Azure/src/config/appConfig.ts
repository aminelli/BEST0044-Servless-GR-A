
/*
        "RESOUCE_GROUP": "BEST0044-GR-A-Servless",
        "STORAGE_ACCOUNT_NAME": "best0044grastorage",
        "STORAGE_CONTAINER_NAME": "data",
        
        "INPUT_FOLDER_PATH": "csv",
        "OUTPUT_FOLDER_PATH": "json",
        "CSV_PARSED_FOLDER_PATH": "csv_parsed",

        "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=best0044grastorage;AccountKey=C+ojohV534z35a+nJYNEcLTUKfDIyK27oSbenFm3qgYFNyFr7GSPmR4hw2o+cwPVM1v5ObIrMox1+AStbrGH9g==;EndpointSuffix=core.windows.net"

*/

export interface AppConfig {
    resourceGroup: string;
    storageAccountName: string;
    storageContainerName: string;
    inputFolderPath: string;
    outputFolderPath: string;
    csvParsedFolderPath: string;
    storageConnectionString: string;
}


export function getAppConfig(): AppConfig {

    const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || null;
    if (!storageConnectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set');
    }

    return {
        storageConnectionString,
        resourceGroup: process.env.RESOUCE_GROUP || 'BEST0044-GR-A-Servless',
        storageAccountName: process.env.STORAGE_ACCOUNT_NAME || 'best0044grastorage',
        storageContainerName: process.env.STORAGE_CONTAINER_NAME || 'data',
        inputFolderPath: process.env.INPUT_FOLDER_PATH || 'csv',
        outputFolderPath: process.env.OUTPUT_FOLDER_PATH || 'json',
        csvParsedFolderPath: process.env.CSV_PARSED_FOLDER_PATH || 'csv_parsed'
    };
}