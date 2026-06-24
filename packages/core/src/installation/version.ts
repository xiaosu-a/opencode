declare global {
  const SUMOCODE_VERSION: string
  const SUMOCODE_CHANNEL: string
}

export const InstallationVersion = typeof SUMOCODE_VERSION === "string" ? SUMOCODE_VERSION : "local"
export const InstallationChannel = typeof SUMOCODE_CHANNEL === "string" ? SUMOCODE_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
