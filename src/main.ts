import { app, BrowserWindow } from 'electron';
import path from 'path';
require('electron-reload')(path.join(__dirname, '..', 'dist'), {
  electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron')
});

import { loadControllers } from './process/modules/controllers';
import { APP_NAME } from '../configs/consts';

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: APP_NAME,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const devMode = process.env.NODE_ENV === 'development';

  if (devMode) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null!;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.whenReady().then(() => {

  loadControllers();
});