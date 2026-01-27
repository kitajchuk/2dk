const { app, Menu, ipcMain, shell } = require( "electron" );
const { DB } = require( "./db" );

const isMac = ( process.platform === "darwin" );

// Global mainWindow
let mainWindow;

// Keep a global reference to the active game and map objects
let contextMenu = null;
let activeGames = [];
let activeMaps = [];
let activeGame = null;
let activeMap = null;

// Global database client
let dBase;

// First class methods for application menus
// The Games / Maps menus will dynamically update their load menus
const loadAssets = () => {
    const assets = [
        "tiles",
        "sounds",
        "sprites",
    ];

    assets.forEach( ( type ) => {
        dBase.getFiles( type ).then( ( response ) => {
            mainWindow.webContents.send( "menu-assets", response );
        });
    });
};
const loadMaps = () => {
    dBase.getMaps().then( ( maps ) => {
        activeMaps = maps;
        mainWindow.webContents.send( "menu-loadmaps", activeMaps );
        setMenu();
    });
};
const loadGames = () => {
    DB.getGames().then( ( games ) => {
        activeGames = games;
        mainWindow.webContents.send( "menu-loadgames", activeGames );
        setMenu();
    });
};
const loadMap = () => {
    dBase.getMap( activeMap ).then( ( map ) => {
        mainWindow.webContents.send( "menu-loadmap", map );
        setMenu();
    });
}
const loadGame = () => {
    dBase.open( activeGame.id ).then( () => {
        dBase.getGame().then( ( game ) => {
            mainWindow.webContents.send( "menu-loadgame", game );
            loadAssets();
            loadMaps();
            setMenu();
        });
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
        label: "Load Game",
        submenu: [],
    };

    activeGames.forEach( ( game ) => {
        const checked = (activeGame && activeGame.id === game.id) ? true : false;
        gamesLoadout.submenu.push({
            label: game.name,
            type: "checkbox",
            checked: checked,
            click () {
                activeGame = game;
                loadGame();
            },
        });
    });

    return {
        label: "Games",
        submenu: [
            {
                label: "New Game",
                click () {
                    mainWindow.webContents.send( "menu-newgame", null );
                },
            },
            gamesLoadout,
            { type: "separator" },
            {
                label: "Game Settings",
                click () {
                    mainWindow.webContents.send( "menu-gamesettings", null );
                },
                enabled: activeGame ? true : false,
            },
            {
                label: "Game Library",
                click () {
                    mainWindow.webContents.send( "menu-gamelibrary", null );
                },
                enabled: activeGame ? true : false,
            },
            { type: "separator" },
            {
                label: "Manage Sprites",
                click () {
                    mainWindow.webContents.send( "menu-newsprite", null );
                },
                enabled: activeGame ? true : false,
            },
            {
                label: "Manage Tilesets",
                click () {
                    mainWindow.webContents.send( "menu-newtileset", null );
                },
                enabled: activeGame ? true : false,
            },
            {
                label: "Manage Sounds",
                click () {
                    mainWindow.webContents.send( "menu-newsound", null );
                },
                enabled: activeGame ? true : false,
            },
        ],
    };
};
const getMapsMenu = () => {
    const mapsLoadout = {
        label: "Load Map",
        submenu: [],
        enabled: activeGame ? true : false,
    };

    activeMaps.forEach( ( map ) => {
        const checked = (activeMap && activeMap.id === map.id) ? true : false;
        mapsLoadout.submenu.push({
            label: map.name,
            type: "checkbox",
            checked: checked,
            click () {
                activeMap = map;
                loadMap();
            },
        });
    });

    return {
        label: "Maps",
        submenu: [
            {
                label: "New Map",
                click () {
                    mainWindow.webContents.send( "menu-newmap", null );
                },
                enabled: activeGame ? true : false,
            },
            mapsLoadout,
            { type: "separator" },
            {
                label: "Map Settings",
                click () {
                    mainWindow.webContents.send( "menu-mapsettings", null );
                },
                enabled: activeMap ? true : false,
            },
            { type: "separator" },
            {
                label: "Save Map",
                accelerator: "CmdOrCtrl+S",
                click () {
                    mainWindow.webContents.send( "menu-savemap", null );
                },
                enabled: activeMap ? true : false,
            },
            {
                label: "Toggle Grid",
                accelerator: "CmdOrCtrl+;",
                click () {
                    mainWindow.webContents.send( "menu-togglegrid", null );
                },
                enabled: activeMap ? true : false,
            },
        ],
    };
};
const getAppMenu = () => {
    return ( isMac ? {
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
            { role: "quit" },
        ],
    } : {});
};
const getFileMenu = () => {
    return {
        label: "File",
        submenu: [
            isMac ? { role: "close" } : { role: "quit" },
        ],
    };
};
const getEditMenu = () => {
    return {
        label: "Edit",
        submenu: [
            {
                label: "Undo",
                accelerator: "CmdOrCtrl+Z",
                role: "undo",
            },
            {
                label: "Redo",
                accelerator: "Shift+CmdOrCtrl+Z",
                role: "redo",
            },
            { type: "separator" },
            {
                label: "Cut",
                accelerator: "CmdOrCtrl+X",
                role: "cut",
            },
            {
                label: "Copy",
                accelerator: "CmdOrCtrl+C",
                role: "copy",
            },
            {
                label: "Paste",
                accelerator: "CmdOrCtrl+V",
                role: "paste",
            },
            {
                label: "Delete",
                accelerator: "Delete",
                role: "delete",
            },
            {
                label: "Select All",
                accelerator: "CmdOrCtrl+A",
                role: "selectall",
            },
        ],
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
            { role: "togglefullscreen" },
        ],
    };
};
const getWindowMenu = () => {
    return {
        label: "Window",
        submenu: [
            { role: "minimize" },
            { role: "zoom" },
            ...( isMac ? [
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" },
            ] : [
            { role: "close" },
            ] ),
        ],
    };
};
const getHelpMenu = () => {
    return {
        role: "help",
        submenu: [
            {
                label: "Learn More",
                click: async () => {
                    await shell.openExternal( "https://2dk.kitajchuk.com" );
                },
            },
        ],
    };
};
const getContextMenu = () => {
    return [
        // TODO: context menu...
    ];
};
const setMenu = () => {
    Menu.setApplicationMenu( Menu.buildFromTemplate( [
        getAppMenu(),
        getFileMenu(),
        getEditMenu(),
        getGamesMenu(),
        getMapsMenu(),
        getViewMenu(),
        getWindowMenu(),
        getHelpMenu(),
    ] ) );
};


// Set the global context menu for reference
contextMenu = Menu.buildFromTemplate( getContextMenu() );


// Listen for events from the ipcRenderer
ipcMain.on( "renderer-unload", () => {
    resetAll();
});

ipcMain.on( "renderer-loadgames", () => {
    loadGames();
});

ipcMain.on( "renderer-loadgame", ( event, data ) => {
    activeGame = activeGames.find( ( game ) => {
        return ( game.id === data.game );
    });
    loadGame();
});

ipcMain.on( "renderer-loadmap", ( event, data ) => {
    activeMap = activeMaps.find( ( map ) => {
        return ( map.id === data.map );
    });
    loadMap();
});

ipcMain.on( "renderer-newgame", ( event, data ) => {
    DB.addGame( data ).then( ( response ) => {
        activeGames = response.games;
        mainWindow.webContents.send( "menu-loadgames", activeGames );
        setMenu();
    });
});

ipcMain.on( "renderer-newmap", ( event, data ) => {
    dBase.addMap( data ).then( ( response ) => {
        activeMaps = response.maps;
        mainWindow.webContents.send( "menu-loadmaps", activeMaps );
        setMenu();
    });
});

ipcMain.on( "renderer-deletegame", ( event, data ) => {
    DB.deleteGame( data ).then( ( games ) => {
        activeGames = games;
        setMenu();
    });
});

ipcMain.on( "renderer-deletemap", ( event, data ) => {
    dBase.deleteMap( data ).then( ( response ) => {
        activeMaps = response.maps;
        setMenu();
        loadGame();
    });
});

ipcMain.on( "renderer-newfile", ( event, data ) => {
    dBase.addFile( data ).then( ( response ) => {
        mainWindow.webContents.send( "menu-assets", response );
    });
});

ipcMain.on( "renderer-deletefile", ( event, data ) => {
    dBase.deleteFile( data ).then( ( response ) => {
        mainWindow.webContents.send( "menu-assets", response );
    });
});

ipcMain.on( "renderer-uploadicon", ( event, data ) => {
    dBase.updateIcon( data ).then( ( response ) => {
        mainWindow.webContents.send( "menu-reloadicon", response );
    });
});

ipcMain.on( "renderer-savemap", ( event, data ) => {
    dBase.updateMap( data ).then( ( response ) => {
        activeMaps = response.maps;
        setMenu();
    });
});

ipcMain.on( "renderer-contextmenu", () => {
    contextMenu.popup({
        window: mainWindow,
    });
});



module.exports = {
    init ( mainWin ) {
        mainWindow = mainWin;
        dBase = new DB();

        loadGames();

        return this;
    },
};
