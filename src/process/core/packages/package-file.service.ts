import { dirname, join } from "path";
import { PACKAGES_DIR } from "./packages.const";
import { PackageItem } from "./packages.type";
import { createWriteStream, existsSync, mkdirSync, readFileSync, renameSync, rmSync, unlink, unlinkSync } from "fs";
import { APIClientService } from "../api-client.service";
import { Readable } from "stream";
import { AxiosResponse } from "axios";

function downloadedString(downloadedSize: number, totalSize: number | null) {

    if(!totalSize) {

        return `Downloaded: ${downloadedSize} bytes`
    }

    const percentage = ((downloadedSize / totalSize) * 100).toFixed(2);

    return `Downloaded: ${percentage}% (${downloadedSize}/${totalSize} bytes)`;
}

export class PackagesFileService {

    public static removeAsar(item: PackageItem) {

        const asarFile = join(PACKAGES_DIR, item.name, item.asarFile);

        unlinkSync(asarFile);
    }

    public static removePackage(name: string) {

        const packageDirectory = join(PACKAGES_DIR, name);

        rmSync(packageDirectory, { recursive: true, force: true });
    }

    public static readLatest(item: PackageItem | string) {

        const packageName = typeof item === 'string' ? item : item.name;

        const latestFile = join(PACKAGES_DIR, packageName, 'latest.json');

        if (existsSync(latestFile)) {
            const content = readFileSync(latestFile, "utf-8");
            try {
                const parsedContent = JSON.parse(content);
                
                return {
                    name: packageName,
                    version: parsedContent.version,
                    asarFile: parsedContent.asarFile,
                    checksum: parsedContent.checksum,
                    releaseDate: parsedContent.releaseDate
                } as PackageItem;
            } catch (err) {
                console.error(
                    `Failed parsing latest.json for /packages/global/${packageName}.`,
                    err,
                );
                return null;
            }
        }

        return null;       
    }

    public static async downloadAndSaveLatestFile(packageName: string) {

        const latestJsonFile = join(PACKAGES_DIR, packageName, 'latest.json');

        await this.downloadPackage(packageName, 'latest', latestJsonFile);
    }

    public static async downloadAndSaveAsarFile(packageItem: PackageItem) {

        const asarTempFile = join(PACKAGES_DIR, packageItem.name, 'asarfile.temp');
        const asarFile = join(PACKAGES_DIR, packageItem.name, packageItem.asarFile);

        await this.downloadPackage(packageItem.name, 'asar', asarTempFile);

        renameSync(asarTempFile, asarFile);
    }    

    public static async downloadPackage(name: string, downloadType: 'latest' | 'asar', outputFile: string): Promise<void> {
        try {
            if (!existsSync(dirname(outputFile))) {
                mkdirSync(dirname(outputFile), { recursive: true });
            }
    
            const apiClient = APIClientService.getClient();
            const response: AxiosResponse<Readable> = await apiClient.get<Readable>(
                `device-packages/${name}/${downloadType}`,
                {
                    responseType: 'stream',
                }
            );
    
            const { data, headers } = response;

            const { ["content-length"]: contentLength, "content-type": contentType } = headers;
    
            console.log(name, downloadType, contentLength, contentType);
    
            const allowedTypes = ['application/octet-stream', 'application/json']

            if (!allowedTypes.includes(contentType)) {
                throw new Error(`Invalid content type: ${contentType}`);
            }
    
            const totalSize = parseInt(contentLength || '0', 10);
            let downloadedSize = 0;
    
            const writer = createWriteStream(outputFile);
    
            data.pipe(writer);

            data.on('data', (chunk) => {
                downloadedSize += chunk.length;
            });            
    
            return new Promise<void>((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`File downloaded: ${outputFile}`);
                    resolve();
                });
    
                writer.on('error', async (err) => {
                    console.error(`Error writing file @ ${downloadedString(downloadedSize, totalSize)}`);

                    if (existsSync(outputFile)) unlinkSync(outputFile);
                    reject(err);
                });
    
                data.on('error', (err) => {
                    console.error(`Error receiving the stream @ ${downloadedString(downloadedSize, totalSize)}`);
                    reject(err);
                });
            });
        } catch (err) {
            console.error(`Error downloading package ${name}, ${downloadType}:`, err);
            throw err;
        }
    }
}