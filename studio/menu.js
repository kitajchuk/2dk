const isMac = (process.platform === "darwin");
const { app, Menu, ipcMain } = require( "electron" );
const db = require( "./source/js/db" );

// Global mainWindow
let mainWindow;

// Keep a global reference to the active game and map objects
let activeGames = [];
let activeMaps = [];
let activeGame = null;
let activeMap = null;

// Global database client
let dBase;

// Getter methods for application menus
// The Games and Maps menus will dynamically update their load submenus
const loadAssets = () => {
    const assets = [
        "tiles",
        "sounds",
        // "sprites",
    ];

    assets.forEach(( type ) => {
        dBase.getFiles( type ).then(( response ) => {
            mainWindow.webContents.send( "menu-assets", response );
        });
    });
};
const loadMaps = () => {
    dBase.getMaps().then(( response ) => {
        activeMaps = response.maps;
        setMenu();
    });
};
const loadGames = () => {
    db.DB.getGames().then(( response ) => {
        activeGames = response.games;
        mainWindow.webContents.send( "menu-loadgames" );
        setMenu();
    });
};
const loadMap = () => {
    dBase.getMap( activeMap ).then(( response ) => {
        mainWindow.webContents.send( "menu-loadmap", response.map );
    });
}
const loadGame = () => {
    dBase.open( activeGame.id ).then(() => {
        dBase.getGame().then(( response ) => {
            mainWindow.webContents.send( "menu-loadgame", response.game );
        });
        loadAssets();
        loadMaps();
    });
};
const getGamesMenu = () => {
    const gamesLoadout = {
        label: "Load Project",
        submenu: [],
    };

    activeGames.forEach(( game ) => {
        gamesLoadout.submenu.push({
            label: game.name,
            click () {
                // if ( !activeGame || game.id !== activeGame.id ) {}
                activeGame = game;
                loadGame();
            }
        });
    });

    return {
        label: "Project",
        submenu: [
            {
                label: "New Project",
                click () {
                    mainWindow.webContents.send( "menu-newgame", null );
                }
            },
            gamesLoadout,
        ]
    };
};
const getMapsMenu = () => {
    const mapsLoadout = {
        label: "Load Map",
        submenu: [],
    };

    activeMaps.forEach(( map ) => {
        mapsLoadout.submenu.push({
            label: map.name,
            click () {
                // if ( !activeMap || map.id !== activeMap.id ) {}
                activeMap = map;
                loadMap();
            }
        });
    });

    return {
        label: "Maps",
        submenu: [
            {
                label: "New Map",
                click () {
                    mainWindow.webContents.send( "menu-newmap", null );
                }
            },
            mapsLoadout,
            { type: "separator" },
            {
                label: "Add Tileset",
                click () {
                    mainWindow.webContents.send( "menu-newtileset", null );
                }
            },
            {
                label: "Add Sound",
                click () {
                    mainWindow.webContents.send( "menu-newsound", null );
                }
            },
            { type: "separator" },
            {
                label: "Save Map",
                accelerator: "CmdOrCtrl+S",
                click () {
                    mainWindow.webContents.send( "menu-savemap", null );
                }
            },
            {
                label: "Undo Map Paint",
                accelerator: "CmdOrCtrl+Z",
                click () {
                    mainWindow.webContents.send( "menu-undomap", null );
                }
            },
            {
                label: "Redo Map Paint",
                accelerator: "Shift+CmdOrCtrl+Z",
                click () {
                    mainWindow.webContents.send( "menu-redomap", null );
                }
            },
            {
                label: "Toggle Map Grid",
                accelerator: "CmdOrCtrl+;",
                click () {
                    mainWindow.webContents.send( "menu-togglegrid", null );
                }
            },
        ]
    };
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
    Menu.setApplicationMenu( Menu.buildFromTemplate([
        getAppMenu(),
        getFileMenu(),
        getGamesMenu(),
        getMapsMenu(),
        getViewMenu(),
        getWindowMenu(),
        getHelpMenu(),
    ]));
};

// Listen for events from the ipcRenderer
ipcMain.on( "renderer-loadgames", ( event, data ) => {
    loadGames();
});

ipcMain.on( "renderer-newgame", ( event, data ) => {
    db.DB.addGame( data ).then(( response ) => {
        activeGames = response.games;
        setMenu();
    });
});

ipcMain.on( "renderer-newmap", ( event, data ) => {
    dBase.addMap( data ).then(( response ) => {
        activeMaps = response.maps;
        setMenu();
    });
});

ipcMain.on( "renderer-deletegame", ( event, data ) => {
    db.DB.deleteGame( data ).then(( response ) => {
        activeGames = response.games;
        setMenu();
    });
});

ipcMain.on( "renderer-deletemap", ( event, data ) => {
    dBase.deleteMap( data ).then(( response ) => {
        activeMaps = response.maps;
        setMenu();
    });
});

ipcMain.on( "renderer-newfile", ( event, data ) => {
    dBase.addFile( data ).then(( response ) => {
        mainWindow.webContents.send( "menu-assets", response );
    });
});

ipcMain.on( "renderer-deletefile", ( event, data ) => {
    dBase.deleteFile( data ).then(( response ) => {
        mainWindow.webContents.send( "menu-assets", response );
    });
});

ipcMain.on( "renderer-savemap", ( event, data ) => {
    dBase.updateMap( data ).then(( response ) => {
        activeMaps = response.maps;
        setMenu();
    });
});



module.exports = {
    init ( mainWin ) {
        mainWindow = mainWin;
        dBase = new db.DB();

        loadGames();

        return this;
    }
};
