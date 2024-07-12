/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import {app, dialog, ipcMain} from 'electron';
import { environment } from '../../environments/environment';
import {dataPath} from "../constants";
import App from "../app";
import * as fs from 'fs/promises';
import {join} from "path";

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
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
})

ipcMain.handle('get-environment', () => {
  return environment;
})

ipcMain.handle('get-changelog', async () => {
  return (await fs.readFile(join(__dirname, '../../..', 'CHANGELOG.md'))).toString();
})

ipcMain.handle('open-directory-select-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(App.mainWindow, {
    title: 'Choose a directory',
    properties: ['openDirectory']
  })
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
})

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
