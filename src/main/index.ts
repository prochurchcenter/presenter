import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import http from 'http'
import icon from '../../resources/icon.png?asset'
import { open } from 'lmdb'
import Gun from 'gun'

// Setup LMDB database
const userDataPath = app.getPath('userData')
const videosPath = path.join(userDataPath, 'presenter/videos')
const dbPath = path.join(userDataPath, 'presenter/db')

if (!fs.existsSync(videosPath)) {
  fs.mkdirSync(videosPath, { recursive: true })
}

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true })
}

// Initialize LMDB database
const db = open({
  path: dbPath,
  compression: true
})

// Create separate stores for different data types
const songsDb = db.openDB({ name: 'songs' })
const presentationsDb = db.openDB({ name: 'presentations' })
const servicesDb = db.openDB({ name: 'services' })
const settingsDb = db.openDB({ name: 'settings' })

// Initialize Gun.js server for peer-to-peer sync
let gunServer
let httpServer
function initGunServer() {
  // Create HTTP server for Gun
  httpServer = http.createServer()
  httpServer.listen(8765, () => {
    console.log('Gun server listening on port 8765')
  })

  // Start Gun server using the HTTP server
  gunServer = Gun({
    web: httpServer,
    file: path.join(userDataPath, 'presenter/gun'),
    multicast: true, // Enable discovery on local network
    localStorage: false // We'll handle storage with LMDB
  })

  // Setup Gun data sync with LMDB
  const gunSongs = gunServer.get('songs')
  const gunPresentations = gunServer.get('presentations')
  const gunServices = gunServer.get('services')
  const gunSettings = gunServer.get('settings')

  // Sync data from Gun to LMDB
  gunSongs.map().on(async (data, id) => {
    if (!data) return
    try {
      await songsDb.put(id, data)
    } catch (error) {
      console.error('Error syncing from Gun to LMDB (songs):', error)
    }
  })

  gunPresentations.map().on(async (data, id) => {
    if (!data) return
    try {
      await presentationsDb.put(id, data)
    } catch (error) {
      console.error('Error syncing from Gun to LMDB (presentations):', error)
    }
  })

  gunServices.map().on(async (data, id) => {
    if (!data) return
    try {
      await servicesDb.put(id, data)
    } catch (error) {
      console.error('Error syncing from Gun to LMDB (services):', error)
    }
  })

  gunSettings.map().on(async (data, id) => {
    if (!data) return
    try {
      await settingsDb.put(id, data)
    } catch (error) {
      console.error('Error syncing from Gun to LMDB (settings):', error)
    }
  })

  console.log('Gun.js server initialized on port 8765')
}

function createWindow(): void {
  // Create the main window
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      allowRunningInsecureContent: true,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  // Create presenter window
  const presenterWindow = new BrowserWindow({
    fullscreen: true,
    titleBarStyle: 'hidden',
    alwaysOnTop: true,
    // kiosk: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Load windows
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}`)
    presenterWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/presenter`)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    presenterWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'presenter' })
  }

  // Show windows when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools()
  })

  presenterWindow.on('ready-to-show', () => {
    presenterWindow.show()
    presenterWindow.webContents.openDevTools()
  })

  // Set CSP headers for media content
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src 'self' blob: file:; img-src 'self' blob: data: file:; connect-src 'self' ws: wss:;"
        ]
      }
    })
  })

  // Do the same for presenter window
  presenterWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src 'self' blob: file:; img-src 'self' blob: data: file:; connect-src 'self' ws: wss:;"
        ]
      }
    })
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  // After creating presenter window
  ipcMain.on('update-presenter', (_, data) => {
    console.log('Received update to send to presenter:', data)
    if (!data) {
      console.error('Invalid data received for presenter')
      return
    }

    // Check if presenter window is available
    if (presenterWindow.isDestroyed()) {
      console.error('Presenter window is destroyed, cannot send update')
      return
    }

    try {
      // Send the data to presenter window
      console.log('Received update to send to presenter:', data);
      if (!data) {
        console.error('Invalid data received for presenter');
        return;
      }
      
      // Check if presenter window is available
      if (presenterWindow.isDestroyed()) {
        console.error('Presenter window is destroyed, cannot send update');
        return;
      }
      
      try {
        // Send the data to presenter window
        presenterWindow.webContents.send('presenter-update', data);
      } catch (error) {
        console.error('Error sending update to presenter:', error);
      }
    } catch (error) {
      console.error('Error sending update to presenter:', error)
    }
  })

  ipcMain.on('settings-update', (_, data) => {
    console.log('Received settings update for presenter')
    if (!presenterWindow.isDestroyed()) {
      console.log('Received settings update for presenter');
      if (!presenterWindow.isDestroyed()) {
        presenterWindow.webContents.send('settings-update', data);
      }
    }
  })

  ipcMain.on('select-video', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'] }]
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  })

  // Handle saving video to app storage
  ipcMain.on('save-video', async (_, filePath) => {
    try {
      const fileName = path.basename(filePath)
      const destinationPath = path.join(videosPath, fileName)

      // Copy file to application's storage
      fs.copyFileSync(filePath, destinationPath)

      return {
        success: true,
        savedPath: destinationPath,
        fileName: fileName
      }
    } catch (error: unknown) {
      console.error('Error saving video:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  })

  // Get list of saved videos
  ipcMain.on('get-saved-videos', () => {
    try {
      const files = fs.readdirSync(videosPath)
      return files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase()
          return ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].includes(ext)
        })
        .map((file) => {
          return {
            fileName: file,
            filePath: path.join(videosPath, file)
          }
        })
    } catch (error) {
      console.error('Error getting saved videos:', error)
      return []
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Initialize Gun.js server
  initGunServer()

  // Add new IPC methods for Gun.js peer connections
  ipcMain.handle('gun-peers', () => {
    if (!gunServer) return { success: false, error: 'Gun server not initialized' }

    try {
      // Gun.js internal structure may vary depending on version
      const peers = Object.keys(gunServer._.opt?.peers || {})
      return { success: true, data: peers }
    } catch (error) {
      console.error('Error getting Gun peers:', error)
      return { success: true, data: [] } // Return empty array on error
    }
  })

  ipcMain.handle('gun-add-peer', (_, peerUrl) => {
    if (!gunServer) return { success: false, error: 'Gun server not initialized' }

    try {
      // Add peer to Gun network
      gunServer.opt({ peers: [peerUrl] })
      return { success: true }
    } catch (error) {
      console.error('Error adding Gun peer:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error adding peer'
      }
    }
  })

  // Add method to get network interfaces for IP discovery
  ipcMain.handle('get-network-interfaces', () => {
    try {
      const { networkInterfaces } = require('os')
      const nets = networkInterfaces()
      const results = []

      // Get all network interfaces
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (loopback) addresses
          if (net.family === 'IPv4' && !net.internal) {
            results.push(net.address)
          }
        }
      }

      return results
    } catch (error) {
      console.error('Error getting network interfaces:', error)
      return []
    }
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  // Close the HTTP server if it exists
  if (httpServer) {
    httpServer.close(() => {
      console.log('Gun HTTP server closed')
    })
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.handle('select-image-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }]
  })

  if (canceled || filePaths.length === 0) {
    throw new Error('No file selected')
  }

  return `file://${filePaths[0]}`
})
ipcMain.handle('select-video-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mov'] }]
  })

  if (canceled || filePaths.length === 0) {
    throw new Error('No file selected')
  }

  return `file://${filePaths[0]}`
})

// Add LMDB handlers with Gun.js sync
ipcMain.handle('db-save-item', async (_, { type, id, data }) => {
  try {
    let targetDb
    let gunCollection

    switch (type) {
      case 'song':
        targetDb = songsDb
        gunCollection = 'songs'
        break
      case 'presentation':
        targetDb = presentationsDb
        gunCollection = 'presentations'
        break
      case 'service':
        targetDb = servicesDb
        gunCollection = 'services'
        break
      case 'settings':
        targetDb = settingsDb
        gunCollection = 'settings'
        break
      default:
        throw new Error(`Unknown item type: ${type}`)
    }

    // Save to LMDB
    await targetDb.put(id, data)

    // Also save to Gun.js if server is initialized
    if (gunServer) {
      try {
        gunServer.get(gunCollection).get(id).put(data)
      } catch (gunError) {
        console.error(`Error syncing to Gun.js (${type}):`, gunError)
        // Continue even if Gun sync fails - data is saved to LMDB
      }
    }

    return { success: true, id }
  } catch (error: unknown) {
    console.error('Error saving to database:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
})

ipcMain.handle('db-get-item', async (_, { type, id }) => {
  try {
    let targetDb
    let gunCollection

    switch (type) {
      case 'song':
        targetDb = songsDb
        gunCollection = 'songs'
        break
      case 'presentation':
        targetDb = presentationsDb
        gunCollection = 'presentations'
        break
      case 'service':
        targetDb = servicesDb
        gunCollection = 'services'
        break
      case 'settings':
        targetDb = settingsDb
        gunCollection = 'settings'
        break
      default:
        throw new Error(`Unknown item type: ${type}`)
    }

    // Try to get from LMDB
    const item = await targetDb.get(id)

    // Also try to fetch from Gun if server is initialized for latest data
    // This ensures we have the most up-to-date data from peers
    if (gunServer && !item) {
      try {
        const gunPromise = new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(null), 500) // Timeout after 500ms
          gunServer
            .get(gunCollection)
            .get(id)
            .once((data) => {
              clearTimeout(timeout)
              if (data) {
                // Also save to LMDB for future use
                targetDb
                  .put(id, data)
                  .catch((err) => console.error(`Error saving Gun data to LMDB (${type}):`, err))
              }
              resolve(data)
            })
        })

        const gunItem = await gunPromise
        if (gunItem) return { success: true, data: gunItem }
      } catch (gunError) {
        console.error(`Error fetching from Gun.js (${type}):`, gunError)
        // Continue with LMDB result if Gun fails
      }
    }

    return { success: true, data: item }
  } catch (error: unknown) {
    console.error('Error getting from database:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
})

ipcMain.handle('db-get-all-items', async (_, { type }) => {
  try {
    let targetDb
    let gunCollection

    switch (type) {
      case 'song':
        targetDb = songsDb
        gunCollection = 'songs'
        break
      case 'presentation':
        targetDb = presentationsDb
        gunCollection = 'presentations'
        break
      case 'service':
        targetDb = servicesDb
        gunCollection = 'services'
        break
      case 'settings':
        targetDb = settingsDb
        gunCollection = 'settings'
        break
      default:
        throw new Error(`Unknown item type: ${type}`)
    }

    // Get items from LMDB
    const items: Array<{ id: string } & Record<string, unknown>> = []
    for await (const { key, value } of targetDb.getRange()) {
      items.push({ id: key, ...value })
    }

    // Try to fetch from Gun if server is initialized
    // This ensures we have the most up-to-date data from peers
    if (gunServer) {
      try {
        const gunPromise = new Promise<Array<any>>((resolve) => {
          const timeout = setTimeout(() => resolve([]), 1000) // Timeout after 1000ms
          const gunItems: Record<string, any> = {}

          gunServer
            .get(gunCollection)
            .map()
            .once((data, id) => {
              if (data) {
                gunItems[id] = { id, ...data }
                // Also save to LMDB for future use
                targetDb
                  .put(id, data)
                  .catch((err) => console.error(`Error saving Gun data to LMDB (${type}):`, err))
              }
            })

          // Wait a bit to collect items from the network
          setTimeout(() => {
            clearTimeout(timeout)
            resolve(Object.values(gunItems))
          }, 500)
        })

        const gunItems = await gunPromise

        // Merge gun items with LMDB items, preferring Gun's data as it's potentially more recent
        if (gunItems.length > 0) {
          const mergedItems = [...items]

          for (const gunItem of gunItems) {
            const existingIndex = mergedItems.findIndex((item) => item.id === gunItem.id)
            if (existingIndex >= 0) {
              mergedItems[existingIndex] = gunItem
            } else {
              mergedItems.push(gunItem)
            }
          }

          return { success: true, data: mergedItems }
        }
      } catch (gunError) {
        console.error(`Error fetching from Gun.js (${type}):`, gunError)
        // Continue with LMDB result if Gun fails
      }
    }

    return { success: true, data: items }
  } catch (error: unknown) {
    console.error('Error getting all items from database:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
})

ipcMain.handle('db-delete-item', async (_, { type, id }) => {
  try {
    let targetDb
    let gunCollection

    switch (type) {
      case 'song':
        targetDb = songsDb
        gunCollection = 'songs'
        break
      case 'presentation':
        targetDb = presentationsDb
        gunCollection = 'presentations'
        break
      case 'service':
        targetDb = servicesDb
        gunCollection = 'services'
        break
      case 'settings':
        targetDb = settingsDb
        gunCollection = 'settings'
        break
      default:
        throw new Error(`Unknown item type: ${type}`)
    }

    // Delete from LMDB
    await targetDb.remove(id)

    // Also delete from Gun.js if server is initialized
    if (gunServer) {
      try {
        // In Gun.js, we "delete" by setting the node to null
        gunServer.get(gunCollection).get(id).put(null)
      } catch (gunError) {
        console.error(`Error deleting from Gun.js (${type}):`, gunError)
        // Continue even if Gun delete fails - data is deleted from LMDB
      }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting from database:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
})
