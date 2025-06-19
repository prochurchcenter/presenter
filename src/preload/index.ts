import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Gun.js API for peer connections
  gun: {
    // Get connected peers
    getPeers: async (): Promise<string[]> => {
      try {
        const result = await ipcRenderer.invoke('gun-peers')
        if (result.success) {
          return result.data
        }
        console.error('Error getting Gun peers:', result.error)
        return []
      } catch (error) {
        console.error('Error invoking gun-peers:', error)
        return []
      }
    },
    
    // Add a peer by URL
    addPeer: async (peerUrl: string): Promise<boolean> => {
      try {
        const result = await ipcRenderer.invoke('gun-add-peer', peerUrl)
        return result.success
      } catch (error) {
        console.error('Error invoking gun-add-peer:', error)
        return false
      }
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
