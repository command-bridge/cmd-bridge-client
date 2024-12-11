import { SSEAction } from "../core/decorators/sse-actions.decorator";
import { APIClientService } from "../core/api-client.service";
import { SendPackagesResponse } from "../core/packages/packages.type";
import { IPackageCallMethodPayload, PackagesManagerService } from "../core/packages/packages-manager.service";
import { PackagesFileService } from "../core/packages/package-file.service";
import logger from "../core/logger";

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

            logger.info('Removing deprecated packages...')

            for(const packageToRemove of data.toRemove) {

                PackagesFileService.removePackage(packageToRemove.name)
            }
        }

        if(data.toDownload.length) {

            logger.info('Downloading new packages...')
        
            for(const packageItem of data.toDownload) {

                const { name } = packageItem;
                
                await PackagesFileService.downloadAndSaveLatestFile(name);

                const metadataPackage = PackagesFileService.readLatest(name);

                if(metadataPackage)
                    await PackagesFileService.downloadAndSaveAsarFile(metadataPackage);
                else
                    throw new Error(`Latest file not loaded for ${name}`);
            }
        }

        if(data.toUpdate.length) {

            logger.info('Updating packages...')
        
            for(const packageItem of data.toUpdate) {

                const { name } = packageItem;

                PackagesFileService.removePackage(name)
                
                await PackagesFileService.downloadAndSaveLatestFile(name);

                const metadataPackage = PackagesFileService.readLatest(name);

                if(metadataPackage){
                    await PackagesFileService.downloadAndSaveAsarFile(metadataPackage); 
                }
                else
                    throw new Error(`Latest file not loaded for ${name}`);
            };
        }

        await PackagesManagerService.allPackagesReady()
    }

    @SSEAction('package')
    public static async packageAction(payload: IPackageCallMethodPayload) {

        const respose = await PackagesManagerService.runPackageMethod(payload);

        logger.info('packageAction response:', respose)

        await APIClientService.post('device-events/response', respose);
    }
}