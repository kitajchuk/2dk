const Library = {
    Colors: {
        grey: "#959595",
        red: "#F30541",
        pink: "#F49AC1",
        blue: "#1795D4",
        teal: "#2AFFEA",
        black: "#000000",
        white: "#FFFFFF",
        green: "#10FF59",
        yellow: "#EEFD02",
        purple: "#6441A4",
        greyDark: "#333",
        blueDark: "#004080",
    },

    Map: {
        events: {
            DOOR: "door",
            MESSAGE: "message"
        },

        collision: {
            NONE: 0,
            WALL: 1
        }
    },

    Socket: {
        broadcast: {
            GET_GAME: "getgame",
            GET_MAP: "getmap",
            GET_MAPS: "getmaps",
            GET_FILES: "getfiles",
            CREATE_MAP: "createmap",
            UPDATE_MAP: "updatemap",
            DELETE_MAP: "deletemap",
            DELETE_GAME: "deletegame",
            DELETE_FILE: "deletefile",
        }
    },

    Editor: {
        modes: {
            SAVING: "saving",
            PINNING: "pinning"
        }
    },

    EditorActions: {
        modes: {
            BRUSH: "brush",
            BUCKET: "bucket",
            TRASH: "delete"
        }
    },

    EditorPins: {
        modes: {
            NPCS: "npcs",
            PLAYER: "player",
            EVENTS: "events",
            SPAWNPOINTS: "spawnpoints"
        }
    },

    EditorCanvas: {
        modes: {
            DRAG: "drag",
            DRAW: "draw",
            ERASE: "erase"
        }
    },

    EditorLayers: {
        modes: {
            BACKGROUND: "background",
            FOREGROUND: "foreground",
            COLLISION: "collision"
        }
    }
};


// Expose
module.exports = Library;
