const { app, BrowserWindow } = require( "electron" );
const path = require( "path" );
const menu = require( "./server/menu" );
const watcher = require( "./watcher" );
const isMac = (process.platform === "darwin");

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        title: "2dk Studio",
        center: true,
        width: 2560,
        height: 1440,
        backgroundColor: "#000",
        webPreferences: {
            preload: path.join( __dirname, "preload.js" ),
            sandbox: false,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile( "index.html" );

    // mainWindow.webContents.openDevTools();

    menu.init( mainWindow );
    watcher.init( mainWindow );
};

app.whenReady().then( () => {
    createWindow();

    app.on( "activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on( "window-all-closed", () => {
    if ( !isMac ) {
        app.quit();
    }
});