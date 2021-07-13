'use strict';

import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { format as formatUrl } from 'url';
import { autoUpdater } from "electron-updater"
import { parse } from 'node-html-parser';

const isDevelopment = process.env.NODE_ENV !== 'production';

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow;
var browserWindow
function createMainWindow() {
  autoUpdater.checkForUpdatesAndNotify();
  browserWindow = new BrowserWindow({ 
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    minWidth: 800,
    minHeight: 600,
    width: 840,
    height: 680
  });

  if (isDevelopment) {
    // browserWindow.webContents.openDevTools();
  }

  if (isDevelopment) {
    browserWindow.loadURL(`https://cms1.nonfungible.com`);//`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`);
  } else {
    browserWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    );
  }

  browserWindow.on('closed', () => {
    mainWindow = null;
  });

  browserWindow.webContents.on('devtools-opened', () => {
    browserWindow.focus();
    setImmediate(() => {
      browserWindow.focus();
    });
  });

  browserWindow.webContents.on('did-navigate', (contents) => {
    browserWindow.webContents.executeJavaScript(`
      require('electron').ipcRenderer.send('gpu', document.body.innerHTML);
    `);
    console.log(contents)
  } )

  

  return browserWindow;
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow();
  }
});

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow();
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('gpu', (_, gpu) => {
  const body = parse( gpu );
  const token = body.querySelector('pre')?.childNodes[0]?._rawText;
  var jwtAuthToken;
  if ( typeof token != undefined ) {
    try {
      jwtAuthToken = JSON.parse( token )?.jwtAuthToken
      if ( typeof jwtAuthToken != undefined ) {
        console.log( jwtAuthToken );
        browserWindow.loadURL(`https://cms1.nonfungible.com/docs`);
        browserWindow.show();
      }
    } catch (e) {
      return false;
    }
    
  }
})