// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require( "electron" );
const path = require( "path" );
const isMac = (process.platform !== "darwin");

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Create application menus
Menu.setApplicationMenu( Menu.buildFromTemplate([
    ...(isMac ? [{
        label: app.name,
        submenu: [
            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideothers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" }
        ]
    }] : []),
    {
        label: "File",
        submenu: [
            isMac ? { role: "close" } : { role: "quit" }
        ]
    },
    {
        label: "Edit",
        submenu: [
            {
                label: "Save",
                accelerator: "CmdOrCtrl+S",
                click () {
                    mainWindow.webContents.send( "save" );
                }
            },
            {
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                click () {
                    mainWindow.webContents.send( "undo" );
                }
            },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                click () {
                    mainWindow.webContents.send( "redo" );
                }
            },
        ]
    },
    {
        label: "View",
        submenu: [
            { role: "reload" },
            { role: "forcereload" },
            { role: "toggledevtools" },
            { type: "separator" },
            { role: "resetzoom" },
            { role: "zoomin" },
            { role: "zoomout" },
            { type: "separator" },
            { role: "togglefullscreen" }
        ]
    },
    {
        label: "Window",
        submenu: [
            { role: "minimize" },
            { role: "zoom" },
            ...(isMac ? [
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" }
            ] : [
            { role: "close" }
            ])
        ]
    },
    {
        role: "help",
        submenu: [
            {
                label: "Learn More",
                click: async () => {
                    const { shell } = require( "electron" );
                    await shell.openExternal( "https://2dk.kitajchuk.com" );
                }
            }
        ]
    }
]));

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        title: "2dk Studio",
        center: true,
        width: 1440,
        height: 900,
        backgroundColor: "#000",
        webPreferences: {
            preload: path.join( __dirname, "preload.js" ),
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile( "index.html" );

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on( "closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on( "ready" , createWindow );

// Quit when all windows are closed.
app.on( "window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if ( isMac ) {
        app.quit();
    }
});

app.on( "activate", () => {
    // On macOS it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if ( mainWindow === null ) {
        createWindow();
    }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
