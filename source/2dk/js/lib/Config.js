const Config = {
    keys: {
        A: 88,
        B: 90,
        UP: 38,
        HOME: 72,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        START: 13,
        SELECT: 32,
        UPLEFT: 111,
        UPRIGHT: 222,
        DOWNLEFT: 333,
        DOWNRIGHT: 444,
    },
    verbs: {
        CUT: "cut",
        PUSH: "push",
        PULL: "pull",
        GRAB: "grab",
        MOVE: "move",
        LIFT: "lift",
        OPEN: "open",
        WALK: "walk",
        FACE: "face",
        TOSS: "toss",
        SWIM: "swim",
    },
    events: {
        DOOR: "door",
        WARP: "warp",
        BOUNDARY: "boundary",
        CUTSCENE: "cutscene",
    },
    tiles: {
        HOLE: "hole",
        GRASS: "grass",
        WATER: "water",
        LEDGE: "ledge",
        STAIRS: "stairs",
        SWITCH: "switch",
    },
    opposites: {
        y: "x",
        x: "y",
        up: "down",
        down: "up",
        left: "right",
        right: "left",
    },
    colors: {
        red: "#F30541",
        grey: "#959595",
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
    values: {
        debounceDur: 256,
        boundaryAnimDur: 512,
    }
};



module.exports = Config;
