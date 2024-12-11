import 'reflect-metadata';
import './process/core/logger-renderer';
import { app, BrowserWindow, Menu, Tray } from 'electron';
import path from 'path';
import { loadControllers } from './process/modules/controllers';
import { APP_NAME } from '../configs/consts';
import { AuthenticateService } from './process/core/authenticate.service';
import { getAutoStartup } from './process/core/store';
import { isDevelopment } from './shared/helpers/is-development.helper';
import logger from './process/core/logger';

logger.info('Version', process.env.npm_package_version);

if (isDevelopment()) {
    // supports hot-reload for electron when using ts-node
    require('electron-reload')(path.join(__dirname, '..', 'dist'), {
        electron: path.join(__dirname, '../..', 'node_modules', '.bin', 'electron')
    });
}

let mainWindow: BrowserWindow;
let tray: Tray | null = null;

const ApplicationIcon = isDevelopment() ?  path.join(__dirname, '../assets/icon.png') : path.join(__dirname, 'assets/icon.png');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {

    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    app.on('ready', () => {
        app.setLoginItemSettings({
            openAtLogin: getAutoStartup(),
            openAsHidden: getAutoStartup(),
        });
        createWindow();
    });
    
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
    
    app.whenReady().then(async () => {
    
        loadControllers();
    
        await AuthenticateService.initiate();
    });
}

function createWindow() {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: APP_NAME,
        icon: ApplicationIcon, // Caminho para o ícone
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: isDevelopment() ? false : true,
        frame: isDevelopment() ? true : false,
        resizable: isDevelopment(),
        fullscreenable: isDevelopment(),
    });

    if (isDevelopment()) {

        mainWindow.loadURL('http://localhost:8090');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
        mainWindow.setMenuBarVisibility(false);
    }

    tray = new Tray(ApplicationIcon);
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Abrir', click: () => mainWindow?.show() },
        { label: 'Sair', click: () => app.quit() },
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        mainWindow?.show();
    });

    mainWindow.on('close', (event) => {
        event.preventDefault();
        mainWindow?.hide();
    });
}