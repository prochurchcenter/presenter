import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import icon from '../../resources/icon.png?asset'
import { open } from 'lmdb'

// Setup LMDB database
const userDataPath = app.getPath('userData');
const videosPath = path.join(userDataPath, 'presenter/videos');
const dbPath = path.join(userDataPath, 'presenter/db');

if (!fs.existsSync(videosPath)) {
  fs.mkdirSync(videosPath, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Initialize LMDB database
const db = open({
  path: dbPath,
  compression: true
});

// Create separate stores for different data types
const songsDb = db.openDB({ name: 'songs'});
const presentationsDb = db.openDB({name:'presentations'});
const servicesDb = db.openDB({ name:'services'});
const settingsDb = db.openDB({ name:'settings'});

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
      webSecurity: false,
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
    })

    ipcMain.on('settings-update', (_, data) => {
      console.log('Received settings update for presenter');
      if (!presenterWindow.isDestroyed()) {
        presenterWindow.webContents.send('settings-update', data);
      }
    })

    ipcMain.on('select-video', async () => {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'] }]
      });
      
      if (result.canceled) {
        return null;
      }
      
      return result.filePaths[0];
    });
    
    // Handle saving video to app storage
    ipcMain.on('save-video', async (_, filePath) => {
      try {
        const fileName = path.basename(filePath);
        const destinationPath = path.join(videosPath, fileName);
        
        // Copy file to application's storage
        fs.copyFileSync(filePath, destinationPath);
        
        return {
          success: true,
          savedPath: destinationPath,
          fileName: fileName
        };
      } catch (error: any) {
        console.error('Error saving video:', error);
        return {
          success: false,
          error: error.message
        };
      }
    });
    
    // Get list of saved videos
    ipcMain.on('get-saved-videos', () => {
      try {
        const files = fs.readdirSync(videosPath);
        return files.filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].includes(ext);
        }).map(file => {
          return {
            fileName: file,
            filePath: path.join(videosPath, file)
          };
        });
      } catch (error) {
        console.error('Error getting saved videos:', error);
        return [];
      }
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

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
  });
  
  if (canceled || filePaths.length === 0) {
    throw new Error('No file selected');
  }
  
  return `file://${filePaths[0]}`;
});
ipcMain.handle('select-video-file', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg', 'mov'] }]
  });
  
  if (canceled || filePaths.length === 0) {
    throw new Error('No file selected');
  }
  
  return `file://${filePaths[0]}`;
});

// Add LMDB handlers
ipcMain.handle('db-save-item', async (_, { type, id, data }) => {
  try {
    let targetDb;
    switch (type) {
      case 'song':
        targetDb = songsDb;
        break;
      case 'presentation':
        targetDb = presentationsDb;
        break;
      case 'service':
        targetDb = servicesDb;
        break;
      case 'settings':
        targetDb = settingsDb;
        break;
      default:
        throw new Error(`Unknown item type: ${type}`);
    }
    
    await targetDb.put(id, data);
    return { success: true, id };
  } catch (error:any) {
    console.error('Error saving to database:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-item', async (_, { type, id }) => {
  try {
    let targetDb;
    switch (type) {
      case 'song':
        targetDb = songsDb;
        break;
      case 'presentation':
        targetDb = presentationsDb;
        break;
      case 'service':
        targetDb = servicesDb;
        break;
      case 'settings':
        targetDb = settingsDb;
        break;
      default:
        throw new Error(`Unknown item type: ${type}`);
    }
    
    const item = await targetDb.get(id);
    return { success: true, data: item };
  } catch (error:any) {
    console.error('Error getting from database:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-all-items', async (_, { type }) => {
  try {
    let targetDb;
    switch (type) {
      case 'song':
        targetDb = songsDb;
        break;
      case 'presentation':
        targetDb = presentationsDb;
        break;
      case 'service':
        targetDb = servicesDb;
        break;
      case 'settings':
        targetDb = settingsDb;
        break;
      default:
        throw new Error(`Unknown item type: ${type}`);
    }
    
    const items = [];
    for await (const { key, value } of targetDb.getRange()) {
      //@ts-ignore
      items.push({ id: key, ...value });
    }
    
    return { success: true, data: items };
  } catch (error:any) {
    console.error('Error getting all items from database:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-item', async (_, { type, id }) => {
  try {
    let targetDb;
    switch (type) {
      case 'song':
        targetDb = songsDb;
        break;
      case 'presentation':
        targetDb = presentationsDb;
        break;
      case 'service':
        targetDb = servicesDb;
        break;
      case 'settings':
        targetDb = settingsDb;
        break;
      default:
        throw new Error(`Unknown item type: ${type}`);
    }
    
    await targetDb.remove(id);
    return { success: true };
  } catch (error:any) {
    console.error('Error deleting from database:', error);
    return { success: false, error: error.message };
  }
});
