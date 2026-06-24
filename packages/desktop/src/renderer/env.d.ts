import type { ElectronAPI } from "../preload/types"

declare global {
  interface Window {
    api: ElectronAPI
    __SUMOCODE__?: {
      deepLinks?: string[]
    }
  }
}
