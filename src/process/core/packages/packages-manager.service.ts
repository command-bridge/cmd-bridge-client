import { existsSync, mkdirSync, readdirSync } from "fs";
import { PackageItem } from "./packages.type";
import { PACKAGES_DIR } from "./packages.const";
import { PackagesFileService } from "./package-file.service";
import { join, resolve } from "path";
import { APIClientService } from "../api-client.service";
import { UUID } from "crypto";
import { extractAll } from "@electron/asar";
import { ChildProcess, fork, Serializable } from "child_process";
import { isDevelopment } from "../../../shared/helpers/is-development.helper";

interface IPackage {
    callableMethods: string[],
    [key: string]: any;
}

interface IPackageMethodResponse {
    success: boolean;
    error?: string;
    response?: any;
    uuid: UUID;
}

export interface IPackageCallMethodPayload {
    uuid: UUID,
    package: string,
    method: string,
    parameters: any,
}

export class PackagesManagerService {

    private static packagesMetadata: PackageItem[] = [];
    private static loadedPackages = new Map<string, IPackage>;
    private static loadedPackagesAsProcess = new Map<string, ChildProcess>;

    public static getPackageMetadatas(cache: boolean = true) {

        if(!cache || !this.packagesMetadata.length) this.reloadPackagesMetadata();

        return this.packagesMetadata;
    }

    public static initiate() {

        this.reloadPackagesMetadata();
    }

    public static reloadPackagesMetadata() {

        const packagesDir = this.getPackageDirectories();
        this.packagesMetadata = packagesDir
            .map(PackagesFileService.readLatest)
            .filter((entry) => entry !== null);
    }

    public static getPackageDirectories() {
    
        if (!existsSync(PACKAGES_DIR)) {
            mkdirSync(PACKAGES_DIR, { recursive: true });
        }

        const entries = readdirSync(PACKAGES_DIR, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
    }

    public static async allPackagesReady() {

        const packages = this.getPackageMetadatas(false);

        for(const packageItem of packages) {

            isDevelopment() 
                ? await this.loadPackage(packageItem)
                : await this.loadPackageAsProcess(packageItem);
        }

        await APIClientService.post('device-events/on-ready')
    }

    public static async loadPackageAsProcess(packageItem: PackageItem) {
        const { name, asarFile } = packageItem;

        const asarPath = join(PACKAGES_DIR, name, asarFile);
        const extractDir = join(PACKAGES_DIR, name, `${asarFile}-extracted`);
        const bundleFile = join(extractDir, 'bundle.js');
    
        try {
            // Extrai o conteúdo do .asar, se necessário
            if (!existsSync(extractDir)) {
                console.log(`Extracting ${asarPath} to ${extractDir}`);
                extractAll(asarPath, extractDir);
            }
    
            if (existsSync(bundleFile)) {
 
                const child = fork(bundleFile, [], { silent: true });

                if (child.stdout) {
                    child.stdout.on('data', (data) => {
                        console.log(`[${name}] ${data.toString()}`);
                    });
                }

                if (child.stderr) {
                    child.stderr.on('data', (data) => {
                        console.error(`[${name}] ${data.toString()}`);
                    });
                }

                child.on('message', (message) => {
                    console.log(`[${name}] Message from child process:`, message);
                });

                child.on('error', (err) => {
                    console.error(`[${name}] Message from child process:`, err);
                });

                this.loadedPackagesAsProcess.set(packageItem.name, child);
            } else {
                console.error('Bundle file not found after extraction:', bundleFile);
            }
        } catch (error) {
            console.error('Failed to load package:', error);
        }
    }

    public static async loadPackage(packageItem: PackageItem) {

        const packageBasePath = resolve(__dirname, '../../packages');

        console.log('Base path', packageBasePath);

        const asarFile = join(packageBasePath, packageItem.name, packageItem.asarFile);
        const bundleFile = join(asarFile, 'bundle.js')

        if(!existsSync(asarFile)) {
            
            console.error('Asar file not found:', asarFile);
        }

        if(!existsSync(bundleFile)) {

            console.error('Bundle file inside asar file not found:', asarFile);
        }

        try {

            console.log(`Loading package ${bundleFile}`)
            // Substitua import() por require()
            const loadedPackage = require(bundleFile) as IPackage;
    
            this.loadedPackages.set(packageItem.name, loadedPackage);
            console.log(`Package ${packageItem.name} loaded successfully`);
        } catch (error) {
            console.error(`Failed to load package ${packageItem.name}:`, error);
        }
    }

    public static async runPackageMethod(payload: IPackageCallMethodPayload): Promise<IPackageMethodResponse> {

        const { method, package: packageName, parameters, uuid } = payload;

        const loadedPackage = this.loadedPackages.get(packageName);
        const loadedPackageAsProcess = this.loadedPackagesAsProcess.get(packageName);
        const runningPackage = loadedPackage || loadedPackageAsProcess;

        if(!runningPackage)
            return { uuid, success: false, error: `[runPackageMethod] Package ${packageName} not loaded.` };
        
        if(runningPackage instanceof ChildProcess) {

            const result = await this.callProcessMethod(runningPackage, payload) as IPackageMethodResponse;

            result.uuid = uuid;

            return result;
        } else {

            if (!(method in runningPackage) || typeof runningPackage[method] !== 'function')
                return { uuid, success: false, error: `[runPackageMethod] Method '${method}' not exists or is not a function on '${packageName}'.` };   
    
            try {
    
                return { uuid, ...(await runningPackage[method](parameters)) };
            } catch (e) {
    
                const error = e as Error;
    
                return { uuid, success: false, error: `[runPackageMethod] ${error.name}: ${error.message}` } 
            }
        }
    }

    private static async callProcessMethod(child: ChildProcess, payload: IPackageCallMethodPayload): Promise<Serializable> {

        return new Promise((resolve, reject) => {

            const { method, parameters } = payload;

            // Envia uma mensagem para o processo filho
            child.send({ method, parameters });

            // Aguarda a resposta do processo filho
            child.once('message', (message) => {
                resolve(message);
            });            
        })
    }
}