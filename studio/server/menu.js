const isMac = (process.platform === "darwin");
const { app, Menu, MenuItem, ipcMain } = require( "electron" );
const { DB } = require( "./db" );

// Global mainWindow
let mainWindow;

// Keep a global reference to the active game and map objects
let contextMenu = null;
let activeGames = [];
let activeMaps = [];
let activeGame = null;
let activeMap = null;
let activeSelect = false;

// Global database client
let dBase;

// First class methods for application menus
// The Games / Maps menus will dynamically update their load menus
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
        mainWindow.webContents.send( "menu-loadmaps", activeMaps );
        setMenu();
    });
};
const loadGames = () => {
    DB.getGames().then(( response ) => {
        activeGames = response.games;
        mainWindow.webContents.send( "menu-loadgames", activeGames );
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
const resetAll = () => {
    activeGames = [];
    activeMaps = [];
    activeGame = null;
    activeMap = null;
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
            { type: "separator" },
            {
                label: "Project Settings",
                click () {
                    mainWindow.webContents.send( "menu-gamesettings", null );
                }
            },
        ]
    };
};
const getMapsMenu = () => {
    const mapsLoadout = {
        label: "Load Map",
        submenu: [],
    };
    const selectionLoadout = {
        label: "Selection",
        submenu: activeSelect ? getContextMenu() : [],
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
                label: "Map Settings",
                click () {
                    mainWindow.webContents.send( "menu-mapsettings", null );
                }
            },
            { type: "separator" },
            {
                label: "Manage Tilesets",
                click () {
                    mainWindow.webContents.send( "menu-newtileset", null );
                }
            },
            {
                label: "Manage Sounds",
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
                label: "Toggle Grid",
                accelerator: "CmdOrCtrl+;",
                click () {
                    mainWindow.webContents.send( "menu-togglegrid", null );
                }
            },
            {
                label: "Undo Paint (TODO)",
                accelerator: "CmdOrCtrl+Z",
                click () {
                    mainWindow.webContents.send( "menu-undomap", null );
                }
            },
            {
                label: "Redo Paint (TODO)",
                accelerator: "Shift+CmdOrCtrl+Z",
                click () {
                    mainWindow.webContents.send( "menu-redomap", null );
                }
            },
            { type: "separator" },
            selectionLoadout
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
const getContextMenu = () => {
    return [
        {
            label: "Create Active Tiles",
            click () {
                mainWindow.webContents.send( "menu-contextmenu", "create-activetiles" );
            },
        },
        {
            label: "Remove Active Tiles",
            click ( menuItem, browserWindow, event ) {
                mainWindow.webContents.send( "menu-contextmenu", "remove-activetiles" );
            },
        },
        {
            label: "Select Matching Tiles",
            click ( menuItem, browserWindow, event ) {
                mainWindow.webContents.send( "menu-contextmenu", "select-matching-tiles" );
            },
        },
        {
            label: "Deselect Tiles",
            click ( menuItem, browserWindow, event ) {
                mainWindow.webContents.send( "menu-contextmenu", "deselect-tiles" );
            },
        },
        {
            label: "Deselect Tile",
            click ( menuItem, browserWindow, event ) {
                mainWindow.webContents.send( "menu-contextmenu", "deselect-tile" );
            },
        },
    ];
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


// Set the global context menu for reference
contextMenu = Menu.buildFromTemplate( getContextMenu() );


// Listen for events from the ipcRenderer
ipcMain.on( "renderer-unload", ( event, data ) => {
    resetAll();
});

ipcMain.on( "renderer-loadgames", ( event, data ) => {
    loadGames();
});

ipcMain.on( "renderer-loadgame", ( event, data ) => {
    activeGame = activeGames.find(( game ) => {
        return (game.id === data.game);
    });
    loadGame();
});

ipcMain.on( "renderer-loadmap", ( event, data ) => {
    activeMap = activeMaps.find(( map ) => {
        return (map.id === data.map);
    });
    loadMap();
});

ipcMain.on( "renderer-newgame", ( event, data ) => {
    DB.addGame( data ).then(( response ) => {
        activeGames = response.games;
        mainWindow.webContents.send( "menu-loadgames", activeGames );
        setMenu();
    });
});

ipcMain.on( "renderer-newmap", ( event, data ) => {
    dBase.addMap( data ).then(( response ) => {
        activeMaps = response.maps;
        mainWindow.webContents.send( "menu-loadmaps", activeMaps );
        setMenu();
    });
});

ipcMain.on( "renderer-deletegame", ( event, data ) => {
    DB.deleteGame( data ).then(( response ) => {
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

ipcMain.on( "renderer-uploadicon", ( event, data ) => {
    dBase.updateIcon( data ).then(( response ) => {
        mainWindow.webContents.send( "menu-reloadicon", response );
    });
});

ipcMain.on( "renderer-savemap", ( event, data ) => {
    dBase.updateMap( data ).then(( response ) => {
        activeMaps = response.maps;
        setMenu();
    });
});

ipcMain.on( "renderer-contextmenu", ( event ) => {
    contextMenu.popup({
        window: mainWindow,
    });
});

ipcMain.on( "renderer-selection", ( event, state ) => {
    activeSelect = state;
    setMenu();
});



module.exports = {
    init ( mainWin ) {
        mainWindow = mainWin;
        dBase = new DB();

        loadGames();

        return this;
    }
};
