import { createHash } from "crypto";
import { machineIdSync } from "node-machine-id";

export function generateDeviceHash(installDate: Date) {

    const uuid = machineIdSync(false);

    return createHash('sha1').update(`${uuid}-${installDate.toISOString()}`).digest('hex')
}