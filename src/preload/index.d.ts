import { ElectronAPI } from '@electron-toolkit/preload'

// Define our Gun-related API types
interface GunAPI {
  getPeers: () => Promise<string[]>
  addPeer: (peerUrl: string) => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      gun: GunAPI
    }
  }
}
