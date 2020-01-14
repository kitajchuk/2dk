const Config = {
    keys: {
        A: 88,
        B: 90,
        UP: 38,
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
        MOVE: "move",
        GRAB: "grab",
        PUSH: "push",
        PULL: "pull",
        LIFT: "lift",
        TOSS: "toss",
        OPEN: "open",
        WALK: "walk",
        FACE: "face",
        TALK: "talk",
        READ: "read",
    },
    events: {
        DOOR: "door",
        BOUNDARY: "boundary",
        CUTSCENE: "cutscene",
    },
    tiles: {
        GRASS: "grass",
        WATER: "water",
        STAIRS: "stairs",
        LEDGE: "ledge",
        SWITCH: "switch",
    },
    opposites: {
        left: "right",
        right: "left",
        down: "up",
        up: "down",
        y: "x",
        x: "y",
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
    values: {
        debounceDur: 256,
        boundaryAnimDur: 500,
    }
};



module.exports = Config;
