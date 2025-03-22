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
            SELECT: "select",
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
            OBJ: "obj",
        },
    },
    keys: {
        B: 66,
        E: 69,
        Z: 90,
        X: 88,
        P: 80,
        ESCAPE: 27,
        SPACEBAR: 32,
    },
};



// Expose
module.exports = Config;
