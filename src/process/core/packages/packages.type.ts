export type PackageItem = {
    name: string;
    version: string;
    checksum: string;
    asarFile: string;
    releaseDate: Date;
}

export type PackageItemResponse = {
    name: string;
    version: string;
}

export type SendPackagesResponse = {
    toUpdate: PackageItemResponse[],
    toDownload: PackageItemResponse[],
    toRemove: PackageItemResponse[]
}