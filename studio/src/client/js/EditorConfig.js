const EditorConfig = {
    Editor: {
        modes: {
            SAVING: "saving",
        }
    },
    EditorActions: {
        modes: {
            BRUSH: "brush",
            BUCKET: "bucket",
            ERASE: "erase",
            SELECT: "select",
            ZOOM: "zoom",
        }
    },
    EditorCanvas: {
        modes: {
            DRAG: "drag",
            DRAW: "draw",
            ERASE: "erase",
        }
    },
    EditorLayers: {
        modes: {
            BACKGROUND: "background",
            FOREGROUND: "foreground",
            COLLISION: "collision",
            OBJECTS: "objects",
        }
    },
    keys: {
        B: 66,
        F: 70,
        E: 69,
        Z: 90,
        X: 88,
        P: 80,
        SPACEBAR: 32,
    },
    colors: {
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
};



// Expose
module.exports = EditorConfig;
