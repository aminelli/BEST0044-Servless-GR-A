import { AppConfig } from "../config/appConfig";
import { ContainerClient, BlobServiceClient, NodeJSReadableStream } from "@azure/storage-blob";


export class StorageService {

    private config: AppConfig;
    private containerClient: ContainerClient;

    constructor(config: AppConfig) {
        this.config = config;
        this.containerClient = this.initializeContainerClient();
    }

    private initializeContainerClient(): ContainerClient {

        const client = BlobServiceClient.fromConnectionString(this.config.storageConnectionString);
        return client.getContainerClient(this.config.storageContainerName);

        //return new ContainerClient(this.config.storageConnectionString, this.config.storageContainerName);
    }


    public async readBlobAsString(blobName: string): Promise<string> {
        try {
            const blobClient = this.containerClient.getBlobClient(blobName);    

            if (!await blobClient.exists()) {
                throw new Error(`Blob ${blobName} does not exist`);
            }

            const downloadBlockBlobResponse = await blobClient.download();
            
            if (!downloadBlockBlobResponse.readableStreamBody) {
                throw new Error(`Blob ${blobName} has no content`);
            }   

            // Conversione dello stream in stringa
            const chunks: Buffer[] = [];
            for await (const chunk of downloadBlockBlobResponse.readableStreamBody) {
                chunks.push(Buffer.from(chunk));                
            }
            
            const downloaded = Buffer.concat(chunks).toString("utf-8");
            return downloaded;

            //const downloaded = await this.streamToString(downloadBlockBlobResponse.readableStreamBody);
            //return downloaded;

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error reading blob ${blobName}: ${error.message}`);
            }
            throw new Error(`Unknown error reading blob ${blobName}`);
        } finally {

        }
    }
    
    /*
    private async streamToString(readableStreamBody: NodeJSReadableStream | undefined): Promise<string> {
        if (!readableStreamBody) {
            throw new Error("Readable stream is undefined");
        }
        return new Promise((resolve, reject) => {
            const chunks: any[] = [];
            readableStreamBody.on("data", (data) => {
                chunks.push(data.toString());
            });
            readableStreamBody.on("end", () => {
                resolve(chunks.join(""));
            });
            readableStreamBody.on("error", reject);
        });
    }
    */

    public async writeBlobFromString(
        blobName: string,
        content: string,
        contentType: string = 'application/json'
    ): Promise<void> {
        try {
            const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

            // Carica il contenuto come stringa
            await blockBlobClient.upload(content, Buffer.byteLength(content), {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error writing blob ${blobName}: ${error.message}`);
            }
            throw new Error(`Unknown error writing blob ${blobName}`);
        }  finally {

        }
    }

    public async blobExists(blobName: string): Promise<boolean> {
        try {
            const blobClient = this.containerClient.getBlobClient(blobName);
            return await blobClient.exists();
        } catch (error) {
            return false;
        } finally {}
    }

    public async moveBlob(sourceBlobName: string, destinationBlobName: string): Promise<void> {
        try {
            
            const sourceBlobClient = this.containerClient.getBlobClient(sourceBlobName);
            const destinationBlobClient = this.containerClient.getBlockBlobClient(destinationBlobName);
            if (!await sourceBlobClient.exists()) {
                throw new Error(`Source blob ${sourceBlobName} does not exist`);
            }
            
            // Copia il blob nella nuova posizione
            const copyPoller = await destinationBlobClient.beginCopyFromURL(sourceBlobClient.url);
            await copyPoller.pollUntilDone();

            // Elimina il blob originale dopo la copia
            await sourceBlobClient.delete();
            

        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error moving blob from ${sourceBlobName} to ${destinationBlobName}: ${error.message}`);
            }
            throw new Error(`Unknown error moving blob from ${sourceBlobName} to ${destinationBlobName}`);
        } finally {

        }
    }


}