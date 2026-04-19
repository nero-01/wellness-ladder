import type { MiloMascotDrive } from "@/lib/milo-mood"
import type { MascotState } from "@/components/MascotStates"

/** Map Milo mood drive to raster mascot animation state (same string union). */
export function miloDriveToMascotState(drive: MiloMascotDrive): MascotState {
  return drive as MascotState
}
