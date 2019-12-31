// Modules to control application life and create native browser window
const { app, ipcMain, BrowserWindow, Menu } = require( "electron" );
const isMac = (process.platform === "darwin");
const path = require( "path" );
const db = require( "./source/js/db" );

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// Keep a global reference to the active game and map objects
let activeGame;
let activeMap;

// Getter methods for application menus
// The Games and Maps menus will dynamically update their load submenus
const getGamesMenu = () => {
    return new Promise(( resolve ) => {
        const gamesLoadout = {
            label: "Load Game",
            submenu: [],
        };

        db.DB.getGames().then(( games ) => {
            games.forEach(( game ) => {
                gamesLoadout.submenu.push({
                    label: game.name,
                    click ( menuItem, browserWindow, event ) {
                        mainWindow.webContents.send( "loadgame", game );
                        activeGame = game;
                        setMenu();
                    }
                });
            });

            resolve({
                label: "Games",
                submenu: [
                    {
                        label: "New Game",
                        click () {
                            mainWindow.webContents.send( "newgame" );
                        }
                    },
                    gamesLoadout,
                ]
            });
        });
    });
};
const getMapsMenu = () => {
    return new Promise(( resolve ) => {
        const mapsLoadout = {
            label: "Load Map",
            submenu: [],
        };
        const resolveMaps = () => {
            resolve({
                label: "Maps",
                submenu: [
                    {
                        label: "New Map",
                        click () {
                            mainWindow.webContents.send( "newmap" );
                        }
                    },
                    mapsLoadout,
                    {
                        label: "Add Tileset",
                        click () {
                            mainWindow.webContents.send( "addtileset" );
                        }
                    },
                    {
                        label: "Add Sound",
                        click () {
                            mainWindow.webContents.send( "addsound" );
                        }
                    },
                    {
                        label: "Save Map",
                        accelerator: "CmdOrCtrl+S",
                        click () {
                            mainWindow.webContents.send( "savemap" );
                        }
                    },
                    {
                        label: "Undo Map Paint",
                        accelerator: "CmdOrCtrl+Z",
                        click () {
                            mainWindow.webContents.send( "undomap" );
                        }
                    },
                    {
                        label: "Redo Map Paint",
                        accelerator: "Shift+CmdOrCtrl+Z",
                        click () {
                            mainWindow.webContents.send( "redomap" );
                        }
                    },
                ]
            });
        };

        if ( activeGame ) {
            db.DB.getMaps( activeGame.id ).then(( maps ) => {
                maps.forEach(( map ) => {
                    mapsLoadout.submenu.push({
                        label: map.name,
                        click ( menuItem, browserWindow, event ) {
                            activeMap = map;
                            mainWindow.webContents.send( "loadmap", map );
                        }
                    });
                });

                resolveMaps();
            });

        } else {
            resolveMaps();
        }
    });
};
const getAppMenu = () => {
    return (isMac ? {
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
    } : {});
};
const getFileMenu = () => {
    return {
        label: "File",
        submenu: [
            isMac ? { role: "close" } : { role: "quit" }
        ]
    };
};
const getViewMenu = () => {
    return {
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
    };
};
const getWindowMenu = () => {
    return {
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
    };
};
const getHelpMenu = () => {
    return {
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
    };
};
const setMenu = () => {
    getGamesMenu().then(( gamesMenu ) => {
        getMapsMenu().then(( mapsMenu ) => {
            Menu.setApplicationMenu( Menu.buildFromTemplate([
                getAppMenu(),
                getFileMenu(),
                gamesMenu,
                mapsMenu,
                getViewMenu(),
                getWindowMenu(),
                getHelpMenu(),
            ]));
        });
    });
}



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

    // Set application menus
    setMenu();

    // Listen for events from the ipcRenderer
    ipcMain.on( "newgame", ( event, game ) => {
        setMenu();
    });

    ipcMain.on( "newmap", ( event, map ) => {
        setMenu();
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
