const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const { autoUpdater } = require("electron-updater")
const log = require('electron-log')

// Logging Einstellungen
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWin

const updateReadyDialog = {
    type: 'info',
    buttons: ['Okay'],
    title: 'Update fertig',
    message: 'Update wurde runtergeladen. App bitte neustarten!',
}

function createWindow() {
    mainWin = new BrowserWindow({width: 1000, height: 800})
    mainWin.webContents.openDevTools()
    mainWin.loadFile('index.html')    
}

function sendStatusToWindow(text) {
    log.info(text);
    mainWin.webContents.send('message', text);
  }

// Versionsnummer Anfrage
ipcMain.on('version-nummer', (event, data) => {
    sendStatusToWindow('Versionsnummer angefragt.');

    event.sender.send('version-nummer', app.getVersion())
})

// autoUpdater Listener
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    dialog.showMessageBox(mainWin, updateReadyDialog)
});


app.on('ready', createWindow)

app.on('ready', function()  {
    autoUpdater.checkForUpdatesAndNotify();
});