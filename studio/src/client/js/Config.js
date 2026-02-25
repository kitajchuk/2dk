const Config = {
    Editor: {
        modes: {
            SAVING: "saving",
        },
    },
    EditorActions: {
        modes: {
            BRUSH: "brush",
            ERASE: "erase",
            BUCKET: "bucket",
            SELECT: "select",
            SPAWN: "spawn",
            EVENT: "event",
            TILES: "tiles",
        },
    },
    EditorCanvas: {
        modes: {
            DRAG: "drag",
            DRAW: "draw",
            ERASE: "erase",
        },
    },
    EditorLayers: {
        modes: {
            BACKGROUND: "background",
            FOREGROUND: "foreground",
            COLLISION: "collision",
            NPC: "npc",
            ITEM: "item",
            FX: "fx",
            SPAWN: "spawn",
            EVENT: "event",
            TILES: "tiles",
        },
    },
};



// Expose
module.exports = Config;
