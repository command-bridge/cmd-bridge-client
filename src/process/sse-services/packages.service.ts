import { SSEAction } from "../core/decorators/sse-actions.decorator";
import { APIClientService } from "../core/api-client.service";
import { SendPackagesResponse } from "../core/packages/packages.type";
import { PackagesManagerService } from "../core/packages/packages-manager.service";
import { PackagesFileService } from "../core/packages/package-file.service";

export class SSEPackagesService {

    @SSEAction('send-packages')
    public static async sendPackages() {

        const packageMetadatas = PackagesManagerService.getPackageMetadatas();
        const packagesToCheck = packageMetadatas.map((item) => {
            return { name: item.name, version: item.version }
        })

        const { data } = await APIClientService.post<SendPackagesResponse>('device-packages', {
            packages: packagesToCheck
        });

        if(data.toRemove.length) {

            console.log('Removing deprecated packages...')

            data.toRemove.forEach((packageToRemove) => PackagesFileService.removePackage(packageToRemove.name));
        }

        if(data.toDownload.length) {

            console.log('Downloading new packages...')
        
            data.toDownload.forEach(async (packageItem) => {

                const { name } = packageItem;
                
                await PackagesFileService.downloadAndSaveLatestFile(name);

                const metadataPackage = PackagesFileService.readLatest(name);

                if(metadataPackage)
                    await PackagesFileService.downloadAndSaveAsarFile(metadataPackage);
                else
                    throw new Error(`Latest file not loaded for ${name}`);
            });
        }

        if(data.toUpdate.length) {

            console.log('Updating packages...')
        
            data.toUpdate.forEach(async (packageItem) => {

                const { name } = packageItem;

                const oldMetadataPackage = PackagesFileService.readLatest(name);
                
                await PackagesFileService.downloadAndSaveLatestFile(name);

                const metadataPackage = PackagesFileService.readLatest(name);

                if(metadataPackage){
                    await PackagesFileService.downloadAndSaveAsarFile(metadataPackage);

                    if(oldMetadataPackage)
                        PackagesFileService.removeAsar(oldMetadataPackage);
                    else
                        console.error(`Failed to remove previous asar file for package ${name} during update.`);   
                }
                else
                    throw new Error(`Latest file not loaded for ${name}`);
            });
        }

        PackagesManagerService.allPackagesReady()
    }
}