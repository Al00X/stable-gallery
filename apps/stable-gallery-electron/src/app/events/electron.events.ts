/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, dialog, ipcMain } from 'electron';
import { environment } from '../../environments/environment';
import {dataPath, tempPath} from '../constants';
import App from '../app';
import * as fs from 'fs/promises';
import { join } from 'path';

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    App.mainWindow.on('resize', () => {
      App.mainWindow.webContents.send('window', App.mainWindow.isMaximized());
    });
    return ipcMain;
  }
}

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
  console.log(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

ipcMain.handle('get-user-data-path', () => {
  return dataPath;
});

ipcMain.handle('get-temp-path', () => {
  return tempPath;
})

ipcMain.handle('get-environment', () => {
  return environment;
});

ipcMain.handle('get-changelog', async () => {
  return (
    await fs.readFile(join(__dirname, '../../..', 'CHANGELOG.md'))
  ).toString();
});

ipcMain.handle('is-window-maximized', () => {
  return App.mainWindow.isMaximized();
});

ipcMain.handle('open-directory-select-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(App.mainWindow, {
    title: 'Choose a directory',
    properties: ['openDirectory'],
  });
  if (canceled) {
    return;
  } else {
    return filePaths[0];
  }
});

ipcMain.handle('window', (e, message) => {
  switch (message) {
    case 'close':
      App.mainWindow.close();
      break;
    case 'maximize':
      App.mainWindow.isMaximized()
        ? App.mainWindow.unmaximize()
        : App.mainWindow.maximize();
      break;
    case 'minimize':
      App.mainWindow.minimize();
      break;
  }
});

ipcMain.handle('reload', () => {
  App.mainWindow.reload();
})

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
