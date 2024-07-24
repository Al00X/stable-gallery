import * as path from 'path';
import { app } from 'electron';

export const rendererAppPort = 4200;
export const rendererAppName = 'stable-gallery'; // options.name.split('-')[0] + '-web'
export const electronAppName = 'stable-gallery-electron';
export const updateServerUrl = 'https://deployment-server-url.com'; // TODO: insert your update server url here

export const dataPath = path.join(app.getPath('appData'), rendererAppName);
export const tempPath = app.getPath('temp');
