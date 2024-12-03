import { readdirSync } from "fs";
import { PackageItem } from "./packages.type";
import { PACKAGES_DIR } from "./packages.const";
import { PackagesFileService } from "./package-file.service";
import { join } from "path";

export class PackagesManagerService {

    private static packagesMetadata: PackageItem[] = [];

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
    
        const entries = readdirSync(PACKAGES_DIR, { withFileTypes: true });
        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name);
    }

    public static allPackagesReady() {

        const packages = this.getPackageMetadatas(false);

        packages.forEach(async (packageItem) => await this.loadPackage(packageItem));
    }

    public static async loadPackage(packageItem: PackageItem) {

        const asarFile = join(PACKAGES_DIR, packageItem.name, packageItem.asarFile, 'bundle.js');

        console.log(`Loading package ${packageItem.name}`)

        const asar = await import(asarFile);

        console.log(asar);
    }
}